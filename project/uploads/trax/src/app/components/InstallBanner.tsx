import { useState, useEffect } from 'react';
import { useT } from '../i18n';
import Icon from './Icon';

type Mode = 'android' | 'ios' | null;

function getMode(): Mode {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return null;
}

function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallBanner() {
  const t = useT();
  const [show, setShow] = useState(false);
  const [guide, setGuide] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [prompt, setPrompt] = useState<{ prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    if (isInstalled()) return;
    if (localStorage.getItem('trax_install_dismissed')) return;

    const m = getMode();
    if (!m) return;
    setMode(m);

    if (m === 'android') {
      const handler = (e: Event) => {
        e.preventDefault();
        setPrompt(e as unknown as typeof prompt);
        setShow(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }

    if (m === 'ios') {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    setGuide(false);
    localStorage.setItem('trax_install_dismissed', '1');
  };

  const androidInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setPrompt(null);
  };

  // Tap the whole banner: Android → native prompt, iOS → visual guide
  const onBannerClick = () => {
    if (mode === 'android') androidInstall();
    else setGuide(true);
  };

  if (!show) return null;

  return (
    <>
      <div className={'install-banner' + (show ? ' in' : '')} onClick={onBannerClick} role="button">
        <div className="install-ic"><Icon name="bolt" size={18} stroke={2.2} /></div>
        <div className="install-body">
          <div className="install-title">{t.installTitle}</div>
          <div className="install-sub">
            {mode === 'ios' && <Icon name="share" size={11} stroke={1.8} style={{ verticalAlign: 'middle', marginRight: 3 }} />}
            {mode === 'ios' ? t.installSubIos : t.installSubAndroid}
          </div>
        </div>
        <button className="btn primary install-btn" onClick={e => { e.stopPropagation(); onBannerClick(); }}>
          <Icon name={mode === 'android' ? 'download' : 'share'} size={14} stroke={2} />
          {mode === 'android' ? t.installBtn : t.installHowBtn}
        </button>
        <button className="install-close" onClick={e => { e.stopPropagation(); dismiss(); }}>
          <Icon name="x" size={15} />
        </button>
      </div>

      {guide && (
        <div className="ios-guide" onClick={() => setGuide(false)}>
          <div className="ios-guide-card" onClick={e => e.stopPropagation()}>
            <div className="ios-guide-mark"><Icon name="bolt" size={24} stroke={2.2} /></div>
            <div className="ios-guide-title">{t.iosGuideTitle}</div>
            <div className="ios-guide-steps">
              <div className="ios-step">
                <span className="ios-step-n">1</span>
                <span className="ios-step-tx">{t.iosStep1}</span>
                <span className="ios-step-ic"><Icon name="share" size={18} /></span>
              </div>
              <div className="ios-step">
                <span className="ios-step-n">2</span>
                <span className="ios-step-tx">{t.iosStep2}</span>
                <span className="ios-step-ic"><Icon name="plus" size={18} stroke={2.2} /></span>
              </div>
              <div className="ios-step">
                <span className="ios-step-n">3</span>
                <span className="ios-step-tx">{t.iosStep3}</span>
                <span className="ios-step-ic"><Icon name="check" size={18} stroke={2.4} /></span>
              </div>
            </div>
            <button className="btn" onClick={() => setGuide(false)}>{t.closeBtn}</button>
          </div>
          <div className="ios-guide-arrow"><Icon name="share" size={22} /></div>
        </div>
      )}
    </>
  );
}
