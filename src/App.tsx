import React, { useState, useMemo } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation, useParams, Link } from 'react-router';
import {
  Bell, Home, Users, ChevronRight, ChevronLeft,
  Phone, Mail, Search, Plus, X, Check, Clock,
  BarChart2, Filter, ArrowUpRight, CreditCard, Calendar, UserPlus,
  Dumbbell, CheckCircle2, Zap,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Login } from './Login';
import { mockMembers as initialMembers, revenueData } from './data';
import type { Member } from './data';

let membersStore: Member[] = [...initialMembers];

const A = '#D97706';
const AL = '#F59E0B';
const AG = 'rgba(217,119,6,0.35)';

const getStatusColor = (days: number): 'green' | 'yellow' | 'red' => {
  if (days < 0) return 'red';
  if (days <= 7) return 'yellow';
  return 'green';
};
const getStatusLabel = (days: number) => days < 0 ? 'Süresi doldu' : `${days} gün kaldı`;

// Sadece üye detayı sayfasında kullanılan tam badge
const PaymentBadgeFull = ({ status }: { status: 'paid' | 'partial' | 'unpaid' }) => {
  if (status === 'paid') return <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ödeme Tamamlandı</span>;
  if (status === 'partial') return <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Kısmi Ödeme</span>;
  return <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Ödeme Bekleniyor</span>;
};

// Liste ve dashboard kartlarında sadece durum noktası

// TRAX Logo — küçük header versiyonu
const TraxLogoSmall = () => (
  <svg viewBox="0 0 290 82" className="h-[18px] w-auto" xmlns="http://www.w3.org/2000/svg" fill="white">
    <polygon points="8,6 8,20 42,20 42,76 58,76 58,20 92,20 92,6" />
    <path d="M104,6 L104,76 L120,76 L120,46 L143,46 L160,76 L178,76 L158,44 C167,40 172,32 172,22 C172,12 164,6 151,6 Z M120,20 L149,20 C154,20 157,23 157,28 C157,33 154,36 149,36 L120,36 Z" />
    <polygon points="187,6 160,76 176,76 192,30 208,76 224,76 197,6" />
    <line x1="232" y1="6" x2="262" y2="44" stroke="white" strokeWidth="13" strokeLinecap="round"/>
    <line x1="262" y1="44" x2="232" y2="76" stroke="white" strokeWidth="13" strokeLinecap="round"/>
    <line x1="284" y1="6" x2="262" y2="44" stroke="white" strokeWidth="13" strokeLinecap="round"/>
    <line x1="265" y1="38" x2="286" y2="10" stroke="white" strokeWidth="10" strokeLinecap="round"/>
    <polygon points="278,4 292,2 290,17" fill="white" />
  </svg>
);

