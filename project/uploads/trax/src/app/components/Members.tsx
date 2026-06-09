import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf } from '../utils';
import { initials } from '../data';
import type { MemberGlow } from '../types';
import Icon from './Icon';

interface MembersProps {
  open: (id: number) => void;
}

const FILTER_KEYS = ['all', 'red', 'yellow', 'green', 'frozen'] as const;
type FilterKey = typeof FILTER_KEYS[number];
const FILTER_COLORS = {
  all:    { c: 'var(--acc)',  b: 'var(--acc-dim)',          dot: false },
  red:    { c: 'var(--bad)',  b: 'rgba(255,77,82,0.16)',    dot: true },
  yellow: { c: 'var(--warn)', b: 'rgba(255,194,61,0.16)',   dot: true },
  green:  { c: 'var(--ok)',   b: 'rgba(70,224,138,0.16)',   dot: true },
  frozen: { c: 'var(--tx-2)', b: 'rgba(255,255,255,0.07)',  dot: true },
};

export default function Members({ open }: MembersProps) {
  const { members } = useStore();
  const t = useT();
  const [f, setF] = useState<FilterKey>('all');
  const FILTERS = [
    { k: 'all'    as FilterKey, l: t.filterAll },
    { k: 'red'    as FilterKey, l: t.filterExpired },
    { k: 'yellow' as FilterKey, l: t.filterExpiring },
    { k: 'green'  as FilterKey, l: t.filterActive },
    { k: 'frozen' as FilterKey, l: t.filterFrozen },
  ];

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
          const col = FILTER_COLORS[x.k];
          return (
            <button
              key={x.k}
              className={'fchip' + (on ? ' on' : '')}
              onClick={() => setF(x.k)}
              style={on ? ({ '--fc': col.c, '--fcb': col.b } as React.CSSProperties) : undefined}
            >
              {col.dot && <span className="fd" style={{ background: col.c }} />}
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
                <div className="kalan tnum">{t.kalan(m)}</div>
              </div>
              <Icon name="chev" size={17} className="chev" />
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
            {t.noMembers}
          </div>
        )}
      </div>
    </div>
  );
}
