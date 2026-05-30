/* ============ TRAX mobile — store, auth, shell ============ */
const { useState: mS, useEffect: mE, useMemo: mM, useCallback: mC } = React;
const DD = window.TRAX;

/* ───────────────── store / context ───────────────── */
const StoreCtx = React.createContext(null);
const useStore = () => React.useContext(StoreCtx);

const MON = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const fmtDate = (d) => d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* plan alanları: Aylık → tarihten gün hesapla · Paket → seans adedi */
function derivePlan(f) {
  if (f.plan === 'Paket') {
    const adet = Math.max(1, parseInt(f.adet, 10) || 1);
    return { plan: 'Paket', kind: 'paket', adet, daysLeft: 9999, expires: '—', status: 'active' };
  }
  const now = new Date();
  const exp = f.date ? new Date(f.date) : new Date(now.getTime() + 30 * 864e5);
  const dl = Math.round((exp - now) / 864e5);
  return { plan: 'Aylık', kind: 'aylik', adet: null, daysLeft: dl, expires: fmtDate(exp),
    status: dl < 0 ? 'expired' : dl <= 7 ? 'expiring' : 'active' };
}

function useStoreValue() {
  const [members, setMembers] = mS(() => load('trax_members', DD.members));
  const [profile, setProfile] = mS(() => load('trax_profile', null));
  const [session, setSession] = mS(() => load('trax_session', null));
  const [notifRead, setNotifRead] = mS(() => load('trax_notifread', false));

  mE(() => save('trax_members', members), [members]);
  mE(() => save('trax_profile', profile), [profile]);
  mE(() => save('trax_session', session), [session]);
  mE(() => save('trax_notifread', notifRead), [notifRead]);

  const addMember = mC((f) => {
    const now = new Date();
    const mem = {
      id: Date.now(), name: f.name.trim(), phone: f.phone.trim(), email: (f.email || '').trim(),
      joined: fmtDate(now), lastVisit: '—', visits: 0, attendance: 0,
      trainer: (f.trainer || '').trim() || '—', ...derivePlan(f),
    };
    setMembers(ms => [mem, ...ms]);
    return mem.id;
  }, []);

  const updateMember = mC((id, patch) => setMembers(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m)), []);
  const deleteMember = mC((id) => setMembers(ms => ms.filter(m => m.id !== id)), []);
  const renewMember = mC((id) => setMembers(ms => ms.map(m => {
    if (m.id !== id) return m;
    if (m.kind === 'paket') return { ...m, adet: (m.adet || 0) + 10, status: 'active' };
    const len = (window.PLAN_LEN && window.PLAN_LEN[m.plan]) || 30;
    const exp = new Date(Date.now() + len * 864e5);
    return { ...m, daysLeft: len, status: 'active', expires: fmtDate(exp) };
  })), []);

  const updateProfile = mC((p) => setProfile(prev => ({ ...prev, ...p })), []);
  const login = mC((email) => setSession({ email, at: Date.now() }), []);
  const logout = mC(() => { setSession(null); }, []);
  const completeOnboarding = mC((p) => setProfile(p), []);
  const markNotifsRead = mC(() => setNotifRead(true), []);

  return { members, addMember, updateMember, deleteMember, renewMember,
    profile, updateProfile, completeOnboarding, session, login, logout,
    notifRead, markNotifsRead, setNotifRead };
}