// ── Header ─────────────────────────────────────────────────────
const Header = ({ onAddMember }: { onAddMember?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetail = location.pathname.includes('/members/');
  const isMembers = location.pathname === '/app/members';

  if (isDetail) return (
    <header className="px-5 pt-14 pb-3 flex items-center justify-between sticky top-0 z-10 bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.04]">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors active:opacity-70 h-10">
        <ChevronLeft className="w-4 h-4" />
        <span className="font-semibold text-[13px]">Geri</span>
      </button>
      <span className="text-[11px] font-bold text-white/25 tracking-widest uppercase">Üye Detayı</span>
      <div className="w-14" />
    </header>
  );

  return (
    <header className="px-5 pt-14 pb-4 flex items-center justify-between sticky top-0 z-10 bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Sadece logo */}
      <TraxLogoSmall />

      <div className="flex items-center gap-2">
        {isMembers && onAddMember && (
          <button
            onClick={onAddMember}
            className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${A}, ${AL})`, boxShadow: `0 4px 14px ${AG}` }}
          >
            <Plus className="w-4 h-4 text-[#080808]" strokeWidth={2.5} />
          </button>
        )}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.06] active:scale-95 transition-transform">
          <Bell className="w-[15px] h-[15px] text-white/50" strokeWidth={1.5} />
          <span className="absolute top-[7px] right-[8px] w-[6px] h-[6px] rounded-full ring-[1.5px] ring-[#080808]" style={{ background: AL }} />
        </button>
      </div>
    </header>
  );
};

// ── Bottom Nav ─────────────────────────────────────────────────
const BottomNav = () => {
  const location = useLocation();
  const tabs = [
    { path: '/app/home', icon: Home, label: 'Anasayfa' },
    { path: '/app/members', icon: Users, label: 'Üyeler' },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#080808] to-transparent pt-4 pb-8 flex items-end justify-center z-20 pointer-events-none">
      <div className="bg-[#141414]/90 backdrop-blur-2xl border border-white/[0.07] rounded-full h-[58px] flex items-center justify-center gap-12 px-10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] pointer-events-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className={`relative flex flex-col items-center justify-center w-10 h-10 gap-0.5 transition-all duration-250 active:scale-90 ${active ? '' : 'text-white/30'}`}>
              <Icon
                className="w-[20px] h-[20px] transition-all duration-250"
                strokeWidth={active ? 2.5 : 1.5}
                style={{ color: active ? AL : undefined }}
              />
              <span className={`text-[8px] font-bold tracking-wide transition-all duration-250 ${active ? 'opacity-100' : 'opacity-0'}`} style={{ color: AL }}>{label}</span>
              {active && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full" style={{ background: AL }} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ── Üye Ekleme Modalı ──────────────────────────────────────────
const AddMemberModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Member) => void }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', package: '', totalAmount: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const packages = ['Aylık Sınırsız', '10 Derslik Paket', '5 Derslik Paket', '20 Derslik Paket', 'Yıllık Üyelik'];
  const inputCls = "w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white placeholder-white/20 focus:outline-none text-[14px] transition-all";
  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.package) return;
    setSaving(true);
    setTimeout(() => {
      onAdd({ id: Date.now().toString(), name: form.name, phone: form.phone, email: form.email, img: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=1a1a1a&color=D97706&size=200`, package: form.package, daysRemaining: 30, paymentStatus: 'unpaid', totalAmount: parseInt(form.totalAmount) || 0, paidAmount: 0, startDate: form.startDate || new Date().toLocaleDateString('tr-TR'), endDate: form.endDate || '', isActive: true, pastPayments: [] });
      onClose();
    }, 600);
  };
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-[#0F0F0F] rounded-t-[28px] border-t border-white/[0.06] p-6 pb-10 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-bold text-white">Yeni Üye</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
        </div>
        <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto">
          <input className={inputCls} placeholder="Ad Soyad *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className={inputCls} placeholder="Telefon *" value={form.phone} type="tel" onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input className={inputCls} placeholder="E-posta" value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <select className={inputCls + " appearance-none"} value={form.package} onChange={e => setForm(f => ({ ...f, package: e.target.value }))}>
            <option value="" disabled>Paket Seçin *</option>
            {packages.map(p => <option key={p} value={p} style={{ background: '#0F0F0F' }}>{p}</option>)}
          </select>
          <input className={inputCls} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2.5">
            <div><label className="text-[10px] text-white/30 font-semibold pl-1 mb-1 block tracking-wider uppercase">Başlangıç</label><input className={inputCls} type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><label className="text-[10px] text-white/30 font-semibold pl-1 mb-1 block tracking-wider uppercase">Bitiş</label><input className={inputCls} type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving || !form.name || !form.phone || !form.package}
          className="w-full py-4 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 text-[#080808] mt-1"
          style={{ background: `linear-gradient(135deg, ${A}, ${AL})`, boxShadow: `0 8px 24px ${AG}` }}>
          {saving ? 'Kaydediliyor...' : <><UserPlus className="w-4 h-4" /> Üye Ekle</>}
        </button>
      </div>
    </div>
  );
};

