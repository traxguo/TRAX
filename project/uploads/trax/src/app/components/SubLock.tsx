import { useStore } from '../store';
import { useT } from '../i18n';
import Icon from './Icon';

export default function SubLock() {
  const { subscription, logout } = useStore();
  const t = useT();
  const suspended = subscription?.status === 'suspended';

  return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" /><span className="orb o2" /><span className="auth-grid" />
      </div>
      <div className="auth-inner" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="lock-mark"><Icon name="lock" size={26} stroke={2} /></div>
          <div className="auth-h" style={{ marginTop: 14 }}>
            {suspended ? t.subSuspendedTitle : t.subEndedTitle}
          </div>
          <div className="auth-sub" style={{ marginBottom: 18 }}>
            {suspended ? t.subSuspendedBody : t.subEndedBody}
          </div>
          <a className="btn primary" href="mailto:traxguo@gmail.com?subject=TRAX%20Renewal">
            <Icon name="mail" size={17} />{t.subRenewBtn}
          </a>
          <button className="btn" style={{ marginTop: 10 }} onClick={logout}>
            <Icon name="logout" size={16} />{t.logoutBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
