import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import {
  RouterProvider, createBrowserRouter, Outlet,
  useNavigate, useLocation, useParams, Link,
} from 'react-router';
import {
  Bell, Home, Users, ChevronLeft, Phone, Mail, Search,
  Plus, X, Check, Clock, CreditCard, Calendar, Dumbbell,
  CheckCircle2, MessageCircle, Edit3, Send, Save, Pencil,
  Trash2, TrendingDown, AlertTriangle, Wallet, Zap,
  ChevronRight, ArrowRight,
} from 'lucide-react';
import { Login } from './Login';
import { mockMembers as initialMembers } from './data';
import type { Member } from './data';
import { colors as C, radius as R, spacing as S } from './theme';

// ─── Sabitler ────────────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES = {
  expiring: 'Merhaba {isim}, paketinizin süresi {gun} gün içinde dolmaktadır. Üyeliğinizi yenilemek için bizimle iletişime geçebilirsiniz. Görüşmek dileğiyle! 🏋️',
  expired:  'Merhaba {isim}, paketinizin süresi maalesef dolmuştur. Sizi yeniden aramızda görmek isteriz! Bilgi için bize ulaşabilirsiniz. 💪',
};

// ─── Yardımcı fonksiyonlar ───────────────────────────────────────────────────
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

const getMember = (m: Member): Member => ({ ...m, daysRemaining: calcDays(m.endDate) });
const initStore = (): Member[] => initialMembers.map(getMember);

const getStatusColor = (days: number): 'green' | 'yellow' | 'red' =>
  days < 0 ? 'red' : days <= 7 ? 'yellow' : 'green';

const getStatusLabel = (days: number) =>
  days < 0 ? 'Süresi doldu' : days === 999 ? 'Tarih yok' : `${days} gün kaldı`;

const getWhatsAppHref = (phone: string, msg: string): string => {
  const c = phone.replace(/\D/g, '');
  const intl = c.startsWith('90') ? c : c.startsWith('0') ? '90' + c.slice(1) : '90' + c;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
};
const buildMsg = (tpl: string, m: Member) =>
  tpl.replace(/{isim}/g, m.name.split(' ')[0]).replace(/{gun}/g, String(Math.max(0, m.daysRemaining)));

// ─── Store Context ────────────────────────────────────────────────────────────
type StoreCtx = {
  members: Member[];
  addMember: (m: Member) => void;
  updateMember: (m: Member) => void;
  deleteMember: (id: string) => void;
};
const StoreContext = createContext<StoreCtx>({
  members: [], addMember: () => {}, updateMember: () => {}, deleteMember: () => {},
});
const useStore = () => useContext(StoreContext);

// ─── Page Transition ─────────────────────────────────────────────────────────
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), 20); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
      {children}
    </div>
  );
};

// ─── TraxLogo ────────────────────────────────────────────────────────────────
const TraxLogo = ({ size = 22 }: { size?: number }) => (
  <img
    src="/trax-logo-amber.png"
    alt="TRAX"
    style={{ height: `${size}px`, width: 'auto', filter: 'drop-shadow(0 0 8px rgba(217,119,6,0.6))' }}
  />
);

