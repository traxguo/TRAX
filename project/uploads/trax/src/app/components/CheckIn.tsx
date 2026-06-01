import { useState } from 'react';
import { useStore } from '../store';
import { colorFor, initials } from '../data';
import Icon from './Icon';

const DAYS  = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getWeek(today: Date): Date[] {
  const dow = today.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + offset);
  mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

export default function CheckIn() {
  const { members, attendanceLog, toggleAttendance } = useStore();
  const today = new Date();
  const todayKey = toKey(today);
  const [selKey, setSelKey] = useState(todayKey);
  const week = getWeek(today);

  const selDate = week.find(d => toKey(d) === selKey) || today;
  const attended = attendanceLog[selKey] || [];
  const isFuture = selKey > todayKey;

  const visible = members.filter(m => m.status !== 'frozen');

  const dayLabel = `${selDate.getDate()} ${MONTHS[selDate.getMonth()]}`;
  const dayName  = DAYS[week.findIndex(d => toKey(d) === selKey)];

  return (
    <div className="fade">

      {/* Weekly strip */}
      <div className="week-strip">
        {week.map((d, i) => {
          const k = toKey(d);
          const isSel   = k === selKey;
          const isToday = k === todayKey;
          const isFut   = k > todayKey;
          return (
            <button
              key={k}
              className={['wday', isSel ? 'on' : '', isFut ? 'fut' : '', isToday ? 'today' : ''].filter(Boolean).join(' ')}
              onClick={() => setSelKey(k)}
            >
              <span className="wday-lbl">{DAYS[i]}</span>
              <span className="wday-num">{d.getDate()}</span>
              {isToday && <span className="wday-dot" />}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div className="ci-head">
        <div>
          <div className="ci-dayname">{dayName}</div>
          <div className="ci-date">{dayLabel}</div>
        </div>
        <span className="count-chip tnum" style={{ transform: 'none' }}>
          {attended.length} giriş
        </span>
      </div>

      {/* Member list */}
      <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {visible.map(m => {
          const came = attended.includes(m.id);
          return (
            <div key={m.id} className="ci-row">
              <div
                className="av"
                style={{ width: 40, height: 40, borderRadius: 12, background: colorFor(m.name), fontSize: 14 }}
              >
                {initials(m.name)}
              </div>
              <div className="ci-info">
                <div className="ci-name">{m.name}</div>
                {m.trainer !== '—' && <div className="ci-sub">{m.trainer}</div>}
              </div>
              {isFuture ? (
                <span className="ci-fut-badge">—</span>
              ) : (
                <button
                  className={'ci-toggle' + (came ? ' on' : '')}
                  onClick={() => toggleAttendance(selKey, m.id)}
                >
                  {came
                    ? <><Icon name="check" size={13} stroke={2.8} />Geldi</>
                    : <span className="ci-x">✕</span>
                  }
                  {!came && <span>Gelmedi</span>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
