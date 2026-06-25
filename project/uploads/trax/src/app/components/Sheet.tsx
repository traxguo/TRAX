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
  const [kbOpen, setKbOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVis(true), 20);
      return () => clearTimeout(t);
    }
    setVis(false);
  }, [open]);

  // Pin the sheet to the *visible* viewport so it always sits above the keyboard.
  useEffect(() => {
    if (!open) { setKbOpen(false); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const apply = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      wrap.style.height = vv.height + 'px';
      wrap.style.top = vv.offsetTop + 'px';
      wrap.style.bottom = 'auto';
      setKbOpen(window.innerHeight - vv.height - vv.offsetTop > 100);
    };
    apply();
    vv.addEventListener('resize', apply);
    return () => {
      vv.removeEventListener('resize', apply);
    };
  }, [open]);

  // Bring the focused field into view (covers Safari, which doesn't auto-scroll reliably).
  const onFocusField = (e: React.FocusEvent) => {
    const el = e.target as HTMLElement;
    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  };

  if (!open) return null;

  const close = () => {
    setVis(false);
    setTimeout(onClose, 230);
  };

  return (
    <div ref={wrapRef} className={'sheet-wrap' + (vis ? ' in' : '') + (kbOpen ? ' kb-open' : '')}>
      <div className="sheet-backdrop" onClick={close} />
      <div className="sheet" onClick={e => e.stopPropagation()}>
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
        <div className="sheet-body" onFocus={onFocusField}>{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}