// ── Layout ─────────────────────────────────────────────────────
const Layout = () => {
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [, forceUpdate] = useState(0);
  const hideNav = location.pathname.includes('/members/');
  const handleAddMember = (m: Member) => { membersStore = [m, ...membersStore]; forceUpdate(n => n + 1); };
  return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-[393px] h-[852px] bg-[#080808] rounded-[50px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] ring-[5px] ring-[#111111] flex flex-col">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[126px] h-[33px] bg-black rounded-full z-50 pointer-events-none" />
        <Header onAddMember={() => setShowAddModal(true)} />
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${hideNav ? 'pb-6' : 'pb-32'}`}>
          <Outlet />
        </main>
        {!hideNav && <BottomNav />}
        {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={handleAddMember} />}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/10 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────
const DashboardScreen = () => {
  const navigate = useNavigate();
  const members = membersStore;
  const red = members.filter(m => m.daysRemaining < 0).length;
  const yellow = members.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7).length;
  const green = members.filter(m => m.daysRemaining > 7).length;
  const pendingRevenue = members.reduce((s, m) => s + (m.totalAmount - m.paidAmount), 0);
  const urgentMembers = members.filter(m => m.daysRemaining < 0 || m.daysRemaining <= 7);

  return (
    <div className="flex flex-col gap-2.5 px-4 pt-3 pb-2">

      {/* Gelir kartı */}
      <div className="rounded-[20px] p-5 border border-white/[0.04] overflow-hidden relative" style={{ background: '#0F0F0F' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(217,119,6,0.07) 0%, transparent 60%)' }} />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[11px] font-semibold text-white/40 tracking-wider uppercase">Son 7 Gün</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07]">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold">+14%</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-[32px] leading-none font-black tracking-tighter text-white">₺32.450</span>
        </div>
        <div className="h-[64px] -mx-1 -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={A} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={A} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={AL} strokeWidth={2} fillOpacity={1} fill="url(#ag)" isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 istatistik */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Süresi Doldu', count: red, color: '#f43f5e', border: 'rgba(244,63,94,0.12)', bg: 'rgba(244,63,94,0.06)' },
          { label: 'Bu Hafta', count: yellow, color: '#fbbf24', border: 'rgba(251,191,36,0.12)', bg: 'rgba(251,191,36,0.06)' },
          { label: 'Aktif', count: green, color: '#34d399', border: 'rgba(52,211,153,0.12)', bg: 'rgba(52,211,153,0.06)' },
        ].map(({ label, count, color, border, bg }) => (
          <div key={label} className="rounded-[16px] p-3.5 flex flex-col gap-2.5" style={{ background: bg, border: `1px solid ${border}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[24px] font-black text-white leading-none">{count}</span>
            <span className="text-[10px] font-semibold text-white/30 leading-tight tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Bekleyen tahsilat — sadece dashboard'da, tek yerde */}
      {pendingRevenue > 0 && (
        <div className="rounded-[18px] p-4 flex items-center gap-3" style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.12)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(217,119,6,0.1)' }}>
            <CreditCard className="w-3.5 h-3.5" style={{ color: AL }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'rgba(245,158,11,0.6)' }}>Bekleyen Tahsilat</p>
            <p className="text-[16px] font-black leading-tight" style={{ color: AL }}>₺{pendingRevenue.toLocaleString('tr-TR')}</p>
          </div>
          <Link to="/app/members" className="text-[11px] font-bold px-3 py-1.5 rounded-full border active:opacity-70 whitespace-nowrap" style={{ color: AL, borderColor: 'rgba(217,119,6,0.2)', background: 'rgba(217,119,6,0.08)' }}>
            Görüntüle
          </Link>
        </div>
      )}

      {/* Dikkat gerektiriyor */}
      {urgentMembers.length > 0 && (
        <div className="rounded-[20px] border border-white/[0.04] overflow-hidden" style={{ background: '#0F0F0F' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <h2 className="text-[13px] font-bold text-white/80">Dikkat Gerektiriyor</h2>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/15">{urgentMembers.length}</span>
          </div>
          <div className="flex flex-col px-3 pb-3 gap-1.5">
            {urgentMembers.map(member => (
              <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)}
                className="flex items-center gap-3 p-3 rounded-[14px] bg-white/[0.02] border border-white/[0.03] active:scale-[0.98] transition-all text-left w-full">
                <img src={member.img} alt={member.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white/90 truncate">{member.name}</p>
                  <p className="text-[11px] text-white/30 truncate">{member.package}</p>
                </div>
                <span className={`text-[10px] font-bold ${member.daysRemaining < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {getStatusLabel(member.daysRemaining)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tüm üyeler özet */}
      <div className="rounded-[20px] border border-white/[0.04] overflow-hidden" style={{ background: '#0F0F0F' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-white/30" />
            <h2 className="text-[13px] font-bold text-white/80">Tüm Üyeler</h2>
          </div>
          <Link to="/app/members" className="flex items-center gap-0.5 text-[11px] font-bold active:opacity-70" style={{ color: AL }}>
            Tümü <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex flex-col px-3 pb-3 gap-1.5">
          {members.slice(0, 4).map(member => (
            <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)}
              className="flex items-center gap-3 p-3 rounded-[14px] bg-white/[0.02] border border-white/[0.03] active:scale-[0.98] transition-all text-left w-full">
              <div className="relative flex-shrink-0">
                <img src={member.img} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0F0F0F] ${getStatusColor(member.daysRemaining) === 'green' ? 'bg-emerald-400' : getStatusColor(member.daysRemaining) === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/90 truncate">{member.name}</p>
                <p className="text-[11px] text-white/30">{member.package}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/15" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Members Screen ─────────────────────────────────────────────
type FilterType = 'all' | 'red' | 'yellow' | 'green';

const MembersScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const members = membersStore;
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'red', label: 'Süresi Doldu' },
    { key: 'yellow', label: 'Bu Hafta' },
    { key: 'green', label: 'Aktif' },
  ];
  const filtered = useMemo(() => {
    let list = members;
    if (search.trim()) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
    if (filter === 'red') list = list.filter(m => m.daysRemaining < 0);
    else if (filter === 'yellow') list = list.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    else if (filter === 'green') list = list.filter(m => m.daysRemaining > 7);
    return list;
  }, [members, search, filter]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
        <input type="text" placeholder="İsim veya telefon ara..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-9 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white placeholder-white/20 focus:outline-none text-[14px] transition-all" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><X className="w-3 h-3 text-white/50" /></button>}
      </div>

      {/* Filtre */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${filter !== key ? 'bg-white/[0.04] text-white/35 border border-white/[0.06]' : ''}`}
            style={filter === key ? { background: `linear-gradient(135deg, ${A}, ${AL})`, color: '#080808', boxShadow: `0 4px 12px ${AG}` } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Sayı */}
      <div className="flex items-center gap-1.5 px-0.5">
        <Filter className="w-3 h-3 text-white/20" />
        <span className="text-[11px] text-white/20 font-medium">{filtered.length} üye</span>
      </div>

      {/* Liste — sadece durum noktası, hiç badge yok */}
      <div className="flex flex-col gap-2 pb-2">
        {filtered.length === 0 && (
          <div className="text-center py-14">
            <Users className="w-7 h-7 mx-auto mb-3 text-white/15" />
            <p className="text-[13px] text-white/20 font-medium">Üye bulunamadı</p>
          </div>
        )}
        {filtered.map(member => {
          const sc = getStatusColor(member.daysRemaining);
          return (
            <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)}
              className="flex items-center gap-3.5 p-3.5 rounded-[18px] border border-white/[0.04] active:scale-[0.98] transition-all text-left w-full"
              style={{ background: '#0F0F0F' }}>
              <div className="relative flex-shrink-0">
                <img src={member.img} alt={member.name} className="w-11 h-11 rounded-full object-cover" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F0F0F] ${sc === 'green' ? 'bg-emerald-400' : sc === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-white/95 truncate mb-0.5">{member.name}</p>
                <p className="text-[11px] text-white/35 truncate">{member.package}</p>
              </div>
              {/* Sadece kalan gün — rengiyle zaten anlaşılıyor */}
              <span className={`text-[11px] font-semibold flex-shrink-0 ${sc === 'red' ? 'text-rose-400' : sc === 'yellow' ? 'text-amber-400' : 'text-white/25'}`}>
                {getStatusLabel(member.daysRemaining)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Member Detail ──────────────────────────────────────────────
const MemberDetailScreen = () => {
  const { id } = useParams();
  const [, forceUpdate] = useState(0);
  const member = membersStore.find(m => m.id === id);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!member) return <div className="text-white/30 text-center py-16 text-sm">Üye bulunamadı.</div>;

  const remaining = member.totalAmount - member.paidAmount;
  const payPct = member.totalAmount > 0 ? Math.round((member.paidAmount / member.totalAmount) * 100) : 0;
  const sc = getStatusColor(member.daysRemaining);

  const handlePayment = () => {
    if (!payAmount || parseInt(payAmount) <= 0) return;
    setSaving(true);
    setTimeout(() => {
      const amount = Math.min(parseInt(payAmount), remaining);
      const idx = membersStore.findIndex(m => m.id === id);
      if (idx !== -1) membersStore[idx] = { ...membersStore[idx], paidAmount: membersStore[idx].paidAmount + amount, paymentStatus: membersStore[idx].paidAmount + amount >= membersStore[idx].totalAmount ? 'paid' : 'partial' };
      setSaving(false); setPaid(true); setPayAmount(''); forceUpdate(n => n + 1);
      setTimeout(() => { setPaid(false); setShowPayModal(false); }, 1500);
    }, 700);
  };

  return (
    <div className="flex flex-col gap-2.5 px-4 pt-3 pb-4">

      {/* Profil */}
      <div className="rounded-[20px] p-5 border border-white/[0.04] flex flex-col items-center text-center relative overflow-hidden" style={{ background: '#0F0F0F' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(217,119,6,0.05) 0%, transparent 60%)' }} />
        <div className="relative mb-3">
          <img src={member.img} alt={member.name} className="w-[72px] h-[72px] rounded-full object-cover border border-white/10" />
          <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-[2px] border-[#0F0F0F] ${sc === 'green' ? 'bg-emerald-400' : sc === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'}`} />
        </div>
        <h2 className="text-[18px] font-black text-white tracking-tight mb-1.5">{member.name}</h2>
        <div className="mb-3">
          <PaymentBadgeFull status={member.paymentStatus} />
        </div>
        <div className="flex gap-2 w-full">
          <a href={`tel:${member.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white/65 text-[12px] font-semibold active:opacity-70">
            <Phone className="w-3.5 h-3.5" /> {member.phone}
          </a>
          <a href={`mailto:${member.email}`} className="w-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white/35 active:opacity-70">
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Paket */}
      <div className="rounded-[20px] p-5 border border-white/[0.04]" style={{ background: '#0F0F0F' }}>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-3.5 h-3.5 text-white/25" />
          <h3 className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Paket</h3>
        </div>
        <div className="flex items-center justify-between mb-2.5 p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]">
          <span className="text-[13px] font-bold text-white/90">{member.package}</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sc === 'green' ? 'text-emerald-400 bg-emerald-500/10' : sc === 'yellow' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
            {getStatusLabel(member.daysRemaining)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]">
            <Calendar className="w-3 h-3 text-white/20 flex-shrink-0" />
            <div><p className="text-[10px] text-white/30 font-medium">Başlangıç</p><p className="text-[12px] font-bold text-white/80">{member.startDate}</p></div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]">
            <Clock className="w-3 h-3 text-white/20 flex-shrink-0" />
            <div><p className="text-[10px] text-white/30 font-medium">Bitiş</p><p className="text-[12px] font-bold text-white/80">{member.endDate}</p></div>
          </div>
        </div>
      </div>

      {/* Ödeme */}
      <div className="rounded-[20px] p-5 border border-white/[0.04]" style={{ background: '#0F0F0F' }}>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-3.5 h-3.5 text-white/25" />
          <h3 className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Ödeme</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]">
            <p className="text-[10px] text-white/30 font-medium mb-1">Toplam</p>
            <p className="text-[17px] font-black text-white">₺{member.totalAmount.toLocaleString('tr-TR')}</p>
          </div>
          <div className="p-3 rounded-[14px] border border-emerald-500/[0.12] bg-emerald-500/[0.04]">
            <p className="text-[10px] text-emerald-400/50 font-medium mb-1">Ödenen</p>
            <p className="text-[17px] font-black text-emerald-400">₺{member.paidAmount.toLocaleString('tr-TR')}</p>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-white/25 font-medium">İlerleme</span>
            <span className="text-[10px] font-bold text-white/40">{payPct}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${payPct}%`, background: `linear-gradient(90deg, ${A}, ${AL})` }} />
          </div>
        </div>
        {remaining > 0 && (
          <div className="flex items-center justify-between p-3 rounded-[14px] border mb-3" style={{ borderColor: 'rgba(217,119,6,0.12)', background: 'rgba(217,119,6,0.04)' }}>
            <span className="text-[12px] font-semibold" style={{ color: 'rgba(245,158,11,0.6)' }}>Kalan</span>
            <span className="text-[15px] font-black" style={{ color: AL }}>₺{remaining.toLocaleString('tr-TR')}</span>
          </div>
        )}
        <button onClick={() => setShowPayModal(true)} disabled={remaining <= 0}
          className="w-full py-3.5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 text-[#080808]"
          style={remaining > 0 ? { background: `linear-gradient(135deg, ${A}, ${AL})`, boxShadow: `0 8px 20px ${AG}` } : { background: '#1a1a1a', color: 'rgba(255,255,255,0.2)' }}>
          <CreditCard className="w-4 h-4" />
          {remaining <= 0 ? 'Ödeme Tamamlandı' : 'Ödeme Al'}
        </button>
      </div>

      {/* Geçmiş ödemeler */}
      {member.pastPayments.length > 0 && (
        <div className="rounded-[20px] p-5 border border-white/[0.04]" style={{ background: '#0F0F0F' }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-white/25" />
            <h3 className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Geçmiş Ödemeler</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {member.pastPayments.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[13px] font-medium text-white/65">{p.month}</span>
                {p.status === 'paid'
                  ? <span className="text-[10px] font-bold text-emerald-400">Ödendi ✓</span>
                  : p.status === 'partial'
                  ? <span className="text-[10px] font-bold text-amber-400">Eksik</span>
                  : <span className="text-[10px] font-bold text-rose-400">Bekleniyor</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ödeme modalı */}
      {showPayModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full rounded-t-[28px] border-t border-white/[0.06] p-6 pb-10 flex flex-col gap-4" style={{ background: '#0F0F0F' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white">Ödeme Al</h2>
              <button onClick={() => { setShowPayModal(false); setPaid(false); }} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
              <p className="text-[11px] text-white/30 font-medium mb-1">{member.name} — Kalan Tutar</p>
              <p className="text-[24px] font-black" style={{ color: AL }}>₺{remaining.toLocaleString('tr-TR')}</p>
            </div>
            {paid ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-[14px] font-bold text-emerald-400">Kaydedildi!</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[15px]" style={{ color: 'rgba(255,255,255,0.3)' }}>₺</span>
                  <input type="number" placeholder="Tutar girin" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white placeholder-white/20 focus:outline-none text-[16px] font-bold" />
                </div>
                <div className="flex gap-2">
                  {[500, 1000, remaining].filter((v, i, arr) => arr.indexOf(v) === i && v > 0).map(v => (
                    <button key={v} onClick={() => setPayAmount(String(v))}
                      className="flex-1 py-2 text-[11px] font-bold rounded-xl border active:opacity-70"
                      style={{ color: AL, borderColor: `${A}25`, background: `${A}0A` }}>
                      ₺{v.toLocaleString('tr-TR')}
                    </button>
                  ))}
                </div>
                <button onClick={handlePayment} disabled={saving || !payAmount || parseInt(payAmount) <= 0}
                  className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 text-[#080808]"
                  style={{ background: `linear-gradient(135deg, ${A}, ${AL})`, boxShadow: `0 8px 20px ${AG}` }}>
                  {saving ? 'Kaydediliyor...' : <><Check className="w-5 h-5" /> Onayla</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Router ─────────────────────────────────────────────────────
const PhoneShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#040404] flex items-center justify-center p-4 sm:p-8">
    <div className="relative w-full max-w-[393px] h-[852px] bg-[#080808] rounded-[50px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] ring-[5px] ring-[#111111] flex flex-col">
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[126px] h-[33px] bg-black rounded-full z-50 pointer-events-none" />
      {children}
    </div>
  </div>
);

const router = createBrowserRouter([
  { path: '/', element: <PhoneShell><Login /></PhoneShell> },
  { path: '/login', element: <PhoneShell><Login /></PhoneShell> },
  { path: '/app', element: <Layout />, children: [
    { path: 'home', element: <DashboardScreen /> },
    { path: 'members', element: <MembersScreen /> },
    { path: 'members/:id', element: <MemberDetailScreen /> },
  ]},
]);

export default function App() { return <RouterProvider router={router} />; }
