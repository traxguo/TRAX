import { useState, FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useT } from '../i18n';
import type { T } from '../i18n';
import Icon from './Icon';

interface LoginProps {
  onLogin: (email: string, password: string, remember?: boolean) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
}

function mapFirebaseError(code: string, t: T): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return t.errWrongPassword;
    case 'auth/email-already-in-use':
      return t.errEmailInUse;
    case 'auth/weak-password':
      return t.errWeakPassword;
    case 'auth/too-many-requests':
      return t.errTooManyAttempts;
    case 'auth/network-request-failed':
      return t.errNetworkFailed;
    default:
      return t.loginError;
  }
}

export default function Login({ onLogin, onSignup }: LoginProps) {
  const t = useT();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const pwOk = pw.length >= 6;
  const valid = mode === 'login'
    ? emailOk && pwOk
    : emailOk && pwOk && pw === confirm;

  function reset() {
    setErr(''); setPw(''); setConfirm(''); setShow(false);
  }

  function switchMode(next: 'login' | 'signup' | 'reset') {
    setMode(next);
    reset();
    setResetSent(false);
  }

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) { setErr(t.loginError); return; }
    setErr(''); setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (ex: unknown) {
      const code = (ex as { code?: string }).code ?? '';
      setErr(mapFirebaseError(code, t));
    }
    setBusy(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setErr(mode === 'signup' && pw !== confirm ? t.pwMismatch : t.loginError);
      return;
    }
    setErr(''); setBusy(true);
    try {
      if (mode === 'login') {
        await onLogin(email, pw, remember);
      } else {
        await onSignup(email, pw);
      }
    } catch (ex: unknown) {
      const code = (ex as { code?: string }).code ?? '';
      setErr(mapFirebaseError(code, t));
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';

  if (mode === 'reset') return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" /><span className="orb o2" /><span className="auth-grid" />
      </div>
      <div className="auth-inner">
        <div className="auth-brand">
          <div className="auth-mark"><Icon name="bolt" size={26} stroke={2.2} /></div>
          <div className="auth-word">TRA<b>X</b></div>
          <div className="auth-tag">{t.loginTagline}</div>
        </div>
        <form className="auth-card" onSubmit={submitReset}>
          <div className="auth-h">{t.forgotPw}</div>
          <div className="auth-sub">{t.resetSub}</div>
          {resetSent ? (
            <div className="auth-ok">{t.resetSent(email)}</div>
          ) : (
            <>
              <label className="fld" style={{ animationDelay: '.06s' }}>
                <span className="fld-l">{t.emailInputLbl}</span>
                <div className="fld-in">
                  <Icon name="mail" size={17} />
                  <input type="email" inputMode="email" autoComplete="username"
                    placeholder="ornek@trax.app" value={email}
                    onChange={e => { setEmail(e.target.value); setErr(''); }} />
                </div>
              </label>
              {err && <div className="auth-err">{err}</div>}
              <button type="submit" className={'btn primary auth-go' + (busy ? ' busy' : '')} disabled={busy} style={{ animationDelay: '.12s' }}>
                {busy ? <span className="spin" /> : <>{t.resetBtn}</>}
              </button>
            </>
          )}
          <div className="auth-foot" style={{ animationDelay: '.18s' }}>
            <span className="link" onClick={() => switchMode('login')}>{t.backToLogin}</span>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="auth-grid" />
      </div>

      <div className="auth-inner">
        <div className="auth-brand">
          <div className="auth-mark"><Icon name="bolt" size={26} stroke={2.2} /></div>
          <div className="auth-word">TRA<b>X</b></div>
          <div className="auth-tag">{t.loginTagline}</div>
        </div>

        <form className="auth-card" key={mode} onSubmit={submit}>
          <div className="auth-h">{isLogin ? t.welcomeBack : t.signUpTitle}</div>
          <div className="auth-sub">{isLogin ? t.loginSub : t.signUpSub}</div>

          <label className="fld" style={{ animationDelay: '.06s' }}>
            <span className="fld-l">{t.emailInputLbl}</span>
            <div className="fld-in">
              <Icon name="mail" size={17} />
              <input type="email" inputMode="email" autoComplete="username"
                placeholder="ornek@trax.app" value={email}
                onChange={e => { setEmail(e.target.value); setErr(''); }} />
            </div>
          </label>

          <label className="fld" style={{ animationDelay: '.12s' }}>
            <span className="fld-l">{t.passwordLbl}</span>
            <div className="fld-in">
              <Icon name="lock" size={17} />
              <input type={show ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••" value={pw}
                onChange={e => { setPw(e.target.value); setErr(''); }} />
              <button type="button" className="fld-eye" onClick={() => setShow(s => !s)} aria-label="Toggle password">
                <Icon name={show ? 'eyeoff' : 'eye'} size={17} />
              </button>
            </div>
          </label>

          {!isLogin && (
            <label className="fld" style={{ animationDelay: '.16s' }}>
              <span className="fld-l">{t.confirmPwLbl}</span>
              <div className="fld-in">
                <Icon name="lock" size={17} />
                <input type={show ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••" value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErr(''); }} />
              </div>
            </label>
          )}

          {isLogin && (
            <div className="auth-row" style={{ animationDelay: '.16s' }}>
              <label className="remember-row" onClick={() => setRemember(r => !r)}>
                <span className={'remember-box' + (remember ? ' on' : '')}>
                  {remember && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                <span className="remember-lbl">{t.rememberMe}</span>
              </label>
              <span className="link sm" onClick={() => switchMode('reset')}>{t.forgotPw}</span>
            </div>
          )}

          {err && <div className="auth-err">{err}</div>}

          <button type="submit"
            className={'btn primary auth-go' + (busy ? ' busy' : '')}
            disabled={busy || !valid}
            style={{ animationDelay: '.2s' }}>
            {busy
              ? <span className="spin" />
              : <>
                  <Icon name={isLogin ? 'logout' : 'userplus'} size={17}
                    style={isLogin ? { transform: 'scaleX(-1)' } : undefined} />
                  {isLogin ? t.signInBtn : t.signUpBtn}
                </>}
          </button>

          <div className="auth-foot" style={{ animationDelay: '.24s' }}>
            {isLogin ? t.noAccount : t.haveAccount}{' '}
            <span className="link" onClick={() => switchMode(isLogin ? 'signup' : 'login')}>
              {isLogin ? t.createAccount : t.signInLink}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
