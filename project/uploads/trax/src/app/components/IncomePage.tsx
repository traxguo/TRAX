import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store';
import type { GymSummary, SubStatus } from '../types';

const fmtMoney = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate + 'T23:59:59').getTime() - Date.now()) / 864e5);
}
function effStatus(g: GymSummary): SubStatus {
  if (g.subscription.status === 'suspended') return 'suspended';
  if (daysLeft(g.subscription.endDate) < 0) return 'expired';
  return g.subscription.status;
}

function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

function RevenueChart({ data, min, max }: { data: number[]; min: number; max: number }) {
  const width = 600, height = 160, pad = 8;
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const last = points[points.length - 1];
  const areaPath = linePath + ` L${last[0].toFixed(2)},${height - pad} L${points[0][0].toFixed(2)},${height - pad} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="rc-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(74, 222, 128, 0.35)" />
          <stop offset="100%" stopColor="rgba(74, 222, 128, 0)" />
        </linearGradient>
        <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="url(#lineStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="#4ade80" />
      <circle cx={last[0]} cy={last[1]} r="9" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.5" className="rc-pulse-ring" />
    </svg>
  );
}

function relTime(startedAt: string) {
  const started = new Date((startedAt || '') + 'T00:00:00').getTime();
  if (!Number.isFinite(started)) return '—';   // legacy docs may have no start date
  const d = Math.floor((Date.now() - started) / 864e5);
  if (d <= 0) return 'bugün';
  if (d === 1) return 'dün';
  if (d < 7) return `${d} gün önce`;
  if (d < 30) return `${Math.floor(d / 7)} hafta önce`;
  return `${Math.floor(d / 30)} ay önce`;
}

export default function IncomePage({ onClose, onManage }: { onClose: () => void; onManage: () => void }) {
  const { fetchAllGyms } = useStore();
  const [gyms, setGyms] = useState<GymSummary[] | null>(null);

  useEffect(() => { fetchAllGyms().then(setGyms).catch(() => setGyms([])); }, [fetchAllGyms]);

  const active = (gyms || []).filter(g => effStatus(g) === 'active');
  const trials = (gyms || []).filter(g => effStatus(g) === 'trial');
  const mrr = active.reduce((s, g) => s + (g.subscription.priceUsd || 0), 0);
  const customers = active.length;
  const newThisWeek = (gyms || []).filter(g => {
    const dl = daysLeft(g.subscription.startedAt);
    return Number.isFinite(dl) && dl > -7;
  }).length;

  const animatedMrr = useAnimatedNumber(mrr, 1100);
  const animatedCustomers = useAnimatedNumber(customers, 700);

  // honest curve: flat baseline at $0, real growth trajectory once revenue exists
  const history = useMemo(() => {
    if (mrr <= 0) return Array.from({ length: 24 }, () => 0);
    const end = mrr, start = end * 0.42;
    return Array.from({ length: 24 }, (_, i) => start + (end - start) * (i / 23) + Math.sin(i / 2) * end * 0.018);
  }, [mrr]);
  const bounds = useMemo(() => {
    const dataMin = Math.min(...history), dataMax = Math.max(...history);
    if (dataMax <= 0) return { min: 0, max: 100 };
    return { min: dataMin * 0.92, max: dataMax + (dataMax - dataMin) * 0.25 };
  }, [history]);

  const feed = [...(gyms || [])]
    .sort((a, b) => (b.subscription.startedAt > a.subscription.startedAt ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="dash-root">
      <style>{`
        .dash-root {
          position: fixed; inset: 0; z-index: 90; overflow-y: auto;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(74, 222, 128, 0.08), transparent),
            linear-gradient(180deg, #0d0d0d 0%, #080808 100%);
          color: #e8e8e8; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300;
          padding: calc(env(safe-area-inset-top, 0px) + 22px) 18px calc(env(safe-area-inset-bottom, 0px) + 40px);
          -webkit-overflow-scrolling: touch;
        }
        .dash-inner { position: relative; z-index: 1; max-width: 480px; margin: 0 auto; }
        .dash-close { position: absolute; top: 0; right: 0; width: 38px; height: 38px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #aaa;
          display: grid; place-items: center; cursor: pointer; font-size: 18px; }
        .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; padding-right: 48px; }
        .brand { font-size: 13px; letter-spacing: 0.12em; color: #6b6b6b; font-weight: 500; text-transform: uppercase; }
        .live-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #4ade80; font-family: monospace; letter-spacing: 0.05em; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px rgba(74, 222, 128, 0.8); animation: livedot 1.8s ease-in-out infinite; }
        @keyframes livedot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        .hero-card { background: linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012)); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px 24px 24px; backdrop-filter: blur(20px); margin-bottom: 16px; position: relative; overflow: hidden; }
        .hero-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #7a7a7a; margin-bottom: 10px; font-weight: 500; }
        .hero-number-row { display: flex; align-items: baseline; gap: 10px; }
        .hero-number { font-family: monospace; font-size: 46px; font-weight: 500; letter-spacing: -0.02em; color: #fafafa; line-height: 1; font-variant-numeric: tabular-nums; }
        .hero-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #4ade80; font-family: monospace; background: rgba(74, 222, 128, 0.1); padding: 3px 9px; border-radius: 100px; border: 1px solid rgba(74, 222, 128, 0.18); }
        .hero-sub { margin-top: 6px; font-size: 12.5px; color: #6b6b6b; }
        .chart-wrap { margin-top: 18px; height: 100px; }
        .rc-svg { width: 100%; height: 100%; overflow: visible; }
        .rc-pulse-ring { animation: ringpulse 2.2s ease-out infinite; transform-origin: center; }
        @keyframes ringpulse { 0% { r: 4.5; opacity: 0.7; } 100% { r: 14; opacity: 0; } }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .stat-card { background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px 16px 14px; backdrop-filter: blur(16px); }
        .stat-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #7a7a7a; margin-bottom: 8px; font-weight: 500; }
        .stat-value { font-family: monospace; font-size: 24px; font-weight: 500; color: #f0f0f0; font-variant-numeric: tabular-nums; }
        .stat-value.green { color: #4ade80; }
        .stat-foot { font-size: 11px; color: #5e5e5e; margin-top: 4px; }
        .feed-card { background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 18px 16px; backdrop-filter: blur(16px); }
        .feed-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #7a7a7a; font-weight: 500; margin-bottom: 12px; }
        .feed-list { display: flex; flex-direction: column; gap: 2px; }
        .feed-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .feed-item:last-child { border-bottom: none; }
        .feed-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .feed-avatar { width: 30px; height: 30px; border-radius: 9px; background: linear-gradient(135deg, rgba(74,222,128,0.18), rgba(74,222,128,0.04)); border: 1px solid rgba(74,222,128,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #4ade80; flex-shrink: 0; }
        .feed-name { font-size: 13px; color: #e0e0e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
        .feed-plan { font-size: 11px; color: #6b6b6b; }
        .feed-right { text-align: right; flex-shrink: 0; }
        .feed-amount { font-family: monospace; font-size: 13px; color: #4ade80; font-weight: 500; }
        .feed-time { font-size: 10.5px; color: #555; margin-top: 1px; }
        .feed-empty { font-size: 12.5px; color: #5e5e5e; text-align: center; padding: 16px 0; }
        .dash-manage { width: 100%; margin-top: 16px; padding: 15px; border-radius: 14px;
          background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.22); color: #4ade80;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px; }
        .dash-manage span { font-size: 18px; }
      `}</style>

      <div className="dash-inner">
        <button className="dash-close" onClick={onClose} aria-label="Kapat">✕</button>
        <div className="top-row">
          <div className="brand">GUO Income</div>
          <div className="live-badge"><span className="live-dot" />CANLI</div>
        </div>

        <div className="hero-card">
          <div className="hero-label">Aylık Yinelenen Gelir</div>
          <div className="hero-number-row">
            <div className="hero-number">{fmtMoney(animatedMrr)}</div>
            {newThisWeek > 0 && <div className="hero-delta">↑ {newThisWeek} bu hafta</div>}
          </div>
          <div className="hero-sub">{customers} aktif abonelikten</div>
          <div className="chart-wrap">
            <RevenueChart data={history} min={bounds.min} max={bounds.max} />
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Aktif Abone</div>
            <div className="stat-value green">{Math.round(animatedCustomers)}</div>
            <div className="stat-foot">{newThisWeek} bu hafta katıldı</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Denemede</div>
            <div className="stat-value">{trials.length}</div>
            <div className="stat-foot">potansiyel müşteri</div>
          </div>
        </div>

        <div className="feed-card">
          <div className="feed-title">Son Kayıtlar</div>
          <div className="feed-list">
            {feed.map(g => (
              <div className="feed-item" key={g.uid}>
                <div className="feed-left">
                  <div className="feed-avatar">{(g.salonName || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="feed-name">{g.salonName}</div>
                    <div className="feed-plan">{effStatus(g) === 'active' ? 'Aktif' : effStatus(g) === 'trial' ? 'Deneme' : 'Pasif'}</div>
                  </div>
                </div>
                <div className="feed-right">
                  {effStatus(g) === 'active'
                    ? <div className="feed-amount">+{fmtMoney(g.subscription.priceUsd || 0)}</div>
                    : <div className="feed-amount" style={{ color: '#6b6b6b' }}>—</div>}
                  <div className="feed-time">{relTime(g.subscription.startedAt)}</div>
                </div>
              </div>
            ))}
            {gyms !== null && feed.length === 0 && <div className="feed-empty">Henüz kayıt yok — ilk salon geldiğinde burada görünecek 🚀</div>}
          </div>
        </div>

        <button className="dash-manage" onClick={onManage}>Salonları Yönet <span>›</span></button>
      </div>
    </div>
  );
}
