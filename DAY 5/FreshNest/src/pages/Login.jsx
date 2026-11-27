import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, Mail } from 'lucide-react';
import { LogoMark } from '../components/Logo.jsx';
import { api } from '../lib/api.js';
import { loadScript } from '../lib/loadScript.js';
import { go } from '../lib/store.jsx';

function GoogleButton({ clientId, onVerified, onError }) {
  const host = useRef(null);
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    const element = host.current;
    loadScript('https://accounts.google.com/gsi/client').then(() => {
      if (!active) return;
      const google = window.google.accounts.id;
      google.initialize({ client_id: clientId, callback: async ({ credential }) => {
        if (!active) return;
        try {
          const session = await api('/auth/google', { method: 'POST', body: { credential } });
          if (active) onVerified(session);
        } catch (error) {
          if (active) onError(error.message);
        }
      } });
      google.renderButton(element, { theme: 'outline', size: 'large', text: 'continue_with',
        shape: 'pill', width: Math.min(320, element.clientWidth || 300) });
    }).catch(() => { if (active) onError('Google sign-in could not load.'); });
    return () => { active = false; element.replaceChildren(); };
  }, [clientId, onVerified, onError]);
  return <div className="google-signin" ref={host} />;
}

export default function Login({ onVerified }) {
  const [options, setOptions] = useState(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('email');
  const [error, setError] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const otpInput = useRef(null);

  useEffect(() => { api('/auth/options').then(setOptions).catch(err => setError(err.message)); }, []);
  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [resendAt]);
  useEffect(() => { if (stage === 'code') otpInput.current?.focus(); }, [stage]);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const isEmail = stage === 'email' || stage === 'sending';
  const verifying = stage === 'verifying' || stage === 'success';

  async function send(event) {
    event?.preventDefault();
    if (stage === 'sending' || stage === 'resending' || (!isEmail && remaining)) return;
    setStage(isEmail ? 'sending' : 'resending');
    setError('');
    try {
      const result = await api('/auth/email/request', { method: 'POST', body: { email: email.trim() } });
      setCode('');
      const time = Date.now();
      setNow(time);
      setResendAt(time + result.resendAfterSeconds * 1000);
      setStage('code');
    } catch (error) {
      setError(error.message);
      setStage(isEmail ? 'email' : 'code');
    }
  }

  async function verify(event) {
    event.preventDefault();
    if (stage !== 'code' || code.length !== 6) return;
    setStage('verifying');
    setError('');
    try {
      const [session] = await Promise.all([api('/auth/email/verify', { method: 'POST', body: { email: email.trim(), otp: code } }),
        new Promise(resolve => setTimeout(resolve, 450))]);
      setStage('success');
      setTimeout(() => onVerified(session), 380);
    } catch (error) {
      setError(error.message);
      setStage('code');
    }
  }

  return <div className="login-shell email-login">
    <div className="login-left">
      <div className="login-brand"><span className="brand-icon"><LogoMark size={30} /></span><span>FreshNest</span></div>
      <div className="login-copy"><h1>Fresh groceries.<br /><em>Delivered to you.</em></h1>
        <p>Shop everyday essentials, save your favorites, and track your order.</p></div>
      <div className="login-foot">© 2026 FreshNest</div>
    </div>
    <div className="login-right"><section className="login-card">
      {isEmail ? <>
        <h2>Welcome to FreshNest</h2>
        <p className="muted">Use your email to receive a one-time sign-in code.</p>
        <form onSubmit={send}>
          <label className="field-label" htmlFor="login-email">Email address</label>
          <input className="login-email-field" id="login-email" type="email" autoComplete="email" required
            maxLength={254} value={email} disabled={stage === 'sending'} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
          <button className="primary wide" disabled={stage === 'sending' || !options?.emailAvailable}>
            {stage === 'sending' ? 'Sending…' : 'Continue with email'} <ArrowRight size={17} />
          </button>
        </form>
        {options?.googleClientId && <><p className="login-divider">or</p>
          <GoogleButton clientId={options.googleClientId} onVerified={onVerified} onError={setError} /></>}
        {options && !options.emailAvailable && <p className="muted">Email sign-in is currently unavailable.</p>}
      </> : <>
        <form onSubmit={verify}>
          <h2>{stage === 'success' ? 'Email verified' : 'Check your email'}</h2>
          <p className="muted">Enter the six-digit code sent to <b>{email.trim()}</b>.</p>
          <div className={'verification-motion' + (verifying ? ' is-verifying' : '')}>
            {verifying ? <div className={'verification-orbit' + (stage === 'success' ? ' is-success' : '')} role="status"
              aria-label={stage === 'success' ? 'Verified' : 'Verifying'}>
              {stage === 'success' ? <BadgeCheck size={38} /> : <><Mail size={27} />{[0,1,2,3].map(i => <i key={i} style={{'--orbit-step':i}} />)}</>}
            </div> : <label className="verification-input">
              <input ref={otpInput} aria-label="Six-digit verification code" value={code} inputMode="numeric" autoComplete="one-time-code"
                onChange={event => setCode(event.target.value.replace(/\D/g,'').slice(0,6))} />
              <span className="verification-digits" aria-hidden="true">{Array.from({length:6},(_,i) =>
                <span className={i === code.length ? 'is-next' : ''} key={i}>{code[i] || '·'}</span>)}</span>
            </label>}
          </div>
          <button className="primary wide" disabled={stage !== 'code' || code.length !== 6}>
            {stage === 'success' ? 'Verified' : verifying ? 'Verifying…' : 'Verify and sign in'}
          </button>
        </form>
        <div className="row-actions center">
          <button className="text-button" disabled={verifying || stage === 'resending'} onClick={() => {setStage('email');setError('');}}>Change email</button>
          <button className="text-button" disabled={remaining > 0 || stage !== 'code'} onClick={send}>
            {stage === 'resending' ? 'Sending…' : remaining ? `Resend in ${remaining}s` : 'Resend code'}
          </button>
        </div>
      </>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row-actions">
        <button className="text-button" onClick={() => go('/')}>Browse the store</button>
        <button className="text-button" onClick={() => go('/info/terms')}>Terms of service</button>
        <button className="text-button" onClick={() => go('/info/privacy')}>Privacy policy</button>
      </div>
    </section></div>
  </div>;
}
