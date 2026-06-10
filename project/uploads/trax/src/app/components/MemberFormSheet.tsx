import { useState, useEffect } from 'react';
import { useT } from '../i18n';
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

const BLANK: MemberFormData = { name: '', phone: '', email: '', plan: 'Aylık', trainer: '', date: defDate(), adet: '10', days: [] };

export default function MemberFormSheet({ open, onClose, initial, onSubmit, mode }: MemberFormSheetProps) {
  const t = useT();
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
        days: initial.days || [],
      });
    } else {
      setF({ ...BLANK, date: defDate() });
    }
  }, [open, initial]);

  const upd = <K extends keyof MemberFormData>(k: K, v: MemberFormData[K]) => setF(p => ({ ...p, [k]: v }));
  const valid = f.name.trim().length > 1 && f.phone.trim().length > 5 && (f.plan === 'Aylık' ? !!f.date : Number(f.adet) > 0);

  return (
    <Sheet open={open} onClose={onClose}
      eyebrow={mode === 'edit' ? t.editEyebrow : t.newMemberEyebrow}
      title={mode === 'edit' ? (f.name || t.addMemberTitle) : t.addMemberTitle}>
      <Fld label={t.fullNameLbl} icon="user" value={f.name} onChange={v => upd('name', v)} placeholder={t.fullNameLbl} autoFocus />
      <Fld label={t.phoneLbl} icon="phone" type="tel" value={f.phone} onChange={v => upd('phone', v)} placeholder="05__ ___ __ __" />
      <Fld label={t.emailLbl} icon="mail" type="email" value={f.email} onChange={v => upd('email', v)} placeholder="ornek@mail.com" opt />

      <div className="fld">
        <span className="fld-l">{t.planLbl}</span>
        <div className="seg">
          {([['Aylık', 'calendar', t.monthlyPlan], ['Paket', 'card', t.packagePlan]] as const).map(([p, ic, lbl]) => (
            <button key={p} type="button" className={'seg-opt' + (f.plan === p ? ' on' : '')} onClick={() => upd('plan', p)}>
              <Icon name={ic} size={15} />{lbl}
            </button>
          ))}
        </div>
      </div>

      {f.plan === 'Aylık'
        ? <Fld label={t.expiryLbl} icon="calendar" type="date" value={f.date} onChange={v => upd('date', v)} />
        : <Fld label={t.sessionsLbl} icon="dumbbell" type="number" value={f.adet} onChange={v => upd('adet', v)} placeholder="10" />}

      <Fld label={t.trainerOptLbl} icon="award" value={f.trainer} onChange={v => upd('trainer', v)} placeholder="—" opt />

      <div className="fld">
        <span className="fld-l">{t.scheduleDaysLbl} <span className="opt">{t.optional}</span></span>
        <div className="dayspick">
          {t.days7.map((d, i) => (
            <button key={i} type="button"
              className={'daychip' + (f.days.includes(i) ? ' on' : '')}
              onClick={() => upd('days', f.days.includes(i) ? f.days.filter(x => x !== i) : [...f.days, i].sort())}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <button className="btn primary" style={{ marginTop: 18 }} disabled={!valid}
        onClick={() => { onSubmit(f); onClose(); }}>
        <Icon name={mode === 'edit' ? 'check' : 'userplus'} size={17} stroke={2.2} />
        {mode === 'edit' ? t.saveChangesBtn : t.saveMemberBtn}
      </button>
    </Sheet>
  );
}
