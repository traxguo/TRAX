import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, ArrowRight } from 'lucide-react';

// TRAX logosu — SVG, tamamen vektör, beyaz/amber renkte kullanılıyor
const TraxLogo = ({ className = '', color = 'white' }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 290 82" className={className} xmlns="http://www.w3.org/2000/svg" fill={color}>
    {/* T */}
    <polygon points="8,6 8,20 42,20 42,76 58,76 58,20 92,20 92,6" />
    {/* R */}
    <path d="M104,6 L104,76 L120,76 L120,46 L143,46 L160,76 L178,76 L158,44 C167,40 172,32 172,22 C172,12 164,6 151,6 Z M120,20 L149,20 C154,20 157,23 157,28 C157,33 154,36 149,36 L120,36 Z" />
    {/* A */}
    <polygon points="187,6 160,76 176,76 192,30 208,76 224,76 197,6" />
    {/* X — sol çapraz */}
    <line x1="232" y1="6" x2="262" y2="44" stroke={color} strokeWidth="13" strokeLinecap="round"/>
    <line x1="262" y1="44" x2="232" y2="76" stroke={color} strokeWidth="13" strokeLinecap="round"/>
    {/* X — sağ + ok yukarı */}
    <line x1="284" y1="6" x2="262" y2="44" stroke={color} strokeWidth="13" strokeLinecap="round"/>
    <line x1="265" y1="38" x2="286" y2="10" stroke={color} strokeWidth="10" strokeLinecap="round"/>
    <polygon points="278,4 292,2 290,17" fill={color} />
  </svg>
);

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'email' | 'pass' | null>(null);

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => navigate('/app/home'), 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#080808] overflow-hidden w-full h-full relative">

      {/* Arkaplan dekorasyon */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Üst amber parıltı */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)',
        }} />
        {/* Izgara çizgileri */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Alt fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, #080808 30%, transparent)',
        }} />
      </div>

      {/* Üst bölüm — logo alanı */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8 gap-6">

        {/* Amber çizgi aksanı */}
        <div style={{
          width: '1px', height: '48px',
          background: 'linear-gradient(to bottom, transparent, #D97706, transparent)',
          marginBottom: '-8px',
        }} />

        {/* Logo */}
        <div className="w-[200px]">
          <TraxLogo color="white" className="w-full h-auto drop-shadow-[0_0_24px_rgba(217,119,6,0.2)]" />
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-3">
          <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.12)' }} />
          <p style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase' }}>
            Stüdyo Yönetim Platformu
          </p>
          <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Özellik ikonları */}
        <div className="flex gap-5 mt-2">
          {[
            { icon: '◈', label: 'Üye Takip' },
            { icon: '◉', label: 'Ödeme' },
            { icon: '◎', label: 'Raporlama' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: 'rgba(217,119,6,0.8)',
              }}>
                {icon}
              </div>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.08em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alt form bölümü */}
      <div className="relative px-6 pb-10 flex flex-col gap-3">

        {/* Form başlık */}
        <div className="mb-1">
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Giriş Yap
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
            Hesabına devam et
          </p>
        </div>

        {/* E-posta */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <Mail style={{ width: '15px', height: '15px', color: focused === 'email' ? '#D97706' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }} />
          </div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            placeholder="E-posta adresi"
            style={{
              width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '15px', paddingBottom: '15px',
              borderRadius: '16px', fontSize: '14px', color: 'white', outline: 'none',
              background: focused === 'email' ? 'rgba(217,119,6,0.05)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${focused === 'email' ? 'rgba(217,119,6,0.35)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s', boxSizing: 'border-box',
            }}
            className="placeholder-[rgba(255,255,255,0.2)]"
          />
        </div>

        {/* Şifre */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <Lock style={{ width: '15px', height: '15px', color: focused === 'pass' ? '#D97706' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }} />
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused('pass')}
            onBlur={() => setFocused(null)}
            placeholder="Şifre"
            style={{
              width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '15px', paddingBottom: '15px',
              borderRadius: '16px', fontSize: '14px', color: 'white', outline: 'none',
              background: focused === 'pass' ? 'rgba(217,119,6,0.05)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${focused === 'pass' ? 'rgba(217,119,6,0.35)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s', boxSizing: 'border-box',
            }}
            className="placeholder-[rgba(255,255,255,0.2)]"
          />
        </div>

        {/* Giriş butonu */}
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          style={{
            width: '100%', paddingTop: '16px', paddingBottom: '16px',
            borderRadius: '16px', fontWeight: 800, fontSize: '14px',
            letterSpacing: '0.02em', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer',
            background: loading || !email || !password
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
            color: loading || !email || !password ? 'rgba(255,255,255,0.25)' : '#080808',
            boxShadow: loading || !email || !password ? 'none' : '0 8px 28px rgba(217,119,6,0.4)',
            transition: 'all 0.25s',
            marginTop: '4px',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#D97706',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
              Giriş yapılıyor...
            </span>
          ) : (
            <>Devam Et <ArrowRight style={{ width: '16px', height: '16px' }} /></>
          )}
        </button>

        {/* Alt not */}
        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.15)', marginTop: '8px', letterSpacing: '0.1em' }}>
          TRAX © 2025
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
