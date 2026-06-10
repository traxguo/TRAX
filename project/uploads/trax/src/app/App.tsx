import { useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import AppShell from './components/AppShell';
import Icon from './components/Icon';

function MobileApp() {
  const { session, profile, login, signup, completeOnboarding, loading } = useStore();

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--acc',      '#ff3b43');
    r.style.setProperty('--acc-rgb',  '255,59,67');
    r.style.setProperty('--acc-deep', '#d11f2c');
    r.style.setProperty('--acc-dim',  'rgba(255,59,67,0.14)');
    r.style.setProperty('--acc-glow', 'rgba(255,59,67,0.42)');

    const gap = Math.max(0, window.screen.height - window.innerHeight);
    r.style.setProperty('--screen-gap', gap + 'px');
    const phoneH = window.screen.height + 60;
    r.style.setProperty('--phone-h', phoneH + 'px');
    r.style.setProperty('--phone-ext', (phoneH - window.innerHeight) + 'px');
    document.documentElement.style.minHeight = phoneH + 'px';
    document.body.style.minHeight = phoneH + 'px';
  }, []);

  if (loading) return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="auth-grid" />
      </div>
      <div className="auth-inner" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-mark" style={{ marginBottom: 0 }}>
          <Icon name="bolt" size={26} stroke={2.2} />
        </div>
        <div style={{ marginTop: 24 }}><span className="spin" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
      </div>
    </div>
  );

  if (!session) return <Login onLogin={login} onSignup={signup} />;
  if (!profile)  return <Onboarding email={session.email} onComplete={completeOnboarding} />;
  return <AppShell />;
}

export default function App() {
  return (
    <StoreProvider>
      <MobileApp />
    </StoreProvider>
  );
}
