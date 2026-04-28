import React, { useState, useMemo, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation, useParams, Link } from 'react-router';
import {
  Bell, Home, Users, ChevronRight, ChevronLeft,
  Phone, Mail, Search, Plus, X, Check, Clock,
  BarChart2, Filter, ArrowUpRight, CreditCard, Calendar, UserPlus,
  Dumbbell, CheckCircle2, Zap, MessageCircle, Edit3, Send, Save,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Login } from './Login';
import { mockMembers as initialMembers, revenueData } from './data';
import type { Member } from './data';

let membersStore: Member[] = [...initialMembers];

const A = '#D97706';
const AL = '#F59E0B';
const AG = 'rgba(217,119,6,0.3)';

// Varsayılan WhatsApp mesaj şablonları
const DEFAULT_TEMPLATES = {
  expiring: 'Merhaba {isim}, paketinizin süresi {gun} gün içinde dolmaktadır. Üyeliğinizi yenilemek için bizimle iletişime geçebilirsiniz. Görüşmek dileğiyle! 🏋️',
  expired: 'Merhaba {isim}, paketinizin süresi maalesef dolmuştur. Sizi yeniden aramızda görmek isteriz! Bilgi için bize ulaşabilirsiniz. 💪',
};

const getStatusColor = (days: number): 'green' | 'yellow' | 'red' => {
  if (days < 0) return 'red';
  if (days <= 7) return 'yellow';
  return 'green';
};
const getStatusLabel = (days: number) => days < 0 ? 'Süresi doldu' : `${days} gün kaldı`;

const buildWhatsAppMsg = (template: string, member: Member) =>
  template
    .replace(/{isim}/g, member.name.split(' ')[0])
    .replace(/{gun}/g, String(Math.max(0, member.daysRemaining)));

