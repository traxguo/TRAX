import { useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import AppShell from './components/AppShell';
import InstallBanner from './components/InstallBanner';
import { InstallProvider } from './install';

function MobileApp() {
  const { session, profile, login, signup, completeOnboarding, loading } = useStore();

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--acc',      '#ff3b43');
    r.style.setProperty('--acc-rgb',  '255,59,67');
    r.style.setProperty('--acc-deep', '#d11f2c');
    r.style.setProperty('--acc-dim',  'rgba(255,59,67,0.14)');
    r.style.setProperty('--acc-glow', 'rgba(255,59,67,0.42)');

    // iOS: keep --phone-ext / --phone-h in sync on resize & orientation
    const sync = () => {
      const h = window.screen.height + 60;
      r.style.setProperty('--phone-h', h + 'px');
      r.style.setProperty('--phone-ext', (h - window.innerHeight) + 'px');
      r.style.minHeight = h + 'px';
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

  if (!session) return <Login onLogin={login} onSignup={signup} />;
  if (!profile)  return <Onboarding email={session.email} onComplete={completeOnboarding} />;
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