/* ───────────────── WhatsApp ───────────────── */
const M_TEMPLATES = [
  { id:'renew', name:'Yenileme hatırlatması', tag:'warn',
    body:(<span>Merhaba <b>{'{isim}'}</b>! TRAX üyeliğinin bitmesine <b>{'{kalan}'}</b> gün kaldı. Yenilemek için stüdyoya uğrayabilirsin. 💪</span>) },
  { id:'winback', name:'Geri kazanım', tag:'bad',
    body:(<span>Seni özledik <b>{'{isim}'}</b>! Bu hafta dönersen ilk aya <b>%20 indirim</b> hediye. 🎁</span>) },
  { id:'welcome', name:'Hoş geldin', tag:'ok',
    body:(<span>TRAX ailesine hoş geldin <b>{'{isim}'}</b>! İyi antrenmanlar! 🔥</span>) },
];
function WhatsAppScreen() {
  const { members } = useStore();
  const [tmpl,setTmpl] = mS('renew');
  const targets = members.filter(m => glowOf(m)==='s-red' || glowOf(m)==='s-yellow');
  const [sel,setSel] = mS(()=>new Set(targets.filter(t=>glowOf(t)==='s-yellow').map(t=>t.id)));
  const [sent,setSent] = mS(false);
  const toggle = id => { const n=new Set(sel); n.has(id)?n.delete(id):n.add(id); setSel(n); setSent(false); };
  return (
    <div className="fade">
      <div className="section-h" style={{marginTop:8}}><h2>Şablon</h2></div>
      <div style={{display:'flex',flexDirection:'column',gap:11}}>
        {M_TEMPLATES.map(t=>(
          <div key={t.id} className={'tmpl'+(tmpl===t.id?' on':'')} onClick={()=>{setTmpl(t.id);setSent(false);}}>
            <div className="row"><span className={'pill '+t.tag}><span className="d"></span></span><span style={{fontWeight:650,fontSize:14}}>{t.name}</span>{tmpl===t.id&&<Icon name="check" size={16} style={{marginLeft:'auto',color:'var(--acc)'}} stroke={2.4} />}</div>
            {tmpl===t.id && <div className="preview">{t.body}</div>}
          </div>
        ))}
      </div>

      <div className="section-h"><h2>Alıcılar</h2><span className="link tnum" onClick={()=>setSel(sel.size===targets.length?new Set():new Set(targets.map(t=>t.id)))}>{sel.size===targets.length?'Hiçbiri':'Tümü'}</span></div>
      <div className="card" style={{paddingTop:4,paddingBottom:4}}>
        {targets.map(m=>(
          <div key={m.id} className="wa-rec" onClick={()=>toggle(m.id)}>
            <div className={'check'+(sel.has(m.id)?' on':'')}>{sel.has(m.id)&&<Icon name="check" size={13} stroke={3} style={{color:'#fff'}} />}</div>
            <div className="av" style={{width:34,height:34,background:DD.colorFor(m.name),fontSize:13}}>{DD.initials(m.name)}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600}}>{m.name}</div><div className="muted" style={{fontSize:12}}>{kalanText(m)}</div></div>
            <span style={{width:9,height:9,borderRadius:99,background:glowOf(m)==='s-red'?'var(--bad)':'var(--warn)'}}></span>
          </div>
        ))}
        {targets.length===0 && <div className="muted" style={{textAlign:'center',padding:'30px 0'}}>Mesaj bekleyen üye yok 🎉</div>}
      </div>

      {sent ? (
        <div className="row" style={{justifyContent:'center',gap:9,color:'var(--ok)',fontWeight:650,padding:'18px 0'}}><Icon name="check" size={18} stroke={2.4} />{sel.size} mesaj kuyruğa alındı</div>
      ) : (
        <button className="btn primary" style={{marginTop:18}} disabled={sel.size===0} onClick={()=>setSent(true)}><Icon name="send" size={17} />{sel.size} kişiye gönder</button>
      )}
    </div>
  );
}

/* ───────────────── theming ───────────────── */
const M_ACCENTS = {
  '#ff3b43':{deep:'#d11f2c',dim:'rgba(255,59,67,0.14)', glow:'rgba(255,59,67,0.42)'},
  '#ff7a1a':{deep:'#d1560a',dim:'rgba(255,122,26,0.14)',glow:'rgba(255,122,26,0.40)'},
  '#c8ff1e':{deep:'#8fb800',dim:'rgba(200,255,30,0.14)',glow:'rgba(200,255,30,0.36)'},
  '#5a8cff':{deep:'#2f5fd1',dim:'rgba(90,140,255,0.14)',glow:'rgba(90,140,255,0.42)'},
};
const M_ACC_RGB = { '#ff3b43':'255,59,67','#ff7a1a':'255,122,26','#c8ff1e':'200,255,30','#5a8cff':'90,140,255' };
const M_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#ff3b43",
  "glow": true
}/*EDITMODE-END*/;

const M_TABS = [
  { k:'home',     l:'Genel',    ico:'grid' },
  { k:'members',  l:'Üyeler',   ico:'users' },
  { k:'checkin',  l:'Check-In', ico:'scan' },
  { k:'whatsapp', l:'WhatsApp', ico:'chat', badge:'37' },
];

