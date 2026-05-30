/* ============ TRAX — CheckIn, WhatsApp ============ */
const C = window.TRAX;

/* ---------- Check-In ---------- */
function CheckIn({ go }) {
  const [q, setQ] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [feed, setFeed] = useState(C.todayCheckins);

  const results = q.trim()
    ? C.members.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q)).slice(0,4)
    : [];

  const doCheckin = (m) => {
    setConfirmed(m);
    const now = new Date();
    const t = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    setFeed([{ id:m.id, name:m.name, time:t }, ...feed]);
    setQ('');
    setTimeout(()=>setConfirmed(null), 2600);
  };

  return (
    <div className="page" style={{height:'calc(100% - 0px)'}}>
      <div className="checkin-wrap">
        <div className="checkin-stage">
          <div className="bigsearch">
            <Icon name="search" size={26} style={{color:'var(--tx-3)'}} />
            <input autoFocus placeholder="İsim veya telefon ile üye ara…" value={q} onChange={e=>setQ(e.target.value)} />
            <div className="pill neutral"><Icon name="scan" size={14} />QR / Kart</div>
          </div>

          {confirmed ? (
            <div className="ci-confirm">
              <div className="ci-check"><Icon name="check" size={42} stroke={2.6} style={{color:'#0a0a0a'}} /></div>
              <div style={{fontSize:13, letterSpacing:2, textTransform:'uppercase', color:'var(--acc)', fontWeight:700, marginBottom:8}}>Giriş onaylandı</div>
              <div style={{fontSize:30, fontWeight:750, letterSpacing:'-0.5px'}}>{confirmed.name}</div>
              <div className="muted" style={{marginTop:6}}>{confirmed.plan} · Hoş geldin! 💪</div>
              <div className="row" style={{justifyContent:'center', gap:24, marginTop:24}}>
                <div className="kv" style={{alignItems:'center'}}><span className="k">Bugün</span><span className="v tnum">{feed.length}. giriş</span></div>
                <div style={{width:1, height:32, background:'var(--line)'}}></div>
                <div className="kv" style={{alignItems:'center'}}><span className="k">Kalan üyelik</span><span className="v tnum" style={{color: confirmed.daysLeft<7?'var(--warn)':'var(--acc)'}}>{confirmed.daysLeft<0?'Süresi doldu':confirmed.daysLeft+' gün'}</span></div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {results.map(m => (
                <div key={m.id} className="ci-result" onClick={()=> m.status!=='expired' && m.status!=='frozen' ? doCheckin(m) : null}>
                  <Avatar name={m.name} size={52} radius={13} />
                  <div style={{flex:1}}>
                    <div className="row" style={{gap:10}}><span style={{fontSize:18,fontWeight:650}}>{m.name}</span><StatusPill status={m.status} /></div>
                    <div className="muted" style={{fontSize:13, marginTop:3}}>{m.plan} · {m.phone}</div>
                  </div>
                  {m.status==='expired' || m.status==='frozen' ? (
                    <div className="pill bad"><Icon name="ban" size={13} />Giriş engeli</div>
                  ) : (
                    <button className="btn primary"><Icon name="check" size={16} stroke={2.4} />Giriş yap</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'56px 24px',textAlign:'center',border:'1px dashed var(--line-2)',background:'transparent'}}>
              <div style={{width:64,height:64,borderRadius:16,background:'var(--panel-2)',display:'grid',placeItems:'center',marginBottom:18,color:'var(--tx-3)'}}><Icon name="scan" size={30} /></div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:6}}>Giriş için üye arayın</div>
              <div className="muted" style={{fontSize:13.5,maxWidth:300}}>İsim ya da telefon yazın, veya QR kodu / üye kartını okutun.</div>
            </div>
          )}

          <div className="three" style={{marginTop:'auto'}}>
            <MiniStat ico="scan"  label="Bugünkü giriş" v={feed.length} accent />
            <MiniStat ico="users" label="Şu an içeride" v="28" />
            <MiniStat ico="clock" label="Yoğun saat" v="18:00" small />
          </div>
        </div>

        {/* live feed */}
        <div className="card" style={{display:'flex',flexDirection:'column',minHeight:0}}>
          <div className="card-h"><span style={{width:7,height:7,borderRadius:99,background:'var(--ok)',boxShadow:'0 0 8px var(--ok)'}}></span><h3>Bugünkü girişler</h3><span className="more tnum">{feed.length}</span></div>
          <div className="scroll" style={{margin:'0 -6px',padding:'0 6px'}}>
            {feed.map((c,i) => (
              <div key={i} className="feed-item" style={{animation: i===0&&confirmed?'fadeUp .4s':'none'}}>
                <Avatar name={c.name} size={34} />
                <div style={{fontSize:13.5,fontWeight:600}}>{c.name}</div>
                <div className="feed-time">{c.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- WhatsApp ---------- */
const WA_TEMPLATES = [
  { id:'renew', name:'Üyelik yenileme hatırlatması', tag:'warn',
    body:(<span>Merhaba <b>{'{isim}'}</b>! TRAX üyeliğinin bitmesine <b>{'{kalan}'}</b> gün kaldı. Yenilemek için stüdyoya uğrayabilir veya bu mesaja yanıt verebilirsin. 💪</span>) },
  { id:'winback', name:'Geri kazanım (süresi dolmuş)', tag:'bad',
    body:(<span>Seni özledik <b>{'{isim}'}</b>! Üyeliğin <b>{'{tarih}'}</b> tarihinde sona erdi. Bu hafta dönersen ilk aya <b>%20 indirim</b> hediye. 🎁</span>) },
  { id:'welcome', name:'Hoş geldin mesajı', tag:'ok',
    body:(<span>TRAX ailesine hoş geldin <b>{'{isim}'}</b>! Antrenman programın için resepsiyondan randevu alabilirsin. İyi antrenmanlar! 🔥</span>) },
];

function WhatsApp() {
  const [tmpl, setTmpl] = useState('renew');
  const targets = C.members.filter(m => m.status==='expiring' || m.status==='expired');
  const [sel, setSel] = useState(() => new Set(targets.filter(t=>t.status==='expiring').map(t=>t.id)));
  const [sent, setSent] = useState(false);

  const toggle = (id) => { const n = new Set(sel); n.has(id)?n.delete(id):n.add(id); setSel(n); setSent(false); };
  const active = WA_TEMPLATES.find(t=>t.id===tmpl);

  return (
    <div className="page">
      <div className="wa-grid">
        <div style={{display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
          <div className="card">
            <div className="card-h"><h3>Mesaj şablonu seç</h3></div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {WA_TEMPLATES.map(t => (
                <div key={t.id} className={'tmpl'+(tmpl===t.id?' on':'')} onClick={()=>{setTmpl(t.id);setSent(false);}}>
                  <div className="row" style={{gap:10}}>
                    <span className={'pill '+t.tag}><span className="d"></span></span>
                    <span style={{fontWeight:600,fontSize:14}}>{t.name}</span>
                    {tmpl===t.id && <Icon name="check" size={16} style={{marginLeft:'auto',color:'var(--acc)'}} stroke={2.4} />}
                  </div>
                  {tmpl===t.id && <div className="preview">{t.body}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* recipients */}
        <div className="card" style={{display:'flex',flexDirection:'column'}}>
          <div className="card-h">
            <Icon name="whatsapp" size={18} style={{color:'var(--ok)'}} />
            <h3>Alıcılar</h3>
            <span className="more tnum" onClick={()=>setSel(sel.size===targets.length?new Set():new Set(targets.map(t=>t.id)))}>
              {sel.size===targets.length?'Hiçbiri':'Tümü'}
            </span>
          </div>
          <div className="scroll" style={{margin:'0 -4px',padding:'0 4px',maxHeight:340}}>
            {targets.map(m => (
              <div key={m.id} className="wa-recipient" onClick={()=>toggle(m.id)}>
                <div className={'check'+(sel.has(m.id)?' on':'')}>{sel.has(m.id) && <Icon name="check" size={13} stroke={3} style={{color:'#0a0a0a'}} />}</div>
                <Avatar name={m.name} size={32} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13.5,fontWeight:600}}>{m.name}</div>
                  <div className="muted" style={{fontSize:12}}>{m.daysLeft<0?`${Math.abs(m.daysLeft)} gün geçti`:`${m.daysLeft} gün kaldı`}</div>
                </div>
                <StatusPill status={m.status} />
              </div>
            ))}
          </div>
          <div className="divider"></div>
          {sent ? (
            <div className="row" style={{justifyContent:'center',gap:10,color:'var(--ok)',fontWeight:600,padding:'4px 0'}}>
              <Icon name="check" size={18} stroke={2.4} />{sel.size} mesaj kuyruğa alındı
            </div>
          ) : (
            <button className="btn primary" style={{width:'100%',padding:'13px'}} disabled={sel.size===0} onClick={()=>setSent(true)}>
              <Icon name="send" size={16} />{sel.size} kişiye gönder
            </button>
          )}
          <div className="muted" style={{fontSize:11.5,textAlign:'center',marginTop:10}}>Mesajlar onaylı WhatsApp Business hattından iletilir.</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CheckIn, WhatsApp });
