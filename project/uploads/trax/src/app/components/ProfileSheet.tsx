import { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { Profile } from '../types';
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
  const { profile, updateProfile, logout, members } = useStore();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Profile | null>(profile);

  useEffect(() => { if (open) { setEdit(false); setF(profile); } }, [open, profile]);

  const save = () => { if (f) { updateProfile(f); } setEdit(false); };

  if (!profile) return null;

  return (
    <Sheet open={open} onClose={onClose} eyebrow="İşletme hesabı"
      title={edit ? 'Bilgileri düzenle' : profile.salonName}>
      {edit && f ? (
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
            <div className="prof-av">{initials(profile.salonName)}</div>
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
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setEdit(true)}>
            <Icon name="edit" size={15} />Bilgileri düzenle
          </button>
          <button className="btn danger" style={{ marginTop: 10 }} onClick={logout}>
            <Icon name="logout" size={16} />Çıkış yap
          </button>
        </>
      )}
    </Sheet>
  );
}
