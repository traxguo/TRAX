/* ============ TRAX — app shell ============ */
const { useState: uS, useEffect: uE } = React;

const ACCENTS = {
  '#c8ff1e': { dim:'rgba(200,255,30,0.14)',  glow:'rgba(200,255,30,0.30)'  },
  '#2de2c0': { dim:'rgba(45,226,192,0.14)',  glow:'rgba(45,226,192,0.30)'  },
  '#66a3ff': { dim:'rgba(102,163,255,0.14)', glow:'rgba(102,163,255,0.32)' },
  '#ff7a45': { dim:'rgba(255,122,69,0.14)',  glow:'rgba(255,122,69,0.30)'  },
};

const TRAX_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#c8ff1e",
  "density": "regular",
  "glow": true
}/*EDITMODE-END*/;

const NAV = [
  { k:'dashboard', l:'Genel bakış', ico:'grid' },
  { k:'members',   l:'Üyeler',      ico:'users', badge:'1.284', muted:true },
  { k:'checkin',   l:'Check-In',    ico:'scan' },
  { k:'whatsapp',  l:'WhatsApp',    ico:'chat', badge:'37' },
];

const TITLES = {
  dashboard: ['Genel bakış', new Date().toLocaleDateString('tr-TR',{weekday:'long', day:'numeric', month:'long'})],
  members:   ['Üyeler', '1.284 toplam üye · 1.142 aktif'],
  member:    ['Üye detayı', 'Profil, üyelik ve hareket geçmişi'],
  checkin:   ['Check-In', 'Hızlı giriş kaydı'],
  whatsapp:  ['WhatsApp', 'Toplu mesaj ve hatırlatmalar'],
};

function App() {
  const [t, setTweak] = useTweaks(TRAX_TWEAKS);
  const [route, setRoute] = uS({ screen:'dashboard', id:null });
  const [query, setQuery] = uS('');

  uE(() => {
    const r = document.documentElement;
    const a = ACCENTS[t.accent] || ACCENTS['#c8ff1e'];
    r.style.setProperty('--acc', t.accent);
    r.style.setProperty('--acc-dim', a.dim);
    r.style.setProperty('--acc-glow', t.glow ? a.glow : 'transparent');
    document.body.setAttribute('data-density', t.density === 'compact' ? 'compact' : 'regular');
  }, [t.accent, t.density, t.glow]);

  const go = (screen, id=null) => { setRoute({ screen, id }); if (screen!=='members') setQuery(''); };
  const navKey = route.screen==='member' ? 'members' : route.screen;
  const [pgTitle, sub] = TITLES[route.screen] || TITLES.dashboard;

  return (
    <div className="app">
      {/* sidebar */}
      <aside className="side">
        <div className="brand">
          <div className="brand-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div className="brand-name">TRA<b>X</b></div>
            <div className="brand-sub">Fitness OS</div>
          </div>
        </div>

        <div className="nav-label">Yönetim</div>
        {NAV.map(n => (
          <div key={n.k} className={'nav-item'+(navKey===n.k?' active':'')} onClick={()=>go(n.k)}>
            <span className="ico"><Icon name={n.ico} size={18} /></span>
            {n.l}
            {n.badge && <span className={'badge'+(n.muted?' muted':'')}>{n.badge}</span>}
          </div>
        ))}

        <div className="nav-label">Sistem</div>
        <div className="nav-item"><span className="ico"><Icon name="trend" size={18} /></span>Raporlar</div>
        <div className="nav-item"><span className="ico"><Icon name="card" size={18} /></span>Ödemeler</div>

        <div className="side-foot">
          <div className="user-card">
            <div className="avatar" style={{background:'var(--acc)'}}>MK</div>
            <div className="user-meta">
              <div className="nm">Mert Kaya</div>
              <div className="rl">Stüdyo yöneticisi</div>
            </div>
            <Icon name="logout" size={16} style={{marginLeft:'auto',color:'var(--tx-3)'}} />
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="main">
        <header className="topbar">
          <div>
            <div className="page-title">{pgTitle}</div>
            <div className="page-sub" style={{textTransform: route.screen==='dashboard'?'capitalize':'none'}}>{sub}</div>
          </div>
          <div className="search">
            <Icon name="search" size={16} style={{color:'var(--tx-3)'}} />
            <input placeholder="Üye, telefon, paket ara…" value={query}
              onChange={e=>{setQuery(e.target.value); if(route.screen!=='members'&&route.screen!=='member') go('members');}} />
          </div>
          <button className="icon-btn"><Icon name="bell" size={18} /><span className="dot"></span></button>
          <button className="btn primary" onClick={()=>go('checkin')}><Icon name="scan" size={16} />Check-In</button>
        </header>

        <div className="scroll">
          {route.screen==='dashboard' && <Dashboard go={go} />}
          {route.screen==='members'   && <Members go={go} query={query} />}
          {route.screen==='member'    && <MemberDetail id={route.id} go={go} />}
          {route.screen==='checkin'   && <CheckIn go={go} />}
          {route.screen==='whatsapp'  && <WhatsApp />}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Marka rengi" />
        <TweakColor label="Vurgu" value={t.accent}
          options={['#c8ff1e','#2de2c0','#66a3ff','#ff7a45']}
          onChange={(v)=>setTweak('accent', v)} />
        <TweakToggle label="Neon parıltı" value={t.glow}
          onChange={(v)=>setTweak('glow', v)} />
        <TweakSection label="Yoğunluk" />
        <TweakRadio label="Aralık" value={t.density}
          options={['compact','regular']}
          onChange={(v)=>setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
