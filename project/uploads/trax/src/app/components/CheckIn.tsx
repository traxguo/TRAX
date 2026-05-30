import { useState } from 'react';
import { useStore } from '../store';
import { colorFor, initials, todayCheckins } from '../data';
import type { CheckinItem, Member } from '../types';
import Icon from './Icon';

export default function CheckIn() {
  const { members } = useStore();
  const [q, setQ] = useState('');
  const [confirmed, setConfirmed] = useState<Member | null>(null);
  const [feed, setFeed] = useState<CheckinItem[]>(todayCheckins);

  const results = q.trim()
    ? members.filter(m =>
        m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q)
      ).slice(0, 3)
    : [];

  const doCi = (m: Member) => {
    setConfirmed(m);
    const now = new Date();
    const t = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    setFeed(prev => [{ id: m.id, name: m.name, time: t }, ...prev]);
    setQ('');
    setTimeout(() => setConfirmed(null), 2600);
  };

  return (
    <div className="fade">
      <div className="m-search big">
        <Icon name="search" size={22} style={{ color: 'var(--tx-3)' }} />
        <input autoFocus placeholder="Üye ara…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {confirmed ? (
        <div className="ci-confirm" style={{ marginTop: 16 }}>
          <div className="ci-check">
            <Icon name="check" size={36} stroke={2.6} style={{ color: '#fff' }} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--acc)', fontWeight: 700, marginBottom: 6 }}>
            Giriş onaylandı
          </div>
          <div style={{ fontSize: 24, fontWeight: 760, letterSpacing: '-0.5px' }}>{confirmed.name}</div>
          <div className="muted" style={{ marginTop: 5, fontSize: 13 }}>{confirmed.plan} · Hoş geldin 💪</div>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 16 }}>
          {results.map(m => {
            const blocked = m.status === 'expired' || m.status === 'frozen';
            return (
              <div key={m.id} className="card"
                onClick={() => !blocked && doCi(m)}
                style={{ display: 'flex', alignItems: 'center', gap: 13, cursor: blocked ? 'default' : 'pointer', borderColor: blocked ? 'var(--line)' : 'rgba(255,59,67,0.3)' }}>
                <div className="av" style={{ width: 44, height: 44, background: colorFor(m.name), fontSize: 16 }}>
                  {initials(m.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 680 }}>{m.name}</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{m.plan}</div>
                </div>
                {blocked
                  ? <span className="pill bad"><Icon name="ban" size={12} />Engel</span>
                  : <Icon name="check" size={22} stroke={2.4} style={{ color: 'var(--acc)' }} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16, textAlign: 'center', padding: '40px 22px', border: '1px dashed var(--line-2)', background: 'transparent' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--panel-2)', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: 'var(--tx-3)' }}>
            <Icon name="scan" size={26} />
          </div>
          <div style={{ fontWeight: 650, marginBottom: 5 }}>Üye arayın veya QR okutun</div>
          <div className="muted" style={{ fontSize: 13 }}>İsim ya da telefon yazın.</div>
        </div>
      )}

      <div className="section-h">
        <h2>Bugünkü girişler</h2>
        <span className="link tnum">{feed.length}</span>
      </div>
      <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {feed.map((c, i) => (
          <div key={i} className="feed">
            <div className="av" style={{ width: 34, height: 34, background: colorFor(c.name), fontSize: 13 }}>
              {initials(c.name)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
            <div className="t tnum">{c.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
