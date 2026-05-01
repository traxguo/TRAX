import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation, useParams, Link } from 'react-router';
import { Bell, Home, Users, ChevronRight, ChevronLeft, Phone, Mail, Search, Plus, X, Check, Clock, BarChart2, Filter, ArrowUpRight, CreditCard, Calendar, UserPlus, Dumbbell, CheckCircle2, Zap, MessageCircle, Edit3, Send, Save, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Login } from './Login';
import { mockMembers as initialMembers, revenueData } from './data';
import type { Member } from './data';

const A = '#D97706'; const AL = '#F59E0B'; const AG = 'rgba(217,119,6,0.25)';

const DEFAULT_TEMPLATES = {
  expiring: 'Merhaba {isim}, paketinizin süresi {gun} gün içinde dolmaktadır. Üyeliğinizi yenilemek için bizimle iletişime geçebilirsiniz. Görüşmek dileğiyle! 🏋️',
  expired:  'Merhaba {isim}, paketinizin süresi maalesef dolmuştur. Sizi yeniden aramızda görmek isteriz! Bilgi için bize ulaşabilirsiniz. 💪',
};

const calcDays = (endDate: string): number => {
  if (!endDate || endDate.trim() === '' || endDate === '-') return 999;
  let day=0, month=0, year=0;
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
  const today = new Date(); today.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

const getMember = (m: Member): Member => ({ ...m, daysRemaining: calcDays(m.endDate) });
const initStore = (): Member[] => initialMembers.map(getMember);

// Sadece 3 durum: expired / expiring / active
// Renk mantığı: yazılar ve büyük elementler HEP beyaz/nötr
// Sadece küçük indikatör nokta ve minimal badge renkli
const getStatusColor = (days: number): 'green'|'yellow'|'red' =>
  days < 0 ? 'red' : days <= 7 ? 'yellow' : 'green';

const getStatusLabel = (days: number) =>
  days < 0 ? 'Süresi doldu' : days === 999 ? 'Tarih yok' : `${days} gün kaldı`;

// Sadece nokta rengi için — pastel/düşük saturasyon
const dotColor = (sc: 'green'|'yellow'|'red') =>
  sc === 'green' ? '#4ade80' : sc === 'yellow' ? '#facc15' : '#f87171';

const getWhatsAppHref = (phone: string, msg: string): string => {
  const c = phone.replace(/\D/g,'');
  const intl = c.startsWith('90') ? c : c.startsWith('0') ? '90'+c.slice(1) : '90'+c;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
};

const buildMsg = (tpl: string, m: Member) =>
  tpl.replace(/{isim}/g, m.name.split(' ')[0]).replace(/{gun}/g, String(Math.max(0, m.daysRemaining)));

// ── Store ────────────────────────────────────────────────────
type StoreCtx = {
  members: Member[];
  addMember: (m: Member) => void;
  updateMember: (m: Member) => void;
  deleteMember: (id: string) => void;
};
const StoreContext = createContext<StoreCtx>({ members: [], addMember:()=>{}, updateMember:()=>{}, deleteMember:()=>{} });
const useStore = () => useContext(StoreContext);

// ── Paylaşılan stiller ───────────────────────────────────────
const card: React.CSSProperties = {
  background: '#111111',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.06)',
  padding: '18px',
  position: 'relative',
  overflow: 'hidden',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 14px', borderRadius: '13px',
  fontSize: '14px', color: 'white', outline: 'none',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxSizing: 'border-box',
};

// ── PageWrapper ───────────────────────────────────────────────
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), 30); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity: v?1:0, transform: v?'translateY(0)':'translateY(10px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
      {children}
    </div>
  );
};

const TraxLogo = ({ size=22 }: { size?: number }) => (
  <img src="/trax-logo-amber.png" alt="TRAX" style={{ height:`${size}px`, width:'auto', filter:'drop-shadow(0 0 8px rgba(217,119,6,0.55)) drop-shadow(0 0 20px rgba(217,119,6,0.2))' }} />
);

// ── Badge — sadece ödeme için, sade ─────────────────────────
const PaymentBadge = ({ status }: { status: 'paid'|'partial'|'unpaid' }) => {
  const cfg = {
    paid:    { color: 'rgba(255,255,255,0.5)',  label: 'Ödeme Tamamlandı' },
    partial: { color: 'rgba(255,255,255,0.35)', label: 'Kısmi Ödeme' },
    unpaid:  { color: 'rgba(255,255,255,0.25)', label: 'Ödeme Bekleniyor' },
  }[status];
  return (
    <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'999px', color: cfg.color, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
      {cfg.label}
    </span>
  );
};

