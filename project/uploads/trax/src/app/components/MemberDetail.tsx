import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf, PLAN_LEN, waPhone, fmtIso } from '../utils';
import { colorFor, initials } from '../data';
import type { Member } from '../types';
import Icon from './Icon';

function statusColor(g: string) {
  return g === 's-red' ? 'var(--bad)' : g === 's-yellow' ? 'var(--warn)' : g === 's-frozen' ? 'var(--tx-2)' : 'var(--ok)';
}
function statusRGB(g: string) {
  return g === 's-red' ? '255,77,82' : g === 's-yellow' ? '255,194,61' : g === 's-frozen' ? '255,255,255' : '70,224,138';
}

interface DetailProps {
  id: number;
  back: () => void;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
}

export default function MemberDetail({ id, back, onEdit, onDelete }: DetailProps) {
  const { members, renewMember, attendanceLog, lang } = useStore();
  const t = useT();
  const m = members.find(x => x.id === id);
  const [renewed, setRenewed] = useState(false);
  const [showQR,  setShowQR]  = useState(false);
  const [qrUrl,   setQrUrl]   = useState('');

  useEffect(() => {
    if (!showQR || !m) return;
    QRCode.toDataURL(`TRAX-${m.id}`, {
      width: 260, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrUrl);
  }, [showQR, m?.id]);

  useEffect(() => { if (!m) back(); }, [m, back]);
  if (!m) return null;

  async function shareQR() {
    if (!qrUrl || !m) return;
    try {
      const blob = await (await fetch(qrUrl)).blob();
      const file = new File([blob], `trax-qr-${m.id}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'TRAX QR', text: m.name });
      } else if (navigator.share) {
        await navigator.share({ title: 'TRAX QR', text: m.name });
      }
    } catch { /* user cancelled */ }
  }

  const g = glowOf(m);
  const c = statusColor(g);
  const rgb = statusRGB(g);
  const len = PLAN_LEN[m.plan] || 30;
  const pct = m.daysLeft < 0 ? 100 : Math.max(5, Math.min(100, Math.round((1 - m.daysLeft / len) * 100)));

  // real check-in history from attendance log (latest first)
  const allDates = Object.keys(attendanceLog)
    .filter(k => (attendanceLog[k] || []).includes(m.id))
    .sort().reverse();
  const myDates = allDates.slice(0, 5);
  const history = [
    ...myDates.map(k => {
      const [y, mo, da] = k.split('-').map(Number);
      return { ico: 'scan', acc: true, t: t.checkedIn, s: `${da} ${t.months12s[mo - 1]} ${y}` };
    }),
    { ico: 'plus', acc: false, t: t.memberCreated, s: fmtIso(m.joinedAt, m.joined, t.months12s) },
  ];

  // live stats from the attendance log (stored visits/attendance are never updated)
  const realVisits = allDates.length;
  const cutoff = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);
  const recent = allDates.filter(k => k >= cutoff).length;
  const scheduledPerWeek = (m.days || []).length;
  const attendPct = scheduledPerWeek > 0
    ? Math.min(100, Math.round((recent / (scheduledPerWeek * 4)) * 100))
    : null;

  const phone = waPhone(m.phone, lang);
  const waMsg = encodeURIComponent(t.tmplWelcomeBody(m.name.split(' ')[0]));
  const waLink = `https://wa.me/${phone}?text=${waMsg}`;

  return (
    <div className="fade detail">
      {/* QR modal */}
      {showQR && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal-card" onClick={e => e.stopPropagation()}>
            <div className="qr-modal-name">{m.name}</div>
            <div className="qr-modal-sub">{t.memberQR}</div>
            {qrUrl
              ? <img src={qrUrl} alt="QR" className="qr-modal-img" />
              : <div className="qr-modal-loading"><div className="spin" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} /></div>
            }
            <div className="qr-modal-hint">{t.qrHint}</div>
            <div className="row" style={{ gap: 10, marginTop: 14 }}>
              <button className="btn" onClick={() => setShowQR(false)}>{t.closeBtn}</button>
              <button className="btn primary" onClick={shareQR} disabled={!qrUrl}>
                <Icon name="send" size={15} />{t.shareBtn}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="m-head detail-head">
        <button className="m-iconbtn" onClick={back} aria-label="Geri"><Icon name="arrowL" size={18} /></button>
        <div className="dh-eyebrow">{t.memberProfile}</div>
        <div className="actions">
          <button className="m-iconbtn" onClick={() => setShowQR(true)} aria-label="QR Kodu"><Icon name="scan" size={16} /></button>
          <button className="m-iconbtn" onClick={() => onEdit(m)} aria-label="Düzenle"><Icon name="edit" size={16} /></button>
          <button className="m-iconbtn danger" onClick={() => onDelete(m)} aria-label="Sil"><Icon name="trash" size={17} /></button>
        </div>
      </div>

      <div className="m-screen" style={{ paddingTop: 4 }}>
        {/* hero banner */}
        <div className="dhero" style={{ '--sc': c, '--srgb': rgb } as React.CSSProperties}>
          <div className="dhero-ring">
            <div className="dhero-av" style={{ background: colorFor(m.name) }}>{initials(m.name)}</div>
          </div>
          <div className="dhero-name">{m.name}</div>
          <div className="dhero-pills">
            <span className="dpill" style={{ color: c, background: `rgba(${rgb},0.14)`, borderColor: `rgba(${rgb},0.3)` }}>
              <span className="dd" style={{ background: c }} />
              {g === 's-red' ? t.statusExpired : g === 's-yellow' ? t.statusExpiring : g === 's-frozen' ? t.statusFrozen : t.statusActive}
            </span>
            <span className="dpill ghost"><Icon name="card" size={13} />{m.plan}</span>
          </div>
          <div className="dhero-days tnum" style={{ color: c }}>{t.kalan(m)}</div>
        </div>

        {/* membership progress / paket */}
        {m.kind === 'paket' ? (
          <div className="card dcard" style={{ marginTop: 16 }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 680, fontSize: 14 }}>{t.packageStatus}</span>
              <span className="tnum" style={{ marginLeft: 'auto', fontSize: 13, color: c, fontWeight: 700 }}>{m.adet} {t.sessions}</span>
            </div>
            <div className="bar" style={{ height: 9 }}>
              <i style={{ width: Math.max(6, Math.min(100, (m.adet ?? 0) * 10)) + '%', background: c, boxShadow: `0 0 12px ${c}` }} />
            </div>
            <div className="row" style={{ marginTop: 9, justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 11.5 }}>{t.startPfx}{fmtIso(m.joinedAt, m.joined, t.months12s)}</span>
              <span className="tnum" style={{ fontSize: 11.5, color: c, fontWeight: 650 }}>{t.kalan(m)}</span>
            </div>
          </div>
        ) : (
          <div className="card dcard" style={{ marginTop: 16 }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 680, fontSize: 14 }}>{t.membershipPrd}</span>
              <span className="muted tnum" style={{ marginLeft: 'auto', fontSize: 12.5 }}>{t.endPfx}{fmtIso(m.expiresAt, m.expires, t.months12s)}</span>
            </div>
            <div className="bar" style={{ height: 9 }}>
              <i style={{ width: pct + '%', background: c, boxShadow: `0 0 12px ${c}` }} />
            </div>
            <div className="row" style={{ marginTop: 9, justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 11.5 }}>{t.startPfx}{fmtIso(m.joinedAt, m.joined, t.months12s)}</span>
              <span className="tnum" style={{ fontSize: 11.5, color: c, fontWeight: 650 }}>%{pct}{t.completedSfx}</span>
            </div>
          </div>
        )}

        {/* stat tiles */}
        <div className="dstats">
          <div className="dstat">
            <div className="dstat-ic"><Icon name="scan" size={16} /></div>
            <div className="dstat-v tnum">{realVisits}</div>
            <div className="dstat-l">{t.totalVisits}</div>
          </div>
          <div className="dstat">
            <div className="dstat-ic" style={{ color: (attendPct ?? 0) >= 70 ? 'var(--ok)' : 'var(--warn)' }}><Icon name="trend" size={16} /></div>
            <div className="dstat-v tnum">{attendPct === null ? '—' : `%${attendPct}`}</div>
            <div className="dstat-l">{t.attendRate}</div>
          </div>
          <div className="dstat">
            <div className="dstat-ic"><Icon name="award" size={16} /></div>
            <div className="dstat-v" style={{ fontSize: 15 }}>{m.trainer}</div>
            <div className="dstat-l">{t.trainerLbl}</div>
          </div>
        </div>

        {/* contact */}
        <div className="section-h"><h2>{t.contactSec}</h2></div>
        <div className="card" style={{ padding: '6px 16px' }}>
          <a className="crow" href={'tel:' + m.phone.replace(/\s/g, '')}>
            <div className="crow-ic"><Icon name="phone" size={16} /></div>
            <div><div className="crow-k">{t.phoneLbl}</div><div className="crow-v tnum">{m.phone}</div></div>
            <Icon name="chev" size={15} style={{ marginLeft: 'auto', color: 'var(--tx-3)' }} />
          </a>
          {m.email && (
            <a className="crow" href={'mailto:' + m.email}>
              <div className="crow-ic"><Icon name="mail" size={16} /></div>
              <div style={{ minWidth: 0 }}><div className="crow-k">{t.emailLbl}</div><div className="crow-v" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.email}</div></div>
              <Icon name="chev" size={15} style={{ marginLeft: 'auto', color: 'var(--tx-3)' }} />
            </a>
          )}
          <a className="crow" href={waLink} target="_blank" rel="noreferrer">
            <div className="crow-ic" style={{ color: 'var(--ok)', background: 'rgba(70,224,138,0.12)', borderColor: 'rgba(70,224,138,0.25)' }}>
              <Icon name="whatsapp" size={16} />
            </div>
            <div><div className="crow-k">WhatsApp</div><div className="crow-v">{t.sendMsg}</div></div>
            <Icon name="chev" size={15} style={{ marginLeft: 'auto', color: 'var(--tx-3)' }} />
          </a>
        </div>

        {/* activity */}
        <div className="section-h"><h2>{t.activitySec}</h2></div>
        <div className="card">
          <div className="timeline">
            {history.map((h, i) => (
              <div key={i} className="tl-item">
                <div className={'tl-dot' + (h.acc ? ' acc' : '')}><Icon name={h.ico} size={15} /></div>
                <div className="tl-body"><div className="t">{h.t}</div><div className="s">{h.s}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* actions */}
        {renewed ? (
          <div className="row" style={{ justifyContent: 'center', gap: 9, color: 'var(--ok)', fontWeight: 650, padding: '20px 0 6px' }}>
            <Icon name="check" size={18} stroke={2.4} />
            {m.kind === 'paket' ? t.sessionsAdded : t.memberRenewed}
          </div>
        ) : (
          <button className="btn primary" style={{ marginTop: 18 }} onClick={() => { renewMember(m.id); setRenewed(true); }}>
            <Icon name="trend" size={17} />
            {m.kind === 'paket' ? t.addSessBtn : t.renewBtn}
          </button>
        )}
        <button className="btn danger" style={{ marginTop: 10, marginBottom: 8 }} onClick={() => onDelete(m)}>
          <Icon name="trash" size={16} />{t.deleteMember}
        </button>
      </div>
    </div>
  );
}
