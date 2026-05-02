import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation, useParams, Link } from 'react-router';
import { Bell, Home, Users, ChevronLeft, Phone, Mail, Search, Plus, X, Check, Clock, BarChart2, Filter, ArrowUpRight, CreditCard, Calendar, UserPlus, Dumbbell, CheckCircle2, Zap, MessageCircle, Edit3, Send, Save, Pencil, Trash2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Login } from './Login';
import { mockMembers as initialMembers, revenueData } from './data';
import type { Member } from './data';

const A = '#D97706'; const AL = '#F59E0B'; const AG = 'rgba(217,119,6,0.25)';

const GLOBAL_CSS = `
  @keyframes slideUp   { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes dangerPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); border-color: rgba(239,68,68,0.25); }
    50%     { box-shadow: 0 0 0 4px rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.5); }
  }
  @keyframes warnPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); border-color: rgba(251,191,36,0.2); }
    50%     { box-shadow: 0 0 0 4px rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.45); }
  }
  @keyframes chartDraw { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
  @keyframes dotPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.5} }
  @keyframes fabIn     { from{transform:scale(0) rotate(-90deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes navSlide  { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes countUp   { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

  .member-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .member-card:active { transform: scale(0.97); box-shadow: 0 2px 8px rgba(0,0,0,0.5); }
  .member-card:hover  { transform: translateY(-1px); }

  .tab-btn { transition: all 0.2s ease; }
  .tab-btn:active { transform: scale(0.95); }

  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.3); }
  input::placeholder { color: rgba(255,255,255,0.2); }
  select option { background: #111; }
  * { -webkit-tap-highlight-color: transparent; }
`;

const DEFAULT_TEMPLATES = {
  expiring: 'Merhaba {isim}, paketinizin süresi {gun} gün içinde dolmaktadır. Üyeliğinizi yenilemek için bizimle iletişime geçebilirsiniz. 🏋️',
  expired:  'Merhaba {isim}, paketinizin süresi dolmuştur. Sizi yeniden aramızda görmek isteriz! 💪',
};

const calcDays = (endDate: string): number => {
  if (!endDate || endDate.trim() === '' || endDate === '-') return 999;
  let day=0,month=0,year=0;
  if (endDate.includes('.')) { const p=endDate.split('.'); if(p.length!==3) return 999; day=parseInt(p[0]);month=parseInt(p[1]);year=parseInt(p[2]); }
  else if (endDate.includes('-')) { const p=endDate.split('-'); if(p.length!==3) return 999; year=parseInt(p[0]);month=parseInt(p[1]);day=parseInt(p[2]); }
  else return 999;
  if (!day||!month||!year||year<2000) return 999;
  const d=new Date(year,month-1,day); const today=new Date(); today.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d.getTime()-today.getTime())/86400000);
};

const getMember = (m: Member): Member => ({ ...m, daysRemaining: calcDays(m.endDate) });
const initStore = (): Member[] => initialMembers.map(getMember);

const getStatus = (d: number): 'expired'|'warning'|'active' => d < 0 ? 'expired' : d <= 7 ? 'warning' : 'active';

const getStatusLabel = (d: number) => d < 0
  ? `${Math.abs(d)} gün önce`
  : d === 999 ? 'Tarih yok'
  : d === 0 ? 'Bugün bitiyor'
  : `${d} gün kaldı`;

const getStatusBadgeLabel = (d: number) => d < 0 ? 'SÜRESİ DOLDU' : d <= 7 ? `${d} GÜN KALDI` : `${d} GÜN KALDI`;

// Avatar initials
const getInitials = (name: string) => name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();

const avatarBg = (status: 'expired'|'warning'|'active') =>
  status==='expired' ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' :
  status==='warning' ? 'linear-gradient(135deg,#78350f,#92400e)' :
                       'linear-gradient(135deg,#1a3a2a,#14532d)';

const statusBadgeStyle = (status: 'expired'|'warning'|'active'): React.CSSProperties =>
  status==='expired' ? { color:'#fca5a5', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.2)' } :
  status==='warning' ? { color:'#fcd34d', background:'rgba(251,191,36,0.1)',  border:'1px solid rgba(251,191,36,0.18)' } :
                       { color:'#86efac', background:'rgba(34,197,94,0.1)',   border:'1px solid rgba(34,197,94,0.15)' };

const cardPulseStyle = (status: 'expired'|'warning'|'active'): React.CSSProperties =>
  status==='expired' ? { animation:'dangerPulse 2.2s ease-in-out infinite', border:'1px solid rgba(239,68,68,0.25)' } :
  status==='warning' ? { animation:'warnPulse 2.5s ease-in-out infinite',   border:'1px solid rgba(251,191,36,0.2)'  } :
                       { border:'1px solid rgba(255,255,255,0.06)' };

const dotStyle = (status: 'expired'|'warning'|'active'): React.CSSProperties =>
  status==='expired' ? { background:'#ef4444', animation:'dotPulse 2s ease-in-out infinite' } :
  status==='warning' ? { background:'#fbbf24', animation:'dotPulse 2.5s ease-in-out infinite' } :
                       { background:'#22c55e' };

const getWhatsAppHref = (phone: string, msg: string) => {
  const c=phone.replace(/\D/g,'');
  const intl=c.startsWith('90')?c:c.startsWith('0')?'90'+c.slice(1):'90'+c;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
};
const buildMsg = (tpl: string, m: Member) =>
  tpl.replace(/{isim}/g,m.name.split(' ')[0]).replace(/{gun}/g,String(Math.max(0,m.daysRemaining)));

// ── Store ────────────────────────────────────────────────────
type StoreCtx = { members:Member[]; addMember:(m:Member)=>void; updateMember:(m:Member)=>void; deleteMember:(id:string)=>void; };
const StoreContext = createContext<StoreCtx>({ members:[],addMember:()=>{},updateMember:()=>{},deleteMember:()=>{} });
const useStore = () => useContext(StoreContext);

// ── Skeleton loader ──────────────────────────────────────────
const Skeleton = ({ w='100%', h=14, r=8, mb=0 }: { w?:string|number; h?:number; r?:number; mb?:number }) => (
  <div style={{ width:w,height:h,borderRadius:r,background:'rgba(255,255,255,0.06)',marginBottom:mb,overflow:'hidden',position:'relative',flexShrink:0 }}>
    <div style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)',animation:'shimmer 1.6s infinite' }}/>
  </div>
);

