import React, { useState, useMemo } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation, useParams, Link } from 'react-router';
import {
  Bell, Home, Users, ChevronRight, ChevronLeft,
  Phone, Mail, Search, Plus, X, Check, Clock, Zap,
  BarChart2, Filter, ArrowUpRight, CreditCard, Calendar, UserPlus,
  Dumbbell, CheckCircle2,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Login } from './Login';
import { mockMembers as initialMembers, revenueData, adminAvatar } from './data'
import type { Member } from './data';

let membersStore: Member[] = [...initialMembers];

const getStatusColor = (days: number): 'green' | 'yellow' | 'red' => {
  if (days < 0) return 'red';
  if (days <= 7) return 'yellow';
  return 'green';
};

const getStatusLabel = (days: number) => {
  if (days < 0) return 'Süresi Doldu';
  return `${days} gün kaldı`;
};

const StatusDot = ({ color }: { color: 'green' | 'yellow' | 'red' }) => {
  const map = {
    green: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    yellow: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    red: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
  };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${map[color]}`} />;
};

const PaymentBadge = ({ status }: { status: 'paid' | 'partial' | 'unpaid' }) => {
  if (status === 'paid') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">Ödendi</span>;
  if (status === 'partial') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 whitespace-nowrap">Eksik</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 whitespace-nowrap">Ödenmedi</span>;
};

const Header = ({ onAddMember }: { onAddMember?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetail = location.pathname.includes('/members/');
  const isMembers = location.pathname === '/app/members';
  if (isDetail) return (
    <header className="px-5 pt-14 pb-3 flex items-center justify-between z-10 sticky top-0 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/[0.04]">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors active:opacity-70 h-10">
        <ChevronLeft className="w-5 h-5" /><span className="font-medium text-[14px]">Geri</span>
      </button>
      <span className="text-[13px] font-semibold text-white/40 tracking-wider uppercase">Üye Detayı</span>
      <div className="w-16" />
    </header>
  );
  return (
    <header className="px-5 pt-14 pb-3 flex items-center justify-between z-10 sticky top-0 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex flex-col">
        <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-0.5">Hoşgeldiniz</span>
        <h1 className="text-[18px] font-black text-white tracking-tight">TRAX Studio</h1>
      </div>
      <div className="flex items-center gap-2.5">
        {isMembers && onAddMember && (
          <button onClick={onAddMember} className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-600 shadow-[0_0_16px_rgba(139,92,246,0.5)] active:scale-95 transition-transform">
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        )}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.06] active:scale-95 transition-transform">
          <Bell className="w-[18px] h-[18px] text-white/70" strokeWidth={1.5} />
          <span className="absolute top-[8px] right-[9px] w-[7px] h-[7px] bg-violet-500 rounded-full ring-2 ring-[#0F0F0F]" />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden">
          <img src={adminAvatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const tabs = [{ path: '/app/home', icon: Home, label: 'Ana Sayfa' }, { path: '/app/members', icon: Users, label: 'Üyeler' }];
  return (
    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/95 to-transparent pt-5 pb-8 px-6 z-20 pointer-events-none">
      <div className="bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/[0.08] rounded-full h-[60px] flex items-center justify-center gap-14 px-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] pointer-events-auto mx-auto w-fit">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className={`relative flex flex-col items-center justify-center w-11 h-11 gap-0.5 transition-all duration-300 ${active ? 'text-violet-400' : 'text-white/35 hover:text-white/70'} active:scale-90`}>
              <div className={`transition-transform duration-300 ${active ? '-translate-y-0.5' : ''}`}>
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.5} />
              </div>
              <span className={`text-[9px] font-semibold tracking-wide transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full bg-violet-400 transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const AddMemberModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Member) => void }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', package: '', totalAmount: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const packages = ['Aylık Sınırsız', '10 Derslik Paket', '5 Derslik Paket', '20 Derslik Paket', 'Yıllık Üyelik'];
  const inputClass = "w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/60 text-[14px]";
  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.package) return;
    setSaving(true);
    setTimeout(() => {
      onAdd({ id: Date.now().toString(), name: form.name, phone: form.phone, email: form.email, img: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=8B5CF6&color=fff&size=200`, package: form.package, daysRemaining: 30, paymentStatus: 'unpaid', totalAmount: parseInt(form.totalAmount) || 0, paidAmount: 0, startDate: form.startDate || new Date().toLocaleDateString('tr-TR'), endDate: form.endDate || '', isActive: true, pastPayments: [] });
      onClose();
    }, 600);
  };
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-[#141414] rounded-t-[32px] border-t border-white/[0.07] p-6 pb-10 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-bold text-white">Yeni Üye Ekle</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center"><X className="w-4 h-4 text-white/60" /></button>
        </div>
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          <input className={inputClass} placeholder="Ad Soyad *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className={inputClass} placeholder="Telefon *" value={form.phone} type="tel" onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input className={inputClass} placeholder="E-posta" value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <select className={inputClass + " appearance-none"} value={form.package} onChange={e => setForm(f => ({ ...f, package: e.target.value }))}>
            <option value="" disabled>Paket Seçin *</option>
            {packages.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input className={inputClass} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] text-white/40 font-medium pl-1 mb-1 block">Başlangıç</label><input className={inputClass} type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><label className="text-[11px] text-white/40 font-medium pl-1 mb-1 block">Bitiş</label><input className={inputClass} type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving || !form.name || !form.phone || !form.package} className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(139,92,246,0.35)] active:scale-[0.98] disabled:opacity-40">
          {saving ? 'Kaydediliyor...' : <><UserPlus className="w-5 h-5" /> Üye Ekle</>}
        </button>
      </div>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [, forceUpdate] = useState(0);
  const hideNav = location.pathname.includes('/members/');
  const handleAddMember = (m: Member) => { membersStore = [m, ...membersStore]; forceUpdate(n => n + 1); };
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-violet-500/30">
      <div className="relative w-full max-w-[393px] h-[852px] bg-[#0F0F0F] rounded-[50px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-[6px] ring-zinc-900 flex flex-col">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[126px] h-[33px] bg-black rounded-full z-50 pointer-events-none" />
        <Header onAddMember={() => setShowAddModal(true)} />
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${hideNav ? 'pb-8' : 'pb-32'}`}>
          <Outlet />
        </main>
        {!hideNav && <BottomNav />}
        {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={handleAddMember} />}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[4px] bg-white/15 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const members = membersStore;
  const red = members.filter(m => m.daysRemaining < 0).length;
  const yellow = members.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7).length;
  const green = members.filter(m => m.daysRemaining > 7).length;
  const pendingRevenue = members.reduce((s, m) => s + (m.totalAmount - m.paidAmount), 0);
  const urgentMembers = members.filter(m => m.daysRemaining < 0 || m.daysRemaining <= 7);
  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-2">
      <div className="bg-[#161616] rounded-[22px] p-5 border border-white/[0.05] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-violet-500/15 flex items-center justify-center"><BarChart2 className="w-3.5 h-3.5 text-violet-400" /></div>
            <span className="text-white/60 font-semibold text-[12px] tracking-wide">Son 7 Günlük Gelir</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" /><span className="text-[11px] text-emerald-400 font-bold">+14%</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-[36px] leading-none font-black tracking-tighter text-white">₺32.450</span>
          <span className="text-white/35 text-[15px] font-medium">.00</span>
        </div>
        <div className="h-[72px] w-full -mx-1 -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
              <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#gv)" isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Süresi Doldu', count: red, dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]', bg: 'bg-rose-500/8 border-rose-500/15' },
          { label: 'Bu Hafta', count: yellow, dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]', bg: 'bg-amber-500/8 border-amber-500/15' },
          { label: 'Aktif', count: green, dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]', bg: 'bg-emerald-500/8 border-emerald-500/15' },
        ].map(({ label, count, dot, bg }) => (
          <div key={label} className={`${bg} border rounded-[16px] p-3 flex flex-col gap-2`}>
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[22px] font-black text-white leading-none">{count}</span>
            <span className="text-[10px] font-semibold text-white/40 leading-tight">{label}</span>
          </div>
        ))}
      </div>
      {pendingRevenue > 0 && (
        <div className="bg-amber-500/8 border border-amber-500/15 rounded-[18px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0"><CreditCard className="w-4 h-4 text-amber-400" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-amber-400/80 font-semibold">Bekleyen Tahsilat</p>
            <p className="text-[18px] font-black text-amber-300 leading-tight">₺{pendingRevenue.toLocaleString('tr-TR')}</p>
          </div>
          <Link to="/app/members" className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/20 active:opacity-70">Görüntüle</Link>
        </div>
      )}
      {urgentMembers.length > 0 && (
        <div className="bg-[#161616] rounded-[22px] border border-white/[0.05] overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center"><Zap className="w-3 h-3 text-rose-400" /></div><h2 className="text-[13px] font-bold text-white/90">Dikkat Gerektiriyor</h2></div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/15">{urgentMembers.length}</span>
          </div>
          <div className="flex flex-col px-3 pb-3 gap-1.5">
            {urgentMembers.map(member => (
              <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)} className="flex items-center gap-3 p-3 rounded-[14px] bg-white/[0.025] border border-white/[0.04] hover:bg-white/[0.04] active:scale-[0.98] transition-all text-left w-full">
                <img src={member.img} alt={member.name} className="w-9 h-9 rounded-full object-cover bg-[#2A2A2A] flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold text-white/90 truncate">{member.name}</p><p className="text-[11px] text-white/40 truncate">{member.package}</p></div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <PaymentBadge status={member.paymentStatus} />
                  <span className={`text-[10px] font-bold ${member.daysRemaining < 0 ? 'text-rose-400' : 'text-amber-400'}`}>{getStatusLabel(member.daysRemaining)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="bg-[#161616] rounded-[22px] border border-white/[0.05] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center"><Users className="w-3 h-3 text-violet-400" /></div><h2 className="text-[13px] font-bold text-white/90">Tüm Üyeler</h2></div>
          <Link to="/app/members" className="flex items-center gap-0.5 text-[12px] font-semibold text-violet-400 active:opacity-70">Tümü <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="flex flex-col px-3 pb-3 gap-1.5">
          {members.slice(0, 4).map(member => (
            <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)} className="flex items-center gap-3 p-3 rounded-[14px] bg-white/[0.025] border border-white/[0.04] hover:bg-white/[0.04] active:scale-[0.98] transition-all text-left w-full">
              <img src={member.img} alt={member.name} className="w-9 h-9 rounded-full object-cover bg-[#2A2A2A] flex-shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold text-white/90 truncate">{member.name}</p><p className="text-[11px] text-white/40">{member.package}</p></div>
              <div className="flex items-center gap-2"><StatusDot color={getStatusColor(member.daysRemaining)} /><ChevronRight className="w-3.5 h-3.5 text-white/20" /></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

type FilterType = 'all' | 'red' | 'yellow' | 'green' | 'unpaid';

const MembersScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const members = membersStore;
  const filters: { key: FilterType; label: string }[] = [{ key: 'all', label: 'Tümü' }, { key: 'red', label: 'Süresi Doldu' }, { key: 'yellow', label: 'Bu Hafta' }, { key: 'green', label: 'Aktif' }, { key: 'unpaid', label: 'Ödenmedi' }];
  const filtered = useMemo(() => {
    let list = members;
    if (search.trim()) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
    if (filter === 'red') list = list.filter(m => m.daysRemaining < 0);
    else if (filter === 'yellow') list = list.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    else if (filter === 'green') list = list.filter(m => m.daysRemaining > 7);
    else if (filter === 'unpaid') list = list.filter(m => m.paymentStatus !== 'paid');
    return list;
  }, [members, search, filter]);
  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="İsim veya telefon ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-10 py-3.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/50 text-[14px]" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><X className="w-3 h-3 text-white/60" /></button>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${filter === key ? 'bg-violet-600 text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)]' : 'bg-white/[0.05] text-white/50 border border-white/[0.07]'}`}>{label}</button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-1"><Filter className="w-3 h-3 text-white/30" /><span className="text-[11px] text-white/30 font-medium">{filtered.length} üye</span></div>
      <div className="flex flex-col gap-2 pb-2">
        {filtered.length === 0 && <div className="text-center py-12 text-white/30"><Users className="w-8 h-8 mx-auto mb-3 opacity-40" /><p className="text-[13px] font-medium">Üye bulunamadı</p></div>}
        {filtered.map(member => (
          <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)} className="flex items-center gap-3.5 p-3.5 rounded-[18px] bg-[#161616] border border-white/[0.05] hover:bg-[#1C1C1C] active:scale-[0.98] transition-all text-left w-full">
            <div className="relative flex-shrink-0">
              <img src={member.img} alt={member.name} className="w-11 h-11 rounded-full object-cover bg-[#2A2A2A]" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161616] ${getStatusColor(member.daysRemaining) === 'green' ? 'bg-emerald-400' : getStatusColor(member.daysRemaining) === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5"><p className="text-[14px] font-bold text-white/95 truncate">{member.name}</p><PaymentBadge status={member.paymentStatus} /></div>
              <p className="text-[11px] text-white/40 truncate">{member.package} • {getStatusLabel(member.daysRemaining)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

const MemberDetailScreen = () => {
  const { id } = useParams();
  const [, forceUpdate] = useState(0);
  const member = membersStore.find(m => m.id === id);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [paid, setPaid] = useState(false);
  if (!member) return <div className="text-white/50 text-center py-16 text-sm">Üye bulunamadı.</div>;
  const remaining = member.totalAmount - member.paidAmount;
  const payPct = member.totalAmount > 0 ? Math.round((member.paidAmount / member.totalAmount) * 100) : 0;
  const statusColor = getStatusColor(member.daysRemaining);
  const handlePayment = () => {
    if (!payAmount || parseInt(payAmount) <= 0) return;
    setSaving(true);
    setTimeout(() => {
      const amount = Math.min(parseInt(payAmount), remaining);
      const idx = membersStore.findIndex(m => m.id === id);
      if (idx !== -1) { membersStore[idx] = { ...membersStore[idx], paidAmount: membersStore[idx].paidAmount + amount, paymentStatus: membersStore[idx].paidAmount + amount >= membersStore[idx].totalAmount ? 'paid' : 'partial' }; }
      setSaving(false); setPaid(true); setPayAmount(''); forceUpdate(n => n + 1);
      setTimeout(() => { setPaid(false); setShowPayModal(false); }, 1500);
    }, 700);
  };
  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
      <div className="bg-[#161616] rounded-[22px] p-5 border border-white/[0.05] flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/6 to-transparent pointer-events-none" />
        <div className="relative mb-3">
          <img src={member.img} alt={member.name} className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
          <span className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-[2.5px] border-[#161616] ${statusColor === 'green' ? 'bg-emerald-400' : statusColor === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'}`} />
        </div>
        <h2 className="text-[18px] font-black text-white tracking-tight mb-1">{member.name}</h2>
        <div className="flex items-center gap-2 mb-3">
          <PaymentBadge status={member.paymentStatus} />
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${member.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>{member.isActive ? 'Aktif Üye' : 'Pasif Üye'}</span>
        </div>
        <div className="flex gap-2 w-full">
          <a href={`tel:${member.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white/80 text-[12px] font-semibold active:opacity-70"><Phone className="w-4 h-4" /> {member.phone}</a>
          <a href={`mailto:${member.email}`} className="w-11 flex items-center justify-center py-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white/50 active:opacity-70"><Mail className="w-4 h-4" /></a>
        </div>
      </div>
      <div className="bg-[#161616] rounded-[22px] p-5 border border-white/[0.05]">
        <div className="flex items-center gap-2 mb-4"><div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center"><Dumbbell className="w-3 h-3 text-violet-400" /></div><h3 className="text-[13px] font-bold text-white/80">Paket Bilgisi</h3></div>
        <div className="flex items-center gap-3 mb-3 p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]">
          <span className="text-[13px] font-bold text-white">{member.package}</span>
          <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColor === 'green' ? 'text-emerald-400 bg-emerald-500/10' : statusColor === 'yellow' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{getStatusLabel(member.daysRemaining)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]"><Calendar className="w-3.5 h-3.5 text-white/30 flex-shrink-0" /><div><p className="text-[10px] text-white/40 font-medium">Başlangıç</p><p className="text-[12px] font-bold text-white/90">{member.startDate}</p></div></div>
          <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]"><Clock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" /><div><p className="text-[10px] text-white/40 font-medium">Bitiş</p><p className="text-[12px] font-bold text-white/90">{member.endDate}</p></div></div>
        </div>
      </div>
      <div className="bg-[#161616] rounded-[22px] p-5 border border-white/[0.05]">
        <div className="flex items-center gap-2 mb-4"><div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center"><CreditCard className="w-3 h-3 text-emerald-400" /></div><h3 className="text-[13px] font-bold text-white/80">Ödeme Durumu</h3></div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-white/[0.03] rounded-[14px] border border-white/[0.04]"><p className="text-[10px] text-white/40 font-medium mb-1">Toplam</p><p className="text-[17px] font-black text-white">₺{member.totalAmount.toLocaleString('tr-TR')}</p></div>
          <div className="p-3 bg-emerald-500/[0.05] rounded-[14px] border border-emerald-500/15"><p className="text-[10px] text-emerald-400/70 font-medium mb-1">Ödenen</p><p className="text-[17px] font-black text-emerald-400">₺{member.paidAmount.toLocaleString('tr-TR')}</p></div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5"><span className="text-[11px] text-white/40">Ödeme İlerlemesi</span><span className="text-[11px] font-bold text-white/70">{payPct}%</span></div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500" style={{ width: `${payPct}%` }} /></div>
        </div>
        {remaining > 0 && <div className="flex items-center justify-between p-3 bg-amber-500/[0.06] rounded-[14px] border border-amber-500/15 mb-3"><span className="text-[12px] text-amber-400/80 font-semibold">Kalan</span><span className="text-[15px] font-black text-amber-400">₺{remaining.toLocaleString('tr-TR')}</span></div>}
        <button onClick={() => setShowPayModal(true)} disabled={remaining <= 0} className="w-full py-3.5 bg-violet-600 text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(139,92,246,0.3)] active:scale-[0.98] disabled:opacity-40">
          <CreditCard className="w-4 h-4" />{remaining <= 0 ? 'Ödeme Tamamlandı' : 'Ödeme Al'}
        </button>
      </div>
      {member.pastPayments.length > 0 && (
        <div className="bg-[#161616] rounded-[22px] p-5 border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-4"><div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center"><Clock className="w-3 h-3 text-white/50" /></div><h3 className="text-[13px] font-bold text-white/80">Geçmiş Ödemeler</h3></div>
          <div className="flex flex-col gap-1.5">
            {member.pastPayments.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-[12px] bg-white/[0.025] border border-white/[0.04]"><span className="text-[13px] font-medium text-white/80">{p.month}</span><PaymentBadge status={p.status} /></div>
            ))}
          </div>
        </div>
      )}
      {showPayModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-[#141414] rounded-t-[32px] border-t border-white/[0.07] p-6 pb-10 flex flex-col gap-4">
            <div className="flex items-center justify-between"><h2 className="text-[16px] font-bold text-white">Ödeme Al</h2><button onClick={() => { setShowPayModal(false); setPaid(false); }} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center"><X className="w-4 h-4 text-white/60" /></button></div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"><p className="text-[12px] text-white/40 font-medium mb-1">{member.name} — Kalan Tutar</p><p className="text-[24px] font-black text-amber-400">₺{remaining.toLocaleString('tr-TR')}</p></div>
            {paid ? (
              <div className="flex flex-col items-center gap-2 py-4"><div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center"><CheckCircle2 className="w-7 h-7 text-emerald-400" /></div><p className="text-[14px] font-bold text-emerald-400">Ödeme Kaydedildi!</p></div>
            ) : (
              <>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-[16px]">₺</span><input type="number" placeholder="Tutar girin" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full pl-8 pr-4 py-4 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/50 text-[16px] font-bold" /></div>
                <div className="flex gap-2">
                  {[500, 1000, remaining].filter((v, i, arr) => arr.indexOf(v) === i && v > 0).map(v => (
                    <button key={v} onClick={() => setPayAmount(String(v))} className="flex-1 py-2 text-[11px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-xl active:opacity-70">₺{v.toLocaleString('tr-TR')}</button>
                  ))}
                </div>
                <button onClick={handlePayment} disabled={saving || !payAmount || parseInt(payAmount) <= 0} className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(139,92,246,0.35)] active:scale-[0.98] disabled:opacity-40">
                  {saving ? 'Kaydediliyor...' : <><Check className="w-5 h-5" /> Ödemeyi Onayla</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PhoneShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 sm:p-8 font-sans">
    <div className="relative w-full max-w-[393px] h-[852px] bg-[#0F0F0F] rounded-[50px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-[6px] ring-zinc-900 flex flex-col">
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[126px] h-[33px] bg-black rounded-full z-50 pointer-events-none" />
      {children}
    </div>
  </div>
);

const router = createBrowserRouter([
  { path: '/', element: <PhoneShell><Login /></PhoneShell> },
  { path: '/login', element: <PhoneShell><Login /></PhoneShell> },
  { path: '/app', element: <Layout />, children: [{ path: 'home', element: <DashboardScreen /> }, { path: 'members', element: <MembersScreen /> }, { path: 'members/:id', element: <MemberDetailScreen /> }] },
]);

export default function App() { return <RouterProvider router={router} />; }