// ─── Payment Badge ────────────────────────────────────────────────────────────
const PaymentBadgeFull = ({ status }: { status: 'paid' | 'partial' | 'unpaid' }) => {
  const cfg = {
    paid:    { bg: C.successMuted,  color: C.success,  border: C.successBorder,  label: 'Ödeme Tamamlandı' },
    partial: { bg: C.warningMuted,  color: C.warning,  border: C.warningBorder,  label: 'Kısmi Ödeme' },
    unpaid:  { bg: C.dangerMuted,   color: C.danger,   border: C.dangerBorder,   label: 'Ödeme Bekleniyor' },
  }[status];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: R.full, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 40, statusColor }: { src: string; name: string; size?: number; statusColor?: string }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    {statusColor && (
      <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: 11, height: 11, borderRadius: '50%', background: statusColor, border: `2px solid ${C.surface}` }} />
    )}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  bg: string;
  onClick?: () => void;
}
const StatCard = ({ label, value, sub, icon, color, border, bg, onClick }: StatCardProps) => (
  <div
    onClick={onClick}
    style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: R.xl,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      cursor: onClick ? 'pointer' : 'default',
      flex: 1,
    }}
  >
    <div style={{ width: 34, height: 34, borderRadius: R.md, background: `rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color, fontWeight: 700, marginTop: 3 }}>{sub}</div>}
    </div>
    <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, count, color }: { icon: React.ReactNode; title: string; count?: number; color?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ color: color || C.textSecondary }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.textSecondary, letterSpacing: '-0.01em' }}>{title}</span>
    </div>
    {count !== undefined && (
      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: R.full, background: `rgba(255,255,255,0.06)`, color: color || C.textSecondary, border: `1px solid rgba(255,255,255,0.08)` }}>
        {count}
      </span>
    )}
  </div>
);

// ─── Member Row (Alert List) ───────────────────────────────────────────────────
const MemberAlertRow = ({ m, onClick }: { m: Member; onClick: () => void }) => {
  const sc = getStatusColor(m.daysRemaining);
  const hexColor = sc === 'yellow' ? C.warning : C.danger;
  const isCount = m.packageType === 'count';

  const sub = isCount
    ? (m.usedSessions !== undefined && m.totalSessions !== undefined
        ? `${m.totalSessions - m.usedSessions} ders kaldı`
        : '')
    : getStatusLabel(m.daysRemaining);

  return (
    <div onClick={onClick} className="meteor-wrap" style={{ '--glow-color': hexColor } as React.CSSProperties}>
      <div className="meteor-light" />
      <div className="mini-meteor-inner">
        <Avatar src={m.img} name={m.name} size={36} statusColor={hexColor} />
        <div style={{ flex: 1, minWidth: 0, zIndex: 2 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
          <p style={{ fontSize: 11, color: C.textTertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.package}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0, zIndex: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: sc === 'yellow' ? C.warningMuted : C.dangerMuted, color: hexColor, border: `1px solid ${sc === 'yellow' ? C.warningBorder : C.dangerBorder}` }}>
            {sc === 'red' ? 'BİTTİ' : 'AZ KALDI'}
          </span>
          {sub && <span style={{ fontSize: 10, color: hexColor, fontWeight: 600 }}>{sub}</span>}
        </div>
      </div>
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({ onAddMember, onBell, urgentCount }: { onAddMember: () => void; onBell: () => void; urgentCount: number }) => (
  <header style={{
    flexShrink: 0,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${C.surfaceBorder}`,
    zIndex: 30,
  }}>
    <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${S.pagePad}` }}>
      <TraxLogo size={20} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onBell}
          style={{ position: 'relative', width: 36, height: 36, borderRadius: R.md, background: urgentCount > 0 ? C.dangerMuted : 'rgba(255,255,255,0.05)', border: `1px solid ${urgentCount > 0 ? C.dangerBorder : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Bell style={{ width: 16, height: 16, color: urgentCount > 0 ? C.danger : C.textTertiary }} />
          {urgentCount > 0 && (
            <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: C.danger, border: `1.5px solid ${C.bg}`, animation: 'pulse-glow 2s ease infinite' }} />
          )}
        </button>
        <button
          onClick={onAddMember}
          style={{ width: 36, height: 36, borderRadius: R.md, background: `linear-gradient(135deg, ${C.brand}, ${C.brandLight})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${C.brandGlow}` }}
        >
          <Plus style={{ width: 18, height: 18, color: '#000' }} />
        </button>
      </div>
    </div>
  </header>
);

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const BottomNav = () => {
  const location = useLocation();
  const tabs = [
    { path: '/app/home', icon: Home, label: 'Anasayfa' },
    { path: '/app/members', icon: Users, label: 'Üyeler' },
  ];

  return (
    <div style={{
      flexShrink: 0,
      background: C.bg,
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      paddingTop: 8,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      zIndex: 40,
      borderTop: `1px solid ${C.surfaceBorder}`,
    }}>
      <div style={{
        display: 'flex',
        gap: 0,
        background: C.surface,
        borderRadius: R.full,
        border: `1px solid ${C.surfaceBorder}`,
        padding: '5px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(24px)',
      }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                width: 80,
                height: 48,
                borderRadius: R.full,
                textDecoration: 'none',
                background: active ? `linear-gradient(135deg, ${C.brand}, ${C.brandLight})` : 'transparent',
                transition: 'background 0.22s ease',
              }}
            >
              <Icon
                style={{ width: 18, height: 18, color: active ? '#000' : C.textTertiary, transition: 'color 0.22s' }}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span style={{ fontSize: 9, fontWeight: 800, color: active ? '#000' : 'transparent', letterSpacing: '0.04em', transition: 'color 0.22s' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ─── Notification Panel ────────────────────────────────────────────────────────
const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { members } = useStore();
  const urgents = members.filter(m => m.daysRemaining <= 7);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editMode, setEditMode] = useState<'expiring' | 'expired' | null>(null);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: C.surface, borderRadius: '28px 28px 0 0', borderTop: `1px solid ${C.surfaceBorder}`, padding: `20px 20px calc(env(safe-area-inset-bottom,0px) + 24px)`, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '82%', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle style={{ width: 15, height: 15, color: C.brandLight }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>WhatsApp Bildirimler</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 14, height: 14, color: C.textTertiary }} />
          </button>
        </div>

        {/* Şablonlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.textTertiary, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mesaj Şablonları</p>
          {(['expiring', 'expired'] as const).map(type => (
            <div key={type} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.surfaceBorder}`, borderRadius: R.lg, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: type === 'expiring' ? C.warning : C.danger }}>{type === 'expiring' ? '⚠️ Az kalan' : '🔴 Süresi dolan'}</span>
                {editMode === type
                  ? <button onClick={() => { if (editMode) setTemplates(t => ({ ...t, [editMode]: draft })); setEditMode(null); }} style={{ fontSize: 11, fontWeight: 700, color: C.brandLight, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Save style={{ width: 12, height: 12 }} />Kaydet</button>
                  : <button onClick={() => { setDraft(templates[type]); setEditMode(type); }} style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 style={{ width: 12, height: 12 }} />Düzenle</button>}
              </div>
              {editMode === type
                ? <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.brandBorder}`, borderRadius: R.md, padding: 8, color: 'white', fontSize: 12, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5, fontFamily: 'inherit' }} />
                : <p style={{ fontSize: 12, color: C.textTertiary, lineHeight: 1.5 }}>{templates[type]}</p>}
            </div>
          ))}
        </div>

        {/* Bildirim listesi */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.textTertiary, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Bildirim Gönder ({urgents.length})</p>
          {urgents.length === 0
            ? <div style={{ textAlign: 'center', padding: '24px', color: C.textTertiary }}><Check style={{ width: 24, height: 24, margin: '0 auto 8px' }} /><p style={{ fontSize: 13 }}>Tüm üyeler aktif 🎉</p></div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {urgents.map(m => {
                const tpl = m.daysRemaining < 0 ? templates.expired : templates.expiring;
                const msg = buildMsg(tpl, m);
                const href = getWhatsAppHref(m.phone, msg);
                const isSent = sent.includes(m.id);
                const sc = getStatusColor(m.daysRemaining);
                const hexColor = sc === 'yellow' ? C.warning : C.danger;
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.surfaceBorder}`, borderRadius: R.lg, padding: '10px 12px' }}>
                    <Avatar src={m.img} name={m.name} size={36} statusColor={hexColor} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 2 }}>{m.name}</p>
                      <p style={{ fontSize: 11, color: hexColor }}>{getStatusLabel(m.daysRemaining)}</p>
                    </div>
                    <a href={href} target="_blank" rel="noreferrer" onClick={() => setSent(s => [...s, m.id])} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: R.md, fontSize: 12, fontWeight: 700, flexShrink: 0, background: isSent ? C.successMuted : 'rgba(37,211,102,0.12)', color: isSent ? C.success : '#25D366', textDecoration: 'none' }}>
                      {isSent ? <><Check style={{ width: 13, height: 13 }} />Gönderildi</> : <><Send style={{ width: 13, height: 13 }} />Gönder</>}
                    </a>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </div>
  );
};

// ─── Add Member Modal ─────────────────────────────────────────────────────────
const AddMemberModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Member) => void }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pkg, setPkg] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: R.md, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.surfaceBorder}`, color: C.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1a1a1a&color=D97706&size=200`,
      package: pkg.trim() || 'Belirtilmedi',
      packageType: 'duration',
      daysRemaining: calcDays(endDate),
      paymentStatus: 'unpaid',
      totalAmount: parseInt(totalAmount) || 0,
      paidAmount: 0,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      isActive: true,
      pastPayments: [],
    };
    onAdd(newMember);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: C.surface, borderRadius: '28px 28px 0 0', borderTop: `1px solid ${C.surfaceBorder}`, padding: `24px 20px calc(env(safe-area-inset-bottom,0px) + 28px)`, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '88%', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>Yeni Üye Ekle</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 15, height: 15, color: C.textTertiary }} /></button>
        </div>
        {[
          { label: 'İsim Soyisim *', val: name, set: setName, placeholder: 'Örn: Ayşe Kaya', type: 'text' },
          { label: 'Telefon *', val: phone, set: setPhone, placeholder: '05xx xxx xx xx', type: 'tel' },
          { label: 'E-posta', val: email, set: setEmail, placeholder: 'ornek@email.com', type: 'email' },
          { label: 'Paket', val: pkg, set: setPkg, placeholder: 'Aylık Sınırsız, 10 Derslik...', type: 'text' },
          { label: 'Toplam Ücret (₺)', val: totalAmount, set: setTotalAmount, placeholder: '0', type: 'number' },
          { label: 'Başlangıç (GG.AA.YYYY)', val: startDate, set: setStartDate, placeholder: '01.05.2026', type: 'text' },
          { label: 'Bitiş (GG.AA.YYYY)', val: endDate, set: setEndDate, placeholder: '31.05.2026', type: 'text' },
        ].map(({ label, val, set, placeholder, type }) => (
          <div key={label}>
            <label style={lbl}>{label}</label>
            <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={inp} />
          </div>
        ))}
        <button onClick={handleAdd} style={{ width: '100%', padding: 16, borderRadius: R.lg, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${C.brand}, ${C.brandLight})`, color: '#000', boxShadow: `0 8px 20px ${C.brandGlow}`, marginTop: 4 }}>
          Üye Ekle
        </button>
      </div>
    </div>
  );
};

// ─── Edit Member Modal ─────────────────────────────────────────────────────────
const EditMemberModal = ({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (m: Member) => void }) => {
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone);
  const [email, setEmail] = useState(member.email);
  const [pkg, setPkg] = useState(member.package);
  const [totalAmount, setTotalAmount] = useState(String(member.totalAmount));
  const [startDate, setStartDate] = useState(member.startDate);
  const [endDate, setEndDate] = useState(member.endDate);

  const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', borderRadius: R.md, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.surfaceBorder}`, color: C.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  const handleSave = () => {
    onSave({ ...member, name: name.trim(), phone: phone.trim(), email: email.trim(), package: pkg.trim(), totalAmount: parseInt(totalAmount) || 0, startDate: startDate.trim(), endDate: endDate.trim(), daysRemaining: calcDays(endDate.trim()) });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: C.surface, borderRadius: '28px 28px 0 0', borderTop: `1px solid ${C.surfaceBorder}`, padding: `24px 20px calc(env(safe-area-inset-bottom,0px) + 28px)`, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '88%', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>Üyeyi Düzenle</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 15, height: 15, color: C.textTertiary }} /></button>
        </div>
        {[
          { label: 'İsim Soyisim', val: name, set: setName, type: 'text' },
          { label: 'Telefon', val: phone, set: setPhone, type: 'tel' },
          { label: 'E-posta', val: email, set: setEmail, type: 'email' },
          { label: 'Paket', val: pkg, set: setPkg, type: 'text' },
          { label: 'Toplam Ücret (₺)', val: totalAmount, set: setTotalAmount, type: 'number' },
          { label: 'Başlangıç (GG.AA.YYYY)', val: startDate, set: setStartDate, type: 'text' },
          { label: 'Bitiş (GG.AA.YYYY)', val: endDate, set: setEndDate, type: 'text' },
        ].map(({ label, val, set, type }) => (
          <div key={label}>
            <label style={lbl}>{label}</label>
            <input type={type} value={val} onChange={e => set(e.target.value)} style={inp} />
          </div>
        ))}
        <button onClick={handleSave} style={{ width: '100%', padding: 16, borderRadius: R.lg, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${C.brand}, ${C.brandLight})`, color: '#000', boxShadow: `0 8px 20px ${C.brandGlow}`, marginTop: 4 }}>
          Kaydet
        </button>
      </div>
    </div>
  );
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const Layout = () => {
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>(initStore);
  const [showAdd, setShowAdd] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const hideNav = location.pathname.includes('/members/');
  const urgentCount = members.filter(m => m.daysRemaining <= 7).length;

  const addMember = (m: Member) => setMembers(prev => [m, ...prev]);
  const updateMember = (updated: Member) => setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));

  return (
    <StoreContext.Provider value={{ members, addMember, updateMember, deleteMember }}>
      {/* ── Tam ekran kapsayıcı — safe area dahil ── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100dvh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <Header onAddMember={() => setShowAdd(true)} onBell={() => setShowBell(true)} urgentCount={urgentCount} />

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' as any, overscrollBehavior: 'contain' }}>
          <Outlet />
        </main>

        {!hideNav && <BottomNav />}

        {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={m => { addMember(m); setShowAdd(false); }} />}
        {showBell && <NotificationPanel onClose={() => setShowBell(false)} />}
      </div>
    </StoreContext.Provider>
  );
};

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
const DashboardScreen = () => {
  const navigate = useNavigate();
  const { members } = useStore();

  const red    = members.filter(m => m.daysRemaining < 0);
  const yellow = members.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
  const pendingTotal = members.reduce((s, m) => s + (m.totalAmount - m.paidAmount), 0);

  // Bugün beklenen tahsilat: kalan borcu olan ve süresi bitmemiş üyeler
  const todayExpected = members
    .filter(m => m.paymentStatus !== 'paid' && m.daysRemaining >= 0 && m.daysRemaining < 999)
    .reduce((s, m) => s + (m.totalAmount - m.paidAmount), 0);

  const alertMembers = [...red, ...yellow].sort((a, b) => a.daysRemaining - b.daysRemaining);

  const card: React.CSSProperties = {
    background: C.surface,
    borderRadius: R.xl,
    border: `1px solid ${C.surfaceBorder}`,
    padding: S.cardPad,
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sectionGap, padding: `14px ${S.pagePad} 20px` }}>

        {/* ── Hoşgeldin ── */}
        <div style={{ paddingBottom: 4 }}>
          <p style={{ fontSize: 12, color: C.textTertiary, fontWeight: 500, marginBottom: 2 }}>Merhaba 👋</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.03em' }}>Genel Bakış</h1>
        </div>

        {/* ── Ana 3 Kart ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Bugün Beklenen Tahsilat */}
          <StatCard
            label="Beklenen Tahsilat"
            value={`₺${todayExpected.toLocaleString('tr-TR')}`}
            sub={todayExpected > 0 ? 'bugün' : undefined}
            icon={<Wallet size={16} />}
            color={todayExpected > 0 ? C.brandLight : C.textTertiary}
            border={todayExpected > 0 ? C.brandBorder : C.surfaceBorder}
            bg={todayExpected > 0 ? C.brandMuted : C.surface}
          />

          {/* Süresi Dolanlar */}
          <StatCard
            label="Süresi Doldu"
            value={red.length}
            sub={red.length > 0 ? 'acil' : undefined}
            icon={<TrendingDown size={16} />}
            color={red.length > 0 ? C.danger : C.textTertiary}
            border={red.length > 0 ? C.dangerBorder : C.surfaceBorder}
            bg={red.length > 0 ? C.dangerMuted : C.surface}
            onClick={red.length > 0 ? () => navigate('/app/members') : undefined}
          />

          {/* Az Kalanlar */}
          <StatCard
            label="Yakında Bitiyor"
            value={yellow.length}
            sub={yellow.length > 0 ? '≤7 gün' : undefined}
            icon={<AlertTriangle size={16} />}
            color={yellow.length > 0 ? C.warning : C.textTertiary}
            border={yellow.length > 0 ? C.warningBorder : C.surfaceBorder}
            bg={yellow.length > 0 ? C.warningMuted : C.surface}
            onClick={yellow.length > 0 ? () => navigate('/app/members') : undefined}
          />
        </div>

        {/* ── Toplam Bekleyen Tahsilat Banner ── */}
        {pendingTotal > 0 && (
          <div
            onClick={() => navigate('/app/members')}
            style={{
              ...card,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: C.brandMuted,
              border: `1px solid ${C.brandBorder}`,
              cursor: 'pointer',
              padding: '14px 16px',
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: R.md, background: 'rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard style={{ width: 16, height: 16, color: C.brand }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,158,11,0.55)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 2 }}>Toplam Bekleyen</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: C.brandLight, letterSpacing: '-0.02em' }}>₺{pendingTotal.toLocaleString('tr-TR')}</p>
            </div>
            <ArrowRight style={{ width: 18, height: 18, color: C.brand, flexShrink: 0 }} />
          </div>
        )}

        {/* ── Dikkat Gerektiren Üyeler ── */}
        {alertMembers.length > 0 && (
          <div style={card}>
            <SectionHeader
              icon={<Zap size={14} />}
              title="Dikkat Gerektiriyor"
              count={alertMembers.length}
              color={C.danger}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertMembers.slice(0, 5).map(m => (
                <MemberAlertRow key={m.id} m={m} onClick={() => navigate(`/app/members/${m.id}`)} />
              ))}
              {alertMembers.length > 5 && (
                <button
                  onClick={() => navigate('/app/members')}
                  style={{ width: '100%', padding: '11px', borderRadius: R.lg, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.surfaceBorder}`, color: C.textTertiary, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  +{alertMembers.length - 5} daha <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Boş durum ── */}
        {alertMembers.length === 0 && pendingTotal === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.successMuted, border: `1px solid ${C.successBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check style={{ width: 24, height: 24, color: C.success }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Her şey yolunda 🎉</p>
            <p style={{ fontSize: 12, color: C.textTertiary }}>Süresi dolan veya ödeme bekleyen üye yok.</p>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </PageWrapper>
  );
};

// ─── Members Screen ────────────────────────────────────────────────────────────
type F = 'all' | 'red' | 'yellow' | 'green';
const MembersScreen = () => {
  const navigate = useNavigate();
  const { members } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<F>('all');

  const filters: { key: F; label: string }[] = [
    { key: 'all',    label: 'Tümü' },
    { key: 'red',    label: 'Süresi Doldu' },
    { key: 'yellow', label: 'Yakında' },
    { key: 'green',  label: 'Aktif' },
  ];

  const filtered = useMemo(() => {
    let l = members;
    if (search.trim()) l = l.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
    if (filter === 'red')    l = l.filter(m => m.daysRemaining < 0);
    else if (filter === 'yellow') l = l.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    else if (filter === 'green')  l = l.filter(m => m.daysRemaining > 7 && m.daysRemaining < 999);
    return l;
  }, [members, search, filter]);

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: `14px ${S.pagePad} 20px` }}>
        {/* Arama */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: C.textTertiary }} />
          <input
            type="text"
            placeholder="İsim veya telefon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 40, paddingRight: search ? 36 : 16, paddingTop: 13, paddingBottom: 13, borderRadius: R.lg, fontSize: 14, color: C.textPrimary, outline: 'none', background: C.surface, border: `1px solid ${C.surfaceBorder}`, boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ width: 12, height: 12, color: C.textTertiary }} />
            </button>
          )}
        </div>

        {/* Filtreler */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{ flexShrink: 0, padding: '7px 14px', borderRadius: R.full, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: filter === key ? `linear-gradient(135deg, ${C.brand}, ${C.brandLight})` : C.surface, color: filter === key ? '#000' : C.textTertiary, boxShadow: filter === key ? `0 4px 12px ${C.brandGlow}` : 'none', border: filter === key ? 'none' : `1px solid ${C.surfaceBorder}` } as React.CSSProperties}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textTertiary }}>
              <Users style={{ width: 28, height: 28, margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13 }}>Üye bulunamadı</p>
            </div>
          )}
          {filtered.map((m, i) => {
            const sc = getStatusColor(m.daysRemaining);
            const hexColor = sc === 'green' ? C.success : sc === 'yellow' ? C.warning : C.danger;
            const sessionsLeft = m.packageType === 'count' && m.totalSessions !== undefined && m.usedSessions !== undefined
              ? m.totalSessions - m.usedSessions
              : null;

            return (
              <div
                key={m.id}
                onClick={() => navigate(`/app/members/${m.id}`)}
                className="meteor-wrap"
                style={{ '--glow-color': hexColor, opacity: 0, animation: `fadeUp 0.3s ease ${i * 0.04}s forwards` } as React.CSSProperties}
              >
                <div className="meteor-light" />
                <div className="meteor-inner">
                  <Avatar src={m.img} name={m.name} size={42} statusColor={hexColor} />
                  <div style={{ flex: 1, minWidth: 0, zIndex: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{m.name}</p>
                    <p style={{ fontSize: 11, color: C.textTertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.package}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0, zIndex: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: R.md, background: sc === 'green' ? C.successMuted : sc === 'yellow' ? C.warningMuted : C.dangerMuted, color: hexColor, border: `1px solid ${sc === 'green' ? C.successBorder : sc === 'yellow' ? C.warningBorder : C.dangerBorder}` }}>
                      {getStatusLabel(m.daysRemaining)}
                    </span>
                    {sessionsLeft !== null && (
                      <span style={{ fontSize: 9, color: C.textTertiary, fontWeight: 600 }}>{sessionsLeft} ders kaldı</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
};

// ─── Member Detail Screen ──────────────────────────────────────────────────────
const MemberDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, updateMember, deleteMember } = useStore();
  const member = members.find(m => m.id === id);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!member) return <div style={{ color: C.textTertiary, textAlign: 'center', padding: '64px 0', fontSize: 14 }}>Üye bulunamadı.</div>;

  const remaining = member.totalAmount - member.paidAmount;
  const payPct = member.totalAmount > 0 ? Math.round((member.paidAmount / member.totalAmount) * 100) : 0;
  const sc = getStatusColor(member.daysRemaining);
  const hexColor = sc === 'green' ? C.success : sc === 'yellow' ? C.warning : C.danger;

  const card: React.CSSProperties = { background: C.surface, borderRadius: R.xl, border: `1px solid ${C.surfaceBorder}`, padding: S.cardPad };

  const handlePayment = () => {
    if (!payAmount || parseInt(payAmount) <= 0) return;
    setSaving(true);
    setTimeout(() => {
      const amount = Math.min(parseInt(payAmount), remaining);
      updateMember({ ...member, paidAmount: member.paidAmount + amount, paymentStatus: member.paidAmount + amount >= member.totalAmount ? 'paid' : 'partial' });
      setSaving(false); setPaid(true); setPayAmount('');
      setTimeout(() => { setPaid(false); setShowPayModal(false); }, 1500);
    }, 700);
  };

  const waTpl = member.daysRemaining < 0 ? DEFAULT_TEMPLATES.expired : DEFAULT_TEMPLATES.expiring;
  const waHref = getWhatsAppHref(member.phone, buildMsg(waTpl, member));
  const sessionsLeft = member.packageType === 'count' && member.totalSessions !== undefined && member.usedSessions !== undefined
    ? member.totalSessions - member.usedSessions
    : null;

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: `12px ${S.pagePad} 20px` }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.textTertiary, padding: '4px 0', width: 'fit-content' }}>
          <ChevronLeft style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Geri</span>
        </button>

        {/* Profile Card */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top, rgba(217,119,6,0.06) 0%, transparent 60%)`, pointerEvents: 'none' }} />
          <button onClick={() => setShowEditModal(true)} style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: R.md, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.surfaceBorder}`, cursor: 'pointer', color: C.textTertiary, fontSize: 11, fontWeight: 600 }}>
            <Pencil style={{ width: 11, height: 11 }} />Düzenle
          </button>
          <div style={{ marginBottom: 12, marginTop: 8 }}>
            <Avatar src={member.img} name={member.name} size={70} statusColor={hexColor} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.02em', marginBottom: 8 }}>{member.name}</h2>
          <div style={{ marginBottom: 14 }}><PaymentBadgeFull status={member.paymentStatus} /></div>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <a href={`tel:${member.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 11, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.surfaceBorder}`, borderRadius: R.lg, color: C.textSecondary, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <Phone style={{ width: 14, height: 14 }} />{member.phone}
            </a>
            {member.email && (
              <a href={`mailto:${member.email}`} style={{ width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.surfaceBorder}`, borderRadius: R.lg, color: C.textTertiary, textDecoration: 'none' }}>
                <Mail style={{ width: 14, height: 14 }} />
              </a>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <a href={waHref} target="_blank" rel="noreferrer" style={{ width: '100%', padding: 13, borderRadius: R.lg, fontWeight: 700, fontSize: 13, border: '1px solid rgba(37,211,102,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(37,211,102,0.08)', color: '#25D366', textDecoration: 'none', boxSizing: 'border-box' }}>
          <MessageCircle style={{ width: 15, height: 15 }} />WhatsApp Mesaj Gönder
        </a>

        {/* Paket */}
        <div style={card}>
          <SectionHeader icon={<Dumbbell size={13} />} title="Paket" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: R.md, border: `1px solid ${C.surfaceBorder}`, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{member.package}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: R.full, background: sc === 'green' ? C.successMuted : sc === 'yellow' ? C.warningMuted : C.dangerMuted, color: hexColor }}>
              {getStatusLabel(member.daysRemaining)}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: R.md, border: `1px solid ${C.surfaceBorder}` }}>
              <Calendar style={{ width: 12, height: 12, color: C.textTertiary, flexShrink: 0 }} />
              <div><p style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500 }}>Başlangıç</p><p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>{member.startDate || '-'}</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: R.md, border: `1px solid ${C.surfaceBorder}` }}>
              <Clock style={{ width: 12, height: 12, color: C.textTertiary, flexShrink: 0 }} />
              <div><p style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500 }}>Bitiş</p><p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>{member.endDate || '-'}</p></div>
            </div>
          </div>
          {sessionsLeft !== null && (
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: R.md, border: `1px solid ${C.surfaceBorder}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textTertiary }}>Kalan Ders</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: sessionsLeft === 0 ? C.danger : sessionsLeft <= 2 ? C.warning : C.success }}>{sessionsLeft} / {member.totalSessions}</span>
            </div>
          )}
        </div>

        {/* Ödeme */}
        <div style={card}>
          <SectionHeader icon={<CreditCard size={13} />} title="Ödeme" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: R.lg, border: `1px solid ${C.surfaceBorder}` }}>
              <p style={{ fontSize: 10, color: C.textTertiary, marginBottom: 4 }}>Toplam</p>
              <p style={{ fontSize: 17, fontWeight: 900, color: C.textPrimary }}>₺{member.totalAmount.toLocaleString('tr-TR')}</p>
            </div>
            <div style={{ padding: 12, background: C.successMuted, borderRadius: R.lg, border: `1px solid ${C.successBorder}` }}>
              <p style={{ fontSize: 10, color: 'rgba(52,211,153,0.6)', marginBottom: 4 }}>Ödenen</p>
              <p style={{ fontSize: 17, fontWeight: 900, color: C.success }}>₺{member.paidAmount.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.textTertiary }}>İlerleme</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textTertiary }}>{payPct}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: R.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: R.full, width: `${payPct}%`, background: `linear-gradient(90deg, ${C.brand}, ${C.brandLight})`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          {remaining > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: R.md, background: C.brandMuted, border: `1px solid ${C.brandBorder}`, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(245,158,11,0.6)', fontWeight: 600 }}>Kalan</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.brandLight }}>₺{remaining.toLocaleString('tr-TR')}</span>
            </div>
          )}
          <button
            onClick={() => setShowPayModal(true)}
            disabled={remaining <= 0}
            style={{ width: '100%', padding: 14, borderRadius: R.lg, fontWeight: 800, fontSize: 14, border: 'none', cursor: remaining > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: remaining > 0 ? `linear-gradient(135deg, ${C.brand}, ${C.brandLight})` : 'rgba(255,255,255,0.05)', color: remaining > 0 ? '#000' : C.textTertiary, boxShadow: remaining > 0 ? `0 8px 20px ${C.brandGlow}` : 'none' }}
          >
            <CreditCard style={{ width: 15, height: 15 }} />{remaining <= 0 ? 'Ödeme Tamamlandı' : 'Ödeme Al'}
          </button>
        </div>

        {/* Geçmiş Ödemeler */}
        {member.pastPayments.length > 0 && (
          <div style={card}>
            <SectionHeader icon={<Clock size={13} />} title="Geçmiş Ödemeler" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {member.pastPayments.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: R.md, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.surfaceBorder}` }}>
                  <span style={{ fontSize: 13, color: C.textSecondary }}>{p.month}</span>
                  {p.status === 'paid'
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: C.success }}>Ödendi ✓</span>
                    : p.status === 'partial'
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: C.warning }}>Eksik</span>
                      : <span style={{ fontSize: 11, fontWeight: 700, color: C.danger }}>Bekleniyor</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sil */}
        <button
          onClick={() => {
            if (window.confirm(`${member.name} isimli üyeyi silmek istediğinize emin misiniz?`)) {
              deleteMember(member.id);
              navigate('/app/members', { replace: true });
            }
          }}
          style={{ width: '100%', padding: 14, borderRadius: R.lg, background: C.dangerMuted, color: C.danger, border: `1px solid ${C.dangerBorder}`, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}
        >
          <Trash2 style={{ width: 15, height: 15 }} /> Üyeyi Sil
        </button>

        {/* Pay Modal */}
        {showPayModal && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', background: C.surface, borderRadius: '28px 28px 0 0', borderTop: `1px solid ${C.surfaceBorder}`, padding: `24px 24px calc(env(safe-area-inset-bottom,0px) + 36px)`, display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideUp 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>Ödeme Al</span>
                <button onClick={() => { setShowPayModal(false); setPaid(false); }} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: 14, height: 14, color: C.textTertiary }} />
                </button>
              </div>
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.surfaceBorder}`, borderRadius: R.lg }}>
                <p style={{ fontSize: 11, color: C.textTertiary, marginBottom: 4 }}>{member.name} — Kalan</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: C.brandLight }}>₺{remaining.toLocaleString('tr-TR')}</p>
              </div>
              {paid ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.successMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 style={{ width: 28, height: 28, color: C.success }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.success }}>Kaydedildi!</p>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.textTertiary, fontSize: 16, fontWeight: 700 }}>₺</span>
                    <input type="number" placeholder="Tutar girin" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: '100%', paddingLeft: 32, paddingRight: 16, paddingTop: 15, paddingBottom: 15, borderRadius: R.lg, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.surfaceBorder}`, color: C.textPrimary, fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[500, 1000, remaining].filter((v, i, arr) => arr.indexOf(v) === i && v > 0).map(v => (
                      <button key={v} onClick={() => setPayAmount(String(v))} style={{ flex: 1, padding: 8, fontSize: 11, fontWeight: 700, color: C.brandLight, background: C.brandMuted, border: `1px solid ${C.brandBorder}`, borderRadius: R.md, cursor: 'pointer' }}>₺{v.toLocaleString('tr-TR')}</button>
                    ))}
                  </div>
                  <button onClick={handlePayment} disabled={saving || !payAmount || parseInt(payAmount) <= 0} style={{ width: '100%', padding: 16, borderRadius: R.lg, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${C.brand}, ${C.brandLight})`, color: '#000', boxShadow: `0 8px 20px ${C.brandGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving || !payAmount || parseInt(payAmount) <= 0 ? 0.4 : 1 }}>
                    {saving ? 'Kaydediliyor...' : <><Check style={{ width: 18, height: 18 }} />Onayla</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {showEditModal && <EditMemberModal member={member} onClose={() => setShowEditModal(false)} onSave={m => { updateMember(m); setShowEditModal(false); }} />}
      </div>
    </PageWrapper>
  );
};

// ─── Router ───────────────────────────────────────────────────────────────────
const W = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%', height: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    {children}
  </div>
);

const router = createBrowserRouter([
  { path: '/',       element: <W><Login /></W> },
  { path: '/login',  element: <W><Login /></W> },
  {
    path: '/app',
    element: <W><Layout /></W>,
    children: [
      { path: 'home',          element: <DashboardScreen /> },
      { path: 'members',       element: <MembersScreen /> },
      { path: 'members/:id',   element: <MemberDetailScreen /> },
    ],
  },
]);

export default function App() { return <RouterProvider router={router} />; }
