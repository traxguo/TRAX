/* ============ TRAX mobile — Giriş & Kurulum ============ */
const { useState: aS } = React;

/* ───────────────── Giriş ekranı ───────────────── */
function LoginScreen({ onLogin, onSignup }) {
  const [email, setEmail] = aS('');
  const [pw, setPw] = aS('');
  const [show, setShow] = aS(false);
  const [err, setErr] = aS('');
  const [busy, setBusy] = aS(false);

  const valid = /\S+@\S+\.\S+/.test(email) && pw.length >= 4;

  const submit = (e) => {
    e && e.preventDefault();
    if (!valid) { setErr('Geçerli e-posta ve en az 4 karakterli şifre girin.'); return; }
    setErr(''); setBusy(true);
    setTimeout(() => { setBusy(false); onLogin(email); }, 750);
  };

  return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1"></span>
        <span className="orb o2"></span>
        <span className="auth-grid"></span>
      </div>

      <div className="auth-inner">
        <div className="auth-brand">
          <div className="auth-mark"><Icon name="bolt" size={26} stroke={2.2} /></div>
          <div className="auth-word">TRA<b>X</b></div>
          <div className="auth-tag">Stüdyo yönetim paneli</div>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-h">Tekrar hoş geldin</div>
          <div className="auth-sub">İşletme hesabınla giriş yap</div>

          <label className="fld" style={{animationDelay:'.06s'}}>
            <span className="fld-l">E-posta</span>
            <div className="fld-in">
              <Icon name="mail" size={17} />
              <input type="email" inputMode="email" autoComplete="username" placeholder="ornek@trax.app"
                value={email} onChange={e=>{setEmail(e.target.value);setErr('');}} />
            </div>
          </label>

          <label className="fld" style={{animationDelay:'.12s'}}>
            <span className="fld-l">Şifre</span>
            <div className="fld-in">
              <Icon name="lock" size={17} />
              <input type={show?'text':'password'} autoComplete="current-password" placeholder="••••••••"
                value={pw} onChange={e=>{setPw(e.target.value);setErr('');}} />
              <button type="button" className="fld-eye" onClick={()=>setShow(s=>!s)} aria-label="Şifreyi göster">
                <Icon name={show?'eyeoff':'eye'} size={17} />
              </button>
            </div>
          </label>

          <div className="auth-row" style={{animationDelay:'.16s'}}>
            <span></span>
            <span className="link sm">Şifremi unuttum</span>
          </div>

          {err && <div className="auth-err">{err}</div>}

          <button type="submit" className={'btn primary auth-go'+(busy?' busy':'')} disabled={busy} style={{animationDelay:'.2s'}}>
            {busy ? <span className="spin"></span> : <><Icon name="logout" size={17} style={{transform:'scaleX(-1)'}} />Giriş yap</>}
          </button>

          <div className="auth-foot" style={{animationDelay:'.24s'}}>
            Hesabın yok mu? <span className="link" onClick={onSignup}>İşletme kaydı oluştur</span>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────────────── Kurulum (onboarding) ───────────────── */
const PLAN_OPTS = ['Premium Yıllık','Premium Aylık','Aylık Standart','3 Aylık'];

function OnboardingScreen({ email, onComplete }) {
  const [step, setStep] = aS(0);
  const [salon, setSalon] = aS('');
  const [biz, setBiz] = aS('');
  const [owner, setOwner] = aS('');
  const [city, setCity] = aS('');

  const steps = [
    { title:'Stüdyonu tanıyalım', sub:'Panelde görünecek işletme bilgileri.' },
    { title:'Son bir adım', sub:'Seni nasıl selamlayalım?' },
  ];
  const canNext = step===0 ? salon.trim().length>1 : owner.trim().length>1;

  const finish = () => onComplete({
    salonName: salon.trim(),
    businessName: biz.trim() || salon.trim(),
    ownerName: owner.trim().split(' ')[0],
    ownerFull: owner.trim(),
    city: city.trim(),
    email,
  });

  return (
    <div className="auth">
      <div className="auth-bg">
        <span className="orb o1"></span>
        <span className="orb o2"></span>
        <span className="auth-grid"></span>
      </div>

      <div className="auth-inner">
        <div className="auth-brand small">
          <div className="auth-mark"><Icon name="bolt" size={22} stroke={2.2} /></div>
          <div className="auth-word sm">TRA<b>X</b></div>
        </div>

        <div className="auth-steps">
          <span className={'sdot'+(step>=0?' on':'')}></span>
          <span className={'sdot'+(step>=1?' on':'')}></span>
        </div>

        <div className="auth-card" key={step}>
          <div className="auth-h">{steps[step].title}</div>
          <div className="auth-sub">{steps[step].sub}</div>

          {step===0 ? (
            <>
              <label className="fld" style={{animationDelay:'.05s'}}>
                <span className="fld-l">Salon adı</span>
                <div className="fld-in"><Icon name="bolt" size={17} />
                  <input placeholder="TRAX Performance" value={salon} onChange={e=>setSalon(e.target.value)} autoFocus />
                </div>
              </label>
              <label className="fld" style={{animationDelay:'.1s'}}>
                <span className="fld-l">İşletme ünvanı <span className="opt">opsiyonel</span></span>
                <div className="fld-in"><Icon name="store" size={17} />
                  <input placeholder="TRAX Spor Hizmetleri Ltd." value={biz} onChange={e=>setBiz(e.target.value)} />
                </div>
              </label>
              <label className="fld" style={{animationDelay:'.15s'}}>
                <span className="fld-l">Şehir <span className="opt">opsiyonel</span></span>
                <div className="fld-in"><Icon name="pin" size={17} />
                  <input placeholder="İstanbul" value={city} onChange={e=>setCity(e.target.value)} />
                </div>
              </label>
            </>
          ) : (
            <label className="fld" style={{animationDelay:'.05s'}}>
              <span className="fld-l">Yetkili adı</span>
              <div className="fld-in"><Icon name="user" size={17} />
                <input placeholder="Mert Kaya" value={owner} onChange={e=>setOwner(e.target.value)} autoFocus />
              </div>
            </label>
          )}

          <div className="row" style={{gap:10,marginTop:18}}>
            {step===1 && <button className="btn" style={{width:'auto',flex:'none',padding:'15px 18px'}} onClick={()=>setStep(0)}><Icon name="arrowL" size={16} /></button>}
            <button className="btn primary" disabled={!canNext} style={{flex:1}}
              onClick={()=> step===0 ? setStep(1) : finish()}>
              {step===0 ? <>Devam<Icon name="chev" size={16} /></> : <><Icon name="check" size={17} stroke={2.4} />Kurulumu tamamla</>}
            </button>
          </div>
        </div>

        <div className="auth-foot dim">Giriş: {email}</div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, OnboardingScreen, PLAN_OPTS });
