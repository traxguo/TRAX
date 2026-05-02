import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation, useParams, Link } from 'react-router';
import { Bell, Home, Users, ChevronLeft, Phone, Mail, Search, Plus, X, Check, Clock, BarChart2, Filter, ArrowUpRight, CreditCard, Calendar, UserPlus, Dumbbell, CheckCircle2, Zap, MessageCircle, Edit3, Send, Save, Pencil, Trash2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Login } from './Login';
import { mockMembers as initialMembers, revenueData } from './data';
import type { Member } from './data';

const AMBER = '#F59E0B';
const AMBER2 = '#D97706';
const AMBER_GLOW = 'rgba(245,158,11,0.28)';

const CSS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  input::placeholder { color: rgba(255,255,255,0.2); }
  select option { background: #1a1a1a; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
  @keyframes slideUp { from{transform:translateY(32px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
  @keyframes dangerRing {
    0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0),inset 0 0 0 1px rgba(239,68,68,0.3)}
    50%{box-shadow:0 0 0 3px rgba(239,68,68,0.12),inset 0 0 0 1px rgba(239,68,68,0.6)}
  }
  @keyframes warnRing {
    0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0),inset 0 0 0 1px rgba(245,158,11,0.25)}
    50%{box-shadow:0 0 0 3px rgba(245,158,11,0.1),inset 0 0 0 1px rgba(245,158,11,0.55)}
  }
  @keyframes dotBeat { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.5);opacity:0.5} }
  @keyframes cardIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fabPop { from{transform:scale(0.5) rotate(-45deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes navIn { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes chartFade { from{opacity:0} to{opacity:1} }
  .press { transition:transform 0.12s ease; cursor:pointer; }
  .press:active { transform:scale(0.975); }
`;

const calcDays = (endDate: string): number => {
  if (!endDate || endDate.trim() === '' || endDate === '-') return 999;
  let day = 0, month = 0, year = 0;
  if (endDate.includes('.')) {
    const p = endDate.split('.');
    if (p.length !== 3) return 999;
    day = parseInt(p[0]); month = parseInt(p[1]); year = parseInt(p[2]);
  } else if (endDate.includes('-')) {
    const p = endDate.split('-');
    if (p.length !== 3) return 999;
    year = parseInt(p[0]); month = parseInt(p[1]); day = parseInt(p[2]);
  } else return 999;
  
  if (!day || !month || !year || year < 2000) return 999;
  const d = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

type Status = 'expired' | 'warn' | 'ok';
const getStatus = (d: number): Status => d < 0 ? 'expired' : d <= 7 ? 'warn' : 'ok';
const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
const toInputDate = (s: string) => {
  if (!s || s === '-') return '';
  if (s.includes('-')) return s;
  const p = s.split('.');
  if (p.length !== 3) return '';
  return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
};
const toDisplayDate = (s: string) => {
  if (!s) return '';
  if (s.includes('.')) return s;
  const p = s.split('-');
  if (p.length !== 3) return '';
  return `${p[2]}.${p[1]}.${p[0]}`;
};

const getWhatsAppHref = (phone: string, msg: string) => {
  const c = phone.replace(/\D/g, '');
  const intl = c.startsWith('90') ? c : c.startsWith('0') ? '90' + c.slice(1) : '90' + c;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
};

const TEMPLATES = {
  expiring: 'Merhaba {isim}, paketinizin süresi {gun} gün içinde dolmaktadır. 🏋️',
  expired: 'Merhaba {isim}, paketinizin süresi dolmuştur. Sizi yeniden aramızda görmek isteriz! 💪'
};

const buildMsg = (tpl: string, m: Member) => tpl.replace(/{isim}/g, m.name.split(' ')[0]).replace(/{gun}/g, String(Math.max(0, m.daysRemaining)));

type StoreCtx = {
  members: Member[];
  addMember: (m: Member) => void;
  updateMember: (m: Member) => void;
  deleteMember: (id: string) => void;
};

const Ctx = createContext<StoreCtx>({ members: [], addMember: () => { }, updateMember: () => { }, deleteMember: () => { } });
const useStore = () => useContext(Ctx);

const Avatar = ({ name, size = 44, status }: { name: string; size?: number; status: Status }) => {
  const bg = status === 'expired' ? 'linear-gradient(145deg,#3b0d0d,#7f1d1d)' : status === 'warn' ? 'linear-gradient(145deg,#3b2000,#92400e)' : 'linear-gradient(145deg,#0d2b1a,#14532d)';
  const dc = status === 'expired' ? '#ef4444' : status === 'warn' ? '#f59e0b' : '#22c55e';
  const da = status === 'ok' ? 'none' : status === 'expired' ? 'dotBeat 2s ease-in-out infinite' : 'dotBeat 2.4s ease-in-out infinite';
  
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.34, fontWeight: 900, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em' }}>{getInitials(name)}</span>
      </div>
      <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: dc, border: '1.5px solid #0d0d0d', animation: da }} />
    </div>
  );
};

const StatusBadge = ({ days }: { days: number }) => {
  const s = getStatus(days);
  const label = s === 'expired' ? 'SÜRESİ DOLDU' : `${days} GÜN KALDI`;
  const color = s === 'expired' ? '#f87171' : s === 'warn' ? '#fbbf24' : '#4ade80';
  const bg = s === 'expired' ? 'rgba(239,68,68,0.1)' : s === 'warn' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)';
  const border = s === 'expired' ? 'rgba(239,68,68,0.2)' : s === 'warn' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)';
  return <span style={{ fontSize: 10, fontWeight: 800, color, background: bg, border: `1px solid ${border}`, padding: '3px 8px', borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</span>;
};

const Skel = ({ w = '100%', h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 0, bottom: 0, width: '60%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)', animation: 'shimmer 1.4s infinite' }} />
  </div>
);

const MemberSkel = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 16, background: '#1a1a1a' }}>
    <Skel w={44} h={44} r={12} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Skel w="55%" h={13} />
      <Skel w="38%" h={10} />
    </div>
    <Skel w={80} h={22} r={999} />
  </div>
);

const MemberCard = ({ m, onClick, delay = 0 }: { m: Member; onClick: () => void; delay?: number }) => {
  const s = getStatus(m.daysRemaining);
  const pulse = s === 'expired' ? 'dangerRing 2s ease-in-out infinite' : s === 'warn' ? 'warnRing 2.4s ease-in-out infinite' : 'none';
  const border = s === 'expired' ? 'rgba(239,68,68,0.3)' : s === 'warn' ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)';
  
  return (
    <button className="press" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 16, width: '100%', textAlign: 'left', background: '#1a1a1a', border: `1px solid ${border}`, animation: `cardIn 0.3s ease ${delay}s both${s !== 'ok' ? `, ${pulse}` : ''}` }}>
      <Avatar name={m.name} size={44} status={s} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{m.name}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.package}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        <StatusBadge days={m.daysRemaining} />
        {m.endDate && m.endDate !== '-' && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>Bitiş: {m.endDate}</span>}
      </div>
    </button>
  );
};

const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: 13, fontSize: 14, color: 'white', outline: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' };

const ModalBack = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
    <div style={{ width: '100%', background: '#151515', borderRadius: '26px 26px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '22px 20px 44px', animation: 'slideUp 0.28s ease' }}>{children}</div>
  </div>
);

const AddMemberModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Member) => void }) => {
  const packages = ['Aylık Sınırsız', '10 Derslik Paket', '5 Derslik Paket', '20 Derslik Paket', 'Yıllık Üyelik'];
  const [form, setForm] = useState({ name: '', phone: '', email: '', pkg: '', amount: '', start: '', end: '' });
  const [busy, setBusy] = useState(false);
  const ok = form.name && form.phone && form.pkg;
  
  const submit = () => {
    if (!ok) return;
    setBusy(true);
    setTimeout(() => {
      const e = toDisplayDate(form.end);
      onAdd({
        id: Date.now().toString(),
        name: form.name,
        phone: form.phone,
        email: form.email,
        img: '',
        package: form.pkg,
        daysRemaining: calcDays(e),
        paymentStatus: 'unpaid',
        totalAmount: parseInt(form.amount) || 0,
        paidAmount: 0,
        startDate: toDisplayDate(form.start) || new Date().toLocaleDateString('tr-TR'),
        endDate: e,
        isActive: calcDays(e) >= 0,
        pastPayments: []
      });
      onClose();
    }, 400);
  };
  
  return (
    <ModalBack onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Yeni Üye</span>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.5)' }} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
        <input style={inp} placeholder="Ad Soyad *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input style={inp} placeholder="Telefon *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <input style={inp} placeholder="E-posta" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <select style={{ ...inp, appearance: 'none' } as React.CSSProperties} value={form.pkg} onChange={e => setForm(f => ({ ...f, pkg: e.target.value }))}>
          <option value="" disabled>Paket Seçin *</option>
          {packages.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input style={inp} placeholder="Toplam Tutar (₺)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Başlangıç</label>
            <input style={inp} type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Bitiş</label>
            <input style={inp} type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
        </div>
      </div>
      <button onClick={submit} disabled={!ok || busy} style={{ width: '100%', marginTop: 14, padding: 15, borderRadius: 15, fontWeight: 800, fontSize: 14, border: 'none', cursor: ok && !busy ? 'pointer' : 'default', background: `linear-gradient(135deg,${AMBER2},${AMBER})`, color: '#0d0d0d', opacity: ok && !busy ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <UserPlus style={{ width: 15, height: 15 }} />{busy ? 'Kaydediliyor...' : 'Üye Ekle'}
      </button>
    </ModalBack>
  );
};

const EditMemberModal = ({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (m: Member) => void }) => {
  const packages = ['Aylık Sınırsız', '10 Derslik Paket', '5 Derslik Paket', '20 Derslik Paket', 'Yıllık Üyelik'];
  const [form, setForm] = useState({ name: member.name, phone: member.phone, email: member.email || '', pkg: member.package, amount: String(member.totalAmount), start: toInputDate(member.startDate), end: toInputDate(member.endDate) });
  const [busy, setBusy] = useState(false);
  
  const save = () => {
    setBusy(true);
    setTimeout(() => {
      const e = toDisplayDate(form.end);
      onSave({ ...member, name: form.name || member.name, phone: form.phone || member.phone, email: form.email, package: form.pkg, totalAmount: parseInt(form.amount) || member.totalAmount, startDate: toDisplayDate(form.start) || member.startDate, endDate: e, daysRemaining: calcDays(e) });
      setBusy(false);
      onClose();
    }, 400);
  };
  
  return (
    <ModalBack onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Üyeyi Düzenle</span>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.5)' }} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
        <input style={inp} placeholder="Ad Soyad" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input style={inp} placeholder="Telefon" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <input style={inp} placeholder="E-posta" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <select style={{ ...inp, appearance: 'none' } as React.CSSProperties} value={form.pkg} onChange={e => setForm(f => ({ ...f, pkg: e.target.value }))}>
          {packages.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input style={inp} placeholder="Toplam Tutar (₺)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Başlangıç</label>
            <input style={inp} type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Bitiş</label>
            <input style={inp} type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
        </div>
      </div>
      <button onClick={save} disabled={busy} style={{ width: '100%', marginTop: 14, padding: 15, borderRadius: 15, fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${AMBER2},${AMBER})`, color: '#0d0d0d', opacity: busy ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Check style={{ width: 15, height: 15 }} />{busy ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </ModalBack>
  );
};

const DeleteModal = ({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) => {
  const [busy, setBusy] = useState(false);
  return (
    <ModalBack onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 style={{ width: 20, height: 20, color: '#f87171' }} /></div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 8 }}>Üyeyi Sil</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}><span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{name}</span> kalıcı olarak silinecek.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 14, fontWeight: 700, fontSize: 14, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }}>Vazgeç</button>
        <button onClick={() => { setBusy(true); setTimeout(onConfirm, 400); }} disabled={busy} style={{ flex: 1, padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.12)', color: '#f87171', opacity: busy ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Trash2 style={{ width: 14, height: 14 }} />{busy ? 'Siliniyor...' : 'Sil'}
        </button>
      </div>
    </ModalBack>
  );
};

