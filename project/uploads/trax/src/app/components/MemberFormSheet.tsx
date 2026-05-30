import { useState, useEffect } from 'react';
import type { Member, MemberFormData } from '../types';
import Sheet from './Sheet';
import Fld from './Fld';
import Icon from './Icon';

interface MemberFormSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Member | null;
  onSubmit: (f: MemberFormData) => void;
  mode: 'add' | 'edit';
}

const defDate = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

const BLANK: MemberFormData = { name: '', phone: '', email: '', plan: 'Aylık', trainer: '', date: defDate(), adet: '10' };

export default function MemberFormSheet({ open, onClose, initial, onSubmit, mode }: MemberFormSheetProps) {
  const [f, setF] = useState<MemberFormData>(BLANK);

  useEffect(() => {
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
    } else {
      setF({ ...BLANK, date: defDate() });
    }
  }, [open, initial]);

  const upd = <K extends keyof MemberFormData>(k: K, v: MemberFormData[K]) => setF(p => ({ ...p, [k]: v }));
  const valid = f.name.trim().length > 1 && f.phone.trim().length > 5 && (f.plan === 'Aylık' ? !!f.date : Number(f.adet) > 0);

  return (
    <Sheet open={open} onClose={onClose}
      eyebrow={mode === 'edit' ? 'Düzenle' : 'Yeni üye'}
      title={mode === 'edit' ? (f.name || 'Üye') : 'Üye ekle'}>
      <Fld label="Ad Soyad" icon="user" value={f.name} onChange={v => upd('name', v)} placeholder="Ad Soyad" autoFocus />
      <Fld label="Telefon" icon="phone" type="tel" value={f.phone} onChange={v => upd('phone', v)} placeholder="05__ ___ __ __" />
      <Fld label="E-posta" icon="mail" type="email" value={f.email} onChange={v => upd('email', v)} placeholder="ornek@mail.com" opt />

      <div className="fld">
        <span className="fld-l">Üyelik Planı</span>
        <div className="seg">
          {([['Aylık', 'calendar'], ['Paket', 'card']] as const).map(([p, ic]) => (
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

      <button className="btn primary" style={{ marginTop: 18 }} disabled={!valid}
        onClick={() => { onSubmit(f); onClose(); }}>
        <Icon name={mode === 'edit' ? 'check' : 'userplus'} size={17} stroke={2.2} />
        {mode === 'edit' ? 'Değişiklikleri kaydet' : 'Üyeyi kaydet'}
      </button>
    </Sheet>
  );
}
