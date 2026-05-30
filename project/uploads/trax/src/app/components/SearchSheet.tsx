import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { glowOf, kalanText } from '../utils';
import { colorFor, initials } from '../data';
import Sheet from './Sheet';
import Icon from './Icon';

interface SearchSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenMember: (id: number) => void;
}

export default function SearchSheet({ open, onClose, onOpenMember }: SearchSheetProps) {
  const { members } = useStore();
  const [q, setQ] = useState('');

  useEffect(() => { if (open) setQ(''); }, [open]);

  const res = q.trim()
    ? members.filter(m =>
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        m.phone.includes(q) ||
        m.email.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : members.slice().sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6);

  return (
    <Sheet open={open} onClose={onClose} eyebrow="Hızlı arama" title="Üye ara">
      <div className="m-search big" style={{ marginBottom: 14 }}>
        <Icon name="search" size={20} style={{ color: 'var(--tx-3)' }} />
        <input autoFocus placeholder="İsim, telefon veya e-posta…" value={q} onChange={e => setQ(e.target.value)} />
        {q && <button className="fld-eye" onClick={() => setQ('')}><Icon name="x" size={16} /></button>}
      </div>
      {!q && <div className="sheet-label">Yenilemesi yakın</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {res.map(m => {
          const g = glowOf(m);
          const c = g === 's-red' ? 'var(--bad)' : g === 's-yellow' ? 'var(--warn)' : g === 's-frozen' ? 'var(--tx-2)' : 'var(--ok)';
          return (
            <div key={m.id} className="srow" onClick={() => { onOpenMember(m.id); onClose(); }}>
              <div className="av" style={{ width: 40, height: 40, fontSize: 14, background: colorFor(m.name) }}>{initials(m.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 650 }}>{m.name}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>{m.plan}</div>
              </div>
              <span className="tnum" style={{ color: c, fontSize: 12.5, fontWeight: 650 }}>{kalanText(m)}</span>
            </div>
          );
        })}
        {q && res.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>"{q}" için sonuç yok.</div>
        )}
      </div>
    </Sheet>
  );
}
