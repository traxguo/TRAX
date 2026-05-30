import { useState } from 'react';
import { useStore } from '../store';
import { glowOf, kalanText, PLAN_LEN } from '../utils';
import { colorFor, initials } from '../data';
import type { Member } from '../types';
import Icon from './Icon';

function statusColor(g: string) {
  return g === 's-red' ? 'var(--bad)' : g === 's-yellow' ? 'var(--warn)' : g === 's-frozen' ? 'var(--tx-2)' : 'var(--ok)';
}
function statusRGB(g: string) {
  return g === 's-red' ? '255,77,82' : g === 's-yellow' ? '255,194,61' : g === 's-frozen' ? '255,255,255' : '70,224,138';
}
function statusLabel(g: string) {
  return g === 's-red' ? 'Süresi doldu' : g === 's-yellow' ? 'Bitmek üzere' : g === 's-frozen' ? 'Donduruldu' : 'Aktif';
}

interface DetailProps {
  id: number;
  back: () => void;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
}

export default function MemberDetail({ id, back, onEdit, onDelete }: DetailProps) {
  const { members, renewMember } = useStore();
  const m = members.find(x => x.id === id);
  const [renewed, setRenewed] = useState(false);

  if (!m) { back(); return null; }

  const g = glowOf(m);
  const c = statusColor(g);
  const rgb = statusRGB(g);
  const len = PLAN_LEN[m.plan] || 30;
  const pct = m.daysLeft < 0 ? 100 : Math.max(5, Math.min(100, Math.round((1 - m.daysLeft / len) * 100)));

  const history = [
    { ico: 'scan',  acc: true,  t: 'Salona giriş yaptı',         s: m.lastVisit },
    { ico: 'money', acc: false, t: 'Ödeme alındı · ₺1.450',      s: '12 May 2026 · Nakit' },
    { ico: 'trend', acc: true,  t: 'Üyelik yenilendi',            s: '12 May 2026' },
    { ico: 'user',  acc: false, t: 'PT seansı',                   s: '08 May 2026 · 07:00' },
    { ico: 'plus',  acc: true,  t: 'Üye kaydı oluşturuldu',       s: m.joined },
  ];

  const phone = '90' + (m.phone || '').replace(/\D/g, '').replace(/^0/, '');
  const waMsg = encodeURIComponent(`Merhaba ${m.name.split(' ')[0]}! TRAX stüdyosundan mesaj gönderiyoruz.`);
  const waLink = `https://wa.me/${phone}?text=${waMsg}`;

  return (
    <div className="fade detail">
      <div className="m-head detail-head">
        <button className="m-iconbtn" onClick={back} aria-label="Geri"><Icon name="arrowL" size={18} /></button>
        <div className="dh-eyebrow">Üye profili</div>
        <div className="actions">
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
              <span className="dd" style={{ background: c }} />{statusLabel(g)}
            </span>
            <span className="dpill ghost"><Icon name="card" size={13} />{m.plan}</span>
          </div>
          <div className="dhero-days tnum" style={{ color: c }}>{kalanText(m)}</div>
        </div>

        {/* membership progress / paket */}
        {m.kind === 'paket' ? (
          <div className="card dcard" style={{ marginTop: 16 }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 680, fontSize: 14 }}>Paket durumu</span>
              <span className="tnum" style={{ marginLeft: 'auto', fontSize: 13, color: c, fontWeight: 700 }}>{m.adet} seans</span>
            </div>
            <div className="bar" style={{ height: 9 }}>
              <i style={{ width: Math.max(6, Math.min(100, (m.adet ?? 0) * 10)) + '%', background: c, boxShadow: `0 0 12px ${c}` }} />
            </div>
            <div className="row" style={{ marginTop: 9, justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Başlangıç · {m.joined}</span>
              <span className="tnum" style={{ fontSize: 11.5, color: c, fontWeight: 650 }}>{kalanText(m)}</span>
            </div>
          </div>
        ) : (
          <div className="card dcard" style={{ marginTop: 16 }}>
            <div className="row" style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 680, fontSize: 14 }}>Üyelik süresi</span>
              <span className="muted tnum" style={{ marginLeft: 'auto', fontSize: 12.5 }}>Bitiş · {m.expires}</span>
            </div>
            <div className="bar" style={{ height: 9 }}>
              <i style={{ width: pct + '%', background: c, boxShadow: `0 0 12px ${c}` }} />
            </div>
            <div className="row" style={{ marginTop: 9, justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Başlangıç · {m.joined}</span>
              <span className="tnum" style={{ fontSize: 11.5, color: c, fontWeight: 650 }}>%{pct} tamamlandı</span>
            </div>
          </div>
        )}

        {/* stat tiles */}
        <div className="dstats">
          <div className="dstat">
            <div className="dstat-ic"><Icon name="scan" size={16} /></div>
            <div className="dstat-v tnum">{m.visits}</div>
            <div className="dstat-l">Toplam ziyaret</div>
          </div>
          <div className="dstat">
            <div className="dstat-ic" style={{ color: m.attendance >= 70 ? 'var(--ok)' : 'var(--warn)' }}><Icon name="trend" size={16} /></div>
            <div className="dstat-v tnum">%{m.attendance}</div>
            <div className="dstat-l">Devam oranı</div>
          </div>
          <div className="dstat">
            <div className="dstat-ic"><Icon name="award" size={16} /></div>
            <div className="dstat-v" style={{ fontSize: 15 }}>{m.trainer}</div>
            <div className="dstat-l">Antrenör</div>
          </div>
        </div>

        {/* contact */}
        <div className="section-h"><h2>İletişim</h2></div>
        <div className="card" style={{ padding: '6px 16px' }}>
          <a className="crow" href={'tel:' + m.phone.replace(/\s/g, '')}>
            <div className="crow-ic"><Icon name="phone" size={16} /></div>
            <div><div className="crow-k">Telefon</div><div className="crow-v tnum">{m.phone}</div></div>
            <Icon name="chev" size={15} style={{ marginLeft: 'auto', color: 'var(--tx-3)' }} />
          </a>
          {m.email && (
            <a className="crow" href={'mailto:' + m.email}>
              <div className="crow-ic"><Icon name="mail" size={16} /></div>
              <div style={{ minWidth: 0 }}><div className="crow-k">E-posta</div><div className="crow-v" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.email}</div></div>
              <Icon name="chev" size={15} style={{ marginLeft: 'auto', color: 'var(--tx-3)' }} />
            </a>
          )}
          <a className="crow" href={waLink} target="_blank" rel="noreferrer">
            <div className="crow-ic" style={{ color: 'var(--ok)', background: 'rgba(70,224,138,0.12)', borderColor: 'rgba(70,224,138,0.25)' }}>
              <Icon name="whatsapp" size={16} />
            </div>
            <div><div className="crow-k">WhatsApp</div><div className="crow-v">Mesaj gönder</div></div>
            <Icon name="chev" size={15} style={{ marginLeft: 'auto', color: 'var(--tx-3)' }} />
          </a>
        </div>

        {/* activity */}
        <div className="section-h"><h2>Hareket geçmişi</h2></div>
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
            {m.kind === 'paket' ? '10 seans eklendi' : 'Üyelik yenilendi'}
          </div>
        ) : (
          <button className="btn primary" style={{ marginTop: 18 }} onClick={() => { renewMember(m.id); setRenewed(true); }}>
            <Icon name="trend" size={17} />
            {m.kind === 'paket' ? 'Pakete 10 seans ekle' : 'Üyeliği yenile'}
          </button>
        )}
        <button className="btn danger" style={{ marginTop: 10, marginBottom: 8 }} onClick={() => onDelete(m)}>
          <Icon name="trash" size={16} />Üyeyi sil
        </button>
      </div>
    </div>
  );
}
