import { useState } from 'react';
import type { Profile } from '../types';
import Icon from './Icon';

interface OnboardingProps {
  email: string;
  onComplete: (p: Profile) => void;
}

export default function Onboarding({ email, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [salon, setSalon] = useState('');
  const [biz, setBiz] = useState('');
  const [owner, setOwner] = useState('');
  const [city, setCity] = useState('');

  const steps = [
    { title: 'Stüdyonu tanıyalım', sub: 'Panelde görünecek işletme bilgileri.' },
    { title: 'Son bir adım',        sub: 'Seni nasıl selamlayalım?' },
  ];
  const canNext = step === 0 ? salon.trim().length > 1 : owner.trim().length > 1;

  const finish = () => onComplete({
    salonName:    salon.trim(),
    businessName: biz.trim() || salon.trim(),
    ownerName:    owner.trim().split(' ')[0],
    ownerFull:    owner.trim(),
    city:         city.trim(),
    email,
  });

  return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="auth-grid" />
      </div>

      <div className="auth-inner">
        <div className="auth-brand small">
          <div className="auth-mark"><Icon name="bolt" size={22} stroke={2.2} /></div>
          <div className="auth-word sm">TRA<b>X</b></div>
        </div>

        <div className="auth-steps">
          <span className={'sdot' + (step >= 0 ? ' on' : '')} />
          <span className={'sdot' + (step >= 1 ? ' on' : '')} />
        </div>

        <div className="auth-card" key={step}>
          <div className="auth-h">{steps[step].title}</div>
          <div className="auth-sub">{steps[step].sub}</div>

          {step === 0 ? (
            <>
              <label className="fld" style={{ animationDelay: '.05s' }}>
                <span className="fld-l">Salon adı</span>
                <div className="fld-in">
                  <Icon name="bolt" size={17} />
                  <input placeholder="TRAX Performance" value={salon} autoFocus onChange={e => setSalon(e.target.value)} />
                </div>
              </label>
              <label className="fld" style={{ animationDelay: '.1s' }}>
                <span className="fld-l">İşletme ünvanı <span className="opt">opsiyonel</span></span>
                <div className="fld-in">
                  <Icon name="store" size={17} />
                  <input placeholder="TRAX Spor Hizmetleri Ltd." value={biz} onChange={e => setBiz(e.target.value)} />
                </div>
              </label>
              <label className="fld" style={{ animationDelay: '.15s' }}>
                <span className="fld-l">Şehir <span className="opt">opsiyonel</span></span>
                <div className="fld-in">
                  <Icon name="pin" size={17} />
                  <input placeholder="İstanbul" value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </label>
            </>
          ) : (
            <label className="fld" style={{ animationDelay: '.05s' }}>
              <span className="fld-l">Yetkili adı</span>
              <div className="fld-in">
                <Icon name="user" size={17} />
                <input placeholder="Mert Kaya" value={owner} autoFocus onChange={e => setOwner(e.target.value)} />
              </div>
            </label>
          )}

          <div className="row" style={{ gap: 10, marginTop: 18 }}>
            {step === 1 && (
              <button className="btn" style={{ width: 'auto', flex: 'none', padding: '15px 18px' }} onClick={() => setStep(0)}>
                <Icon name="arrowL" size={16} />
              </button>
            )}
            <button className="btn primary" disabled={!canNext} style={{ flex: 1 }}
              onClick={() => step === 0 ? setStep(1) : finish()}>
              {step === 0
                ? <><span>Devam</span><Icon name="chev" size={16} /></>
                : <><Icon name="check" size={17} stroke={2.4} />Kurulumu tamamla</>}
            </button>
          </div>
        </div>

        <div className="auth-foot dim">Giriş: {email}</div>
      </div>
    </div>
  );
}
