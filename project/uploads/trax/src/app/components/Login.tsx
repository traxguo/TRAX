import { useState, FormEvent } from 'react';
import { useT } from '../i18n';
import type { T } from '../i18n';
import Icon from './Icon';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
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
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const pwOk = pw.length >= 6;
  const valid = mode === 'login'
    ? emailOk && pwOk
    : emailOk && pwOk && pw === confirm;

  function reset() {
    setErr(''); setPw(''); setConfirm(''); setShow(false);
  }

  function switchMode(next: 'login' | 'signup') {
    setMode(next);
    reset();
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setErr(mode === 'signup' && pw !== confirm ? t.pwMismatch : t.loginError);
      return;
    }
    setErr(''); setBusy(true);
    try {
      if (mode === 'login') {
        await onLogin(email, pw);
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
              <span />
              <span className="link sm">{t.forgotPw}</span>
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