/* ───────────────── shell (logged-in app) ───────────────── */
function AppShell() {
  const store = useStore();
  const { members, profile, addMember, updateMember, deleteMember, notifRead } = store;
  const [tab,setTab] = mS('home');
  const [detail,setDetail] = mS(null);
  const [sheet,setSheet] = mS(null);          // 'search' | 'notif' | 'profile' | 'add'
  const [editing,setEditing] = mS(null);      // member being edited
  const [deleting,setDeleting] = mS(null);    // member being deleted

  const owner = (profile && profile.ownerName) || 'Mert';
  const M_HEAD = {
    home:     { eyebrow:'Hoş geldin, ' + owner, title:'TRAX' },
    members:  { eyebrow:'Üye yönetimi', title:'Üyeler', count: members.length },
    checkin:  { eyebrow:'Hızlı giriş', title:'Check-In' },
    whatsapp: { eyebrow:'Toplu mesaj', title:'WhatsApp' },
  };
  const h = M_HEAD[tab] || M_HEAD.home;
  const tabIndex = Math.max(0, M_TABS.findIndex(t=>t.k===tab));
  const openMember = (id) => { setDetail(id); };

  return (
    <div className="phone">
      {detail !== null ? (
        <DetailScreen id={detail} back={()=>setDetail(null)}
          onEdit={(m)=>setEditing(m)} onDelete={(m)=>setDeleting(m)} />
      ) : (
        <>
          <div className="m-head">
            <div style={{minWidth:0}}>
              <div className="eyebrow">{h.eyebrow}</div>
              <div className="title-row">
                <h1>{tab==='home' ? <>TRA<b>X</b></> : h.title}</h1>
                {h.count!=null && <span className="count-chip tnum">{h.count} üye</span>}
              </div>
            </div>
            <div className="actions">
              <button className="m-iconbtn" onClick={()=>setSheet('search')} aria-label="Ara"><Icon name="search" size={18} /></button>
              <button className="m-iconbtn" onClick={()=>setSheet('notif')} aria-label="Bildirimler"><Icon name="bell" size={18} />{!notifRead && <span className="dot"></span>}</button>
              <button className="m-iconbtn av-btn" onClick={()=>setSheet('profile')} aria-label="Profil">{DD.initials((profile&&profile.salonName)||'TRAX')}</button>
            </div>
          </div>

          <div className={'m-screen'+(tab==='members'?' flush':'')}>
            {tab==='home'     && <HomeScreen go={setTab} open={openMember} owner={owner} />}
            {tab==='members'  && <MembersScreen open={openMember} />}
            {tab==='checkin'  && <CheckInScreen />}
            {tab==='whatsapp' && <WhatsAppScreen />}
          </div>

          {/* FAB — yalnızca Üyeler */}
          {tab==='members' && (
            <button className="fab" onClick={()=>setSheet('add')} aria-label="Üye ekle">
              <Icon name="plus" size={24} stroke={2.4} />
            </button>
          )}

          <div className="m-scrim"></div>
          <nav className="m-nav">
            <span className="nav-ind" style={{'--i':tabIndex}}></span>
            {M_TABS.map(t=>(
              <button key={t.k} className={'m-tab'+(tab===t.k?' on':'')} onClick={()=>setTab(t.k)}>
                <Icon name={t.ico} size={22} stroke={tab===t.k?2.2:1.8} />
                {t.badge && <span className="badge">{t.badge}</span>}
              </button>
            ))}
          </nav>
        </>
      )}

      {/* sheets */}
      <SearchSheet open={sheet==='search'} onClose={()=>setSheet(null)} onOpenMember={openMember} />
      <NotifSheet open={sheet==='notif'} onClose={()=>setSheet(null)} onOpenMember={openMember} />
      <ProfileSheet open={sheet==='profile'} onClose={()=>setSheet(null)} />
      <MemberFormSheet open={sheet==='add'} onClose={()=>setSheet(null)} mode="add" onSubmit={(f)=>{ const id=addMember(f); }} />
      <MemberFormSheet open={!!editing} onClose={()=>setEditing(null)} mode="edit" initial={editing}
        onSubmit={(f)=>{ if(editing) updateMember(editing.id, { name:f.name, phone:f.phone, email:f.email, trainer:f.trainer||'—', ...derivePlan(f) }); }} />
      <ConfirmSheet open={!!deleting} onClose={()=>setDeleting(null)} name={deleting&&deleting.name}
        onConfirm={()=>{ if(deleting){ deleteMember(deleting.id); if(detail===deleting.id) setDetail(null); } }} />
    </div>
  );
}

/* ───────────────── root ───────────────── */
function MobileApp() {
  const [tw,setTweak] = useTweaks(M_TWEAKS);
  const store = useStoreValue();

  mE(()=>{
    const r=document.documentElement; const a=M_ACCENTS[tw.accent]||M_ACCENTS['#ff3b43'];
    r.style.setProperty('--acc',tw.accent);
    r.style.setProperty('--acc-rgb',M_ACC_RGB[tw.accent]||'255,59,67');
    r.style.setProperty('--acc-deep',a.deep);
    r.style.setProperty('--acc-dim',a.dim);
    r.style.setProperty('--acc-glow',tw.glow?a.glow:'transparent');
  },[tw.accent,tw.glow]);

  const loggedIn = !!store.session;
  const onboarded = !!store.profile;

  return (
    <StoreCtx.Provider value={store}>
      <div className="stage">
        <IOSDevice dark width={402} height={874}>
          {!loggedIn
            ? <LoginScreen onLogin={store.login} onSignup={()=>store.login('kayit@trax.app')} />
            : !onboarded
              ? <OnboardingScreen email={store.session.email} onComplete={store.completeOnboarding} />
              : <AppShell />}
        </IOSDevice>

        <TweaksPanel>
          <TweakSection label="Marka rengi" />
          <TweakColor label="Vurgu" value={tw.accent} options={['#ff3b43','#ff7a1a','#c8ff1e','#5a8cff']} onChange={(v)=>setTweak('accent',v)} />
          <TweakToggle label="Neon parıltı" value={tw.glow} onChange={(v)=>setTweak('glow',v)} />
        </TweaksPanel>
      </div>
    </StoreCtx.Provider>
  );
}

Object.assign(window, { useStore });
ReactDOM.createRoot(document.getElementById('root')).render(<MobileApp />);
