import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useT } from './i18n';
import Icon from './components/Icon';

type Mode = 'android' | 'ios' | null;
type Prompt = { prompt: () => void; userChoice: Promise<{ outcome: string }> };

function getMode(): Mode {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return null;
}

export function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

interface InstallValue {
  mode: Mode;
  canInstall: boolean;
  /** True only when Android has fired beforeinstallprompt (for the first-run banner). */
  androidReady: boolean;
  trigger: () => void;
}

const InstallCtx = createContext<InstallValue | null>(null);
export const useInstall = () => useContext(InstallCtx)!;

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [guide, setGuide] = useState(false);
  const mode = getMode();
  const installed = isInstalled();

  useEffect(() => {
    if (mode !== 'android') return;
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as unknown as Prompt); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [mode]);

  const trigger = useCallback(async () => {
    if (mode === 'android' && prompt) {
      prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } else {
      setGuide(true); // iOS, or Android before the prompt is ready
    }
  }, [mode, prompt]);

  const value: InstallValue = {
    mode,
    canInstall: !installed && mode !== null,
    androidReady: !!prompt,
    trigger,
  };

  return (
    <InstallCtx.Provider value={value}>
      {children}
      {guide && <IosGuide onClose={() => setGuide(false)} />}
    </InstallCtx.Provider>
  );
}

function IosGuide({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="ios-guide" onClick={onClose}>
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
        <button className="btn" onClick={onClose}>{t.closeBtn}</button>
      </div>
      <div className="ios-guide-arrow"><Icon name="share" size={22} /></div>
    </div>
  );
}
