/* ============ TRAX mobile — bottom sheets & forms ============ */
const { useState: sS, useEffect: sE, useMemo: sM } = React;
/* D, glowOf, kalanText, PLAN_LEN come from earlier-loaded scripts (shared scope) */

/* ───────────────── Sheet primitive ───────────────── */
function Sheet({ open, onClose, title, eyebrow, children, footer }) {
  const [vis, setVis] = sS(false);
  sE(() => { if (open) { const r = setTimeout(() => setVis(true), 20); return () => clearTimeout(r); } setVis(false); }, [open]);
  if (!open) return null;
  const close = () => { setVis(false); setTimeout(onClose, 230); };
  return (
    <div className={'sheet-wrap' + (vis ? ' in' : '')}>
      <div className="sheet-backdrop" onClick={close}></div>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grip"></div>
        <div className="sheet-head">
          <div>
            {eyebrow && <div className="sheet-eyebrow">{eyebrow}</div>}
            <div className="sheet-title">{title}</div>
          </div>
          <button className="m-iconbtn" onClick={close} aria-label="Kapat"><Icon name="x" size={18} /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ───────────────── Arama ───────────────── */
function SearchSheet({ open, onClose, onOpenMember }) {
  const { members } = useStore();
  const [q, setQ] = sS('');
  sE(() => { if (open) setQ(''); }, [open]);
  const res = q.trim()
    ? members.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q) || (m.email||'').toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : members.slice().sort((a,b)=>a.daysLeft-b.daysLeft).slice(0, 6);
  return (
    <Sheet open={open} onClose={onClose} eyebrow="Hızlı arama" title="Üye ara">
      <div className="m-search big" style={{ marginBottom: 14 }}>
        <Icon name="search" size={20} style={{ color: 'var(--tx-3)' }} />
        <input autoFocus placeholder="İsim, telefon veya e-posta…" value={q} onChange={e => setQ(e.target.value)} />
        {q && <button className="fld-eye" onClick={() => setQ('')}><Icon name="x" size={16} /></button>}
      </div>
      {!q && <div className="sheet-label">Yenilemesi yakın</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {res.map(m => {
          const g = glowOf(m); const c = g==='s-red'?'var(--bad)':g==='s-yellow'?'var(--warn)':g==='s-frozen'?'var(--tx-2)':'var(--ok)';
          return (
            <div key={m.id} className="srow" onClick={() => { onOpenMember(m.id); onClose(); }}>
              <div className="av" style={{ width: 40, height: 40, fontSize: 14, background: D.colorFor(m.name) }}>{D.initials(m.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 650 }}>{m.name}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>{m.plan}</div>
              </div>
              <span className="tnum" style={{ color: c, fontSize: 12.5, fontWeight: 650 }}>{kalanText(m)}</span>
            </div>
          );
        })}
        {q && res.length === 0 && <div className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>“{q}” için sonuç yok.</div>}
      </div>
    </Sheet>
  );
}

/* ───────────────── Bildirimler ───────────────── */
function NotifSheet({ open, onClose, onOpenMember }) {
  const { members, notifRead, markNotifsRead } = useStore();
  sE(() => { if (open) { const t = setTimeout(markNotifsRead, 900); return () => clearTimeout(t); } }, [open]);
  const items = sM(() => {
    const out = [];
    members.forEach(m => {
      const g = glowOf(m);
      if (g === 's-red') out.push({ id: 'r' + m.id, mid: m.id, ico: 'clock', tone: 'bad', t: `${m.name} üyeliği doldu`, s: `${Math.abs(m.daysLeft)} gün geçti · ${m.plan}` });
      else if (g === 's-yellow') out.push({ id: 'y' + m.id, mid: m.id, ico: 'clock', tone: 'warn', t: `${m.name} yenilemeli`, s: `${m.daysLeft} gün kaldı · ${m.plan}` });
    });
    D.activity.filter(a => a.type === 'join').forEach((a, i) => out.push({ id: 'j' + i, ico: 'userplus', tone: 'acc', t: `${a.who} kaydoldu`, s: `${a.text} · ${a.time}` }));
    return out.sort((a, b) => (a.tone === 'bad' ? -1 : 1));
  }, [members]);
  return (
    <Sheet open={open} onClose={onClose} eyebrow="Bugün" title="Bildirimler"
      footer={!notifRead && items.length > 0 ? <button className="btn" onClick={markNotifsRead}>Tümünü okundu işaretle</button> : null}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(n => (
          <div key={n.id} className="nrow" onClick={() => { if (n.mid) { onOpenMember(n.mid); onClose(); } }} style={{ cursor: n.mid ? 'pointer' : 'default' }}>
            <div className={'nic ' + n.tone}><Icon name={n.ico} size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.t}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{n.s}</div>
            </div>
            {n.mid && <Icon name="chev" size={15} style={{ color: 'var(--tx-3)' }} />}
          </div>
        ))}
        {items.length === 0 && <div className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>Yeni bildirim yok 🎉</div>}
      </div>
    </Sheet>
  );
}