const WAPanel = ({ onClose }: { onClose: () => void }) => {
  const { members } = useStore();
  const urgents = members.filter(m => m.daysRemaining <= 7);
  const [tpls, setTpls] = useState(TEMPLATES);
  const [edit, setEdit] = useState<'expiring' | 'expired' | null>(null);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  
  return (
    <ModalBack onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageCircle style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)' }} /><span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>WhatsApp Bildirimler</span></div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.4)' }} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '70vh', overflowY: 'auto' }}>
        {(['expiring', 'expired'] as const).map(type => (
          <div key={type} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{type === 'expiring' ? '⚠️ Az kalan' : '⊘ Süresi dolan'}</span>
              {edit === type ? (
                <button onClick={() => { setTpls(t => ({ ...t, [type]: draft })); setEdit(null); }} style={{ fontSize: 11, fontWeight: 700, color: AMBER, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Save style={{ width: 11, height: 11 }} />Kaydet</button>
              ) : (
                <button onClick={() => { setDraft(tpls[type]); setEdit(type); }} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 style={{ width: 11, height: 11 }} />Düzenle</button>
              )}
            </div>
            {edit === type ? (
              <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, color: 'white', fontSize: 12, resize: 'none', outline: 'none', lineHeight: 1.5 }} />
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{tpls[type]}</p>
            )}
          </div>
        ))}
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>Gönder ({urgents.length})</p>
        {urgents.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '16px 0' }}>Tüm üyeler aktif 🎉</p>
        ) : urgents.map(m => {
          const tpl = m.daysRemaining < 0 ? tpls.expired : tpls.expiring;
          const href = getWhatsAppHref(m.phone, buildMsg(tpl, m));
          const isSent = sent.includes(m.id);
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 12px' }}>
              <Avatar name={m.name} size={36} status={getStatus(m.daysRemaining)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>{m.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{m.daysRemaining < 0 ? `${Math.abs(m.daysRemaining)} gün önce doldu` : `${m.daysRemaining} gün kaldı`}</p>
              </div>
              <a href={href} target="_blank" rel="noreferrer" onClick={() => setSent(s => [...s, m.id])} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0, textDecoration: 'none', background: isSent ? 'rgba(255,255,255,0.05)' : 'rgba(37,211,102,0.1)', color: isSent ? 'rgba(255,255,255,0.3)' : '#25D366' }}>
                {isSent ? <><Check style={{ width: 12, height: 12 }} />Gönderildi</> : <><Send style={{ width: 12, height: 12 }} />Gönder</>}
              </a>
            </div>
          );
        })}
      </div>
    </ModalBack>
  );
};

