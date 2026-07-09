import { useStore } from '../store';
import { useT } from '../i18n';
import Icon from './Icon';

const BUY_URL = 'https://traxapp.lemonsqueezy.com/checkout/buy/d63d13e6-71cf-4eb0-a27b-8404988095f1';

export default function SubLock() {
  const { subscription, session, logout } = useStore();
  const t = useT();
  const suspended = subscription?.status === 'suspended';

  // prefill the checkout with the account e-mail and pass the uid so the
  // webhook can credit the right gym automatically
  const checkout = `${BUY_URL}?checkout[email]=${encodeURIComponent(session?.email || '')}&checkout[custom][uid]=${encodeURIComponent(session?.uid || '')}`;

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
          {suspended ? (
            <a className="btn primary" href="mailto:traxguo@gmail.com?subject=TRAX%20Account">
              <Icon name="mail" size={17} />{t.subRenewBtn}
            </a>
          ) : (
            <>
              <a className="btn primary" href={checkout} target="_blank" rel="noreferrer">
                <Icon name="card" size={17} />{t.subPayBtn}
              </a>
              <button className="btn" style={{ marginTop: 10 }} onClick={() => window.location.reload()}>
                <Icon name="check" size={16} stroke={2.2} />{t.subPaidRefresh}
              </button>
            </>
          )}
          <button className="btn" style={{ marginTop: 10 }} onClick={logout}>
            <Icon name="logout" size={16} />{t.logoutBtn}
          </button>
          {!suspended && (
            <div style={{ marginTop: 14, fontSize: 12 }}>
              <a className="link sm" href="mailto:traxguo@gmail.com?subject=TRAX%20Renewal" style={{ textDecoration: 'none' }}>{t.supportRow}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