// ── Üye Silme Onay Modalı ────────────────────────────────────
const DeleteModal = ({ name, onClose, onConfirm }: { name: string; onClose: ()=>void; onConfirm: ()=>void }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', zIndex:70, display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', background:'#111', borderRadius:'28px 28px 0 0', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'28px 24px 48px', display:'flex', flexDirection:'column', gap:'20px', animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', textAlign:'center' }}>
          <div style={{ width:'50px', height:'50px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Trash2 style={{ width:'20px', height:'20px', color:'rgba(255,255,255,0.4)' }} />
          </div>
          <div>
            <p style={{ fontSize:'16px', fontWeight:800, color:'white', marginBottom:'8px' }}>Üyeyi sil</p>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
              <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{name}</span> kalıcı olarak silinecek.
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'14px', borderRadius:'15px', fontWeight:700, fontSize:'14px', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)' }}>
            Vazgeç
          </button>
          <button onClick={() => { setBusy(true); setTimeout(onConfirm, 500); }} disabled={busy} style={{ flex:1, padding:'14px', borderRadius:'15px', fontWeight:800, fontSize:'14px', border:'none', cursor:'pointer', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', opacity:busy?0.6:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Trash2 style={{ width:'14px', height:'14px' }} />{busy ? 'Siliniyor...' : 'Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── WhatsApp Paneli ──────────────────────────────────────────
const NotificationPanel = ({ onClose }: { onClose: ()=>void }) => {
  const { members } = useStore();
  const urgents = members.filter(m => m.daysRemaining <= 7);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editMode, setEditMode]   = useState<'expiring'|'expired'|null>(null);
  const [draft, setDraft]         = useState('');
  const [sent, setSent]           = useState<string[]>([]);

  return (
    <div style={{ position:'absolute', inset:0, zIndex:60, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#111', borderRadius:'28px 28px 0 0', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 20px 36px', display:'flex', flexDirection:'column', gap:'14px', maxHeight:'82%', overflow:'hidden', animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <MessageCircle style={{ width:'15px', height:'15px', color:'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize:'15px', fontWeight:800, color:'white' }}>WhatsApp Bildirimler</span>
          </div>
          <button onClick={onClose} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X style={{ width:'14px', height:'14px', color:'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <p style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.12em', textTransform:'uppercase' }}>Mesaj Şablonları</p>
          {(['expiring','expired'] as const).map(type => (
            <div key={type} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.45)' }}>{type==='expiring' ? '⚠️  Az kalan' : '⊘  Süresi dolan'}</span>
                {editMode===type
                  ? <button onClick={() => { setTemplates(t=>({...t,[type]:draft})); setEditMode(null); }} style={{ fontSize:'11px', fontWeight:700, color:AL, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}><Save style={{ width:'12px', height:'12px' }}/>Kaydet</button>
                  : <button onClick={() => { setDraft(templates[type]); setEditMode(type); }} style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.25)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}><Edit3 style={{ width:'12px', height:'12px' }}/>Düzenle</button>}
              </div>
              {editMode===type
                ? <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={3} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'8px', color:'white', fontSize:'12px', resize:'none', outline:'none', boxSizing:'border-box', lineHeight:1.5 }} />
                : <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>{templates[type]}</p>}
            </div>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          <p style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>Bildirim Gönder ({urgents.length})</p>
          {urgents.length===0
            ? <div style={{ textAlign:'center', padding:'24px', color:'rgba(255,255,255,0.2)' }}><p style={{ fontSize:'13px' }}>Tüm üyeler aktif 🎉</p></div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {urgents.map(m => {
                  const tpl = m.daysRemaining<0 ? templates.expired : templates.expiring;
                  const href = getWhatsAppHref(m.phone, buildMsg(tpl, m));
                  const isSent = sent.includes(m.id);
                  return (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'14px', padding:'10px 12px' }}>
                      <img src={m.img} alt={m.name} style={{ width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:'2px' }}>{m.name}</p>
                        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{getStatusLabel(m.daysRemaining)}</p>
                      </div>
                      <a href={href} target="_blank" rel="noreferrer" onClick={() => setSent(s=>[...s,m.id])} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'7px 12px', borderRadius:'10px', fontSize:'12px', fontWeight:700, flexShrink:0, background:isSent?'rgba(255,255,255,0.05)':'rgba(37,211,102,0.1)', color:isSent?'rgba(255,255,255,0.3)':'#25D366', textDecoration:'none' }}>
                        {isSent ? <><Check style={{ width:'13px', height:'13px' }}/>Gönderildi</> : <><Send style={{ width:'13px', height:'13px' }}/>Gönder</>}
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

// ── Edit Member Modal ────────────────────────────────────────
const EditMemberModal = ({ member, onClose, onSave }: { member:Member; onClose:()=>void; onSave:(m:Member)=>void }) => {
  const packages = ['Aylık Sınırsız','10 Derslik Paket','5 Derslik Paket','20 Derslik Paket','Yıllık Üyelik'];
  const toInput = (s:string) => { if(!s||s==='-') return ''; if(s.includes('-')) return s; const p=s.split('.'); if(p.length!==3) return ''; return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; };
  const toDisplay = (s:string) => { if(!s) return ''; if(s.includes('.')) return s; const p=s.split('-'); if(p.length!==3) return ''; return `${p[2]}.${p[1]}.${p[0]}`; };
  const [form, setForm] = useState({ name:member.name, phone:member.phone, email:member.email||'', package:member.package, totalAmount:String(member.totalAmount), startDate:toInput(member.startDate), endDate:toInput(member.endDate) });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const endDisp = toDisplay(form.endDate);
      onSave({ ...member, name:form.name.trim()||member.name, phone:form.phone.trim()||member.phone, email:form.email.trim(), package:form.package, totalAmount:parseInt(form.totalAmount)||member.totalAmount, startDate:toDisplay(form.startDate)||member.startDate, endDate:endDisp, daysRemaining:calcDays(endDisp) });
      setSaving(false); onClose();
    }, 400);
  };

  return (
    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', zIndex:50, display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', background:'#111', borderRadius:'28px 28px 0 0', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'24px 24px 44px', display:'flex', flexDirection:'column', gap:'10px', animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ fontSize:'16px', fontWeight:800, color:'white' }}>Üyeyi Düzenle</span>
          <button onClick={onClose} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X style={{ width:'14px', height:'14px', color:'rgba(255,255,255,0.4)' }}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'65vh', overflowY:'auto' }}>
          <input style={inputStyle} placeholder="Ad Soyad" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <input style={inputStyle} placeholder="Telefon" value={form.phone} type="tel" onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          <input style={inputStyle} placeholder="E-posta" value={form.email} type="email" onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          <select style={{ ...inputStyle, appearance:'none' } as React.CSSProperties} value={form.package} onChange={e=>setForm(f=>({...f,package:e.target.value}))}>
            {packages.map(p=><option key={p} value={p} style={{ background:'#111' }}>{p}</option>)}
          </select>
          <input style={inputStyle} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e=>setForm(f=>({...f,totalAmount:e.target.value}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <div><label style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', fontWeight:700, display:'block', marginBottom:'4px' }}>Başlangıç</label><input style={inputStyle} type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} /></div>
            <div><label style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', fontWeight:700, display:'block', marginBottom:'4px' }}>Bitiş</label><input style={inputStyle} type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} /></div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ width:'100%', padding:'15px', borderRadius:'15px', fontWeight:800, fontSize:'14px', border:'none', cursor:'pointer', background:`linear-gradient(135deg,#B45309,${A} 50%,${AL})`, color:'#080808', boxShadow:`0 6px 20px ${AG}`, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:saving?0.7:1, marginTop:'4px' }}>
          {saving ? 'Kaydediliyor...' : <><Check style={{ width:'16px', height:'16px' }}/>Kaydet</>}
        </button>
      </div>
    </div>
  );
};

// ── Add Member Modal ─────────────────────────────────────────
const AddMemberModal = ({ onClose, onAdd }: { onClose:()=>void; onAdd:(m:Member)=>void }) => {
  const packages = ['Aylık Sınırsız','10 Derslik Paket','5 Derslik Paket','20 Derslik Paket','Yıllık Üyelik'];
  const toDisp = (s:string) => { if(!s) return ''; const p=s.split('-'); if(p.length!==3) return ''; return `${p[2]}.${p[1]}.${p[0]}`; };
  const [form, setForm] = useState({ name:'', phone:'', email:'', package:'', totalAmount:'', startDate:'', endDate:'' });
  const [saving, setSaving] = useState(false);
  const canSubmit = form.name && form.phone && form.package;

  const handleSubmit = () => {
    if(!canSubmit) return;
    setSaving(true);
    setTimeout(() => {
      const endDisp = toDisp(form.endDate);
      const days = calcDays(endDisp);
      onAdd({ id:Date.now().toString(), name:form.name, phone:form.phone, email:form.email, img:`https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=1a1a1a&color=D97706&size=200`, package:form.package, daysRemaining:days, paymentStatus:'unpaid', totalAmount:parseInt(form.totalAmount)||0, paidAmount:0, startDate:toDisp(form.startDate)||new Date().toLocaleDateString('tr-TR'), endDate:endDisp, isActive:days>=0, pastPayments:[] });
      onClose();
    }, 500);
  };

  return (
    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', zIndex:50, display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', background:'#111', borderRadius:'28px 28px 0 0', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'24px 24px 44px', display:'flex', flexDirection:'column', gap:'10px', animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <span style={{ fontSize:'16px', fontWeight:800, color:'white' }}>Yeni Üye</span>
          <button onClick={onClose} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X style={{ width:'14px', height:'14px', color:'rgba(255,255,255,0.4)' }}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'65vh', overflowY:'auto' }}>
          <input style={inputStyle} placeholder="Ad Soyad *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <input style={inputStyle} placeholder="Telefon *" value={form.phone} type="tel" onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          <input style={inputStyle} placeholder="E-posta" value={form.email} type="email" onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          <select style={{ ...inputStyle, appearance:'none' } as React.CSSProperties} value={form.package} onChange={e=>setForm(f=>({...f,package:e.target.value}))}>
            <option value="" disabled>Paket Seçin *</option>
            {packages.map(p=><option key={p} value={p} style={{ background:'#111' }}>{p}</option>)}
          </select>
          <input style={inputStyle} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e=>setForm(f=>({...f,totalAmount:e.target.value}))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <div><label style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', fontWeight:700, display:'block', marginBottom:'4px' }}>Başlangıç</label><input style={inputStyle} type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} /></div>
            <div><label style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', fontWeight:700, display:'block', marginBottom:'4px' }}>Bitiş</label><input style={inputStyle} type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} /></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving||!canSubmit} style={{ width:'100%', padding:'15px', borderRadius:'15px', fontWeight:800, fontSize:'14px', border:'none', cursor:'pointer', background:`linear-gradient(135deg,#B45309,${A} 50%,${AL})`, color:'#080808', boxShadow:`0 6px 20px ${AG}`, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:saving||!canSubmit?0.35:1, marginTop:'4px' }}>
          {saving ? 'Kaydediliyor...' : <><UserPlus style={{ width:'16px', height:'16px' }}/>Üye Ekle</>}
        </button>
      </div>
    </div>
  );
};

