import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { initials, colorFor } from '../data';
import type { GymSummary, SubStatus } from '../types';
import Icon from './Icon';

function daysLeft(endDate: string): number {
  const end = new Date(endDate + 'T23:59:59');
  return Math.ceil((end.getTime() - Date.now()) / 864e5);
}

// status shown in the panel (expired is derived from the date)
function effStatus(g: GymSummary): SubStatus {
  if (g.subscription.status === 'suspended') return 'suspended';
  if (daysLeft(g.subscription.endDate) < 0) return 'expired';
  return g.subscription.status;
}

const STATUS_META: Record<SubStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'Aktif',     color: 'var(--ok)',   bg: 'rgba(70,224,138,0.14)' },
  trial:     { label: 'Deneme',    color: 'var(--warn)', bg: 'rgba(255,194,61,0.14)' },
  expired:   { label: 'Süresi doldu', color: 'var(--bad)', bg: 'rgba(255,77,82,0.14)' },
  suspended: { label: 'Askıda',    color: 'var(--tx-2)', bg: 'rgba(255,255,255,0.07)' },
};

function isoPlusDays(from: string, days: number) {
  const base = new Date(from + 'T00:00:00');
  const start = base.getTime() > Date.now() ? base : new Date();
  return new Date(start.getTime() + days * 864e5).toISOString().slice(0, 10);
}

