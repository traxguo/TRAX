import { useState, FormEvent } from 'react';
import { useT } from '../i18n';
import Icon from './Icon';

interface LoginProps {
  onLogin: (email: string) => void;
  onSignup: () => void;
}

export default function Login({ onLogin, onSignup }: LoginProps) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = /\S+@\S+\.\S+/.test(email) && pw.length >= 4;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) { setErr(t.loginError); return; }
    setErr(''); setBusy(true);
    setTimeout(() => { setBusy(false); onLogin(email); }, 750);
  };

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

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-h">{t.welcomeBack}</div>
          <div className="auth-sub">{t.loginSub}</div>

          <label className="fld" style={{ animationDelay: '.06s' }}>
            <span className="fld-l">{t.emailInputLbl}</span>
            <div className="fld-in">
              <Icon name="mail" size={17} />
              <input type="email" inputMode="email" autoComplete="username" placeholder="ornek@trax.app"
                value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} />
            </div>
          </label>

          <label className="fld" style={{ animationDelay: '.12s' }}>
            <span className="fld-l">{t.passwordLbl}</span>
            <div className="fld-in">
              <Icon name="lock" size={17} />
              <input type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} />
              <button type="button" className="fld-eye" onClick={() => setShow(s => !s)} aria-label="Şifreyi göster">
                <Icon name={show ? 'eyeoff' : 'eye'} size={17} />
              </button>
            </div>
          </label>

          <div className="auth-row" style={{ animationDelay: '.16s' }}>
            <span />
            <span className="link sm">{t.forgotPw}</span>
          </div>

          {err && <div className="auth-err">{err}</div>}

          <button type="submit" className={'btn primary auth-go' + (busy ? ' busy' : '')} disabled={busy} style={{ animationDelay: '.2s' }}>
            {busy
              ? <span className="spin" />
              : <><Icon name="logout" size={17} style={{ transform: 'scaleX(-1)' }} />{t.signInBtn}</>}
          </button>

          <div className="auth-foot" style={{ animationDelay: '.24s' }}>
            {t.noAccount}{' '}
            <span className="link" onClick={onSignup}>{t.createAccount}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
