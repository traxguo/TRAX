import { useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import AppShell from './components/AppShell';
import InstallBanner from './components/InstallBanner';
import SubLock from './components/SubLock';
import { InstallProvider } from './install';

function MobileApp() {
  const { session, profile, login, signup, completeOnboarding, loading, loadFailed, subBlocked, lang } = useStore();

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--acc',      '#ff3b43');
    r.style.setProperty('--acc-rgb',  '255,59,67');
    r.style.setProperty('--acc-deep', '#d11f2c');
    r.style.setProperty('--acc-dim',  'rgba(255,59,67,0.14)');
    r.style.setProperty('--acc-glow', 'rgba(255,59,67,0.42)');

    // Keep --phone-ext / --phone-h in sync. Only the installed PWA uses the
    // extend-below-viewport hack; a browser tab uses 0 + 100dvh fallback.
    const sync = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (standalone) {
        const h = window.screen.height + 60;
        r.style.setProperty('--phone-h', h + 'px');
        r.style.setProperty('--phone-ext', (h - window.innerHeight) + 'px');
        r.style.minHeight = h + 'px';
      } else {
        r.style.setProperty('--phone-ext', '0px');
        r.style.removeProperty('--phone-h');
        r.style.minHeight = '';
      }
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);

  if (loading) return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="auth-grid" />
      </div>
      <div className="auth-inner" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <img src="/icon-192.png" alt="TRAX" style={{ width: 88, height: 88, borderRadius: 22 }} />
        <div style={{ marginTop: 24 }}><span className="spin" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
      </div>
    </div>
  );

  if (loadFailed) return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" /><span className="orb o2" /><span className="auth-grid" />
      </div>
      <div className="auth-inner" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <img src="/icon-192.png" alt="TRAX" style={{ width: 72, height: 72, borderRadius: 18 }} />
        <div style={{ marginTop: 20, fontSize: 14.5, color: 'var(--tx-2)', textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
          {lang === 'tr' ? 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.' : 'Could not connect. Check your internet and try again.'}
        </div>
        <button className="btn primary" style={{ marginTop: 18, width: 'auto', padding: '13px 28px' }} onClick={() => window.location.reload()}>
          {lang === 'tr' ? 'Tekrar dene' : 'Retry'}
        </button>
      </div>
    </div>
  );

  if (!session) return <Login onLogin={login} onSignup={signup} />;
  if (!profile)  return <Onboarding email={session.email} onComplete={completeOnboarding} />;
  if (subBlocked) return <SubLock />;
  return (
    <>
      <AppShell />
      <InstallBanner />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <InstallProvider>
        <MobileApp />
      </InstallProvider>
    </StoreProvider>
  );
}