const FILTERS: { k: SubStatus | 'all'; l: string }[] = [
  { k: 'all', l: 'Tümü' },
  { k: 'active', l: 'Aktif' },
  { k: 'trial', l: 'Deneme' },
  { k: 'expired', l: 'Süresi doldu' },
  { k: 'suspended', l: 'Askıda' },
];

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { fetchAllGyms, updateGymSubscription, deleteGym } = useStore();
  const [gyms, setGyms] = useState<GymSummary[] | null>(null);
  const [err, setErr] = useState('');
  const [sel, setSel] = useState<GymSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<SubStatus | 'all'>('all');
  const [confirmDel, setConfirmDel] = useState(false);

  const load = () => fetchAllGyms().then(setGyms).catch(e => setErr(String(e?.message || e)));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const total = gyms?.length ?? 0;
  const activeCount = gyms?.filter(g => effStatus(g) === 'active').length ?? 0;
  const trialCount = gyms?.filter(g => effStatus(g) === 'trial').length ?? 0;
  const mrr = gyms?.filter(g => effStatus(g) === 'active').reduce((s, g) => s + (g.subscription.priceUsd || 0), 0) ?? 0;

  const list = (gyms || []).filter(g => {
    if (filter !== 'all' && effStatus(g) !== filter) return false;
    if (!q.trim()) return true;
    return g.salonName.toLowerCase().includes(q.toLowerCase()) || g.email.toLowerCase().includes(q.toLowerCase());
  }).sort((a, b) => daysLeft(a.subscription.endDate) - daysLeft(b.subscription.endDate));

  async function act(patch: Partial<GymSummary['subscription']>) {
    if (!sel) return;
    setBusy(true);
    try {
      await updateGymSubscription(sel.uid, patch);
      setSel(s => s ? { ...s, subscription: { ...s.subscription, ...patch } } : s);
      setGyms(gs => gs?.map(g => g.uid === sel.uid ? { ...g, subscription: { ...g.subscription, ...patch } } : g) ?? null);
    } catch (e) { setErr(String((e as Error)?.message || e)); }
    setBusy(false);
  }

  const extend = (days: number) => sel && act({ status: 'active', endDate: isoPlusDays(sel.subscription.endDate, days) });

  async function doDelete() {
    if (!sel) return;
    setBusy(true);
    try {
      await deleteGym(sel.uid);
      setGyms(gs => gs?.filter(g => g.uid !== sel.uid) ?? null);
      setSel(null); setConfirmDel(false);
    } catch (e) { setErr(String((e as Error)?.message || e)); }
    setBusy(false);
  }

  return (
    <div className="admin">
      <div className="m-head detail-head">
        <button className="m-iconbtn" onClick={onClose} aria-label="Geri"><Icon name="arrowL" size={18} /></button>
        <div className="dh-eyebrow">Yönetici</div>
        <div className="actions">
          <button className="m-iconbtn" onClick={() => { setGyms(null); load(); }} aria-label="Yenile"><Icon name="trend" size={16} /></button>
        </div>
      </div>

      <div className="m-screen" style={{ paddingTop: 4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', marginBottom: 14 }}>Kontrol Paneli</h1>

        {/* metrics */}
        <div className="adm-stats">
          <div className="adm-stat"><div className="adm-v tnum" style={{ color: '#4ade80' }}>${mrr}</div><div className="adm-l">Aylık gelir (MRR)</div></div>
          <div className="adm-stat"><div className="adm-v tnum">{total}</div><div className="adm-l">Toplam salon</div></div>
          <div className="adm-stat"><div className="adm-v tnum" style={{ color: 'var(--ok)' }}>{activeCount}</div><div className="adm-l">Aktif abone</div></div>
          <div className="adm-stat"><div className="adm-v tnum" style={{ color: 'var(--warn)' }}>{trialCount}</div><div className="adm-l">Denemede</div></div>
        </div>

        {err && <div className="auth-err" style={{ marginTop: 14 }}>{err}</div>}

        <div className="m-search" style={{ margin: '16px 0 12px' }}>
          <Icon name="search" size={17} style={{ color: 'var(--tx-3)', flexShrink: 0 }} />
          <input placeholder="Salon veya e-posta ara…" value={q} onChange={e => setQ(e.target.value)} />
          {q && <button className="fld-eye" onClick={() => setQ('')}><Icon name="x" size={15} /></button>}
        </div>

        <div className="filter-rail">
          {FILTERS.map(f => (
            <button key={f.k} className={'fchip' + (filter === f.k ? ' on' : '')} onClick={() => setFilter(f.k)}>
              {f.l}
            </button>
          ))}
        </div>

        {gyms === null && !err && (
          <div className="row" style={{ justifyContent: 'center', padding: '30px 0' }}><span className="spin" /></div>
        )}

        <div className="mcards">
          {list.map(g => {
            const st = effStatus(g);
            const meta = STATUS_META[st];
            const dl = daysLeft(g.subscription.endDate);
            return (
              <div key={g.uid} className="mcard" onClick={() => { setSel(g); setConfirmDel(false); }}>
                <div className="av-m" style={{ background: colorFor(g.salonName) }}>{initials(g.salonName)}</div>
                <div className="info">
                  <div className="nm">{g.salonName}</div>
                  <div className="kalan tnum" style={{ fontSize: 12 }}>{g.email} · {g.memberCount} üye</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 6 }}>
                  <span className="adm-badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                  <div className="muted tnum" style={{ fontSize: 11, marginTop: 4 }}>
                    {dl < -365 ? 'eski hesap' : dl < 0 ? `${Math.abs(dl)}g önce` : `${dl}g kaldı`}
                  </div>
                </div>
              </div>
            );
          })}
          {gyms !== null && list.length === 0 && <div className="muted" style={{ textAlign: 'center', padding: 20 }}>Kayıt yok.</div>}
        </div>
      </div>

      {/* gym action modal */}
      {sel && (
        <div className="ios-guide" onClick={() => !busy && setSel(null)}>
          <div className="ios-guide-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div className="ios-guide-title" style={{ marginBottom: 4 }}>{sel.salonName}</div>
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>{sel.email}</div>

            <div className="adm-kv"><span>Durum</span><b style={{ color: STATUS_META[effStatus(sel)].color }}>{STATUS_META[effStatus(sel)].label}</b></div>
            <div className="adm-kv"><span>Bitiş</span><b className="tnum">{sel.subscription.endDate}</b></div>
            <div className="adm-kv"><span>Üye sayısı</span><b className="tnum">{sel.memberCount}</b></div>
            <div className="adm-kv"><span>Aylık ücret</span><b className="tnum">${sel.subscription.priceUsd}</b></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
              <button className="btn" disabled={busy} onClick={() => extend(30)}>+1 Ay</button>
              <button className="btn" disabled={busy} onClick={() => extend(365)}>+1 Yıl</button>
            </div>
            <button className="btn" style={{ marginTop: 8, fontSize: 13, color: 'var(--warn)' }} disabled={busy}
              onClick={() => act({ endDate: new Date(Date.now() - 864e5).toISOString().slice(0, 10) })}>
              Süreyi şimdi bitir
            </button>
            {effStatus(sel) === 'suspended'
              ? <button className="btn" style={{ marginTop: 8, color: 'var(--ok)' }} disabled={busy} onClick={() => act({ status: 'active' })}>Aktifleştir</button>
              : <button className="btn danger" style={{ marginTop: 8 }} disabled={busy} onClick={() => act({ status: 'suspended' })}>Hesabı askıya al</button>}

            {!confirmDel ? (
              <button className="btn" style={{ marginTop: 8, color: 'var(--bad)', fontSize: 13 }} disabled={busy} onClick={() => setConfirmDel(true)}>
                Hesabı kalıcı sil
              </button>
            ) : (
              <div style={{ marginTop: 8, background: 'rgba(255,77,82,0.08)', border: '1px solid rgba(255,77,82,0.25)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12.5, color: 'var(--tx-2)', marginBottom: 10, lineHeight: 1.4 }}>
                  Bu salonun <b>tüm verisi</b> (üyeler dahil) kalıcı silinecek. Geri alınamaz.
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn" style={{ flex: 1, fontSize: 13 }} disabled={busy} onClick={() => setConfirmDel(false)}>Vazgeç</button>
                  <button className="btn danger" style={{ flex: 1, fontSize: 13 }} disabled={busy} onClick={doDelete}>
                    {busy ? <span className="spin" /> : 'Evet, sil'}
                  </button>
                </div>
              </div>
            )}
            <button className="btn" style={{ marginTop: 8 }} disabled={busy} onClick={() => setSel(null)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
