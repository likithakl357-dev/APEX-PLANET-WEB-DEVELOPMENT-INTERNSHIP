import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export async function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '')
      .replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Account is unavailable.'
      });
    }

    if (
      (payload.version ?? 0) !== user.sessionVersion ||
      (payload.jti &&
        await prisma.revokedSession.findUnique({
          where: { id: payload.jti }
        }))
    ) {
      return res.status(401).json({
        error: 'Session revoked. Please sign in again.'
      });
    }

    // Only the authorized email can have admin access.
    const adminEmail = (process.env.ADMIN_EMAIL || '')
      .trim().toLowerCase();

    if (
      user.role === 'ADMIN' &&
      (!adminEmail ||
       user.loginEmail?.toLowerCase() !== adminEmail)
    ) {
      return res.status(403).json({
        error: 'Unauthorized administrator account.'
      });
    }

    req.user = user;
    req.sessionClaims = payload;
    next();

  } catch {
    return res.status(401).json({
      error: 'Session expired. Please log in again.'
    });
  }
}

export const roles = (...allowed) =>
  (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You are not authorised to perform this action.'
      });
    }

    next();
  };