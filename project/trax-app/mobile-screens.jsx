/* ============ TRAX mobile — app ============ */
const { useState, useMemo } = React;
const D = window.TRAX;

const PLAN_LEN = { 'Aylık':30, 'Premium Yıllık':365, 'Premium Aylık':30, 'Aylık Standart':30, '3 Aylık':90 };

function glowOf(m) {
  if (m.status === 'frozen') return 's-frozen';
  if (m.kind === 'paket') {
    if (m.adet <= 0) return 's-red';
    if (m.adet <= 2) return 's-yellow';
    return 's-green';
  }
  if (m.daysLeft < 0)  return 's-red';
  if (m.daysLeft <= 7) return 's-yellow';
  return 's-green';
}
function kalanText(m) {
  if (m.status === 'frozen') return 'Donduruldu';
  if (m.kind === 'paket') return m.adet <= 0 ? 'Paket bitti' : `${m.adet} seans kaldı`;
  if (m.daysLeft < 0) return `${Math.abs(m.daysLeft)} gün geçti`;
  if (m.daysLeft === 0) return 'Bugün bitiyor';
  return `${m.daysLeft} gün kaldı`;
}

/* ───────────────── Üyeler — minimal cards ───────────────── */
function MembersScreen({ open }) {
  const { members: MEM } = useStore();
  const [f, setF] = useState('all');
  const filters = [
    { k:'all',    l:'Tümü',         c:'var(--acc)',  b:'var(--acc-dim)',          dot:null },
    { k:'red',    l:'Doldu',        c:'var(--bad)',  b:'rgba(255,77,82,0.16)',    dot:'var(--bad)' },
    { k:'yellow', l:'Bitmek üzere', c:'var(--warn)', b:'rgba(255,194,61,0.16)',   dot:'var(--warn)' },
    { k:'green',  l:'Aktif',        c:'var(--ok)',   b:'rgba(70,224,138,0.16)',   dot:'var(--ok)' },
    { k:'frozen', l:'Donduruldu',   c:'var(--tx-2)', b:'rgba(255,255,255,0.07)',  dot:'var(--tx-2)' },
  ];
  const list = useMemo(() => MEM.filter(m => {
    const g = glowOf(m).replace('s-','');
    return f === 'all' ? true : g === f;
  }).sort((a,b) => a.daysLeft - b.daysLeft), [f, MEM]);
  const counts = MEM.reduce((a,m)=>{const g=glowOf(m).replace('s-','');a[g]=(a[g]||0)+1;return a;},{});

  return (
    <div className="fade">
      <div className="filter-rail">
        {filters.map(x => {
          const on = f===x.k;
          return (
            <button key={x.k} className={'fchip'+(on?' on':'')} onClick={()=>setF(x.k)}
              style={on?{'--fc':x.c,'--fcb':x.b}:undefined}>
              {x.dot && <span className="fd" style={{background:x.c}}></span>}
              {x.l}
              <span className="cnt tnum">{x.k==='all' ? MEM.length : (counts[x.k]||0)}</span>
            </button>
          );
        })}
      </div>

      <div className="mcards">
        {list.map(m => {
          const g = glowOf(m);
          return (
            <div key={m.id} className={'mcard '+g} onClick={()=>open(m.id)}>
              <div className="av-m">{D.initials(m.name)}</div>
              <div className="info">
                <div className="nm">{m.name}</div>
                <div className="kalan tnum">{kalanText(m)}</div>
              </div>
              <Icon name="chev" size={17} className="chev" />
            </div>
          );
        })}
        {list.length===0 && <div className="muted" style={{textAlign:'center',padding:'40px 0'}}>Bu kategoride üye yok.</div>}
      </div>
    </div>
  );
}

