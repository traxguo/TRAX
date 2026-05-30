import { useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVis(true), 20);
      return () => clearTimeout(t);
    }
    setVis(false);
  }, [open]);

  if (!open) return null;

  const close = () => {
    setVis(false);
    setTimeout(onClose, 230);
  };

  return (
    <div className={'sheet-wrap' + (vis ? ' in' : '')}>
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
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}