const Header = ({ onAdd, onBell, urgentCount }: { onAdd?: () => void; onBell: () => void; urgentCount: number }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetail = location.pathname.includes('/members/');
  const isMembers = location.pathname === '/app/members';
  const base: React.CSSProperties = { padding: '50px 18px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 };
  
  if (isDetail) return (
    <header style={base}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft style={{ width: 16, height: 16 }} /><span style={{ fontSize: 14, fontWeight: 600 }}>Geri</span></button>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Üye Detayı</span>
      <div style={{ width: 56 }} />
    </header>
  );
  
  return (
    <header style={base}>
      <img src="/trax-logo-amber.png" alt="TRAX" style={{ height: 22, filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.6)) drop-shadow(0 0 24px rgba(245,158,11,0.2))' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isMembers && onAdd && <button onClick={onAdd} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${AMBER2},${AMBER})`, boxShadow: `0 4px 16px ${AMBER_GLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fabPop 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}><Plus style={{ width: 17, height: 17, color: '#0d0d0d', strokeWidth: 2.5 }} /></button>}
        <button onClick={onBell} style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell style={{ width: 15, height: 15, color: urgentCount > 0 ? AMBER : 'rgba(255,255,255,0.4)' }} strokeWidth={1.5} />
          {urgentCount > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: AMBER, border: '1.5px solid #0d0d0d' }} />}
        </button>
      </div>
    </header>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const tabs = [{ path: '/app/home', icon: Home, label: 'Anasayfa' }, { path: '/app/members', icon: Users, label: 'Üyeler' }];
  
  return (
    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 24, paddingTop: 8, background: 'linear-gradient(to top,#0d0d0d 55%,transparent)', animation: 'navIn 0.4s ease 0.1s both' }}>
      <nav style={{ display: 'flex', background: 'rgba(25,25,25,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '5px 6px', gap: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, width: 90, height: 48, textDecoration: 'none', borderRadius: 999, background: active ? 'rgba(245,158,11,0.1)' : 'transparent', transition: 'background 0.2s ease' }}>
              <Icon style={{ width: 20, height: 20, color: active ? AMBER : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? AMBER : 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>(() => initialMembers.map(m => ({ ...m, daysRemaining: calcDays(m.endDate) })));
  const [showAdd, setShowAdd] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const isDetail = location.pathname.includes('/members/');
  const urgentCount = members.filter(m => m.daysRemaining <= 7).length;
  const addMember = (m: Member) => setMembers(p => [m, ...p]);
  const updateMember = (u: Member) => setMembers(p => p.map(m => m.id === u.id ? u : m));
  const deleteMember = (id: string) => setMembers(p => p.filter(m => m.id !== id));
  
  return (
    <Ctx.Provider value={{ members, addMember, updateMember, deleteMember }}>
      <style>{CSS}</style>
      <div style={{ width: '100%', height: '100%', background: '#0d0d0d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header onAdd={() => setShowAdd(true)} onBell={() => setShowBell(true)} urgentCount={urgentCount} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}><Outlet /></main>
        {!isDetail && <BottomNav />}
        {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={m => { addMember(m); setShowAdd(false); }} />}
        {showBell && <WAPanel onClose={() => setShowBell(false)} />}
      </div>
    </Ctx.Provider>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { members } = useStore();
  const expired = members.filter(m => m.daysRemaining < 0);
  const warning = members.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
  const active = members.filter(m => m.daysRemaining > 7 && m.daysRemaining < 999);
  const pending = members.reduce((s, m) => s + (m.totalAmount - m.paidAmount), 0);
  const thisWeek = [...warning].sort((a, b) => a.daysRemaining - b.daysRemaining);
  
  return (
    <div style={{ padding: '14px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Hero Chart */}
      <div style={{ background: 'linear-gradient(145deg,#1f1200,#2a1800)', borderRadius: 22, padding: '16px 16px 0', border: '1px solid rgba(245,158,11,0.15)', overflow: 'hidden', animation: 'cardIn 0.35s ease 0s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><BarChart2 style={{ width: 12, height: 12, color: 'rgba(245,158,11,0.5)' }} /><span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,158,11,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SON 7 GÜN GELİR</span></div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>₺32.450</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}><ArrowUpRight style={{ width: 12, height: 12, color: '#4ade80' }} /><span style={{ fontSize: 11, fontWeight: 800, color: '#4ade80' }}>%14</span><span style={{ fontSize: 10, color: 'rgba(74,222,128,0.6)', fontWeight: 500 }}>geçen haftaya göre</span></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>7 Gün Önce</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Bugün</span>
        </div>
        <div style={{ height: 80, marginLeft: -16, marginRight: -16, animation: 'chartFade 1s ease 0.3s both' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={AMBER} stopOpacity={0.45} /><stop offset="100%" stopColor={AMBER} stopOpacity={0} /></linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <Area type="monotone" dataKey="value" stroke={AMBER} strokeWidth={2.5} fill="url(#cg)" dot={false} isAnimationActive={false} filter="url(#glow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3 Stat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[{ label: 'Süresi Doldu', count: expired.length, icon: '🕐' }, { label: 'Bu Hafta', count: warning.length, icon: '⏳' }, { label: 'Aktif', count: active.length, icon: '✓' }].map(({ label, count, icon }, i) => (
          <div key={label} style={{ background: '#1a1a1a', borderRadius: 18, padding: '14px 12px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8, animation: `cardIn 0.3s ease ${0.1 + i * 0.06}s both` }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>{count}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', lineHeight: 1.3 }}>{label}</span>
          </div>
        ))}
      </div>
      
      {/* Tahsilat */}
      {pending > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 16, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', animation: 'cardIn 0.3s ease 0.28s both' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CreditCard style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)' }} /></div>
        <div style={{ flex: 1 }}><p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>BEKlEYEN TAHSİLAT</p><p style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>₺{pending.toLocaleString('tr-TR')}</p></div>
        <Link to="/app/members" style={{ fontSize: 12, fontWeight: 700, color: AMBER, textDecoration: 'none', padding: '7px 14px', borderRadius: 999, background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.15)` }}>Görüntüle →</Link>
      </div>}
      
      {/* Bu Hafta */}
      {thisWeek.length > 0 && <div style={{ background: '#1a1a1a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', animation: 'cardIn 0.3s ease 0.32s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)' }} /><span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>BU HAFTA BİTENLER</span></div>
          <Link to="/app/members" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Tümü →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px 14px' }}>
          {thisWeek.map(m => (
            <button key={m.id} onClick={() => navigate(`/app/members/${m.id}`)} className="press" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', width: '100%', textAlign: 'left', animation: 'warnRing 2.4s ease-in-out infinite', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Avatar name={m.name} size={36} status="warn" />
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{m.package}</p></div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}><span style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24', lineHeight: 1, display: 'block' }}>{m.daysRemaining}</span><span style={{ fontSize: 9, color: 'rgba(251,191,36,0.5)', fontWeight: 700, letterSpacing: '0.06em' }}>GÜN</span></div>
            </button>
          ))}
        </div>
      </div>}
      
      {/* Dolanlar */}
      {expired.length > 0 && <div style={{ background: '#1a1a1a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', animation: 'cardIn 0.3s ease 0.38s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)' }} /><span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>SÜRESİ DOLANLAR</span></div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 999 }}>{expired.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px 14px' }}>
          {expired.map(m => (
            <button key={m.id} onClick={() => navigate(`/app/members/${m.id}`)} className="press" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', width: '100%', textAlign: 'left', animation: 'dangerRing 2s ease-in-out infinite', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Avatar name={m.name} size={36} status="expired" />
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{m.package}</p></div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: '#f87171', letterSpacing: '0.06em', display: 'block' }}>DOLU</span><span style={{ fontSize: 10, color: 'rgba(239,68,68,0.45)', fontWeight: 500 }}>{Math.abs(m.daysRemaining)} gün önce</span></div>
            </button>
          ))}
        </div>
      </div>}
      
      {thisWeek.length === 0 && expired.length === 0 && <div style={{ background: '#1a1a1a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px' }}><span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>ÜYELER</span><Link to="/app/members" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Tümü →</Link></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px 14px' }}>{members.slice(0, 4).map((m, i) => <MemberCard key={m.id} m={m} onClick={() => navigate(`/app/members/${m.id}`)} delay={i * 0.05} />)}</div>
      </div>}
    </div>
  );
};

type FK = 'all' | 'red' | 'yellow' | 'green';

const MembersScreen = () => {
  const navigate = useNavigate();
  const { members } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FK>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  
  const filters: { key: FK; label: string }[] = [{ key: 'all', label: 'Tümü' }, { key: 'red', label: 'Süresi Doldu' }, { key: 'yellow', label: 'Bu Hafta' }, { key: 'green', label: 'Aktif' }];
  
  const list = useMemo(() => {
    let l = members;
    const q = search.trim().toLowerCase();
    if (q) l = l.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q));
    if (filter === 'red') l = l.filter(m => m.daysRemaining < 0);
    if (filter === 'yellow') l = l.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    if (filter === 'green') l = l.filter(m => m.daysRemaining > 7 && m.daysRemaining < 999);
    return l;
  }, [members, search, filter]);
  
  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(255,255,255,0.2)' }} />
        <input type="text" placeholder="İsim veya telefon ara..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 38, paddingRight: search ? 36 : 14 }} />
        {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.4)' }} /></button>}
      </div>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.18s ease', background: filter === key ? `linear-gradient(135deg,${AMBER2},${AMBER})` : 'rgba(255,255,255,0.07)', color: filter === key ? '#0d0d0d' : 'rgba(255,255,255,0.4)', boxShadow: filter === key ? `0 4px 14px ${AMBER_GLOW}` : 'none' }}>{label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Filter style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.15)' }} /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontWeight: 500 }}>{list.length} üye</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? [0, 1, 2, 3].map(i => <MemberSkel key={i} />) : list.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.15)' }}><Users style={{ width: 28, height: 28, margin: '0 auto 10px' }} /><p style={{ fontSize: 13 }}>Üye bulunamadı</p></div> : list.map((m, i) => <MemberCard key={m.id} m={m} onClick={() => navigate(`/app/members/${m.id}`)} delay={i * 0.04} />)}
      </div>
    </div>
  );
};

const MemberDetail = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const { members, updateMember, deleteMember } = useStore();
  const member = members.find(m => m.id === id);
  const [showPay, setShowPay] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [payAmt, setPayAmt] = useState('');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  
  if (!member) return <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '64px 0', fontSize: 14 }}>Üye bulunamadı.</div>;
  
  const status = getStatus(member.daysRemaining);
  const remaining = member.totalAmount - member.paidAmount;
  const pct = member.totalAmount > 0 ? Math.round(member.paidAmount / member.totalAmount * 100) : 0;
  const waHref = getWhatsAppHref(member.phone, buildMsg(member.daysRemaining < 0 ? TEMPLATES.expired : TEMPLATES.expiring, member));
  
  const pay = () => {
    const amt = Math.min(parseInt(payAmt) || 0, remaining);
    if (amt <= 0) return;
    setPaying(true);
    setTimeout(() => {
      updateMember({ ...member, paidAmount: member.paidAmount + amt, paymentStatus: member.paidAmount + amt >= member.totalAmount ? 'paid' : 'partial' });
      setPaying(false);
      setPaid(true);
      setPayAmt('');
      setTimeout(() => { setPaid(false); setShowPay(false); }, 1400);
    }, 700);
  };
  
  const cs: React.CSSProperties = { background: '#1a1a1a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', padding: 18, position: 'relative' };
  
  return (
    <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...cs, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'cardIn 0.3s ease 0.05s both' }}>
        <button onClick={() => setShowEdit(true)} style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }}><Pencil style={{ width: 11, height: 11 }} />Düzenle</button>
        <div style={{ marginBottom: 12, marginTop: 8 }}><Avatar name={member.name} size={70} status={status} /></div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>{member.name}</h2>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>{member.paymentStatus === 'paid' ? 'Ödeme Tamamlandı' : member.paymentStatus === 'partial' ? 'Kısmi Ödeme' : 'Ödeme Bekleniyor'}</span>
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <a href={`tel:${member.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}><Phone style={{ width: 13, height: 13 }} />{member.phone}</a>
          {member.email && <a href={`mailto:${member.email}`} style={{ width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}><Mail style={{ width: 13, height: 13 }} /></a>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, animation: 'cardIn 0.3s ease 0.1s both' }}>
        <a href={waHref} target="_blank" rel="noreferrer" style={{ flex: 1, padding: 13, borderRadius: 16, fontWeight: 700, fontSize: 13, border: '1px solid rgba(37,211,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(37,211,102,0.05)', color: 'rgba(37,211,102,0.7)', textDecoration: 'none' }}><MessageCircle style={{ width: 15, height: 15 }} />WhatsApp</a>
        <button onClick={() => setShowDel(true)} style={{ width: 48, borderRadius: 16, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.06)' }}><Trash2 style={{ width: 16, height: 16, color: '#f87171' }} /></button>
      </div>
      <div style={{ ...cs, animation: 'cardIn 0.3s ease 0.15s both' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>PAKET</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', background: 'rgba(255,255,255,0.04)', borderRadius: 13, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{member.package}</span><StatusBadge days={member.daysRemaining} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ icon: Calendar, label: 'Başlangıç', val: member.startDate || '-' }, { icon: Clock, label: 'Bitiş', val: member.endDate || '-' }].map(({ icon: Icon, label, val }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}><Icon style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} /><div><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{label}</p><p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{val}</p></div></div>
          ))}
        </div>
      </div>
      <div style={{ ...cs, animation: 'cardIn 0.3s ease 0.2s both' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>ÖDEME</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[{ label: 'Toplam', val: member.totalAmount }, { label: 'Ödenen', val: member.paidAmount }].map(({ label, val }) => (
            <div key={label} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 13, border: '1px solid rgba(255,255,255,0.05)' }}><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>{label}</p><p style={{ fontSize: 17, fontWeight: 900, color: 'white' }}>₺{val.toLocaleString('tr-TR')}</p></div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>İlerleme</span><span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{pct}%</span></div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: `linear-gradient(90deg,${AMBER2},${AMBER})`, transition: 'width 0.6s ease' }} /></div>
        </div>
        {remaining > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 10 }}><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Kalan</span><span style={{ fontSize: 15, fontWeight: 900, color: 'white' }}>₺{remaining.toLocaleString('tr-TR')}</span></div>}
        <button onClick={() => setShowPay(true)} disabled={remaining <= 0} style={{ width: '100%', padding: 14, borderRadius: 15, fontWeight: 800, fontSize: 14, border: 'none', cursor: remaining > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: remaining > 0 ? `linear-gradient(135deg,${AMBER2},${AMBER})` : 'rgba(255,255,255,0.05)', color: remaining > 0 ? '#0d0d0d' : 'rgba(255,255,255,0.2)', boxShadow: remaining > 0 ? `0 6px 18px ${AMBER_GLOW}` : 'none' }}><CreditCard style={{ width: 14, height: 14 }} />{remaining <= 0 ? 'Ödeme Tamamlandı' : 'Ödeme Al'}</button>
      </div>
      {member.pastPayments.length > 0 && <div style={{ ...cs, animation: 'cardIn 0.3s ease 0.25s both' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>GEÇMİŞ ÖDEMELER</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {member.pastPayments.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}><span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{p.month}</span><span style={{ fontSize: 11, fontWeight: 700, color: p.status === 'paid' ? 'rgba(255,255,255,0.55)' : p.status === 'partial' ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.2)' }}>{p.status === 'paid' ? 'Ödendi ✓' : p.status === 'partial' ? 'Eksik' : 'Bekleniyor'}</span></div>
          ))}
        </div>
      </div>}
      {showPay && <ModalBack onClose={() => { setShowPay(false); setPaid(false); }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Ödeme Al</span><button onClick={() => { setShowPay(false); setPaid(false); }} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.4)' }} /></button></div>
        <div style={{ padding: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 12 }}><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{member.name} — Kalan</p><p style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>₺{remaining.toLocaleString('tr-TR')}</p></div>
        {paid ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0' }}><CheckCircle2 style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.6)' }} /><p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Kaydedildi!</p></div> : <>
          <div style={{ position: 'relative', marginBottom: 10 }}><span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: 16, fontWeight: 700 }}>₺</span><input type="number" placeholder="Tutar" value={payAmt} onChange={e => setPayAmt(e.target.value)} style={{ ...inp, paddingLeft: 30, fontSize: 16, fontWeight: 700 }} /></div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>{[500, 1000, remaining].filter((v, i, a) => a.indexOf(v) === i && v > 0).map(v => <button key={v} onClick={() => setPayAmt(String(v))} style={{ flex: 1, padding: 8, fontSize: 11, fontWeight: 700, color: AMBER, background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.15)`, borderRadius: 12, cursor: 'pointer' }}>₺{v.toLocaleString('tr-TR')}</button>)}</div>
          <button onClick={pay} disabled={paying || !payAmt || parseInt(payAmt) <= 0} style={{ width: '100%', padding: 15, borderRadius: 15, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${AMBER2},${AMBER})`, color: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: paying || !payAmt || parseInt(payAmt) <= 0 ? 0.35 : 1 }}><Check style={{ width: 17, height: 17 }} />{paying ? 'Kaydediliyor...' : 'Onayla'}</button>
        </>}
      </ModalBack>}
      {showEdit && <EditMemberModal member={member} onClose={() => setShowEdit(false)} onSave={m => { updateMember(m); setShowEdit(false); }} />}
      {showDel && <DeleteModal name={member.name} onClose={() => setShowDel(false)} onConfirm={() => { deleteMember(member.id); navigate('/app/members'); }} />}
    </div>
  );
};

const W = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%', height: '100%', background: '#0d0d0d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{children}</div>
);

const router = createBrowserRouter([
  { path: '/', element: <W><Login /></W> },
  { path: '/login', element: <W><Login /></W> },
  { path: '/app', element: <W><Layout /></W>, children: [
    { path: 'home', element: <Dashboard /> },
    { path: 'members', element: <MembersScreen /> },
    { path: 'members/:id', element: <MemberDetail /> },
  ]},
]);

export default function App() { return <RouterProvider router={router} />; }