const MemberCardSkeleton = () => (
  <div style={{ display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',borderRadius:'18px',background:'#111',border:'1px solid rgba(255,255,255,0.06)' }}>
    <Skeleton w={44} h={44} r={12}/>
    <div style={{ flex:1 }}>
      <Skeleton w="60%" h={13} mb={6}/>
      <Skeleton w="40%" h={10}/>
    </div>
    <Skeleton w={70} h={20} r={10}/>
  </div>
);

// ── Avatar ───────────────────────────────────────────────────
const Avatar = ({ name, size=44, status }: { name:string; size?:number; status:'expired'|'warning'|'active' }) => (
  <div style={{ width:size,height:size,borderRadius:size*0.27,background:avatarBg(status),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative' }}>
    <span style={{ fontSize:size*0.33,fontWeight:900,color:'rgba(255,255,255,0.85)',letterSpacing:'-0.02em',lineHeight:1 }}>{getInitials(name)}</span>
    <div style={{ position:'absolute',bottom:-2,right:-2,width:size*0.27,height:size*0.27,borderRadius:'50%',border:`2px solid #0a0a0a`,...dotStyle(status) }}/>
  </div>
);

// ── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ days }: { days:number }) => {
  const status = getStatus(days);
  return (
    <span style={{ fontSize:10,fontWeight:800,padding:'3px 8px',borderRadius:999,letterSpacing:'0.06em',...statusBadgeStyle(status) }}>
      {getStatusBadgeLabel(days)}
    </span>
  );
};

// ── Member Card (liste) ──────────────────────────────────────
const MemberCard = ({ m, onClick, delay=0 }: { m:Member; onClick:()=>void; delay?:number }) => {
  const status = getStatus(m.daysRemaining);
  const needsPulse = status !== 'active';
  return (
    <button
      className="member-card"
      onClick={onClick}
      style={{ display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',borderRadius:'18px',background:'#111',cursor:'pointer',textAlign:'left',width:'100%',
        opacity:0,animation:`fadeUp 0.35s ease ${delay}s forwards`,
        ...(needsPulse ? cardPulseStyle(status) : { border:'1px solid rgba(255,255,255,0.06)' })
      }}
    >
      <Avatar name={m.name} size={44} status={status}/>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:14,fontWeight:700,color:'rgba(255,255,255,0.9)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2 }}>{m.name}</p>
        <p style={{ fontSize:11,color:'rgba(255,255,255,0.3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.package}</p>
      </div>
      <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0 }}>
        <StatusBadge days={m.daysRemaining}/>
        {m.endDate && <span style={{ fontSize:10,color:'rgba(255,255,255,0.2)',fontWeight:500 }}>Bitiş: {m.endDate}</span>}
      </div>
    </button>
  );
};

// ── Hero Chart (animasyonlu) ─────────────────────────────────
const HeroChart = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let p=0;
      const iv = setInterval(() => { p+=2; setProgress(Math.min(p,100)); if(p>=100) clearInterval(iv); },16);
      return () => clearInterval(iv);
    },300);
    return () => clearTimeout(t);
  },[]);

  const visibleData = revenueData.map((d,i) => ({
    ...d, value: i < Math.floor(progress/100*revenueData.length) ? d.value : undefined
  }));

  return (
    <div style={{ height:72,marginLeft:-4,marginRight:-4,marginBottom:-4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={visibleData} margin={{ top:4,right:0,left:0,bottom:0 }}>
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={A} stopOpacity={0.35}/>
              <stop offset="100%" stopColor={A} stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <Area type="monotone" dataKey="value" stroke={AL} strokeWidth={2} fillOpacity={1} fill="url(#heroGrad)" isAnimationActive={false} dot={false} filter="url(#glow)"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── PaymentBadge ─────────────────────────────────────────────
const PaymentBadge = ({ status }: { status:'paid'|'partial'|'unpaid' }) => {
  const cfg = {
    paid:    { color:'rgba(255,255,255,0.5)',  label:'Ödeme Tamamlandı' },
    partial: { color:'rgba(255,255,255,0.35)', label:'Kısmi Ödeme' },
    unpaid:  { color:'rgba(255,255,255,0.25)', label:'Ödeme Bekleniyor' },
  }[status];
  return <span style={{ fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:999,color:cfg.color,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)' }}>{cfg.label}</span>;
};

// ── Delete Modal ─────────────────────────────────────────────
const DeleteModal = ({ name,onClose,onConfirm }: { name:string;onClose:()=>void;onConfirm:()=>void }) => {
  const [busy,setBusy]=useState(false);
  return (
    <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(12px)',zIndex:70,display:'flex',alignItems:'flex-end' }}>
      <div style={{ width:'100%',background:'#111',borderRadius:'28px 28px 0 0',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'28px 24px 48px',display:'flex',flexDirection:'column',gap:20,animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:14,textAlign:'center' }}>
          <div style={{ width:52,height:52,borderRadius:'50%',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Trash2 style={{ width:20,height:20,color:'#f87171' }}/>
          </div>
          <div>
            <p style={{ fontSize:16,fontWeight:800,color:'white',marginBottom:8 }}>Üyeyi Sil</p>
            <p style={{ fontSize:13,color:'rgba(255,255,255,0.35)',lineHeight:1.6 }}>
              <span style={{ color:'rgba(255,255,255,0.7)',fontWeight:600 }}>{name}</span> kalıcı olarak silinecek.
            </p>
          </div>
        </div>
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={onClose} style={{ flex:1,padding:14,borderRadius:15,fontWeight:700,fontSize:14,border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.45)' }}>Vazgeç</button>
          <button onClick={()=>{setBusy(true);setTimeout(onConfirm,500);}} disabled={busy} style={{ flex:1,padding:14,borderRadius:15,fontWeight:800,fontSize:14,border:'none',cursor:'pointer',background:'rgba(239,68,68,0.15)',color:'#fca5a5',opacity:busy?0.6:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
            <Trash2 style={{ width:14,height:14 }}/>{busy?'Siliniyor...':'Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── WhatsApp Panel ───────────────────────────────────────────
const NotificationPanel = ({ onClose }: { onClose:()=>void }) => {
  const { members } = useStore();
  const urgents = members.filter(m=>m.daysRemaining<=7);
  const [templates,setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editMode,setEditMode]   = useState<'expiring'|'expired'|null>(null);
  const [draft,setDraft]         = useState('');
  const [sent,setSent]           = useState<string[]>([]);

  return (
    <div style={{ position:'absolute',inset:0,zIndex:60,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
      <div style={{ background:'#111',borderRadius:'28px 28px 0 0',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'20px 20px 36px',display:'flex',flexDirection:'column',gap:14,maxHeight:'82%',overflow:'hidden',animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <MessageCircle style={{ width:15,height:15,color:'rgba(255,255,255,0.4)' }}/>
            <span style={{ fontSize:15,fontWeight:800,color:'white' }}>WhatsApp Bildirimler</span>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.05)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X style={{ width:14,height:14,color:'rgba(255,255,255,0.4)' }}/>
          </button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.12em',textTransform:'uppercase' }}>Şablonlar</p>
          {(['expiring','expired'] as const).map(type=>(
            <div key={type} style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:12 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.45)' }}>{type==='expiring'?'⚠️ Az kalan':'⊘ Süresi dolan'}</span>
                {editMode===type
                  ?<button onClick={()=>{setTemplates(t=>({...t,[type]:draft}));setEditMode(null);}} style={{ fontSize:11,fontWeight:700,color:AL,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}><Save style={{ width:12,height:12 }}/>Kaydet</button>
                  :<button onClick={()=>{setDraft(templates[type]);setEditMode(type);}} style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.25)',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}><Edit3 style={{ width:12,height:12 }}/>Düzenle</button>}
              </div>
              {editMode===type
                ?<textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={3} style={{ width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:8,color:'white',fontSize:12,resize:'none',outline:'none',boxSizing:'border-box',lineHeight:1.5 }}/>
                :<p style={{ fontSize:12,color:'rgba(255,255,255,0.35)',lineHeight:1.5 }}>{templates[type]}</p>}
            </div>
          ))}
        </div>
        <div style={{ flex:1,overflowY:'auto' }}>
          <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:8 }}>Gönder ({urgents.length})</p>
          {urgents.length===0
            ?<div style={{ textAlign:'center',padding:24,color:'rgba(255,255,255,0.2)' }}><p style={{ fontSize:13 }}>Tüm üyeler aktif 🎉</p></div>
            :<div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {urgents.map(m=>{
                
                const tpl=m.daysRemaining<0?templates.expired:templates.expiring;
                const href=getWhatsAppHref(m.phone,buildMsg(tpl,m));
                const isSent=sent.includes(m.id);
                return (
                  <div key={m.id} style={{ display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:'10px 12px' }}>
                    <Avatar name={m.name} size={36} status={getStatus(m.daysRemaining)}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.85)',marginBottom:2 }}>{m.name}</p>
                      <p style={{ fontSize:11,color:'rgba(255,255,255,0.3)' }}>{getStatusLabel(m.daysRemaining)}</p>
                    </div>
                    <a href={href} target="_blank" rel="noreferrer" onClick={()=>setSent(s=>[...s,m.id])} style={{ display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:10,fontSize:12,fontWeight:700,flexShrink:0,background:isSent?'rgba(255,255,255,0.05)':'rgba(37,211,102,0.1)',color:isSent?'rgba(255,255,255,0.3)':'#25D366',textDecoration:'none' }}>
                      {isSent?<><Check style={{ width:13,height:13 }}/>Gönderildi</>:<><Send style={{ width:13,height:13 }}/>Gönder</>}
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

// ── Input stili ──────────────────────────────────────────────
const inp: React.CSSProperties = { width:'100%',padding:'13px 14px',borderRadius:13,fontSize:14,color:'white',outline:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',boxSizing:'border-box' };

// ── Edit Member Modal ────────────────────────────────────────
const EditMemberModal = ({ member,onClose,onSave }: { member:Member;onClose:()=>void;onSave:(m:Member)=>void }) => {
  const packages=['Aylık Sınırsız','10 Derslik Paket','5 Derslik Paket','20 Derslik Paket','Yıllık Üyelik'];
  const toInput=(s:string)=>{ if(!s||s==='-') return ''; if(s.includes('-')) return s; const p=s.split('.'); if(p.length!==3) return ''; return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`; };
  const toDisplay=(s:string)=>{ if(!s) return ''; if(s.includes('.')) return s; const p=s.split('-'); if(p.length!==3) return ''; return `${p[2]}.${p[1]}.${p[0]}`; };
  const [form,setForm]=useState({ name:member.name,phone:member.phone,email:member.email||'',package:member.package,totalAmount:String(member.totalAmount),startDate:toInput(member.startDate),endDate:toInput(member.endDate) });
  const [saving,setSaving]=useState(false);
  const handleSave=()=>{ setSaving(true); setTimeout(()=>{ const endDisp=toDisplay(form.endDate); onSave({...member,name:form.name.trim()||member.name,phone:form.phone.trim()||member.phone,email:form.email.trim(),package:form.package,totalAmount:parseInt(form.totalAmount)||member.totalAmount,startDate:toDisplay(form.startDate)||member.startDate,endDate:endDisp,daysRemaining:calcDays(endDisp)}); setSaving(false); onClose(); },400); };
  return (
    <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(10px)',zIndex:50,display:'flex',alignItems:'flex-end' }}>
      <div style={{ width:'100%',background:'#111',borderRadius:'28px 28px 0 0',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'24px 24px 44px',display:'flex',flexDirection:'column',gap:10,animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
          <span style={{ fontSize:16,fontWeight:800,color:'white' }}>Üyeyi Düzenle</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.05)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X style={{ width:14,height:14,color:'rgba(255,255,255,0.4)' }}/></button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:8,maxHeight:'65vh',overflowY:'auto' }}>
          <input style={inp} placeholder="Ad Soyad" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input style={inp} placeholder="Telefon" value={form.phone} type="tel" onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
          <input style={inp} placeholder="E-posta" value={form.email} type="email" onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <select style={{ ...inp,appearance:'none' } as React.CSSProperties} value={form.package} onChange={e=>setForm(f=>({...f,package:e.target.value}))}>
            {packages.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <input style={inp} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e=>setForm(f=>({...f,totalAmount:e.target.value}))}/>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            <div><label style={{ fontSize:10,color:'rgba(255,255,255,0.25)',fontWeight:700,display:'block',marginBottom:4 }}>Başlangıç</label><input style={inp} type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/></div>
            <div><label style={{ fontSize:10,color:'rgba(255,255,255,0.25)',fontWeight:700,display:'block',marginBottom:4 }}>Bitiş</label><input style={inp} type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}/></div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ width:'100%',padding:15,borderRadius:15,fontWeight:800,fontSize:14,border:'none',cursor:'pointer',background:`linear-gradient(135deg,#B45309,${A} 50%,${AL})`,color:'#080808',boxShadow:`0 6px 20px ${AG}`,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:saving?0.7:1,marginTop:4 }}>
          {saving?'Kaydediliyor...':<><Check style={{ width:16,height:16 }}/>Kaydet</>}
        </button>
      </div>
    </div>
  );
};

// ── Add Member Modal ─────────────────────────────────────────
const AddMemberModal = ({ onClose,onAdd }: { onClose:()=>void;onAdd:(m:Member)=>void }) => {
  const packages=['Aylık Sınırsız','10 Derslik Paket','5 Derslik Paket','20 Derslik Paket','Yıllık Üyelik'];
  const toDisp=(s:string)=>{ if(!s) return ''; const p=s.split('-'); if(p.length!==3) return ''; return `${p[2]}.${p[1]}.${p[0]}`; };
  const [form,setForm]=useState({ name:'',phone:'',email:'',package:'',totalAmount:'',startDate:'',endDate:'' });
  const [saving,setSaving]=useState(false);
  const canSubmit=form.name&&form.phone&&form.package;
  const handleSubmit=()=>{ if(!canSubmit) return; setSaving(true); setTimeout(()=>{ const endDisp=toDisp(form.endDate); const days=calcDays(endDisp); onAdd({ id:Date.now().toString(),name:form.name,phone:form.phone,email:form.email,img:'',package:form.package,daysRemaining:days,paymentStatus:'unpaid',totalAmount:parseInt(form.totalAmount)||0,paidAmount:0,startDate:toDisp(form.startDate)||new Date().toLocaleDateString('tr-TR'),endDate:endDisp,isActive:days>=0,pastPayments:[] }); onClose(); },500); };
  return (
    <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(10px)',zIndex:50,display:'flex',alignItems:'flex-end' }}>
      <div style={{ width:'100%',background:'#111',borderRadius:'28px 28px 0 0',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'24px 24px 44px',display:'flex',flexDirection:'column',gap:10,animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
          <span style={{ fontSize:16,fontWeight:800,color:'white' }}>Yeni Üye</span>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.05)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X style={{ width:14,height:14,color:'rgba(255,255,255,0.4)' }}/></button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:8,maxHeight:'65vh',overflowY:'auto' }}>
          <input style={inp} placeholder="Ad Soyad *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input style={inp} placeholder="Telefon *" value={form.phone} type="tel" onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
          <input style={inp} placeholder="E-posta" value={form.email} type="email" onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <select style={{ ...inp,appearance:'none' } as React.CSSProperties} value={form.package} onChange={e=>setForm(f=>({...f,package:e.target.value}))}>
            <option value="" disabled>Paket Seçin *</option>
            {packages.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <input style={inp} placeholder="Toplam Tutar (₺)" value={form.totalAmount} type="number" onChange={e=>setForm(f=>({...f,totalAmount:e.target.value}))}/>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            <div><label style={{ fontSize:10,color:'rgba(255,255,255,0.25)',fontWeight:700,display:'block',marginBottom:4 }}>Başlangıç</label><input style={inp} type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/></div>
            <div><label style={{ fontSize:10,color:'rgba(255,255,255,0.25)',fontWeight:700,display:'block',marginBottom:4 }}>Bitiş</label><input style={inp} type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}/></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving||!canSubmit} style={{ width:'100%',padding:15,borderRadius:15,fontWeight:800,fontSize:14,border:'none',cursor:'pointer',background:`linear-gradient(135deg,#B45309,${A} 50%,${AL})`,color:'#080808',boxShadow:`0 6px 20px ${AG}`,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:saving||!canSubmit?0.35:1,marginTop:4 }}>
          {saving?'Kaydediliyor...':<><UserPlus style={{ width:16,height:16 }}/>Üye Ekle</>}
        </button>
      </div>
    </div>
  );
};

// ── Header ───────────────────────────────────────────────────
const Header = ({ onAddMember,onBell,urgentCount }: { onAddMember?:()=>void;onBell:()=>void;urgentCount:number }) => {
  const location=useLocation(); const navigate=useNavigate();
  const isDetail=location.pathname.includes('/members/');
  const isMembers=location.pathname==='/app/members';
  const hdr: React.CSSProperties={ padding:'52px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10,background:'rgba(10,10,10,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.04)',flexShrink:0 };

  if (isDetail) return (
    <header style={hdr}>
      <button onClick={()=>navigate(-1)} style={{ display:'flex',alignItems:'center',gap:6,color:'rgba(255,255,255,0.4)',background:'none',border:'none',cursor:'pointer',padding:'8px 0' }}>
        <ChevronLeft style={{ width:16,height:16 }}/><span style={{ fontSize:13,fontWeight:600 }}>Geri</span>
      </button>
      <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.18)',letterSpacing:'0.14em',textTransform:'uppercase' }}>Üye Detayı</span>
      <div style={{ width:56 }}/>
    </header>
  );

  return (
    <header style={hdr}>
      <img src="/trax-logo-amber.png" alt="TRAX" style={{ height:22,width:'auto',filter:'drop-shadow(0 0 8px rgba(217,119,6,0.55)) drop-shadow(0 0 20px rgba(217,119,6,0.2))' }}/>
      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
        {/* FAB — üyeler sayfasında */}
        {isMembers && onAddMember && (
          <button onClick={onAddMember} className="tab-btn" style={{ width:34,height:34,borderRadius:'50%',border:'none',cursor:'pointer',background:`linear-gradient(135deg,${A},${AL})`,boxShadow:`0 4px 16px ${AG}`,display:'flex',alignItems:'center',justifyContent:'center',animation:'fabIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <Plus style={{ width:16,height:16,color:'#080808' }}/>
          </button>
        )}
        <button onClick={onBell} style={{ position:'relative',width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Bell style={{ width:15,height:15,color:urgentCount>0?AL:'rgba(255,255,255,0.35)' }} strokeWidth={1.5}/>
          {urgentCount>0&&<span style={{ position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:AL,border:'1.5px solid #0a0a0a' }}/>}
        </button>
      </div>
    </header>
  );
};

// ── Bottom Nav ───────────────────────────────────────────────
const BottomNav = () => {
  const location=useLocation();
  const tabs=[{ path:'/app/home',icon:Home,label:'Anasayfa' },{ path:'/app/members',icon:Users,label:'Üyeler' }];
  return (
    <div style={{ flexShrink:0,height:88,background:'linear-gradient(to top,#0a0a0a 60%,transparent)',display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:20,zIndex:20,animation:'navSlide 0.5s ease 0.1s both' }}>
      <div style={{ background:'rgba(20,20,20,0.95)',backdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:999,height:58,display:'flex',alignItems:'center',justifyContent:'center',gap:0,padding:'0 8px',boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
        {tabs.map(({ path,icon:Icon,label })=>{
          const active=location.pathname===path;
          return (
            <Link key={path} to={path} className="tab-btn" style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,width:80,height:46,textDecoration:'none',borderRadius:999,background:active?'rgba(217,119,6,0.12)':'transparent',transition:'background 0.2s' }}>
              <Icon style={{ width:20,height:20,color:active?AL:'rgba(255,255,255,0.28)',transition:'all 0.2s' }} strokeWidth={active?2.5:1.5}/>
              <span style={{ fontSize:9,fontWeight:700,color:active?AL:'rgba(255,255,255,0.2)',transition:'color 0.2s',letterSpacing:'0.04em' }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ── Layout ───────────────────────────────────────────────────
const Layout = () => {
  const location=useLocation();
  const [members,setMembers]=useState<Member[]>(initStore);
  const [showAdd,setShowAdd]=useState(false);
  const [showBell,setShowBell]=useState(false);
  const hideNav=location.pathname.includes('/members/');
  const urgentCount=members.filter(m=>m.daysRemaining<=7).length;

  const addMember    = (m:Member) => setMembers(prev=>[m,...prev]);
  const updateMember = (u:Member) => setMembers(prev=>prev.map(m=>m.id===u.id?u:m));
  const deleteMember = (id:string) => setMembers(prev=>prev.filter(m=>m.id!==id));

  return (
    <StoreContext.Provider value={{ members,addMember,updateMember,deleteMember }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ width:'100%',height:'100%',background:'#0a0a0a',display:'flex',flexDirection:'column',overflow:'hidden' }}>
        <Header onAddMember={()=>setShowAdd(true)} onBell={()=>setShowBell(true)} urgentCount={urgentCount}/>
        <main style={{ flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch' as any,overscrollBehavior:'contain' }}>
          <Outlet/>
        </main>
        {!hideNav&&<BottomNav/>}
        {showAdd&&<AddMemberModal onClose={()=>setShowAdd(false)} onAdd={m=>{addMember(m);setShowAdd(false);}}/>}
        {showBell&&<NotificationPanel onClose={()=>setShowBell(false)}/>}
      </div>
    </StoreContext.Provider>
  );
};

// ── Dashboard ────────────────────────────────────────────────
const DashboardScreen = () => {
  const navigate=useNavigate();
  const { members }=useStore();
  

  const red    = members.filter(m=>m.daysRemaining<0).length;
  const yellow = members.filter(m=>m.daysRemaining>=0&&m.daysRemaining<=7).length;
  const green  = members.filter(m=>m.daysRemaining>7&&m.daysRemaining<999).length;
  const pending = members.reduce((s,m)=>s+(m.totalAmount-m.paidAmount),0);
  const thisWeek = members.filter(m=>m.daysRemaining>=0&&m.daysRemaining<=7).sort((a,b)=>a.daysRemaining-b.daysRemaining);
  const expired  = members.filter(m=>m.daysRemaining<0);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10,padding:'12px 16px 8px' }}>

      {/* Hero Chart */}
      <div style={{ background:'#111',borderRadius:24,border:'1px solid rgba(255,255,255,0.06)',padding:'18px 18px 0',position:'relative',overflow:'hidden',opacity:0,animation:'fadeUp 0.4s ease 0.05s forwards' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at top left,rgba(217,119,6,0.08) 0%,transparent 55%)',pointerEvents:'none' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:6 }}>
              <BarChart2 style={{ width:12,height:12,color:'rgba(255,255,255,0.25)' }}/>
              <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',textTransform:'uppercase' }}>SON 7 GÜN GELİR</span>
            </div>
            <div style={{ fontSize:30,fontWeight:900,color:'white',letterSpacing:'-0.03em',lineHeight:1 }}>₺32.450</div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:999,background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.15)' }}>
            <ArrowUpRight style={{ width:11,height:11,color:'#4ade80' }}/>
            <span style={{ fontSize:11,color:'#4ade80',fontWeight:700 }}>%14</span>
            <span style={{ fontSize:10,color:'rgba(52,211,153,0.5)',fontWeight:600 }}>Geçen haftaya göre</span>
          </div>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
          <span style={{ fontSize:9,color:'rgba(255,255,255,0.15)',fontWeight:500 }}>7 Gün Önce</span>
          <span style={{ fontSize:9,color:'rgba(255,255,255,0.15)',fontWeight:500 }}>Bugün</span>
        </div>
        <HeroChart/>
      </div>

      {/* 3 stat */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8 }}>
        {[
          { label:'Süresi Doldu', count:red,    icon:'🕐' },
          { label:'Bu Hafta',     count:yellow,  icon:'⏳' },
          { label:'Aktif',        count:green,   icon:'✓' },
        ].map(({ label,count,icon },i)=>(
          <div key={label} style={{ background:'#111',border:'1px solid rgba(255,255,255,0.06)',borderRadius:18,padding:'14px 12px',display:'flex',flexDirection:'column',gap:10,opacity:0,animation:`fadeUp 0.35s ease ${0.1+i*0.06}s forwards` }}>
            <span style={{ fontSize:16 }}>{icon}</span>
            <span style={{ fontSize:26,fontWeight:900,color:'white',lineHeight:1,animation:'countUp 0.4s ease both' }}>{count}</span>
            <span style={{ fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.25)',lineHeight:1.3 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Bekleyen tahsilat */}
      {pending>0&&(
        <div style={{ borderRadius:18,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,background:'rgba(217,119,6,0.04)',border:'1px solid rgba(217,119,6,0.1)',opacity:0,animation:'fadeUp 0.35s ease 0.28s forwards' }}>
          <div style={{ width:36,height:36,borderRadius:12,background:'rgba(217,119,6,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <CreditCard style={{ width:15,height:15,color:AL }}/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10,fontWeight:700,color:'rgba(245,158,11,0.5)',letterSpacing:'0.1em',textTransform:'uppercase' }}>BEKlEYEN TAHSİLAT</p>
            <p style={{ fontSize:18,fontWeight:900,color:'white' }}>₺{pending.toLocaleString('tr-TR')}</p>
          </div>
          <Link to="/app/members" style={{ fontSize:12,fontWeight:700,padding:'7px 14px',borderRadius:999,textDecoration:'none',color:AL,background:'rgba(217,119,6,0.1)',border:'1px solid rgba(217,119,6,0.15)' }}>Görüntüle →</Link>
        </div>
      )}

      {/* Bu hafta bitenler */}
      {thisWeek.length>0&&(
        <div style={{ background:'#111',borderRadius:20,border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',opacity:0,animation:'fadeUp 0.35s ease 0.32s forwards' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 16px 10px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Clock style={{ width:13,height:13,color:'rgba(255,255,255,0.25)' }}/>
              <span style={{ fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.75)' }}>BU HAFTA BİTENLER</span>
            </div>
            <Link to="/app/members?filter=yellow" style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.25)',textDecoration:'none' }}>Tümü →</Link>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:6,padding:'0 12px 14px' }}>
            {thisWeek.map((m,i)=>(
              <button key={m.id} onClick={()=>navigate(`/app/members/${m.id}`)} className="member-card" style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:14,background:'rgba(255,255,255,0.025)',cursor:'pointer',textAlign:'left',width:'100%',animation:`warnPulse 2.5s ease-in-out ${i*0.3}s infinite`,border:'1px solid rgba(251,191,36,0.2)' }}>
                <Avatar name={m.name} size={36} status="warning"/>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.name}</p>
                  <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)' }}>{m.package}</p>
                </div>
                <div style={{ textAlign:'right',flexShrink:0 }}>
                  <span style={{ fontSize:20,fontWeight:900,color:'#fcd34d',lineHeight:1,display:'block' }}>{m.daysRemaining}</span>
                  <span style={{ fontSize:9,color:'rgba(251,191,36,0.5)',fontWeight:700,letterSpacing:'0.06em' }}>GÜN</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Süresi dolanlar */}
      {expired.length>0&&(
        <div style={{ background:'#111',borderRadius:20,border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',opacity:0,animation:'fadeUp 0.35s ease 0.38s forwards' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 16px 10px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Zap style={{ width:13,height:13,color:'rgba(255,255,255,0.25)' }}/>
              <span style={{ fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.75)' }}>SÜRESİ DOLANLAR</span>
            </div>
            <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.04)',padding:'2px 8px',borderRadius:999 }}>{expired.length}</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:6,padding:'0 12px 14px' }}>
            {expired.map((m,i)=>(
              <button key={m.id} onClick={()=>navigate(`/app/members/${m.id}`)} className="member-card" style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:14,background:'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'left',width:'100%',animation:`dangerPulse 2.2s ease-in-out ${i*0.3}s infinite`,border:'1px solid rgba(239,68,68,0.25)' }}>
                <Avatar name={m.name} size={36} status="expired"/>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.name}</p>
                  <p style={{ fontSize:11,color:'rgba(255,255,255,0.2)' }}>{m.package}</p>
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2,flexShrink:0 }}>
                  <span style={{ fontSize:10,fontWeight:800,color:'#fca5a5',letterSpacing:'0.06em' }}>DOLU</span>
                  <span style={{ fontSize:10,color:'rgba(239,68,68,0.5)',fontWeight:600 }}>{getStatusLabel(m.daysRemaining)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hepsi aktifse son üyeler */}
      {thisWeek.length===0&&expired.length===0&&(
        <div style={{ background:'#111',borderRadius:20,border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 16px 10px' }}>
            <span style={{ fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.7)' }}>Üyeler</span>
            <Link to="/app/members" style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.3)',textDecoration:'none' }}>Tümü →</Link>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:6,padding:'0 12px 12px' }}>
            {members.slice(0,4).map((m,i)=>(
              <MemberCard key={m.id} m={m} onClick={()=>navigate(`/app/members/${m.id}`)} delay={i*0.04}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Members Screen ───────────────────────────────────────────
type F='all'|'red'|'yellow'|'green';
const MembersScreen = () => {
  const navigate=useNavigate();
  const { members }=useStore();
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState<F>('all');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ const t=setTimeout(()=>setLoading(false),600); return ()=>clearTimeout(t); },[]);

  const filters: { key:F;label:string }[]=[
    { key:'all',label:'Tümü' },{ key:'red',label:'Süresi Doldu' },{ key:'yellow',label:'Bu Hafta' },{ key:'green',label:'Aktif' },
  ];

  const filtered=useMemo(()=>{
    let l=members;
    if(search.trim()) l=l.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.phone.includes(search));
    if(filter==='red')    l=l.filter(m=>m.daysRemaining<0);
    if(filter==='yellow') l=l.filter(m=>m.daysRemaining>=0&&m.daysRemaining<=7);
    if(filter==='green')  l=l.filter(m=>m.daysRemaining>7&&m.daysRemaining<999);
    return l;
  },[members,search,filter]);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10,padding:'12px 16px' }}>
      {/* Arama */}
      <div style={{ position:'relative',opacity:0,animation:'fadeUp 0.3s ease 0.05s forwards' }}>
        <Search style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:14,height:14,color:'rgba(255,255,255,0.2)' }}/>
        <input type="text" placeholder="İsim veya telefon ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%',paddingLeft:40,paddingRight:search?36:16,paddingTop:13,paddingBottom:13,borderRadius:14,fontSize:14,color:'white',outline:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',boxSizing:'border-box' }}/>
        {search&&<button onClick={()=>setSearch('')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:20,height:20,borderRadius:'50%',background:'rgba(255,255,255,0.07)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X style={{ width:12,height:12,color:'rgba(255,255,255,0.4)' }}/></button>}
      </div>

      {/* Filtreler */}
      <div style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:2,opacity:0,animation:'fadeUp 0.3s ease 0.1s forwards' }}>
        {filters.map(({ key,label })=>(
          <button key={key} onClick={()=>setFilter(key)} className="tab-btn" style={{ flexShrink:0,padding:'7px 16px',borderRadius:999,fontSize:11,fontWeight:700,border:'none',cursor:'pointer',background:filter===key?`linear-gradient(135deg,${A},${AL})`:'rgba(255,255,255,0.05)',color:filter===key?'#080808':'rgba(255,255,255,0.35)',boxShadow:filter===key?`0 4px 14px ${AG}`:'none' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:'flex',alignItems:'center',gap:6,paddingLeft:2 }}>
        <Filter style={{ width:11,height:11,color:'rgba(255,255,255,0.15)' }}/>
        <span style={{ fontSize:11,color:'rgba(255,255,255,0.15)',fontWeight:500 }}>{filtered.length} üye</span>
      </div>

      {/* Liste */}
      <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
        {loading
          ? [0,1,2,3].map(i=><div key={i} style={{ opacity:0,animation:`fadeUp 0.3s ease ${i*0.07}s forwards` }}><MemberCardSkeleton/></div>)
          : filtered.length===0
            ? <div style={{ textAlign:'center',padding:'48px 0',color:'rgba(255,255,255,0.15)' }}><Users style={{ width:28,height:28,margin:'0 auto 10px' }}/><p style={{ fontSize:13 }}>Üye bulunamadı</p></div>
            : filtered.map((m,i)=><MemberCard key={m.id} m={m} onClick={()=>navigate(`/app/members/${m.id}`)} delay={i*0.04}/>)
        }
      </div>
    </div>
  );
};

// ── Member Detail ────────────────────────────────────────────
const MemberDetailScreen = () => {
  const { id }=useParams();
  const navigate=useNavigate();
  const { members,updateMember,deleteMember }=useStore();
  const member=members.find(m=>m.id===id);
  const [showPayModal,setShowPayModal]       =useState(false);
  const [showEditModal,setShowEditModal]     =useState(false);
  const [showDeleteModal,setShowDeleteModal] =useState(false);
  const [payAmount,setPayAmount]             =useState('');
  const [saving,setSaving]                   =useState(false);
  const [paid,setPaid]                       =useState(false);

  if (!member) return <div style={{ color:'rgba(255,255,255,0.2)',textAlign:'center',padding:'64px 0',fontSize:14 }}>Üye bulunamadı.</div>;

  const remaining=member.totalAmount-member.paidAmount;
  const payPct=member.totalAmount>0?Math.round((member.paidAmount/member.totalAmount)*100):0;
  const status=getStatus(member.daysRemaining);

  const handlePayment=()=>{
    if(!payAmount||parseInt(payAmount)<=0) return;
    setSaving(true);
    setTimeout(()=>{ const amount=Math.min(parseInt(payAmount),remaining); updateMember({...member,paidAmount:member.paidAmount+amount,paymentStatus:member.paidAmount+amount>=member.totalAmount?'paid':'partial'}); setSaving(false); setPaid(true); setPayAmount(''); setTimeout(()=>{setPaid(false);setShowPayModal(false);},1500); },700);
  };

  const waTpl=member.daysRemaining<0?DEFAULT_TEMPLATES.expired:DEFAULT_TEMPLATES.expiring;
  const waHref=getWhatsAppHref(member.phone,buildMsg(waTpl,member));

  const card: React.CSSProperties={ background:'#111',borderRadius:20,border:'1px solid rgba(255,255,255,0.06)',padding:18,position:'relative',overflow:'hidden' };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10,padding:'12px 16px 16px' }}>

      {/* Profil */}
      <div style={{ ...card,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',opacity:0,animation:'fadeUp 0.35s ease 0.05s forwards' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at top,rgba(255,255,255,0.02) 0%,transparent 60%)',pointerEvents:'none' }}/>
        <button onClick={()=>setShowEditModal(true)} style={{ position:'absolute',top:14,right:14,display:'flex',alignItems:'center',gap:5,padding:'6px 10px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',color:'rgba(255,255,255,0.35)',fontSize:11,fontWeight:600 }}>
          <Pencil style={{ width:11,height:11 }}/>Düzenle
        </button>
        <div style={{ marginBottom:12,marginTop:8 }}>
          <Avatar name={member.name} size={72} status={status}/>
        </div>
        <h2 style={{ fontSize:20,fontWeight:900,color:'white',letterSpacing:'-0.02em',marginBottom:8 }}>{member.name}</h2>
        <div style={{ marginBottom:14 }}><PaymentBadge status={member.paymentStatus}/></div>
        <div style={{ display:'flex',gap:8,width:'100%' }}>
          <a href={`tel:${member.phone}`} style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:11,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,textDecoration:'none' }}>
            <Phone style={{ width:14,height:14 }}/>{member.phone}
          </a>
          {member.email&&<a href={`mailto:${member.email}`} style={{ width:42,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,color:'rgba(255,255,255,0.3)',textDecoration:'none' }}>
            <Mail style={{ width:14,height:14 }}/>
          </a>}
        </div>
      </div>

      {/* WhatsApp + Sil */}
      <div style={{ display:'flex',gap:8,opacity:0,animation:'fadeUp 0.35s ease 0.1s forwards' }}>
        <a href={waHref} target="_blank" rel="noreferrer" style={{ flex:1,padding:13,borderRadius:16,fontWeight:700,fontSize:13,border:'1px solid rgba(37,211,102,0.12)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'rgba(37,211,102,0.05)',color:'rgba(37,211,102,0.7)',textDecoration:'none' }}>
          <MessageCircle style={{ width:15,height:15 }}/>WhatsApp
        </a>
        <button onClick={()=>setShowDeleteModal(true)} style={{ width:48,flexShrink:0,borderRadius:16,border:'1px solid rgba(239,68,68,0.15)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(239,68,68,0.05)' }}>
          <Trash2 style={{ width:16,height:16,color:'#f87171' }}/>
        </button>
      </div>

      {/* Paket — durum geçişi */}
      <div style={{ ...card,...(status!=='active'?cardPulseStyle(status):{}),opacity:0,animation:`fadeUp 0.35s ease 0.15s forwards` }}>
        <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:12 }}>
          <Dumbbell style={{ width:13,height:13,color:'rgba(255,255,255,0.2)' }}/>
          <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.14em',textTransform:'uppercase' }}>Paket</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'rgba(255,255,255,0.03)',borderRadius:14,border:'1px solid rgba(255,255,255,0.05)',marginBottom:8 }}>
          <span style={{ fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.85)' }}>{member.package}</span>
          <StatusBadge days={member.daysRemaining}/>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:10,background:'rgba(255,255,255,0.03)',borderRadius:12,border:'1px solid rgba(255,255,255,0.05)' }}>
            <Calendar style={{ width:12,height:12,color:'rgba(255,255,255,0.15)',flexShrink:0 }}/>
            <div><p style={{ fontSize:10,color:'rgba(255,255,255,0.2)',fontWeight:500 }}>Başlangıç</p><p style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.75)' }}>{member.startDate||'-'}</p></div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:10,background:'rgba(255,255,255,0.03)',borderRadius:12,border:'1px solid rgba(255,255,255,0.05)' }}>
            <Clock style={{ width:12,height:12,color:'rgba(255,255,255,0.15)',flexShrink:0 }}/>
            <div><p style={{ fontSize:10,color:'rgba(255,255,255,0.2)',fontWeight:500 }}>Bitiş</p><p style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.75)' }}>{member.endDate||'-'}</p></div>
          </div>
        </div>
      </div>

      {/* Ödeme */}
      <div style={{ ...card,opacity:0,animation:'fadeUp 0.35s ease 0.2s forwards' }}>
        <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:12 }}>
          <CreditCard style={{ width:13,height:13,color:'rgba(255,255,255,0.2)' }}/>
          <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.14em',textTransform:'uppercase' }}>Ödeme</span>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
          <div style={{ padding:12,background:'rgba(255,255,255,0.03)',borderRadius:14,border:'1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize:10,color:'rgba(255,255,255,0.2)',marginBottom:4 }}>Toplam</p>
            <p style={{ fontSize:17,fontWeight:900,color:'white' }}>₺{member.totalAmount.toLocaleString('tr-TR')}</p>
          </div>
          <div style={{ padding:12,background:'rgba(255,255,255,0.03)',borderRadius:14,border:'1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize:10,color:'rgba(255,255,255,0.2)',marginBottom:4 }}>Ödenen</p>
            <p style={{ fontSize:17,fontWeight:900,color:'rgba(255,255,255,0.8)' }}>₺{member.paidAmount.toLocaleString('tr-TR')}</p>
          </div>
        </div>
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
            <span style={{ fontSize:10,color:'rgba(255,255,255,0.2)' }}>İlerleme</span>
            <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.3)' }}>{payPct}%</span>
          </div>
          <div style={{ height:4,background:'rgba(255,255,255,0.06)',borderRadius:999,overflow:'hidden' }}>
            <div style={{ height:'100%',borderRadius:999,width:`${payPct}%`,background:`linear-gradient(90deg,${A},${AL})`,transition:'width 0.5s ease' }}/>
          </div>
        </div>
        {remaining>0&&<div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',marginBottom:10 }}>
          <span style={{ fontSize:12,color:'rgba(255,255,255,0.3)',fontWeight:600 }}>Kalan</span>
          <span style={{ fontSize:15,fontWeight:900,color:'white' }}>₺{remaining.toLocaleString('tr-TR')}</span>
        </div>}
        <button onClick={()=>setShowPayModal(true)} disabled={remaining<=0} style={{ width:'100%',padding:14,borderRadius:16,fontWeight:800,fontSize:14,border:'none',cursor:remaining>0?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:remaining>0?`linear-gradient(135deg,${A},${AL})`:'rgba(255,255,255,0.04)',color:remaining>0?'#080808':'rgba(255,255,255,0.18)',boxShadow:remaining>0?`0 8px 20px ${AG}`:'none' }}>
          <CreditCard style={{ width:15,height:15 }}/>{remaining<=0?'Ödeme Tamamlandı':'Ödeme Al'}
        </button>
      </div>

      {/* Geçmiş ödemeler */}
      {member.pastPayments.length>0&&(
        <div style={{ ...card,opacity:0,animation:'fadeUp 0.35s ease 0.25s forwards' }}>
          <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:12 }}>
            <Clock style={{ width:13,height:13,color:'rgba(255,255,255,0.2)' }}/>
            <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.14em',textTransform:'uppercase' }}>Geçmiş Ödemeler</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
            {member.pastPayments.map((p,i)=>(
              <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize:13,color:'rgba(255,255,255,0.5)' }}>{p.month}</span>
                <span style={{ fontSize:11,fontWeight:700,color:p.status==='paid'?'rgba(255,255,255,0.6)':p.status==='partial'?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.2)' }}>
                  {p.status==='paid'?'Ödendi ✓':p.status==='partial'?'Eksik':'Bekleniyor'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ödeme modalı */}
      {showPayModal&&(
        <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(8px)',zIndex:50,display:'flex',alignItems:'flex-end' }}>
          <div style={{ width:'100%',background:'#111',borderRadius:'28px 28px 0 0',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 24px 40px',display:'flex',flexDirection:'column',gap:12,animation:'slideUp 0.3s ease' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontSize:15,fontWeight:800,color:'white' }}>Ödeme Al</span>
              <button onClick={()=>{setShowPayModal(false);setPaid(false);}} style={{ width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.05)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X style={{ width:14,height:14,color:'rgba(255,255,255,0.4)' }}/></button>
            </div>
            <div style={{ padding:14,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16 }}>
              <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)',marginBottom:4 }}>{member.name} — Kalan</p>
              <p style={{ fontSize:22,fontWeight:900,color:'white' }}>₺{remaining.toLocaleString('tr-TR')}</p>
            </div>
            {paid?(
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'16px 0' }}>
                <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <CheckCircle2 style={{ width:28,height:28,color:'rgba(255,255,255,0.7)' }}/>
                </div>
                <p style={{ fontSize:14,fontWeight:700,color:'rgba(255,255,255,0.7)' }}>Kaydedildi!</p>
              </div>
            ):(
              <>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.2)',fontSize:16,fontWeight:700 }}>₺</span>
                  <input type="number" placeholder="Tutar girin" value={payAmount} onChange={e=>setPayAmount(e.target.value)} style={{ width:'100%',paddingLeft:32,paddingRight:16,paddingTop:15,paddingBottom:15,borderRadius:16,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'white',fontSize:16,fontWeight:700,outline:'none',boxSizing:'border-box' }}/>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  {[500,1000,remaining].filter((v,i,arr)=>arr.indexOf(v)===i&&v>0).map(v=>(
                    <button key={v} onClick={()=>setPayAmount(String(v))} style={{ flex:1,padding:8,fontSize:11,fontWeight:700,color:AL,background:'rgba(217,119,6,0.07)',border:'1px solid rgba(217,119,6,0.13)',borderRadius:12,cursor:'pointer' }}>₺{v.toLocaleString('tr-TR')}</button>
                  ))}
                </div>
                <button onClick={handlePayment} disabled={saving||!payAmount||parseInt(payAmount)<=0} style={{ width:'100%',padding:16,borderRadius:16,fontWeight:800,fontSize:15,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${A},${AL})`,color:'#080808',boxShadow:`0 8px 20px ${AG}`,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:saving||!payAmount||parseInt(payAmount)<=0?0.4:1 }}>
                  {saving?'Kaydediliyor...':<><Check style={{ width:18,height:18 }}/>Onayla</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showEditModal&&<EditMemberModal member={member} onClose={()=>setShowEditModal(false)} onSave={m=>{updateMember(m);setShowEditModal(false);}}/>}
      {showDeleteModal&&<DeleteModal name={member.name} onClose={()=>setShowDeleteModal(false)} onConfirm={()=>{deleteMember(member.id);navigate('/app/members');}}/>}
    </div>
  );
};

// ── Router ───────────────────────────────────────────────────
const W = ({ children }: { children:React.ReactNode }) => (
  <div style={{ width:'100%',height:'100%',background:'#0a0a0a',display:'flex',flexDirection:'column',overflow:'hidden' }}>{children}</div>
);

const router=createBrowserRouter([
  { path:'/',      element:<W><Login/></W> },
  { path:'/login', element:<W><Login/></W> },
  { path:'/app',   element:<W><Layout/></W>, children:[
    { path:'home',        element:<DashboardScreen/> },
    { path:'members',     element:<MembersScreen/> },
    { path:'members/:id', element:<MemberDetailScreen/> },
  ]},
]);

export default function App() { return <RouterProvider router={router}/>; }