/* ───────────────── Profil / İşletme ───────────────── */
function ProfileSheet({ open, onClose }) {
  const { profile, updateProfile, logout, members } = useStore();
  const [edit, setEdit] = sS(false);
  const [f, setF] = sS(profile);
  sE(() => { if (open) { setEdit(false); setF(profile); } }, [open, profile]);
  const save = () => { updateProfile(f); setEdit(false); };
  return (
    <Sheet open={open} onClose={onClose} eyebrow="İşletme hesabı" title={edit ? 'Bilgileri düzenle' : profile.salonName}>
      {edit ? (
        <>
          <Fld label="Salon adı" icon="bolt" value={f.salonName} onChange={v => setF({ ...f, salonName: v })} />
          <Fld label="İşletme ünvanı" icon="store" value={f.businessName} onChange={v => setF({ ...f, businessName: v })} />
          <Fld label="Yetkili adı" icon="user" value={f.ownerFull} onChange={v => setF({ ...f, ownerFull: v, ownerName: v.split(' ')[0] })} />
          <Fld label="Şehir" icon="pin" value={f.city} onChange={v => setF({ ...f, city: v })} />
          <div className="row" style={{ gap: 10, marginTop: 16 }}>
            <button className="btn" onClick={() => { setEdit(false); setF(profile); }}>Vazgeç</button>
            <button className="btn primary" onClick={save}><Icon name="check" size={16} stroke={2.4} />Kaydet</button>
          </div>
        </>
      ) : (
        <>
          <div className="prof-hero">
            <div className="prof-av">{D.initials(profile.salonName)}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 740 }}>{profile.salonName}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{profile.businessName}</div>
            </div>
          </div>
          <div className="kv-list">
            <KV ico="user" k="Yetkili" v={profile.ownerFull || profile.ownerName} />
            <KV ico="mail" k="E-posta" v={profile.email} />
            {profile.city && <KV ico="pin" k="Şehir" v={profile.city} />}
            <KV ico="users" k="Toplam üye" v={members.length + ' kişi'} />
          </div>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setEdit(true)}><Icon name="edit" size={15} />Bilgileri düzenle</button>
          <button className="btn danger" style={{ marginTop: 10 }} onClick={logout}><Icon name="logout" size={16} />Çıkış yap</button>
        </>
      )}
    </Sheet>
  );
}

function KV({ ico, k, v }) {
  return (
    <div className="kvr">
      <div className="kvi"><Icon name={ico} size={15} /></div>
      <div className="kvk">{k}</div>
      <div className="kvv">{v}</div>
    </div>
  );
}

/* ───────────────── Form field ───────────────── */
function Fld({ label, icon, value, onChange, placeholder, type = 'text', opt, autoFocus }) {
  return (
    <label className="fld">
      <span className="fld-l">{label}{opt && <span className="opt">opsiyonel</span>}</span>
      <div className="fld-in">
        <Icon name={icon} size={17} />
        <input type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)} />
      </div>
    </label>
  );
}

