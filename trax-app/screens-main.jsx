/* ============ TRAX — Dashboard, Members, MemberDetail ============ */
const { useState, useMemo } = React;
const D = window.TRAX;

/* ---------- Dashboard ---------- */
function Dashboard({ go }) {
  const maxV = Math.max(...D.weekVisits.map(w => w.v));
  const expiring = D.members.filter(m => m.status === 'expiring' || m.status === 'expired')
    .sort((a,b) => a.daysLeft - b.daysLeft).slice(0,5);
  const actIcon = { checkin:'scan', payment:'money', join:'plus', renew:'trend' };

  return (
    <div className="page">
      <div className="stat-grid" style={{marginBottom:'var(--gap)'}}>
        <Stat feat ico="users"    label="Aktif üye"        s={D.stats.active} />
        <Stat      ico="scan"     label="Bugünkü giriş"    s={D.stats.today} />
        <Stat      ico="money"    label="Aylık gelir"      s={D.stats.revenue} />
        <Stat      ico="clock"    label="Yakında bitiyor"  s={D.stats.expiring} warn />
      </div>

      <div className="two-col">
        {/* chart */}
        <div className="card">
          <div className="card-h">
            <h3>Haftalık giriş yoğunluğu</h3>
            <div className="seg" style={{marginLeft:'auto'}}>
              <button className="on">Bu hafta</button>
              <button>Bu ay</button>
            </div>
          </div>
          <div className="chart">
            {D.weekVisits.map((w,i) => (
              <div key={i} className={'col'+(w.today?' muted':'')}>
                <div className="v tnum">{w.v}</div>
                <div className="stack" style={{height:(w.v/maxV*100)+'%'}}></div>
                <div className="lbl">{w.d}</div>
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div className="kv"><span className="k">Haftalık toplam</span><span className="v tnum">583 giriş</span></div>
            <div className="kv"><span className="k">Günlük ortalama</span><span className="v tnum">83</span></div>
            <div className="kv"><span className="k">En yoğun</span><span className="v">Cumartesi</span></div>
            <div className="kv"><span className="k">Doluluk</span><span className="v" style={{color:'var(--acc)'}}>72%</span></div>
          </div>
        </div>

        {/* activity feed */}
        <div className="card">
          <div className="card-h"><h3>Son hareketler</h3><span className="more">Tümü</span></div>
          <div>
            {D.activity.map((a,i) => (
              <div key={i} className="feed-item">
                <div className={'tl-dot'+(a.acc?' acc':'')} style={{width:34,height:34}}>
                  <Icon name={actIcon[a.type]} size={15} />
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.5}}><b style={{fontWeight:600}}>{a.who}</b> <span className="muted">{a.text}</span></div>
                </div>
                <div className="feed-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* expiring memberships */}
      <div className="card" style={{marginTop:'var(--gap)'}}>
        <div className="card-h">
          <Icon name="clock" size={17} style={{color:'var(--warn)'}} />
          <h3>Yenileme bekleyen üyeler</h3>
          <button className="btn sm ghost" style={{marginLeft:'auto'}} onClick={()=>go('whatsapp')}>
            <Icon name="whatsapp" size={15} />Toplu hatırlatma gönder
          </button>
        </div>
        <table className="tbl">
          <thead><tr><th>Üye</th><th>Paket</th><th>Bitiş</th><th>Kalan süre</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {expiring.map(m => (
              <tr key={m.id} onClick={()=>go('member', m.id)}>
                <td><div className="cell-name"><Avatar name={m.name} /><div><div className="nm">{m.name}</div><div className="sub">{m.phone}</div></div></div></td>
                <td>{m.plan}</td>
                <td className="tnum">{m.expires}</td>
                <td>
                  <span className={'tnum'} style={{fontWeight:600, color: m.daysLeft<0?'var(--bad)':m.daysLeft<7?'var(--warn)':'var(--tx)'}}>
                    {m.daysLeft < 0 ? `${Math.abs(m.daysLeft)} gün geçti` : `${m.daysLeft} gün`}
                  </span>
                </td>
                <td><StatusPill status={m.status} /></td>
                <td style={{textAlign:'right'}}><button className="btn sm" onClick={(e)=>{e.stopPropagation();go('whatsapp');}}><Icon name="whatsapp" size={14} />Hatırlat</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ ico, label, s, feat, warn }) {
  return (
    <div className={'stat'+(feat?' feat':'')}>
      <div className="top">
        <div className="ico-box"><Icon name={ico} size={18} /></div>
        <div className="label">{label}</div>
      </div>
      <div className="val tnum">{s.val}</div>
      <div className={'delta '+(s.up?'up':warn?'down':'down')}>
        {s.up && <Icon name="trend" size={13} />}
        {s.delta} {s.note && <span>{s.note}</span>}
      </div>
    </div>
  );
}

/* ---------- Members list ---------- */
function Members({ go, query }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');

  const filters = [
    { k:'all',      l:'Tümü' },
    { k:'active',   l:'Aktif' },
    { k:'expiring', l:'Bitiyor' },
    { k:'expired',  l:'Süresi doldu' },
    { k:'frozen',   l:'Donduruldu' },
  ];

  const list = useMemo(() => {
    let r = D.members.filter(m => filter==='all' || m.status===filter);
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.plan.toLowerCase().includes(q));
    }
    r = [...r].sort((a,b) => {
      if (sort==='name') return a.name.localeCompare(b.name,'tr');
      if (sort==='expires') return a.daysLeft - b.daysLeft;
      if (sort==='visits') return b.visits - a.visits;
      return 0;
    });
    return r;
  }, [filter, sort, query]);

  const counts = D.members.reduce((a,m)=>{a[m.status]=(a[m.status]||0)+1;return a;}, {});

  return (
    <div className="page">
      <div className="between" style={{marginBottom:18}}>
        <div className="chips">
          {filters.map(f => (
            <button key={f.k} className={'chip'+(filter===f.k?' on':'')} onClick={()=>setFilter(f.k)}>
              {f.l}{f.k!=='all' && counts[f.k] ? ` · ${counts[f.k]}` : ''}
            </button>
          ))}
        </div>
        <div className="row">
          <div className="seg">
            <button className={sort==='name'?'on':''} onClick={()=>setSort('name')}>İsim</button>
            <button className={sort==='expires'?'on':''} onClick={()=>setSort('expires')}>Bitiş</button>
            <button className={sort==='visits'?'on':''} onClick={()=>setSort('visits')}>Ziyaret</button>
          </div>
          <button className="btn primary"><Icon name="plus" size={16} />Yeni üye</button>
        </div>
      </div>

      <div className="card" style={{padding:'8px 8px 4px'}}>
        <table className="tbl">
          <thead><tr>
            <th style={{paddingLeft:14}}>Üye</th><th>Paket</th><th>Durum</th><th>Kalan</th>
            <th>Devam</th><th>Son ziyaret</th><th></th>
          </tr></thead>
          <tbody>
            {list.map(m => (
              <tr key={m.id} onClick={()=>go('member', m.id)}>
                <td><div className="cell-name"><Avatar name={m.name} size={36} /><div><div className="nm">{m.name}</div><div className="sub">{m.phone}</div></div></div></td>
                <td>{m.plan}</td>
                <td><StatusPill status={m.status} /></td>
                <td><span className="tnum" style={{fontWeight:600, color: m.daysLeft<0?'var(--bad)':m.daysLeft<7?'var(--warn)':'var(--tx-2)'}}>{m.daysLeft<0?`${Math.abs(m.daysLeft)}g geçti`:`${m.daysLeft}g`}</span></td>
                <td style={{width:120}}>
                  <div className="row" style={{gap:8}}>
                    <div className={'bar'+(m.attendance<50?' bad':m.attendance<70?' warn':'')} style={{flex:1,maxWidth:64}}><i style={{width:m.attendance+'%'}}></i></div>
                    <span className="tnum muted" style={{fontSize:12}}>{m.attendance}%</span>
                  </div>
                </td>
                <td className="muted" style={{fontSize:13}}>{m.lastVisit}</td>
                <td style={{textAlign:'right',paddingRight:14}}><Icon name="more" size={16} style={{color:'var(--tx-3)'}} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length===0 && <div className="empty">Sonuç bulunamadı.</div>}
      </div>
    </div>
  );
}

/* ---------- Member detail ---------- */
function MemberDetail({ id, go }) {
  const m = D.members.find(x => x.id === id) || D.members[0];
  const planLen = { 'Premium Yıllık':365, 'Premium Aylık':30, 'Aylık Standart':30, '3 Aylık':90 }[m.plan] || 30;
  const used = Math.max(0, Math.min(100, Math.round((1 - m.daysLeft/planLen)*100)));
  const history = [
    { ico:'scan',  acc:true, t:'Salona giriş yaptı',        s:m.lastVisit },
    { ico:'money', t:'Ödeme alındı · ₺1.450',  s:'12 May 2026 · Nakit' },
    { ico:'trend', acc:true, t:'Üyelik yenilendi · '+m.plan, s:'12 May 2026' },
    { ico:'scan',  t:'Salona giriş yaptı',                  s:'10 May 2026 · 18:20' },
    { ico:'user',  t:'PT seansı · '+(m.trainer!=='—'?m.trainer:'Mert K.'), s:'08 May 2026 · 07:00' },
    { ico:'plus',  acc:true, t:'Üye kaydı oluşturuldu',     s:m.joined },
  ];

  return (
    <div className="page">
      <button className="btn ghost sm" style={{marginBottom:18}} onClick={()=>go('members')}><Icon name="arrowL" size={15} />Üyeler</button>

      <div className="profile-hero" style={{marginBottom:'var(--gap)'}}>
        <Avatar name={m.name} cls="av-lg" size={null} />
        <div style={{flex:1, zIndex:1}}>
          <div className="row" style={{gap:12, marginBottom:6}}>
            <h2 style={{fontSize:26, fontWeight:750, letterSpacing:'-0.5px'}}>{m.name}</h2>
            <StatusPill status={m.status} />
          </div>
          <div className="row muted" style={{gap:18, fontSize:13.5}}>
            <span className="row" style={{gap:6}}><Icon name="phone" size={14} />{m.phone}</span>
            <span className="row" style={{gap:6}}><Icon name="mail" size={14} />{m.email}</span>
            <span className="row" style={{gap:6}}><Icon name="calendar" size={14} />Üyelik: {m.joined}</span>
          </div>
        </div>
        <div className="row" style={{zIndex:1}}>
          <button className="btn"><Icon name="whatsapp" size={16} />WhatsApp</button>
          <button className="btn"><Icon name="edit" size={15} />Düzenle</button>
          <button className="btn primary"><Icon name="trend" size={16} />Yenile</button>
        </div>
      </div>

      <div className="two-col">
        <div style={{display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
          <div className="three">
            <MiniStat ico="flame"    label="Toplam ziyaret" v={m.visits} />
            <MiniStat ico="trend"    label="Devam oranı"    v={m.attendance+'%'} accent={m.attendance>=70} />
            <MiniStat ico="user"     label="Antrenör"       v={m.trainer} small />
          </div>

          <div className="card">
            <div className="card-h"><h3>Üyelik hareketleri</h3></div>
            <div className="timeline">
              {history.map((h,i) => (
                <div key={i} className="tl-item">
                  <div className={'tl-dot'+(h.acc?' acc':'')}><Icon name={h.ico} size={15} /></div>
                  <div className="tl-body"><div className="t">{h.t}</div><div className="s">{h.s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
          <div className="card">
            <div className="card-h"><Icon name="card" size={17} style={{color:'var(--acc)'}} /><h3>Aktif paket</h3></div>
            <div style={{fontSize:20, fontWeight:700, marginBottom:4}}>{m.plan}</div>
            <div className="muted" style={{fontSize:13, marginBottom:18}}>Bitiş: <span className="tnum">{m.expires}</span></div>
            <div className="between" style={{marginBottom:8, fontSize:12.5}}>
              <span className="muted">Kullanım</span>
              <span className="tnum" style={{fontWeight:600, color: m.daysLeft<0?'var(--bad)':m.daysLeft<7?'var(--warn)':'var(--acc)'}}>
                {m.daysLeft<0?'Süresi doldu':`${m.daysLeft} gün kaldı`}
              </span>
            </div>
            <div className={'bar'+(m.daysLeft<0?' bad':m.daysLeft<7?' warn':'')}><i style={{width:used+'%'}}></i></div>
          </div>

          <div className="card">
            <div className="card-h"><h3>Hızlı işlemler</h3></div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <button className="btn" style={{justifyContent:'flex-start'}}><Icon name="scan" size={16} />Manuel giriş kaydet</button>
              <button className="btn" style={{justifyContent:'flex-start'}}><Icon name="money" size={16} />Ödeme al</button>
              <button className="btn" style={{justifyContent:'flex-start'}}><Icon name="snow" size={16} />Üyeliği dondur</button>
              <button className="btn" style={{justifyContent:'flex-start'}}><Icon name="whatsapp" size={16} />Mesaj gönder</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ ico, label, v, accent, small }) {
  return (
    <div className="card" style={{padding:18}}>
      <div className="row" style={{gap:9, marginBottom:12, color:'var(--tx-2)'}}><Icon name={ico} size={16} /><span style={{fontSize:12.5}}>{label}</span></div>
      <div style={{fontSize: small?20:28, fontWeight:750, letterSpacing:'-0.5px', color: accent?'var(--acc)':'var(--tx)'}} className="tnum">{v}</div>
    </div>
  );
}

Object.assign(window, { Dashboard, Members, MemberDetail });