// ── Header ───────────────────────────────────────────────────
const Header = ({ onAddMember, onBell, urgentCount }: { onAddMember?:()=>void; onBell:()=>void; urgentCount:number }) => {
  const location = useLocation(); const navigate = useNavigate();
  const isDetail  = location.pathname.includes('/members/');
  const isMembers = location.pathname === '/app/members';
  const hdr: React.CSSProperties = { padding:'52px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, background:'rgba(8,8,8,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.04)', flexShrink:0 };

  if (isDetail) return (
    <header style={hdr}>
      <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer', padding:'8px 0' }}>
        <ChevronLeft style={{ width:'16px', height:'16px' }}/><span style={{ fontSize:'13px', fontWeight:600 }}>Geri</span>
      </button>
      <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.18)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Üye Detayı</span>
      <div style={{ width:'56px' }}/>
    </header>
  );

  return (
    <header style={hdr}>
      <TraxLogo/>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        {isMembers && onAddMember && (
          <button onClick={onAddMember} style={{ width:'32px', height:'32px', borderRadius:'50%', border:'none', cursor:'pointer', background:`linear-gradient(135deg,${A},${AL})`, boxShadow:`0 4px 12px ${AG}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Plus style={{ width:'16px', height:'16px', color:'#080808' }}/>
          </button>
        )}
        <button onClick={onBell} style={{ position:'relative', width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Bell style={{ width:'15px', height:'15px', color:urgentCount>0?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.35)' }} strokeWidth={1.5}/>
          {urgentCount>0 && <span style={{ position:'absolute', top:'7px', right:'7px', width:'7px', height:'7px', borderRadius:'50%', background:AL, border:'1.5px solid #080808' }}/>}
        </button>
      </div>
    </header>
  );
};

// ── Bottom Nav ───────────────────────────────────────────────
const BottomNav = () => {
  const location = useLocation();
  const tabs = [{ path:'/app/home', icon:Home, label:'Anasayfa' }, { path:'/app/members', icon:Users, label:'Üyeler' }];
  return (
    <div style={{ flexShrink:0, height:'88px', background:'linear-gradient(to top,#080808 60%,transparent)', display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:'20px', zIndex:20 }}>
      <div style={{ background:'rgba(20,20,20,0.95)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'999px', height:'56px', display:'flex', alignItems:'center', justifyContent:'center', gap:'48px', padding:'0 40px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
        {tabs.map(({ path, icon:Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', width:'40px', height:'40px', justifyContent:'center', textDecoration:'none' }}>
              <Icon style={{ width:'20px', height:'20px', color:active?'white':'rgba(255,255,255,0.25)', transition:'color 0.2s' }} strokeWidth={active?2.5:1.5}/>
              <span style={{ fontSize:'8px', fontWeight:700, color:active?AL:'transparent', transition:'color 0.2s' }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ── Layout ───────────────────────────────────────────────────
const Layout = () => {
  const location = useLocation();
  const [members, setMembers]   = useState<Member[]>(initStore);
  const [showAdd, setShowAdd]   = useState(false);
  const [showBell, setShowBell] = useState(false);
  const hideNav     = location.pathname.includes('/members/');
  const urgentCount = members.filter(m => m.daysRemaining <= 7).length;

  const addMember    = (m: Member) => setMembers(prev => [m, ...prev]);
  const updateMember = (u: Member) => setMembers(prev => prev.map(m => m.id===u.id ? u : m));
  const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));

  return (
    <StoreContext.Provider value={{ members, addMember, updateMember, deleteMember }}>
      <div style={{ width:'100%', height:'100%', background:'#080808', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Header onAddMember={() => setShowAdd(true)} onBell={() => setShowBell(true)} urgentCount={urgentCount}/>
        <main style={{ flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch' as any, overscrollBehavior:'contain' }}>
          <Outlet/>
        </main>
        {!hideNav && <BottomNav/>}
        {showAdd  && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={m => { addMember(m); setShowAdd(false); }}/>}
        {showBell && <NotificationPanel onClose={() => setShowBell(false)}/>}
      </div>
    </StoreContext.Provider>
  );
};

// ── Dashboard ────────────────────────────────────────────────
const DashboardScreen = () => {
  const navigate = useNavigate();
  const { members } = useStore();

  const red    = members.filter(m => m.daysRemaining < 0).length;
  const yellow = members.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7).length;
  const green  = members.filter(m => m.daysRemaining > 7 && m.daysRemaining < 999).length;
  const pending = members.reduce((s,m) => s + (m.totalAmount - m.paidAmount), 0);

  // Bu hafta bitenler (0-7 gün)
  const thisWeek = members
    .filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7)
    .sort((a,b) => a.daysRemaining - b.daysRemaining);

  // Süresi dolanlar
  const expired = members.filter(m => m.daysRemaining < 0);

  return (
    <PageWrapper>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'12px 16px 8px' }}>

        {/* Gelir kartı */}
        <div style={card}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at top left, rgba(217,119,6,0.05) 0%, transparent 60%)', pointerEvents:'none' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <BarChart2 style={{ width:'12px', height:'12px', color:'rgba(255,255,255,0.2)' }}/>
              <span style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Son 7 Gün Gelir</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 8px', borderRadius:'999px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <ArrowUpRight style={{ width:'11px', height:'11px', color:'rgba(255,255,255,0.4)' }}/>
              <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', fontWeight:700 }}>+14%</span>
            </div>
          </div>
          <div style={{ fontSize:'28px', fontWeight:900, color:'white', letterSpacing:'-0.03em', marginBottom:'12px' }}>₺32.450</div>
          <div style={{ height:'56px', marginLeft:'-4px', marginRight:'-4px', marginBottom:'-4px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top:4, right:0, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={A} stopOpacity={0.18}/>
                    <stop offset="100%" stopColor={A} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={AL} strokeWidth={1.5} fillOpacity={1} fill="url(#ag)" isAnimationActive={false} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 stat — minimal, sadece sayı + etiket */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
          {[
            { label:'Süresi Doldu', count:red,    sc:'red'    as const },
            { label:'Bu Hafta',     count:yellow,  sc:'yellow' as const },
            { label:'Aktif',        count:green,   sc:'green'  as const },
          ].map(({ label, count, sc }) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'14px 12px', display:'flex', flexDirection:'column', gap:'10px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:dotColor(sc), display:'block', opacity:0.7 }}/>
              <span style={{ fontSize:'24px', fontWeight:900, color:'white', lineHeight:1 }}>{count}</span>
              <span style={{ fontSize:'10px', fontWeight:600, color:'rgba(255,255,255,0.25)', lineHeight:1.3 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bekleyen tahsilat — sadece varsa */}
        {pending > 0 && (
          <div style={{ borderRadius:'18px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <CreditCard style={{ width:'14px', height:'14px', color:'rgba(255,255,255,0.35)' }}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Bekleyen Tahsilat</p>
              <p style={{ fontSize:'16px', fontWeight:900, color:'white' }}>₺{pending.toLocaleString('tr-TR')}</p>
            </div>
            <Link to="/app/members" style={{ fontSize:'11px', fontWeight:700, padding:'6px 14px', borderRadius:'999px', textDecoration:'none', color:AL, background:`linear-gradient(135deg,${A},${AL})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' } as React.CSSProperties}>Görüntüle →</Link>
          </div>
        )}

        {/* ── Bu Hafta Bitenler ── */}
        {thisWeek.length > 0 && (
          <div style={{ background:'#111111', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 16px 12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Clock style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.25)' }}/>
                <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.75)' }}>Bu Hafta Bitenler</span>
              </div>
              <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.07)' }}>{thisWeek.length} üye</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', padding:'0 12px 14px' }}>
              {thisWeek.map(m => (
                <button key={m.id} onClick={() => navigate(`/app/members/${m.id}`)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'14px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', textAlign:'left', width:'100%' }}>
                  <img src={m.img} alt={m.name} style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</p>
                    <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.package}</p>
                  </div>
                  {/* Sadece kalan gün sayısı — sade, renksiz */}
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <span style={{ fontSize:'18px', fontWeight:900, color:'white', lineHeight:1, display:'block' }}>{m.daysRemaining}</span>
                    <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.2)', fontWeight:600 }}>GÜN</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Süresi Dolanlar ── */}
        {expired.length > 0 && (
          <div style={{ background:'#111111', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 16px 12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Zap style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.25)' }}/>
                <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.75)' }}>Süresi Dolanlar</span>
              </div>
              <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.07)' }}>{expired.length} üye</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', padding:'0 12px 14px' }}>
              {expired.map(m => (
                <button key={m.id} onClick={() => navigate(`/app/members/${m.id}`)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'14px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', textAlign:'left', width:'100%' }}>
                  <img src={m.img} alt={m.name} style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', flexShrink:0, opacity:0.7 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</p>
                    <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.package}</p>
                  </div>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', flexShrink:0 }}>Doldu</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Son üyeler — sadece listede yoksa boşluk doldurmak için */}
        {thisWeek.length === 0 && expired.length === 0 && (
          <div style={{ background:'#111111', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 16px 10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <Users style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.2)' }}/>
                <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.7)' }}>Üyeler</span>
              </div>
              <Link to="/app/members" style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.35)', textDecoration:'none', display:'flex', alignItems:'center', gap:'2px' }}>Tümü<ChevronRight style={{ width:'13px', height:'13px' }}/></Link>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', padding:'0 12px 12px' }}>
              {members.slice(0,4).map(m => {
                const sc = getStatusColor(m.daysRemaining);
                return (
                  <button key={m.id} onClick={() => navigate(`/app/members/${m.id}`)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', cursor:'pointer', textAlign:'left', width:'100%' }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <img src={m.img} alt={m.name} style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover' }}/>
                      <span style={{ position:'absolute', bottom:'-1px', right:'-1px', width:'9px', height:'9px', borderRadius:'50%', border:'2px solid #111', background:dotColor(sc) }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</p>
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>{m.package}</p>
                    </div>
                    <ChevronRight style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.1)', flexShrink:0 }}/>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

// ── Members ──────────────────────────────────────────────────
type F = 'all'|'red'|'yellow'|'green';
const MembersScreen = () => {
  const navigate = useNavigate();
  const { members } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<F>('all');

  const filters: { key:F; label:string }[] = [
    { key:'all',    label:'Tümü' },
    { key:'red',    label:'Süresi Doldu' },
    { key:'yellow', label:'Bu Hafta' },
    { key:'green',  label:'Aktif' },
  ];

  const filtered = useMemo(() => {
    let l = members;
    if (search.trim()) l = l.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
    if (filter==='red')    l = l.filter(m => m.daysRemaining < 0);
    if (filter==='yellow') l = l.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    if (filter==='green')  l = l.filter(m => m.daysRemaining > 7 && m.daysRemaining < 999);
    return l;
  }, [members, search, filter]);

  return (
    <PageWrapper>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'12px 16px' }}>
        <div style={{ position:'relative' }}>
          <Search style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'rgba(255,255,255,0.2)' }}/>
          <input type="text" placeholder="İsim veya telefon..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', paddingLeft:'40px', paddingRight:search?'36px':'16px', paddingTop:'13px', paddingBottom:'13px', borderRadius:'14px', fontSize:'14px', color:'white', outline:'none', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', boxSizing:'border-box' }}/>
          {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'20px', height:'20px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X style={{ width:'12px', height:'12px', color:'rgba(255,255,255,0.4)' }}/></button>}
        </div>

        <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'2px' }}>
          {filters.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:'999px', fontSize:'11px', fontWeight:700, border:'none', cursor:'pointer', background:filter===key?`linear-gradient(135deg,${A},${AL})`:'rgba(255,255,255,0.05)', color:filter===key?'#080808':'rgba(255,255,255,0.3)', boxShadow:filter===key?`0 4px 12px ${AG}`:'none', transition:'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'6px', paddingLeft:'2px' }}>
          <Filter style={{ width:'11px', height:'11px', color:'rgba(255,255,255,0.15)' }}/>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)', fontWeight:500 }}>{filtered.length} üye</span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px 0', color:'rgba(255,255,255,0.15)' }}>
              <Users style={{ width:'28px', height:'28px', margin:'0 auto 10px' }}/>
              <p style={{ fontSize:'13px' }}>Üye bulunamadı</p>
            </div>
          )}
          {filtered.map((m, i) => {
            const sc = getStatusColor(m.daysRemaining);
            return (
              <button key={m.id} onClick={() => navigate(`/app/members/${m.id}`)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 14px', borderRadius:'18px', background:'#111111', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', textAlign:'left', width:'100%', opacity:0, animation:`fadeUp 0.3s ease ${i*0.04}s forwards` }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <img src={m.img} alt={m.name} style={{ width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover' }}/>
                  <span style={{ position:'absolute', bottom:'-1px', right:'-1px', width:'11px', height:'11px', borderRadius:'50%', border:'2px solid #111', background:dotColor(sc) }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'2px' }}>{m.name}</p>
                  <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.package}</p>
                </div>
                {/* Kalan gün — sadece yazı, renksiz */}
                <span style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.3)', flexShrink:0 }}>
                  {getStatusLabel(m.daysRemaining)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </PageWrapper>
  );
};

// ── Member Detail ────────────────────────────────────────────
const MemberDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, updateMember, deleteMember } = useStore();
  const member = members.find(m => m.id === id);
  const [showPayModal, setShowPayModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payAmount, setPayAmount]             = useState('');
  const [saving, setSaving]                   = useState(false);
  const [paid, setPaid]                       = useState(false);

  if (!member) return <div style={{ color:'rgba(255,255,255,0.2)', textAlign:'center', padding:'64px 0', fontSize:'14px' }}>Üye bulunamadı.</div>;

  const remaining = member.totalAmount - member.paidAmount;
  const payPct    = member.totalAmount > 0 ? Math.round((member.paidAmount/member.totalAmount)*100) : 0;
  const sc        = getStatusColor(member.daysRemaining);

  const handlePayment = () => {
    if (!payAmount || parseInt(payAmount) <= 0) return;
    setSaving(true);
    setTimeout(() => {
      const amount = Math.min(parseInt(payAmount), remaining);
      updateMember({ ...member, paidAmount:member.paidAmount+amount, paymentStatus:member.paidAmount+amount>=member.totalAmount?'paid':'partial' });
      setSaving(false); setPaid(true); setPayAmount('');
      setTimeout(() => { setPaid(false); setShowPayModal(false); }, 1500);
    }, 700);
  };

  const waTpl  = member.daysRemaining < 0 ? DEFAULT_TEMPLATES.expired : DEFAULT_TEMPLATES.expiring;
  const waHref = getWhatsAppHref(member.phone, buildMsg(waTpl, member));

  return (
    <PageWrapper>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'12px 16px 16px' }}>

        {/* Profil */}
        <div style={{ ...card, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at top,rgba(255,255,255,0.02) 0%,transparent 60%)', pointerEvents:'none' }}/>
          {/* Aksiyonlar — sağ üst */}
          <div style={{ position:'absolute', top:'14px', right:'14px', display:'flex', gap:'6px' }}>
            <button onClick={() => setShowEditModal(true)} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'6px 10px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', color:'rgba(255,255,255,0.35)', fontSize:'11px', fontWeight:600 }}>
              <Pencil style={{ width:'11px', height:'11px' }}/>Düzenle
            </button>
           <button onClick={() => setShowDeleteModal(true)} style={{ width:'32px', height:'32px', borderRadius:'10px', background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)',
              <Trash2 style={{ width:'14px', height:'14px', color:'#f87171' }}/>
            </button>
          </div>

          <div style={{ position:'relative', marginBottom:'12px', marginTop:'8px' }}>
            <img src={member.img} alt={member.name} style={{ width:'70px', height:'70px', borderRadius:'50%', objectFit:'cover', border:'1px solid rgba(255,255,255,0.08)' }}/>
            <span style={{ position:'absolute', bottom:'1px', right:'1px', width:'13px', height:'13px', borderRadius:'50%', border:'2px solid #111', background:dotColor(sc) }}/>
          </div>
          <h2 style={{ fontSize:'18px', fontWeight:900, color:'white', letterSpacing:'-0.02em', marginBottom:'8px' }}>{member.name}</h2>
          <div style={{ marginBottom:'14px' }}><PaymentBadge status={member.paymentStatus}/></div>
          <div style={{ display:'flex', gap:'8px', width:'100%' }}>
            <a href={`tel:${member.phone}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'11px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', color:'rgba(255,255,255,0.5)', fontSize:'12px', fontWeight:600, textDecoration:'none' }}>
              <Phone style={{ width:'14px', height:'14px' }}/>{member.phone}
            </a>
            {member.email && (
              <a href={`mailto:${member.email}`} style={{ width:'42px', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>
                <Mail style={{ width:'14px', height:'14px' }}/>
              </a>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <a href={waHref} target="_blank" rel="noreferrer" style={{ width:'100%', padding:'13px', borderRadius:'16px', fontWeight:700, fontSize:'13px', border:'1px solid rgba(37,211,102,0.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(37,211,102,0.05)', color:'rgba(37,211,102,0.7)', textDecoration:'none', boxSizing:'border-box' }}>
          <MessageCircle style={{ width:'15px', height:'15px' }}/>WhatsApp Mesaj Gönder
        </a>

        {/* Paket */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
            <Dumbbell style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.2)' }}/>
            <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Paket</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.05)', marginBottom:'8px' }}>
            <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{member.package}</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)' }}>{getStatusLabel(member.daysRemaining)}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
              <Calendar style={{ width:'12px', height:'12px', color:'rgba(255,255,255,0.15)', flexShrink:0 }}/>
              <div><p style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)', fontWeight:500 }}>Başlangıç</p><p style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.75)' }}>{member.startDate||'-'}</p></div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
              <Clock style={{ width:'12px', height:'12px', color:'rgba(255,255,255,0.15)', flexShrink:0 }}/>
              <div><p style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)', fontWeight:500 }}>Bitiş</p><p style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.75)' }}>{member.endDate||'-'}</p></div>
            </div>
          </div>
        </div>

        {/* Ödeme */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
            <CreditCard style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.2)' }}/>
            <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Ödeme</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
            <div style={{ padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)', marginBottom:'4px' }}>Toplam</p>
              <p style={{ fontSize:'17px', fontWeight:900, color:'white' }}>₺{member.totalAmount.toLocaleString('tr-TR')}</p>
            </div>
            <div style={{ padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)', marginBottom:'4px' }}>Ödenen</p>
              <p style={{ fontSize:'17px', fontWeight:900, color:'rgba(255,255,255,0.8)' }}>₺{member.paidAmount.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div style={{ marginBottom:'10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)' }}>İlerleme</span>
              <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.3)' }}>{payPct}%</span>
            </div>
            <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'999px', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:'999px', width:`${payPct}%`, background:`linear-gradient(90deg,${A},${AL})`, transition:'width 0.5s ease' }}/>
            </div>
          </div>
          {remaining > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', marginBottom:'10px' }}>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', fontWeight:600 }}>Kalan</span>
              <span style={{ fontSize:'15px', fontWeight:900, color:'white' }}>₺{remaining.toLocaleString('tr-TR')}</span>
            </div>
          )}
          <button onClick={() => setShowPayModal(true)} disabled={remaining <= 0} style={{ width:'100%', padding:'14px', borderRadius:'16px', fontWeight:800, fontSize:'14px', border:'none', cursor:remaining>0?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:remaining>0?`linear-gradient(135deg,${A},${AL})`:'rgba(255,255,255,0.04)', color:remaining>0?'#080808':'rgba(255,255,255,0.18)', boxShadow:remaining>0?`0 8px 20px ${AG}`:'none' }}>
            <CreditCard style={{ width:'15px', height:'15px' }}/>{remaining<=0?'Ödeme Tamamlandı':'Ödeme Al'}
          </button>
        </div>

        {/* Geçmiş ödemeler */}
        {member.pastPayments.length > 0 && (
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
              <Clock style={{ width:'13px', height:'13px', color:'rgba(255,255,255,0.2)' }}/>
              <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Geçmiş Ödemeler</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {member.pastPayments.map((p,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:'12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>{p.month}</span>
                  <span style={{ fontSize:'11px', fontWeight:700, color:p.status==='paid'?'rgba(255,255,255,0.6)':p.status==='partial'?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.2)' }}>
                    {p.status==='paid'?'Ödendi ✓':p.status==='partial'?'Eksik':'Bekleniyor'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ödeme modalı */}
        {showPayModal && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'flex-end' }}>
            <div style={{ width:'100%', background:'#111', borderRadius:'28px 28px 0 0', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'24px 24px 40px', display:'flex', flexDirection:'column', gap:'12px', animation:'slideUp 0.3s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'15px', fontWeight:800, color:'white' }}>Ödeme Al</span>
                <button onClick={() => { setShowPayModal(false); setPaid(false); }} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X style={{ width:'14px', height:'14px', color:'rgba(255,255,255,0.4)' }}/></button>
              </div>
              <div style={{ padding:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px' }}>
                <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginBottom:'4px' }}>{member.name} — Kalan</p>
                <p style={{ fontSize:'22px', fontWeight:900, color:'white' }}>₺{remaining.toLocaleString('tr-TR')}</p>
              </div>
              {paid ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', padding:'16px 0' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CheckCircle2 style={{ width:'28px', height:'28px', color:'rgba(255,255,255,0.7)' }}/>
                  </div>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.7)' }}>Kaydedildi!</p>
                </div>
              ) : (
                <>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.2)', fontSize:'16px', fontWeight:700 }}>₺</span>
                    <input type="number" placeholder="Tutar girin" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width:'100%', paddingLeft:'32px', paddingRight:'16px', paddingTop:'15px', paddingBottom:'15px', borderRadius:'16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', fontSize:'16px', fontWeight:700, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[500,1000,remaining].filter((v,i,arr) => arr.indexOf(v)===i && v>0).map(v => (
                      <button key={v} onClick={() => setPayAmount(String(v))} style={{ flex:1, padding:'8px', fontSize:'11px', fontWeight:700, color:AL, background:`rgba(217,119,6,0.07)`, border:`1px solid rgba(217,119,6,0.13)`, borderRadius:'12px', cursor:'pointer' }}>₺{v.toLocaleString('tr-TR')}</button>
                    ))}
                  </div>
                  <button onClick={handlePayment} disabled={saving||!payAmount||parseInt(payAmount)<=0} style={{ width:'100%', padding:'16px', borderRadius:'16px', fontWeight:800, fontSize:'15px', border:'none', cursor:'pointer', background:`linear-gradient(135deg,${A},${AL})`, color:'#080808', boxShadow:`0 8px 20px ${AG}`, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:saving||!payAmount||parseInt(payAmount)<=0?0.4:1 }}>
                    {saving?'Kaydediliyor...':<><Check style={{ width:'18px', height:'18px' }}/>Onayla</>}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {showEditModal && <EditMemberModal member={member} onClose={() => setShowEditModal(false)} onSave={m => { updateMember(m); setShowEditModal(false); }}/>}
        {showDeleteModal && <DeleteModal name={member.name} onClose={() => setShowDeleteModal(false)} onConfirm={() => { deleteMember(member.id); navigate('/app/members'); }}/>}
      </div>
      <style>{`
        @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </PageWrapper>
  );
};

// ── Router ───────────────────────────────────────────────────
const W = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width:'100%', height:'100%', background:'#080808', display:'flex', flexDirection:'column', overflow:'hidden' }}>{children}</div>
);

const router = createBrowserRouter([
  { path:'/',      element:<W><Login/></W> },
  { path:'/login', element:<W><Login/></W> },
  { path:'/app',   element:<W><Layout/></W>, children:[
    { path:'home',        element:<DashboardScreen/> },
    { path:'members',     element:<MembersScreen/> },
    { path:'members/:id', element:<MemberDetailScreen/> },
  ]},
]);

export default function App() { return <RouterProvider router={router}/>; }
