import { useState, useEffect } from 'react';
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
  const [show, setShow] = useState(false);
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
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('trax_install_dismissed', '1');
  };

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setPrompt(null);
  };

  if (!show) return null;

  return (
    <div className={'install-banner' + (show ? ' in' : '')}>
      <div className="install-ic">
        <Icon name="bolt" size={18} stroke={2.2} />
      </div>
      <div className="install-body">
        <div className="install-title">TRAX'ı Yükle</div>
        {mode === 'ios'
          ? <div className="install-sub">
              <Icon name="share" size={11} stroke={1.8} style={{ verticalAlign: 'middle', marginRight: 3 }} />
              Paylaş → Ana Ekrana Ekle
            </div>
          : <div className="install-sub">Ana ekrana ekleyerek hızlı eriş</div>
        }
      </div>
      {mode === 'android' && (
        <button className="btn primary install-btn" onClick={install}>
          <Icon name="download" size={14} stroke={2} />
          Yükle
        </button>
      )}
      <button className="install-close" onClick={dismiss}>
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
