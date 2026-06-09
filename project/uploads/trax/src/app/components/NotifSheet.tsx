import { useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf } from '../utils';
import { activity } from '../data';
import Sheet from './Sheet';
import Icon from './Icon';

interface NotifSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenMember: (id: number) => void;
}

interface NotifItem {
  id: string;
  mid?: number;
  ico: string;
  tone: string;
  t: string;
  s: string;
}

export default function NotifSheet({ open, onClose, onOpenMember }: NotifSheetProps) {
  const { members, notifRead, markNotifsRead } = useStore();
  const t = useT();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(markNotifsRead, 900);
      return () => clearTimeout(timer);
    }
  }, [open, markNotifsRead]);

  const items = useMemo<NotifItem[]>(() => {
    const out: NotifItem[] = [];
    members.forEach(m => {
      const g = glowOf(m);
      if (g === 's-red') out.push({ id: 'r' + m.id, mid: m.id, ico: 'clock', tone: 'bad', t: t.notifExpired(m.name), s: `${t.daysAgo(m.daysLeft)} · ${m.plan}` });
      else if (g === 's-yellow') out.push({ id: 'y' + m.id, mid: m.id, ico: 'clock', tone: 'warn', t: t.notifExpiring(m.name), s: `${t.daysLeftN(m.daysLeft)} · ${m.plan}` });
    });
    activity.filter(a => a.type === 'join').forEach((a, i) => {
      out.push({ id: 'j' + i, ico: 'userplus', tone: 'acc', t: t.notifJoined(a.who), s: `${a.text} · ${a.time}` });
    });
    return out.sort((a, b) => (a.tone === 'bad' ? -1 : 1));
  }, [members, t]);

  return (
    <Sheet open={open} onClose={onClose} eyebrow={t.todayEyebrow} title={t.notifTitle}
      footer={!notifRead && items.length > 0
        ? <button className="btn" onClick={markNotifsRead}>{t.markAllRead}</button>
        : null}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(n => (
          <div key={n.id} className="nrow"
            onClick={() => { if (n.mid) { onOpenMember(n.mid); onClose(); } }}
            style={{ cursor: n.mid ? 'pointer' : 'default' }}>
            <div className={'nic ' + n.tone}><Icon name={n.ico} size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.t}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{n.s}</div>
            </div>
            {n.mid && <Icon name="chev" size={15} style={{ color: 'var(--tx-3)' }} />}
          </div>
        ))}
        {items.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>{t.noNotifs}</div>
        )}
      </div>
    </Sheet>
  );
}
