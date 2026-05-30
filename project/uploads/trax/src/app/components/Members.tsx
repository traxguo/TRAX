import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { glowOf, kalanText } from '../utils';
import { initials } from '../data';
import type { MemberGlow } from '../types';
import Icon from './Icon';

interface MembersProps {
  open: (id: number) => void;
}

const FILTERS = [
  { k: 'all',    l: 'Tümü',         c: 'var(--acc)',  b: 'var(--acc-dim)',         dot: false },
  { k: 'red',    l: 'Doldu',        c: 'var(--bad)',  b: 'rgba(255,77,82,0.16)',   dot: true },
  { k: 'yellow', l: 'Bitmek üzere', c: 'var(--warn)', b: 'rgba(255,194,61,0.16)', dot: true },
  { k: 'green',  l: 'Aktif',        c: 'var(--ok)',   b: 'rgba(70,224,138,0.16)', dot: true },
  { k: 'frozen', l: 'Donduruldu',   c: 'var(--tx-2)', b: 'rgba(255,255,255,0.07)',dot: true },
] as const;

type FilterKey = typeof FILTERS[number]['k'];

export default function Members({ open }: MembersProps) {
  const { members } = useStore();
  const [f, setF] = useState<FilterKey>('all');

  const list = useMemo(() => members.filter(m => {
    if (f === 'all') return true;
    return (glowOf(m) as MemberGlow).replace('s-', '') === f;
  }).sort((a, b) => a.daysLeft - b.daysLeft), [f, members]);

  const counts = useMemo(() => members.reduce<Record<string, number>>((acc, m) => {
    const g = (glowOf(m) as MemberGlow).replace('s-', '');
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {}), [members]);

  return (
    <div className="fade">
      <div className="filter-rail">
        {FILTERS.map(x => {
          const on = f === x.k;
          return (
            <button
              key={x.k}
              className={'fchip' + (on ? ' on' : '')}
              onClick={() => setF(x.k)}
              style={on ? ({ '--fc': x.c, '--fcb': x.b } as React.CSSProperties) : undefined}
            >
              {x.dot && <span className="fd" style={{ background: x.c }} />}
              {x.l}
              <span className="cnt tnum">{x.k === 'all' ? members.length : (counts[x.k] || 0)}</span>
            </button>
          );
        })}
      </div>

      <div className="mcards">
        {list.map(m => {
          const g = glowOf(m);
          return (
            <div key={m.id} className={'mcard ' + g} onClick={() => open(m.id)}>
              <div className="av-m">{initials(m.name)}</div>
              <div className="info">
                <div className="nm">{m.name}</div>
                <div className="kalan tnum">{kalanText(m)}</div>
              </div>
              <Icon name="chev" size={17} className="chev" />
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
            Bu kategoride üye yok.
          </div>
        )}
      </div>
    </div>
  );
}
