import { useState, useEffect, useRef, ReactNode } from 'react';
import Icon from './Icon';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Sheet({ open, onClose, title, eyebrow, children, footer }: SheetProps) {
  const [vis, setVis] = useState(false);
  const [kb, setKb] = useState(0);
  const baseRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVis(true), 20);
      return () => clearTimeout(t);
    }
    setVis(false);
  }, [open]);

  // keyboard: shift sheet above the on-screen keyboard
  useEffect(() => {
    if (!open) { baseRef.current = null; setKb(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const ext = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--phone-ext')) || 0;
    const calc = () => {
      const hidden = window.innerHeight - vv.height - vv.offsetTop;
      if (baseRef.current === null) baseRef.current = hidden;
      const raised = Math.max(0, hidden - (baseRef.current || 0));
      setKb(raised > 40 ? raised + ext : 0);
    };
    calc();
    vv.addEventListener('resize', calc);
    vv.addEventListener('scroll', calc);
    return () => {
      vv.removeEventListener('resize', calc);
      vv.removeEventListener('scroll', calc);
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setVis(false);
    setTimeout(onClose, 230);
  };

  return (
    <div className={'sheet-wrap' + (vis ? ' in' : '')}>
      <div className="sheet-backdrop" onClick={close} />
      <div
        className="sheet"
        onClick={e => e.stopPropagation()}
        style={kb > 0 ? { marginBottom: kb, maxHeight: `calc(86% - ${kb}px)` } : undefined}
      >
        <div className="sheet-grip" />
        <div className="sheet-head">
          <div>
            {eyebrow && <div className="sheet-eyebrow">{eyebrow}</div>}
            <div className="sheet-title">{title}</div>
          </div>
          <button className="m-iconbtn" onClick={close} aria-label="Kapat">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}
