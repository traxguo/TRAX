import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const A = '#D97706'; const AL = '#F59E0B';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState<'email'|'pass'|null>(null);
  const [mounted, setMounted]     = useState(false);
  const [error, setError]         = useState('');

  // Sayfa açılınca: otomatik giriş kontrolü
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    const saved = localStorage.getItem('trax_remember');
    if (saved) {
      const { email: e, password: p } = JSON.parse(saved);
      setEmail(e); setPassword(p); setRemember(true);
      // Otomatik giriş
      setTimeout(() => navigate('/app/home'), 400);
    }
    return () => clearTimeout(t);
  }, []);

  const handleLogin = () => {
    if (!email || !password) { setError('E-posta ve şifre gerekli'); return; }
    setError('');
    setLoading(true);
    // Beni hatırla
    if (remember) {
      localStorage.setItem('trax_remember', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('trax_remember');
    }
    setTimeout(() => navigate('/app/home'), 900);
  };

  const inp = (focused: boolean): React.CSSProperties => ({
    width: '100%', paddingLeft: '44px', paddingRight: '44px',
    paddingTop: '14px', paddingBottom: '14px',
    borderRadius: '15px', fontSize: '14px', color: 'white', outline: 'none',
    background: focused ? 'rgba(217,119,6,0.05)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? 'rgba(217,119,6,0.28)' : 'rgba(255,255,255,0.07)'}`,
    transition: 'all 0.2s', boxSizing: 'border-box',
  });

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#080808', overflow:'hidden', position:'relative', width:'100%', height:'100%' }}>

      {/* Arkaplan */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-120px', left:'50%', transform:'translateX(-50%)', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(217,119,6,0.09) 0%, transparent 65%)' }} />
        <svg width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.022 }}>
          <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60%', background:'linear-gradient(to top, #080808 40%, transparent)' }} />
      </div>

      {/* Logo alanı */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px', gap:'20px', position:'relative', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(-14px)', transition:'opacity 0.6s ease, transform 0.6s ease' }}>
        <div style={{ width:'1px', height:'40px', background:`linear-gradient(to bottom, transparent, ${A}, transparent)`, marginBottom:'-4px' }} />
        
        {/* Logo - CSS glow ile parlıyor */}
        <div style={{ position:'relative', width:'200px' }}>
          <img src="/trax-logo-amber.png" alt="TRAX" style={{ width:'200px', height:'auto', display:'block', filter:'drop-shadow(0 0 16px rgba(217,119,6,0.7)) drop-shadow(0 0 32px rgba(217,119,6,0.35)) drop-shadow(0 0 48px rgba(217,119,6,0.15))' }} />
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'12px', opacity:mounted?1:0, transition:'opacity 0.7s ease 0.25s' }}>
          <div style={{ width:'28px', height:'1px', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ display:'flex', gap:'14px' }}>
            {[{icon:'◈',label:'Üye Takip'},{icon:'◉',label:'Ödeme'},{icon:'◎',label:'Raporlama'}].map(({icon,label}) => (
              <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'11px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', color:'rgba(217,119,6,0.7)' }}>{icon}</div>
                <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.2)', fontWeight:600, letterSpacing:'0.07em' }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ width:'28px', height:'1px', background:'rgba(255,255,255,0.08)' }} />
        </div>
      </div>

      {/* Form */}
      <div style={{ padding:'0 24px 44px', display:'flex', flexDirection:'column', gap:'10px', position:'relative', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(18px)', transition:'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s' }}>
        <div style={{ marginBottom:'4px' }}>
          <p style={{ fontSize:'18px', fontWeight:800, color:'white', letterSpacing:'-0.02em' }}>Giriş Yap</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.26)', marginTop:'3px' }}>Hesabına devam et</p>
        </div>

        {/* Email */}
        <div style={{ position:'relative' }}>
          <Mail style={{ position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', width:'15px', height:'15px', color:focused==='email'?A:'rgba(255,255,255,0.2)', transition:'color 0.2s', zIndex:1 }} />
          <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('');}} onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} placeholder="E-posta adresi" style={inp(focused==='email')} />
        </div>

        {/* Şifre */}
        <div style={{ position:'relative' }}>
          <Lock style={{ position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', width:'15px', height:'15px', color:focused==='pass'?A:'rgba(255,255,255,0.2)', transition:'color 0.2s', zIndex:1 }} />
          <input type={showPass?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('');}} onFocus={()=>setFocused('pass')} onBlur={()=>setFocused(null)} placeholder="Şifre" style={inp(focused==='pass')} />
          <button onClick={()=>setShowPass(s=>!s)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center' }}>
            {showPass ? <EyeOff style={{width:'15px',height:'15px'}} /> : <Eye style={{width:'15px',height:'15px'}} />}
          </button>
        </div>

        {/* Hata mesajı */}
        {error && <p style={{ fontSize:'12px', color:'#f43f5e', paddingLeft:'4px' }}>{error}</p>}

        {/* Beni hatırla */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'2px 0' }}>
          <div onClick={()=>setRemember(r=>!r)} style={{ width:'20px', height:'20px', borderRadius:'6px', border:`1.5px solid ${remember?A:'rgba(255,255,255,0.12)'}`, background:remember?`rgba(217,119,6,0.15)`:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
            {remember && <span style={{ color:A, fontSize:'13px', fontWeight:900, lineHeight:1 }}>✓</span>}
          </div>
          <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', cursor:'pointer', userSelect:'none' }} onClick={()=>setRemember(r=>!r)}>Beni hatırla</span>
        </div>

        {/* Buton */}
        <button onClick={handleLogin} disabled={loading||!email||!password} style={{ width:'100%', paddingTop:'15px', paddingBottom:'15px', borderRadius:'15px', fontWeight:800, fontSize:'14px', letterSpacing:'0.02em', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', cursor:email&&password&&!loading?'pointer':'default', background:email&&password&&!loading?`linear-gradient(135deg, #B45309, ${A} 50%, ${AL})`:'rgba(255,255,255,0.05)', color:email&&password&&!loading?'#080808':'rgba(255,255,255,0.18)', boxShadow:email&&password&&!loading?'0 8px 28px rgba(217,119,6,0.35)':'none', transition:'all 0.25s', marginTop:'2px' }}>
          {loading
            ? <><span style={{ width:'15px', height:'15px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.15)', borderTopColor:A, animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Giriş yapılıyor...</>
            : <><span>Devam Et</span><ArrowRight style={{width:'16px',height:'16px'}} /></>}
        </button>

        <p style={{ textAlign:'center', fontSize:'10px', color:'rgba(255,255,255,0.1)', marginTop:'2px', letterSpacing:'0.12em' }}>TRAX © 2025</p>
      </div>
    </div>
  );
};
