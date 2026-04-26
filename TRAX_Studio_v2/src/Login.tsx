import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Lock, Mail, MapPin } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studio, setStudio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate('/app/home');
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-32 pb-10 bg-[#121212] overflow-y-auto w-full h-full">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-[#8B5CF6] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <span className="text-white text-3xl font-black tracking-tighter">T</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">TRAX</h1>
        <p className="text-white/50 text-[15px]">Stüdyo Yönetim Platformu</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            required
            value={studio}
            onChange={(e) => setStudio(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-[#1E1E1E] border border-white/5 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all text-[15px]"
            placeholder="Stüdyo Adı"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-[#1E1E1E] border border-white/5 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all text-[15px]"
            placeholder="E-posta Adresi"
          />
        </div>

        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 bg-[#1E1E1E] border border-white/5 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all text-[15px]"
            placeholder="Şifre"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#8B5CF6] text-white rounded-2xl font-semibold text-[15px] hover:bg-[#7C3AED] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] disabled:opacity-70 mt-4"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};