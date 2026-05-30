import { useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import AppShell from './components/AppShell';

function MobileApp() {
  const store = useStore();
  const { session, profile, login, completeOnboarding } = store;

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--acc',      '#ff3b43');
    r.style.setProperty('--acc-rgb',  '255,59,67');
    r.style.setProperty('--acc-deep', '#d11f2c');
    r.style.setProperty('--acc-dim',  'rgba(255,59,67,0.14)');
    r.style.setProperty('--acc-glow', 'rgba(255,59,67,0.42)');

    // iOS viewport-fit=cover workaround: compute bottom gap manually
    const gap = Math.max(0, window.screen.height - window.innerHeight);
    r.style.setProperty('--screen-gap', gap + 'px');
  }, []);

  const loggedIn  = !!session;
  const onboarded = !!profile;

  if (!loggedIn) return <Login onLogin={login} onSignup={() => login('kayit@trax.app')} />;
  if (!onboarded) return <Onboarding email={session.email} onComplete={completeOnboarding} />;
  return <AppShell />;
}

export default function App() {
  return (
    <StoreProvider>
      <MobileApp />
    </StoreProvider>
  );
}