/* ───────────────── Üye ekle / düzenle ───────────────── */
function MemberFormSheet({ open, onClose, initial, onSubmit, mode }) {
  const defDate = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const blank = { name: '', phone: '', email: '', plan: 'Aylık', trainer: '', date: defDate(), adet: '10' };
  const [f, setF] = sS(blank);
  sE(() => {
    if (!open) return;
    if (initial) {
      const isPaket = initial.kind === 'paket' || initial.plan === 'Paket';
      const dl = typeof initial.daysLeft === 'number' ? initial.daysLeft : 30;
      setF({
        name: initial.name || '', phone: initial.phone || '', email: initial.email || '',
        trainer: initial.trainer && initial.trainer !== '—' ? initial.trainer : '',
        plan: isPaket ? 'Paket' : 'Aylık',
        date: new Date(Date.now() + dl * 864e5).toISOString().slice(0, 10),
        adet: isPaket ? String(initial.adet || 10) : '10',
      });
    } else { setF(blank); }
  }, [open, initial]);
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.name.trim().length > 1 && f.phone.trim().length > 5 && (f.plan === 'Aylık' ? !!f.date : Number(f.adet) > 0);
  return (
    <Sheet open={open} onClose={onClose} eyebrow={mode === 'edit' ? 'Düzenle' : 'Yeni üye'} title={mode === 'edit' ? f.name || 'Üye' : 'Üye ekle'}>
      <Fld label="Ad Soyad" icon="user" value={f.name} onChange={v => upd('name', v)} placeholder="Ad Soyad" autoFocus />
      <Fld label="Telefon" icon="phone" type="tel" value={f.phone} onChange={v => upd('phone', v)} placeholder="05__ ___ __ __" />
      <Fld label="E-posta" icon="mail" type="email" value={f.email} onChange={v => upd('email', v)} placeholder="ornek@mail.com" opt />

      <div className="fld">
        <span className="fld-l">Üyelik Planı</span>
        <div className="seg">
          {[['Aylık', 'calendar'], ['Paket', 'card']].map(([p, ic]) => (
            <button key={p} type="button" className={'seg-opt' + (f.plan === p ? ' on' : '')} onClick={() => upd('plan', p)}>
              <Icon name={ic} size={15} />{p}
            </button>
          ))}
        </div>
      </div>

      {f.plan === 'Aylık'
        ? <Fld label="Üyelik bitiş tarihi" icon="calendar" type="date" value={f.date} onChange={v => upd('date', v)} />
        : <Fld label="Paket adedi (seans)" icon="dumbbell" type="number" value={f.adet} onChange={v => upd('adet', v)} placeholder="10" />}

      <Fld label="Antrenör" icon="award" value={f.trainer} onChange={v => upd('trainer', v)} placeholder="—" opt />
      <button className="btn primary" style={{ marginTop: 18 }} disabled={!valid} onClick={() => { onSubmit(f); onClose(); }}>
        <Icon name={mode === 'edit' ? 'check' : 'userplus'} size={17} stroke={2.2} />{mode === 'edit' ? 'Değişiklikleri kaydet' : 'Üyeyi kaydet'}
      </button>
    </Sheet>
  );
}

/* ───────────────── Silme onayı ───────────────── */
function ConfirmSheet({ open, onClose, name, onConfirm }) {
  return (
    <Sheet open={open} onClose={onClose} eyebrow="Onay" title="Üyeyi sil">
      <div className="confirm-ic"><Icon name="trash" size={26} /></div>
      <p style={{ textAlign: 'center', color: 'var(--tx-2)', fontSize: 14.5, lineHeight: 1.55, margin: '4px 8px 4px' }}>
        <b style={{ color: 'var(--tx)' }}>{name}</b> kalıcı olarak silinecek. Bu işlem geri alınamaz.
      </p>
      <div className="row" style={{ gap: 10, marginTop: 18 }}>
        <button className="btn" onClick={onClose}>Vazgeç</button>
        <button className="btn danger solid" onClick={() => { onConfirm(); onClose(); }}><Icon name="trash" size={16} />Sil</button>
      </div>
    </Sheet>
  );
}

Object.assign(window, { Sheet, SearchSheet, NotifSheet, ProfileSheet, MemberFormSheet, ConfirmSheet, Fld, KV });