const openWhatsApp = (phone: string, message: string) => {
  const cleaned = phone.replace(/\D/g, '');
  const intl = cleaned.startsWith('0') ? '90' + cleaned.slice(1) : cleaned;
  const url = `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

const PaymentBadgeFull = ({ status }: { status: 'paid' | 'partial' | 'unpaid' }) => {
  if (status === 'paid') return <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>Ödeme Tamamlandı</span>;
  if (status === 'partial') return <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>Kısmi Ödeme</span>;
  return <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>Ödeme Bekleniyor</span>;
};

// Animasyonlu sayfa wrapper
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 30); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>
      {children}
    </div>
  );
};

// ── TRAX Logo (header için küçük) ──────────────────────────────
const TraxLogoHeader = () => (
  <img
    src="/trax-logo-amber.png"
    alt="TRAX"
    style={{ height: '20px', width: 'auto',  }}
  />
);

// ── Bildirim / WhatsApp Paneli ─────────────────────────────────
const NotificationPanel = ({ onClose, members }: { onClose: () => void; members: Member[] }) => {
  const urgents = members.filter(m => m.daysRemaining <= 7);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editMode, setEditMode] = useState<'expiring' | 'expired' | null>(null);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  const startEdit = (type: 'expiring' | 'expired') => {
    setDraft(templates[type]);
    setEditMode(type);
  };
  const saveEdit = () => {
    if (editMode) setTemplates(t => ({ ...t, [editMode]: draft }));
    setEditMode(null);
  };
  const handleSend = (member: Member) => {
    const tpl = member.daysRemaining < 0 ? templates.expired : templates.expiring;
    openWhatsApp(member.phone, buildWhatsAppMsg(tpl, member));
    setSent(s => [...s, member.id]);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div style={{
        background: '#0F0F0F', borderRadius: '28px 28px 0 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 20px 36px', display: 'flex', flexDirection: 'column', gap: '14px',
        maxHeight: '82%', overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle style={{ width: '16px', height: '16px', color: AL }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>WhatsApp Bildirimler</span>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        {/* Mesaj şablonları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mesaj Şablonları</p>
          {(['expiring', 'expired'] as const).map(type => (
            <div key={type} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: type === 'expiring' ? '#fbbf24' : '#f43f5e' }}>
                  {type === 'expiring' ? '⚠️ Az kalan' : '🔴 Süresi dolan'}
                </span>
                {editMode === type ? (
                  <button onClick={saveEdit} style={{ fontSize: '11px', fontWeight: 700, color: AL, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Save style={{ width: '12px', height: '12px' }} /> Kaydet
                  </button>
                ) : (
                  <button onClick={() => startEdit(type)} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit3 style={{ width: '12px', height: '12px' }} /> Düzenle
                  </button>
                )}
              </div>
              {editMode === type ? (
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(217,119,6,0.3)',
                    borderRadius: '10px', padding: '8px', color: 'white', fontSize: '12px',
                    resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
                  }}
                />
              ) : (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{templates[type]}</p>
              )}
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>{'{isim}'} ve {'{gun}'} otomatik dolar</p>
            </div>
          ))}
        </div>

        {/* Üye listesi — mesaj gönder */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Bildirim Gönderilecekler ({urgents.length})
          </p>
          {urgents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.2)' }}>
              <Check style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>Tüm üyeler aktif 🎉</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {urgents.map(member => {
              const isSent = sent.includes(member.id);
              const isExpired = member.daysRemaining < 0;
              return (
                <div key={member.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '14px', padding: '10px 12px',
                }}>
                  <img src={member.img} alt={member.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '2px' }}>{member.name}</p>
                    <p style={{ fontSize: '11px', color: isExpired ? '#f43f5e' : '#fbbf24' }}>{getStatusLabel(member.daysRemaining)}</p>
                  </div>
                  <button
                    onClick={() => handleSend(member)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                      background: isSent ? 'rgba(52,211,153,0.12)' : 'rgba(37,211,102,0.12)',
                      color: isSent ? '#34d399' : '#25D366',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isSent ? <><Check style={{ width: '13px', height: '13px' }} /> Gönderildi</> : <><Send style={{ width: '13px', height: '13px' }} /> Gönder</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};

// ── Header ─────────────────────────────────────────────────────
const Header = ({ onAddMember, onBell, urgentCount }: { onAddMember?: () => void; onBell: () => void; urgentCount: number }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetail = location.pathname.includes('/members/');
  const isMembers = location.pathname === '/app/members';

  if (isDetail) return (
    <header style={{
      padding: '52px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
        <ChevronLeft style={{ width: '16px', height: '16px' }} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Geri</span>
      </button>
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Üye Detayı</span>
      <div style={{ width: '56px' }} />
    </header>
  );

  return (
    <header style={{
      padding: '52px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <TraxLogoHeader />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isMembers && onAddMember && (
          <button onClick={onAddMember} style={{
            width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${A}, ${AL})`,
            boxShadow: `0 4px 12px ${AG}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s', flexShrink: 0,
          }}>
            <Plus style={{ width: '16px', height: '16px', color: '#080808' }} />
          </button>
        )}
        <button onClick={onBell} style={{
          position: 'relative', width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell style={{ width: '15px', height: '15px', color: urgentCount > 0 ? AL : 'rgba(255,255,255,0.45)' }} strokeWidth={1.5} />
          {urgentCount > 0 && (
            <span style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: AL, boxShadow: `0 0 6px ${AG}`,
              border: '1.5px solid #080808',
            }} />
          )}
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
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px',
      background: 'linear-gradient(to top, #080808 50%, transparent)',
      paddingBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 20, pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(18,18,18,0.92)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '999px',
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '48px', padding: '0 40px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        pointerEvents: 'auto',
      }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '2px', width: '40px', height: '40px', justifyContent: 'center',
              textDecoration: 'none', transition: 'transform 0.15s',
            }}>
              <Icon style={{ width: '20px', height: '20px', color: active ? AL : 'rgba(255,255,255,0.28)', transition: 'color 0.2s' }} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '8px', fontWeight: 700, color: active ? AL : 'transparent', letterSpacing: '0.06em', transition: 'color 0.2s' }}>{label}</span>
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
  const inp = (extra = ''): React.CSSProperties => ({
    width: '100%', padding: '14px 16px', borderRadius: '14px', fontSize: '14px',
    color: 'white', outline: 'none', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)', boxSizing: 'border-box',
    ...JSON.parse(extra || '{}'),
  });
  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.package) return;
    setSaving(true);
    setTimeout(() => {
      onAdd({ id: Date.now().toString(), name: form.name, phone: form.phone, email: form.email, img: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=1a1a1a&color=D97706&size=200`, package: form.package, daysRemaining: 30, paymentStatus: 'unpaid', totalAmount: parseInt(form.totalAmount) || 0, paidAmount: 0, startDate: form.startDate || new Date().toLocaleDateString('tr-TR'), endDate: form.endDate || '', isActive: true, pastPayments: [] });
      onClose();
    }, 600);
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: '#0F0F0F', borderRadius: '28px 28px 0 0', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'slideUp 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>Yeni Üye</span>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          <input style={inp()} placeholder="Ad Soyad *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input style={inp()} placeholder="Telefon *" value={form.phone} type="tel" onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input style={inp()} placeholder="E-posta" value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <select style={{ ...inp(), appearance: 'none' } as React.CSSProperties} value={form.package} onChange={e => setForm(f => ({ ...f, package: e.target.value }))}>
            <option value="" disabled>Paket Seçin *</option>
            {packages.map(p => <option key={p} value={p} style={{ background: '#0F0F0F' }}>{p}</option>)}
          </select>
          <input style={inp()} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Başlangıç</label><input style={inp()} type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Bitiş</label><input style={inp()} type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving || !form.name || !form.phone || !form.package} style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${A}, ${AL})`, color: '#080808', boxShadow: `0 8px 24px ${AG}`, opacity: saving || !form.name || !form.phone || !form.package ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
          {saving ? 'Kaydediliyor...' : <><UserPlus style={{ width: '16px', height: '16px' }} /> Üye Ekle</>}
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity:0; } to { transform: translateY(0); opacity:1; } } input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
};

// ── Layout ─────────────────────────────────────────────────────
const Layout = () => {
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const [, forceUpdate] = useState(0);
  const hideNav = location.pathname.includes('/members/');
  const handleAddMember = (m: Member) => { membersStore = [m, ...membersStore]; forceUpdate(n => n + 1); };
  const urgentCount = membersStore.filter(m => m.daysRemaining <= 7).length;

  return (
    <div style={{ width: '100%', height: '100%', background: '#080808', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Header onAddMember={() => setShowAddModal(true)} onBell={() => setShowBell(true)} urgentCount={urgentCount} />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: hideNav ? '24px' : '110px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={handleAddMember} />}
      {showBell && <NotificationPanel onClose={() => setShowBell(false)} members={membersStore} />}
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

  const card: React.CSSProperties = { background: '#0F0F0F', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', position: 'relative', overflow: 'hidden' };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px 8px' }}>

        {/* Gelir kartı */}
        <div style={card}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top left, rgba(217,119,6,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.25)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Son 7 Gün</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '999px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <ArrowUpRight style={{ width: '11px', height: '11px', color: '#34d399' }} />
              <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>+14%</span>
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '12px' }}>₺32.450</div>
          <div style={{ height: '60px', marginLeft: '-4px', marginRight: '-4px', marginBottom: '-4px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity={0.22} /><stop offset="100%" stopColor={A} stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="value" stroke={AL} strokeWidth={2} fillOpacity={1} fill="url(#ag)" isAnimationActive={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 istatistik */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Süresi Doldu', count: red, color: '#f43f5e', border: 'rgba(244,63,94,0.12)', bg: 'rgba(244,63,94,0.06)' },
            { label: 'Bu Hafta', count: yellow, color: '#fbbf24', border: 'rgba(251,191,36,0.12)', bg: 'rgba(251,191,36,0.06)' },
            { label: 'Aktif', count: green, color: '#34d399', border: 'rgba(52,211,153,0.12)', bg: 'rgba(52,211,153,0.06)' },
          ].map(({ label, count, color, border, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'block' }} />
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{count}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.28)', lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bekleyen tahsilat */}
        {pendingRevenue > 0 && (
          <div style={{ borderRadius: '18px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.1)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard style={{ width: '14px', height: '14px', color: AL }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(245,158,11,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Bekleyen Tahsilat</p>
              <p style={{ fontSize: '16px', fontWeight: 900, color: AL, lineHeight: 1.3 }}>₺{pendingRevenue.toLocaleString('tr-TR')}</p>
            </div>
            <Link to="/app/members" style={{ fontSize: '11px', fontWeight: 700, padding: '6px 12px', borderRadius: '999px', textDecoration: 'none', color: AL, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}>Görüntüle</Link>
          </div>
        )}

        {/* Dikkat gerektiriyor */}
        {urgentMembers.length > 0 && (
          <div style={{ background: '#0F0F0F', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap style={{ width: '13px', height: '13px', color: '#f43f5e' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Dikkat Gerektiriyor</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(244,63,94,0.15)' }}>{urgentMembers.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 12px 12px' }}>
              {urgentMembers.map(member => (
                <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'opacity 0.15s' }}>
                  <img src={member.img} alt={member.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.package}</p>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: member.daysRemaining < 0 ? '#f43f5e' : '#fbbf24', flexShrink: 0 }}>{getStatusLabel(member.daysRemaining)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tüm üyeler özet */}
        <div style={{ background: '#0F0F0F', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.25)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Tüm Üyeler</span>
            </div>
            <Link to="/app/members" style={{ fontSize: '11px', fontWeight: 700, color: AL, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Tümü <ChevronRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 12px 12px' }}>
            {members.slice(0, 4).map(member => {
              const sc = getStatusColor(member.daysRemaining);
              return (
                <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={member.img} alt={member.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #0F0F0F', background: sc === 'green' ? '#34d399' : sc === 'yellow' ? '#fbbf24' : '#f43f5e' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>{member.package}</p>
                  </div>
                  <ChevronRight style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

// ── Members Screen ─────────────────────────────────────────────
type FilterType = 'all' | 'red' | 'yellow' | 'green';
const MembersScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const members = membersStore;
  const filters: { key: FilterType; label: string }[] = [{ key: 'all', label: 'Tümü' }, { key: 'red', label: 'Süresi Doldu' }, { key: 'yellow', label: 'Bu Hafta' }, { key: 'green', label: 'Aktif' }];
  const filtered = useMemo(() => {
    let list = members;
    if (search.trim()) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
    if (filter === 'red') list = list.filter(m => m.daysRemaining < 0);
    else if (filter === 'yellow') list = list.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    else if (filter === 'green') list = list.filter(m => m.daysRemaining > 7);
    return list;
  }, [members, search, filter]);

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px' }}>
        {/* Arama */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgba(255,255,255,0.22)' }} />
          <input type="text" placeholder="İsim veya telefon..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: '40px', paddingRight: search ? '36px' : '16px', paddingTop: '13px', paddingBottom: '13px', borderRadius: '14px', fontSize: '14px', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', boxSizing: 'border-box' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.5)' }} /></button>}
        </div>
        {/* Filtreler */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {filters.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: filter === key ? `linear-gradient(135deg, ${A}, ${AL})` : 'rgba(255,255,255,0.05)', color: filter === key ? '#080808' : 'rgba(255,255,255,0.35)', boxShadow: filter === key ? `0 4px 12px ${AG}` : 'none' }}>{label}</button>
          ))}
        </div>
        {/* Sayı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '2px' }}>
          <Filter style={{ width: '11px', height: '11px', color: 'rgba(255,255,255,0.18)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontWeight: 500 }}>{filtered.length} üye</span>
        </div>
        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.18)' }}><Users style={{ width: '28px', height: '28px', margin: '0 auto 10px' }} /><p style={{ fontSize: '13px' }}>Üye bulunamadı</p></div>}
          {filtered.map((member, i) => {
            const sc = getStatusColor(member.daysRemaining);
            return (
              <button key={member.id} onClick={() => navigate(`/app/members/${member.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', borderRadius: '18px', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left', width: '100%', opacity: 0, animation: `fadeUp 0.3s ease ${i * 0.05}s forwards` }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={member.img} alt={member.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #0F0F0F', background: sc === 'green' ? '#34d399' : sc === 'yellow' ? '#fbbf24' : '#f43f5e' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{member.name}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.package}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: sc === 'red' ? '#f43f5e' : sc === 'yellow' ? '#fbbf24' : 'rgba(255,255,255,0.22)', flexShrink: 0 }}>{getStatusLabel(member.daysRemaining)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </PageWrapper>
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

  if (!member) return <div style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '64px 0', fontSize: '14px' }}>Üye bulunamadı.</div>;

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

  const card: React.CSSProperties = { background: '#0F0F0F', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', padding: '20px' };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px 16px' }}>
        {/* Profil */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(217,119,6,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <img src={member.img} alt={member.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
            <span style={{ position: 'absolute', bottom: '1px', right: '1px', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #0F0F0F', background: sc === 'green' ? '#34d399' : sc === 'yellow' ? '#fbbf24' : '#f43f5e' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '8px' }}>{member.name}</h2>
          <div style={{ marginBottom: '14px' }}><PaymentBadgeFull status={member.paymentStatus} /></div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <a href={`tel:${member.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <Phone style={{ width: '14px', height: '14px' }} /> {member.phone}
            </a>
            <a href={`mailto:${member.email}`} style={{ width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              <Mail style={{ width: '14px', height: '14px' }} />
            </a>
          </div>
        </div>

        {/* Paket */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Dumbbell style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.22)' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Paket</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{member.package}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: sc === 'green' ? 'rgba(52,211,153,0.1)' : sc === 'yellow' ? 'rgba(251,191,36,0.1)' : 'rgba(244,63,94,0.1)', color: sc === 'green' ? '#34d399' : sc === 'yellow' ? '#fbbf24' : '#f43f5e' }}>{getStatusLabel(member.daysRemaining)}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Calendar style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <div><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>Başlangıç</p><p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.78)' }}>{member.startDate}</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Clock style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <div><p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>Bitiş</p><p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.78)' }}>{member.endDate}</p></div>
            </div>
          </div>
        </div>

        {/* Ödeme */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CreditCard style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.22)' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ödeme</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', marginBottom: '4px' }}>Toplam</p>
              <p style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>₺{member.totalAmount.toLocaleString('tr-TR')}</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(52,211,153,0.05)', borderRadius: '14px', border: '1px solid rgba(52,211,153,0.12)' }}>
              <p style={{ fontSize: '10px', color: 'rgba(52,211,153,0.5)', marginBottom: '4px' }}>Ödenen</p>
              <p style={{ fontSize: '17px', fontWeight: 900, color: '#34d399' }}>₺{member.paidAmount.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>İlerleme</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.38)' }}>{payPct}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${payPct}%`, background: `linear-gradient(90deg, ${A}, ${AL})`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          {remaining > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '12px', background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.1)', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(245,158,11,0.55)', fontWeight: 600 }}>Kalan</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: AL }}>₺{remaining.toLocaleString('tr-TR')}</span>
          </div>}
          <button onClick={() => setShowPayModal(true)} disabled={remaining <= 0} style={{ width: '100%', padding: '14px', borderRadius: '16px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: remaining > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: remaining > 0 ? `linear-gradient(135deg, ${A}, ${AL})` : 'rgba(255,255,255,0.05)', color: remaining > 0 ? '#080808' : 'rgba(255,255,255,0.2)', boxShadow: remaining > 0 ? `0 8px 20px ${AG}` : 'none' }}>
            <CreditCard style={{ width: '15px', height: '15px' }} />{remaining <= 0 ? 'Ödeme Tamamlandı' : 'Ödeme Al'}
          </button>
        </div>

        {/* Geçmiş ödemeler */}
        {member.pastPayments.length > 0 && (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Clock style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.22)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Geçmiş Ödemeler</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {member.pastPayments.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{p.month}</span>
                  {p.status === 'paid' ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>Ödendi ✓</span> : p.status === 'partial' ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>Eksik</span> : <span style={{ fontSize: '11px', fontWeight: 700, color: '#f43f5e' }}>Bekleniyor</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ödeme modalı */}
        {showPayModal && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', background: '#0F0F0F', borderRadius: '28px 28px 0 0', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideUp 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Ödeme Al</span>
                <button onClick={() => { setShowPayModal(false); setPaid(false); }} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)' }} /></button>
              </div>
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginBottom: '4px' }}>{member.name} — Kalan</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: AL }}>₺{remaining.toLocaleString('tr-TR')}</p>
              </div>
              {paid ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 style={{ width: '28px', height: '28px', color: '#34d399' }} /></div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>Kaydedildi!</p>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', fontSize: '16px', fontWeight: 700 }}>₺</span>
                    <input type="number" placeholder="Tutar girin" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: '100%', paddingLeft: '32px', paddingRight: '16px', paddingTop: '15px', paddingBottom: '15px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'white', fontSize: '16px', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[500, 1000, remaining].filter((v, i, arr) => arr.indexOf(v) === i && v > 0).map(v => (
                      <button key={v} onClick={() => setPayAmount(String(v))} style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700, color: AL, background: 'rgba(217,119,6,0.08)', border: `1px solid rgba(217,119,6,0.15)`, borderRadius: '12px', cursor: 'pointer' }}>₺{v.toLocaleString('tr-TR')}</button>
                    ))}
                  </div>
                  <button onClick={handlePayment} disabled={saving || !payAmount || parseInt(payAmount) <= 0} style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${A}, ${AL})`, color: '#080808', boxShadow: `0 8px 20px ${AG}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: saving || !payAmount || parseInt(payAmount) <= 0 ? 0.4 : 1 }}>
                    {saving ? 'Kaydediliyor...' : <><Check style={{ width: '18px', height: '18px' }} />Onayla</>}
                  </button>
                </>
              )}
              <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

// ── Router — TELEFON FRAME YOK, TAM EKRAN ─────────────────────
const router = createBrowserRouter([
  { path: '/', element: <div style={{ width: '100%', height: '100%', background: '#080808', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><Login /></div> },
  { path: '/login', element: <div style={{ width: '100%', height: '100%', background: '#080808', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><Login /></div> },
  { path: '/app', element: <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><Layout /></div>, children: [
    { path: 'home', element: <DashboardScreen /> },
    { path: 'members', element: <MembersScreen /> },
    { path: 'members/:id', element: <MemberDetailScreen /> },
  ]},
]);

export default function App() { return <RouterProvider router={router} />; }