/* ───────────────── Genel bakış ───────────────── */
function HomeScreen({ go, open }) {
  const { members: MEM } = useStore();
  const maxV = Math.max(...D.weekVisits.map(w=>w.v));
  const actIcon = { checkin:'scan', payment:'money', join:'plus', renew:'trend' };
  const soon = MEM.filter(m => glowOf(m)==='s-yellow' || glowOf(m)==='s-red')
    .sort((a,b)=>a.daysLeft-b.daysLeft).slice(0,3);

  return (
    <div className="fade">
      {/* hero */}
      <div className="hero">
        <div className="h-row">
          <span className="h-live"><i></i>CANLI · BUGÜN</span>
          <span className="h-date">Cumartesi, 30 Mayıs</span>
        </div>
        <div className="h-main">
          <div>
            <div className="h-val tnum">46</div>
            <div className="h-label">giriş <span className="h-delta">↑ +12</span> · 28 içeride</div>
          </div>
          <div className="h-spark">
            {D.weekVisits.map((w,i)=>(
              <i key={i} className={w.today?'dim':''} style={{height:(w.v/maxV*100)+'%'}}></i>
            ))}
          </div>
        </div>
        <div className="h-foot">
          <div className="hf"><div className="v tnum">1.142</div><div className="l">Aktif üye</div></div>
          <div className="sep"></div>
          <div className="hf"><div className="v tnum">₺184K</div><div className="l">Aylık gelir</div></div>
          <div className="sep"></div>
          <div className="hf"><div className="v tnum">72%</div><div className="l">Doluluk</div></div>
        </div>
      </div>

      {/* secondary stats */}
      <div className="stat-row">
        <div className="statc">
          <div className="row1"><Icon name="trend" size={15} /><span className="l">Bu hafta</span></div>
          <div className="v tnum">583</div>
          <div className="dl up">+6.4% giriş</div>
        </div>
        <div className="statc">
          <div className="row1" style={{color:'var(--warn)'}}><Icon name="clock" size={15} /><span className="l muted">Yenileme</span></div>
          <div className="v tnum">37</div>
          <div className="dl warn">7 gün içinde</div>
        </div>
      </div>

      {/* week chart */}
      <div className="section-h"><h2>Haftalık giriş</h2><span className="link tnum">Cmt en yoğun</span></div>
      <div className="card">
        <div className="mchart">
          {D.weekVisits.map((w,i)=>(
            <div key={i} className={'col'+(w.today?' today':'')}>
              <div className="stack" style={{height:(w.v/maxV*100)+'%'}}></div>
              <div className="lbl">{w.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* renewals due */}
      <div className="section-h"><h2>Yenileme bekleyen</h2><span className="link" onClick={()=>go('members')}>Tümü</span></div>
      <div className="card" style={{paddingTop:4,paddingBottom:4}}>
        {soon.map(m=>{
          const g = glowOf(m);
          const c = g==='s-red'?'var(--bad)':'var(--warn)';
          return (
            <div key={m.id} className="mini-row" onClick={()=>open(m.id)}>
              <div className="av" style={{width:34,height:34,fontSize:13,background:D.colorFor(m.name)}}>{D.initials(m.name)}</div>
              <div><div className="nm">{m.name}</div><div className="muted" style={{fontSize:12}}>{m.plan}</div></div>
              <span className="kln tnum" style={{color:c}}>{kalanText(m)}</span>
            </div>
          );
        })}
      </div>

      {/* activity */}
      <div className="section-h"><h2>Son hareketler</h2></div>
      <div className="card" style={{paddingTop:4,paddingBottom:4}}>
        {D.activity.slice(0,4).map((a,i)=>(
          <div key={i} className="feed">
            <div className={'ic'+(a.acc?' acc':'')}><Icon name={actIcon[a.type]} size={15} /></div>
            <div style={{minWidth:0}}><div style={{fontSize:13.5}}><b style={{fontWeight:650}}>{a.who}</b> <span className="muted">{a.text}</span></div></div>
            <div className="t tnum">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Check-In ───────────────── */
function CheckInScreen() {
  const { members: MEM } = useStore();
  const [q,setQ] = useState('');
  const [confirmed,setConfirmed] = useState(null);
  const [feed,setFeed] = useState(D.todayCheckins);
  const results = q.trim() ? MEM.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.phone.includes(q)).slice(0,3) : [];
  const doCi = (m) => {
    setConfirmed(m);
    const now=new Date(); const t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    setFeed([{id:m.id,name:m.name,time:t},...feed]); setQ('');
    setTimeout(()=>setConfirmed(null),2600);
  };
  return (
    <div className="fade">
      <div className="m-search big">
        <Icon name="search" size={22} style={{color:'var(--tx-3)'}} />
        <input autoFocus placeholder="Üye ara…" value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      {confirmed ? (
        <div className="ci-confirm" style={{marginTop:16}}>
          <div className="ci-check"><Icon name="check" size={36} stroke={2.6} style={{color:'#fff'}} /></div>
          <div style={{fontSize:11,letterSpacing:2,textTransform:'uppercase',color:'var(--acc)',fontWeight:700,marginBottom:6}}>Giriş onaylandı</div>
          <div style={{fontSize:24,fontWeight:760,letterSpacing:'-0.5px'}}>{confirmed.name}</div>
          <div className="muted" style={{marginTop:5,fontSize:13}}>{confirmed.plan} · Hoş geldin 💪</div>
        </div>
      ) : results.length>0 ? (
        <div style={{display:'flex',flexDirection:'column',gap:11,marginTop:16}}>
          {results.map(m=>{
            const blocked = m.status==='expired'||m.status==='frozen';
            return (
              <div key={m.id} className="card" onClick={()=>!blocked&&doCi(m)} style={{display:'flex',alignItems:'center',gap:13,cursor:blocked?'default':'pointer',borderColor:blocked?'var(--line)':'rgba(255,59,67,0.3)'}}>
                <div className="av" style={{width:44,height:44,background:D.colorFor(m.name),fontSize:16}}>{D.initials(m.name)}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:15.5,fontWeight:680}}>{m.name}</div><div className="muted" style={{fontSize:12.5,marginTop:2}}>{m.plan}</div></div>
                {blocked ? <span className="pill bad"><Icon name="ban" size={12} />Engel</span> : <Icon name="check" size={22} stroke={2.4} style={{color:'var(--acc)'}} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{marginTop:16,textAlign:'center',padding:'40px 22px',border:'1px dashed var(--line-2)',background:'transparent'}}>
          <div style={{width:56,height:56,borderRadius:16,background:'var(--panel-2)',display:'grid',placeItems:'center',margin:'0 auto 14px',color:'var(--tx-3)'}}><Icon name="scan" size={26} /></div>
          <div style={{fontWeight:650,marginBottom:5}}>Üye arayın veya QR okutun</div>
          <div className="muted" style={{fontSize:13}}>İsim ya da telefon yazın.</div>
        </div>
      )}

      <div className="section-h"><h2>Bugünkü girişler</h2><span className="link tnum">{feed.length}</span></div>
      <div className="card" style={{paddingTop:4,paddingBottom:4}}>
        {feed.map((c,i)=>(
          <div key={i} className="feed">
            <div className="av" style={{width:34,height:34,background:D.colorFor(c.name),fontSize:13}}>{D.initials(c.name)}</div>
            <div style={{fontSize:14,fontWeight:600}}>{c.name}</div>
            <div className="t tnum">{c.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MembersScreen, HomeScreen, CheckInScreen, glowOf, kalanText, PLAN_LEN });
