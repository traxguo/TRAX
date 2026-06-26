import { useState, useEffect } from 'react';
import { useT } from '../i18n';
import { useInstall } from '../install';
import Icon from './Icon';

export default function InstallBanner() {
  const t = useT();
  const { mode, canInstall, androidReady, trigger } = useInstall();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canInstall) return;
    if (localStorage.getItem('trax_install_dismissed')) return;
    // Android: only once the prompt is ready. iOS: after a short delay.
    if (mode === 'android') { if (androidReady) setShow(true); return; }
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [canInstall, mode, androidReady]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('trax_install_dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className={'install-banner in'} onClick={trigger} role="button">
      <div className="install-ic"><Icon name="bolt" size={18} stroke={2.2} /></div>
      <div className="install-body">
        <div className="install-title">{t.installTitle}</div>
        <div className="install-sub">
          {mode === 'ios' && <Icon name="share" size={11} stroke={1.8} style={{ verticalAlign: 'middle', marginRight: 3 }} />}
          {mode === 'ios' ? t.installSubIos : t.installSubAndroid}
        </div>
      </div>
      <button className="btn primary install-btn" onClick={e => { e.stopPropagation(); trigger(); }}>
        <Icon name={mode === 'android' ? 'download' : 'share'} size={14} stroke={2} />
        {mode === 'android' ? t.installBtn : t.installHowBtn}
      </button>
      <button className="install-close" onClick={e => { e.stopPropagation(); dismiss(); }}>
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
