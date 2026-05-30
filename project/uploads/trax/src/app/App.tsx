import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import AppShell from './components/AppShell';

function Diag() {
  const [info, setInfo] = useState('...');
  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,0,0,0.85);color:#fff;font-size:11px;padding:4px 8px;font-family:monospace;line-height:1.5;';
    document.body.appendChild(el);
    const update = () => {
      const sab = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)');
      el.innerHTML =
        `iH=${window.innerHeight} | vvH=${Math.round(window.visualViewport?.height??0)} | scrH=${window.screen.height} | oH=${window.outerHeight}`;
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => { document.body.removeChild(el); };
  }, []);
  return null;
}

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
      <Diag />
    </StoreProvider>
  );
}
