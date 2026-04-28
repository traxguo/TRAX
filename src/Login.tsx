import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'email' | 'pass' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => navigate('/app/home'), 900);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#080808', overflow: 'hidden',
      width: '100%', height: '100%', position: 'relative',
    }}>
      {/* Arkaplan */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.10) 0%, transparent 70%)',
        }} />
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.025 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(to top, #080808 40%, transparent)',
        }} />
      </div>

      {/* Üst alan — logo */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', gap: '20px', position: 'relative',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        {/* Amber çizgi */}
        <div style={{
          width: '1px', height: '44px',
          background: 'linear-gradient(to bottom, transparent, #D97706, transparent)',
          marginBottom: '-4px',
        }} />

        {/* Gerçek logo PNG — mix-blend-mode ile beyaz arkaplan görünmez */}
        <div style={{ width: '180px', position: 'relative' }}>
          <img
            src="/trax-logo.png"
            alt="TRAX"
            style={{
              width: '100%', height: 'auto',
              mixBlendMode: 'screen',
              filter: 'brightness(1.8) contrast(1.1)',
              display: 'block',
            }}
          />
        </div>

        {/* Özellik ikonları */}
        <div style={{
          display: 'flex', gap: '16px', marginTop: '8px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.7s ease 0.2s',
        }}>
          {[
            { icon: '◈', label: 'Üye Takip' },
            { icon: '◉', label: 'Ödeme' },
            { icon: '◎', label: 'Raporlama' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '17px', color: 'rgba(217,119,6,0.75)',
              }}>{icon}</div>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', fontWeight: 600, letterSpacing: '0.08em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alt form */}
      <div style={{
        padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: '12px',
        position: 'relative',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
      }}>
        <div style={{ marginBottom: '4px' }}>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Giriş Yap</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginTop: '3px' }}>Hesabına devam et</p>
        </div>

        {/* Email */}
        <div style={{ position: 'relative' }}>
          <Mail style={{
            position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
            width: '15px', height: '15px',
            color: focused === 'email' ? '#D97706' : 'rgba(255,255,255,0.22)',
            transition: 'color 0.2s',
          }} />
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            placeholder="E-posta adresi"
            style={{
              width: '100%', paddingLeft: '44px', paddingRight: '16px',
              paddingTop: '15px', paddingBottom: '15px',
              borderRadius: '16px', fontSize: '14px', color: 'white', outline: 'none',
              background: focused === 'email' ? 'rgba(217,119,6,0.05)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${focused === 'email' ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Şifre */}
        <div style={{ position: 'relative' }}>
          <Lock style={{
            position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
            width: '15px', height: '15px',
            color: focused === 'pass' ? '#D97706' : 'rgba(255,255,255,0.22)',
            transition: 'color 0.2s',
          }} />
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused('pass')}
            onBlur={() => setFocused(null)}
            placeholder="Şifre"
            style={{
              width: '100%', paddingLeft: '44px', paddingRight: '16px',
              paddingTop: '15px', paddingBottom: '15px',
              borderRadius: '16px', fontSize: '14px', color: 'white', outline: 'none',
              background: focused === 'pass' ? 'rgba(217,119,6,0.05)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${focused === 'pass' ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Buton */}
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          style={{
            width: '100%', paddingTop: '16px', paddingBottom: '16px',
            borderRadius: '16px', fontWeight: 800, fontSize: '14px',
            letterSpacing: '0.02em', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer',
            background: !loading && email && password
              ? 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)'
              : 'rgba(255,255,255,0.06)',
            color: !loading && email && password ? '#080808' : 'rgba(255,255,255,0.2)',
            boxShadow: !loading && email && password ? '0 8px 28px rgba(217,119,6,0.38)' : 'none',
            transition: 'all 0.25s', marginTop: '4px',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{
                width: '15px', height: '15px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#D97706',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
              Giriş yapılıyor...
            </span>
          ) : (
            <><span>Devam Et</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.12)', marginTop: '6px', letterSpacing: '0.12em' }}>
          TRAX © 2025
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};
