import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import type { Profile, Lang } from '../types';
import { initials } from '../data';
import Sheet from './Sheet';
import Fld from './Fld';
import Icon from './Icon';

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

function KV({ ico, k, v }: { ico: string; k: string; v: string }) {
  return (
    <div className="kvr">
      <div className="kvi"><Icon name={ico} size={15} /></div>
      <div className="kvk">{k}</div>
      <div className="kvv">{v}</div>
    </div>
  );
}

export default function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  const { profile, updateProfile, logout, deleteAccount, members, lang, setLang } = useStore();
  const t = useT();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Profile | null>(profile);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState('');

  useEffect(() => { if (open) { setEdit(false); setF(profile); setConfirmDelete(false); setDelErr(''); } }, [open, profile]);

  const doDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      setDelErr(code === 'auth/requires-recent-login' ? t.deleteAccountRelogin : t.deleteAccountErr);
      setDeleting(false);
    }
  };

  const save = () => { if (f) { updateProfile(f); } setEdit(false); };

  if (!profile) return null;

  return (
    <Sheet open={open} onClose={onClose} eyebrow={t.bizAccount}
      title={edit ? t.editInfoTitle : profile.salonName}>
      {edit && f ? (
        <>
          <Fld label={t.salonNameLbl} icon="bolt" value={f.salonName} onChange={v => setF({ ...f, salonName: v })} />
          <Fld label={t.bizNameLbl} icon="store" value={f.businessName} onChange={v => setF({ ...f, businessName: v })} />
          <Fld label={t.authNameLbl} icon="user" value={f.ownerFull} onChange={v => setF({ ...f, ownerFull: v, ownerName: v.split(' ')[0] })} />
          <Fld label={t.cityLbl} icon="pin" value={f.city} onChange={v => setF({ ...f, city: v })} />
          <div className="row" style={{ gap: 10, marginTop: 16 }}>
            <button className="btn" onClick={() => { setEdit(false); setF(profile); }}>{t.cancelBtn}</button>
            <button className="btn primary" onClick={save}><Icon name="check" size={16} stroke={2.4} />{t.saveBtn}</button>
          </div>
        </>
      ) : (
        <>
          <div className="prof-hero">
            <div className="prof-av">{initials(profile.salonName)}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 740 }}>{profile.salonName}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{profile.businessName}</div>
            </div>
          </div>
          <div className="kv-list">
            <KV ico="user" k={t.authorizedLbl} v={profile.ownerFull || profile.ownerName} />
            <KV ico="mail" k={t.emailLbl} v={profile.email} />
            {profile.city && <KV ico="pin" k={t.cityLbl} v={profile.city} />}
            <KV ico="users" k={t.totalMembersLbl} v={members.length + ' ' + t.people} />
          </div>
          <div className="fld" style={{ marginTop: 16 }}>
            <span className="fld-l">{t.languageLbl}</span>
            <div className="seg">
              {(['en', 'tr'] as Lang[]).map(l => (
                <button key={l} type="button" className={'seg-opt' + (lang === l ? ' on' : '')} onClick={() => setLang(l)}>
                  {l === 'en' ? 'English' : 'Türkçe'}
                </button>
              ))}
            </div>
          </div>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setEdit(true)}>
            <Icon name="edit" size={15} />{t.editInfoBtn}
          </button>
          <button className="btn danger" style={{ marginTop: 10 }} onClick={logout}>
            <Icon name="logout" size={16} />{t.logoutBtn}
          </button>

          {!confirmDelete ? (
            <button className="btn" style={{ marginTop: 10, color: 'var(--bad)', borderColor: 'transparent', fontSize: 13 }}
              onClick={() => setConfirmDelete(true)}>
              {t.deleteAccountBtn}
            </button>
          ) : (
            <div style={{ marginTop: 12, background: 'rgba(255,77,82,0.08)', border: '1px solid rgba(255,77,82,0.25)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bad)', marginBottom: 6 }}>{t.deleteAccountTitle}</div>
              <div style={{ fontSize: 12.5, color: 'var(--tx-2)', marginBottom: 12, lineHeight: 1.5 }}>{t.deleteAccountConfirm}</div>
              {delErr && <div style={{ fontSize: 12, color: 'var(--bad)', marginBottom: 10 }}>{delErr}</div>}
              <div className="row" style={{ gap: 8 }}>
                <button className="btn" style={{ flex: 1, fontSize: 13 }} onClick={() => { setConfirmDelete(false); setDelErr(''); }}>
                  {t.cancelBtn}
                </button>
                <button className="btn danger" style={{ flex: 1, fontSize: 13 }} disabled={deleting} onClick={doDeleteAccount}>
                  {deleting ? <span className="spin" /> : t.deleteAccountFinal}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
