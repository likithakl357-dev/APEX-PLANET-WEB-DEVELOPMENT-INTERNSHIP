import { createHmac, createPublicKey, randomInt, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from './db.js';
import { fail, serial } from './operations.js';
import { asyncHandler } from './utils/http.js';

const emailAddress = z.string().trim().max(254).email().transform(value => value.toLowerCase());
const mailReady = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
const googleId = () => process.env.GOOGLE_CLIENT_ID || '';
const digest = (email, code) => createHmac('sha256', process.env.JWT_SECRET).update(email + ':' + code).digest('hex');
let googleKeys;
let googleKeysUntil = 0;

async function verifyGoogle(credential) {
  const decoded = jwt.decode(credential, { complete: true });
  if (!decoded?.header?.kid || decoded.header.alg !== 'RS256') throw fail(401, 'Google sign-in could not be verified.');
  if (Date.now() >= googleKeysUntil || !googleKeys) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/certs', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw fail(503, 'Google sign-in is temporarily unavailable.');
    googleKeys = (await response.json()).keys;
    const seconds = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 60);
    googleKeysUntil = Date.now() + Math.min(seconds, 3600) * 1000;
  }
  const jwk = googleKeys.find(key => key.kid === decoded.header.kid);
  if (!jwk) throw fail(401, 'Google sign-in could not be verified.');
  try {
    return jwt.verify(credential, createPublicKey({ key: jwk, format: 'jwk' }), {
      algorithms: ['RS256'], issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: googleId(), maxAge: '10m'
    });
  } catch {
    throw fail(401, 'Google sign-in could not be verified.');
  }
}

export function registerEmailAuth(app, { parse, sign, userView }) {
  const session = (res, user) => {
    if (!user.isActive) throw fail(403, 'This account is unavailable.');
    res.json({ token: sign(user), user: userView(user) });
  };
  app.get('/api/auth/options', (_req, res) => res.json({ emailAvailable: mailReady(), googleClientId: googleId() }));
  app.post('/api/auth/email/request', asyncHandler(async (req, res) => {
    const { email } = parse(z.object({ email: emailAddress }), req.body);
    if (!mailReady()) throw fail(503, 'Email sign-in is not configured.');
    const code = String(randomInt(0, 1000000)).padStart(6, '0');
    const now = new Date();
    const codeHash = digest(email, code);
    await serial(async tx => {
      const previous = await tx.emailChallenge.findUnique({ where: { email } });
      if (previous && now - previous.reservedAt < 60000) throw fail(429, 'Wait one minute before requesting another code.');
      const values = { codeHash, reservedAt: now, expiresAt: new Date(now.getTime() + 300000), attempts: 0, consumedAt: null };
      await tx.emailChallenge.upsert({ where: { email }, create: { email, ...values }, update: values });
    });
    if (mailReady()) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], subject: 'Your FreshNest sign-in code',
            text: 'Your FreshNest sign-in code is ' + code + '. It expires in 5 minutes. If you did not request it, you can ignore this email.' }),
          signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) throw Error('Resend rejected the request');
      } catch {
        await prisma.emailChallenge.deleteMany({ where: { email, codeHash } });
        throw fail(503, 'We could not send your code. Try again shortly.');
      }
    }
    res.json({ expiresInSeconds: 300, resendAfterSeconds: 60 });
  }));
  app.post('/api/auth/email/verify', asyncHandler(async (req, res) => {
    const { email, otp } = parse(z.object({ email: emailAddress, otp: z.string().regex(/^\d{6}$/) }), req.body);
    if (!mailReady() && !local()) throw fail(503, 'Email sign-in is not configured.');
    const user = await serial(async tx => {
      const record = await tx.emailChallenge.findUnique({ where: { email } });
      const now = new Date();
      if (!record || record.consumedAt || record.expiresAt <= now || record.attempts >= 5) return null;
      const valid = timingSafeEqual(Buffer.from(digest(email, otp), 'hex'), Buffer.from(record.codeHash, 'hex'));
      await tx.emailChallenge.update({ where: { email }, data: valid ? { consumedAt: now } : { attempts: { increment: 1 } } });
      if (!valid) return null;
      return tx.user.upsert({ where: { loginEmail: email }, create: { loginEmail: email }, update: {} });
    });
    if (!user) throw fail(400, 'Code invalid or expired. Request a new code if needed.');
    session(res, user);
  }));
  app.post('/api/auth/google', asyncHandler(async (req, res) => {
    if (!googleId()) throw fail(503, 'Google sign-in is not configured.');
    const { credential } = parse(z.object({ credential: z.string().min(20).max(10000) }), req.body);
    const claims = await verifyGoogle(credential);
    const email = emailAddress.safeParse(claims.email);
    if (!claims.sub || !claims.email_verified || !email.success) throw fail(401, 'Google did not verify this email.');
    let avatarUrl;
    try {
      const image = new URL(claims.picture);
      if (image.protocol === 'https:' && (image.hostname === 'googleusercontent.com' || image.hostname.endsWith('.googleusercontent.com')) && image.href.length <= 1024) avatarUrl = image.href;
    } catch { /* Profile photo is optional. */ }
    const authoritative = email.data.endsWith('@gmail.com') || Boolean(claims.hd);
    const user = await serial(async tx => {
      const linked = await tx.user.findUnique({ where: { googleSubject: claims.sub } });
      if (linked) return avatarUrl && linked.avatarUrl !== avatarUrl ? tx.user.update({ where: { id: linked.id }, data: { avatarUrl } }) : linked;
      if (authoritative) {
        const existing = await tx.user.findUnique({ where: { loginEmail: email.data } });
        if (existing) {
          if (existing.googleSubject) throw fail(409, 'This account is already linked to Google.');
          return tx.user.update({ where: { id: existing.id }, data: { googleSubject: claims.sub, avatarUrl } });
        }
      }
      return tx.user.create({ data: { googleSubject: claims.sub, avatarUrl,
        ...(authoritative ? { loginEmail: email.data } : {}), name: String(claims.name || '').slice(0, 100) || null } });
    });
    session(res, user);
  }));
}
