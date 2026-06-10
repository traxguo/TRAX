import { useState } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { colorFor, initials } from '../data';
import Icon from './Icon';
import QRScanner from './QRScanner';
import Empty from './Empty';

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

// JS: 0=Sun,1=Mon... → our: 0=Mon...6=Sun
function toDow(d: Date) {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

export default function CheckIn() {
  const [tab, setTab] = useState<'calendar' | 'qr'>('calendar');
  const { members, attendanceLog, toggleAttendance, addDayToMember, removeDayFromMember } = useStore();
  const t = useT();
  const DAYS   = t.days7;
  const MONTHS = t.months12;
  const today    = new Date();
  const todayKey = toKey(today);
  const [selKey,   setSelKey]   = useState<string>(todayKey);
  const [editMode, setEditMode] = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);
  const week = getWeek(today);

  const isAll    = selKey === 'all';
  const selDate  = isAll ? today : (week.find(d => toKey(d) === selKey) || today);
  const selDow   = toDow(selDate);
  const ciDate   = isAll ? todayKey : selKey;
  const attended = attendanceLog[ciDate] || [];
  const isFuture = !isAll && selKey > todayKey;

  const nonFrozen = members.filter(m => m.status !== 'frozen');
  const visible   = isAll ? nonFrozen : nonFrozen.filter(m => (m.days || []).includes(selDow));
  const addable   = isAll ? [] : nonFrozen.filter(m => !(m.days || []).includes(selDow));

  const dayIdx  = isAll ? -1 : week.findIndex(d => toKey(d) === selKey);
  const dayName = isAll ? 'Tüm Hafta' : (DAYS[dayIdx] ?? '');
  const dateStr = isAll ? '' : `${selDate.getDate()} ${MONTHS[selDate.getMonth()]}`;

  function selectDay(k: string) {
    setSelKey(k);
    setEditMode(false);
    setShowAdd(false);
  }

  return (
    <div className="fade">

      {/* ── Tab switcher ── */}
      <div className="ci-tab-bar">
        <button className={'ci-tab-btn' + (tab === 'calendar' ? ' on' : '')} onClick={() => setTab('calendar')}>
          <Icon name="calendar" size={14} />{t.calTab}
        </button>
        <button className={'ci-tab-btn' + (tab === 'qr' ? ' on' : '')} onClick={() => setTab('qr')}>
          <Icon name="scan" size={14} />{t.qrTab}
        </button>
      </div>

      {tab === 'qr' && <QRScanner />}
      {tab === 'calendar' && <>

      {/* ── Weekly strip ── */}
      <div className="week-strip">
        <button
          className={'wday wday-all' + (isAll ? ' on' : '')}
          onClick={() => selectDay('all')}
        >
          <span className="wday-lbl">{t.allWeekLbl}</span>
          <span className="wday-all-sub">{t.weekLbl}</span>
        </button>

        {week.map((d, i) => {
          const k      = toKey(d);
          const isSel  = k === selKey;
          const isToday = k === todayKey;
          const isFut  = k > todayKey;
          const cls = ['wday', isSel ? 'on' : '', isFut ? 'fut' : '', isToday ? 'today' : ''].filter(Boolean).join(' ');
          return (
            <button key={k} className={cls} onClick={() => selectDay(k)}>
              <span className="wday-lbl">{DAYS[i]}</span>
              <span className="wday-num">{d.getDate()}</span>
              {isToday && <span className="wday-dot" />}
            </button>
          );
        })}
      </div>

      {/* ── Day header ── */}
      <div className="ci-head">
        <div>
          {dateStr && <div className="ci-dayname">{dayName}</div>}
          <div className="ci-date">{dateStr || dayName}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="count-chip tnum" style={{ transform:'none' }}>
            {t.entryCount(attended.length)}
          </span>
          {!isAll && !isFuture && (
            <button
              className={'m-iconbtn' + (editMode ? ' danger' : '')}
              style={{ width:36, height:36, borderRadius:11 }}
              onClick={() => { setEditMode(e => !e); setShowAdd(false); }}
              aria-label={t.editSchedule}
            >
              <Icon name={editMode ? 'x' : 'edit'} size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Member list ── */}
      <div className="card" style={{ paddingTop:4, paddingBottom:4 }}>

        {visible.length === 0 && !editMode && <Empty ico="calendar" text={t.noSchedule} />}

        {visible.map(m => {
          const came = attended.includes(m.id);
          return (
            <div key={m.id} className="ci-row">
              {editMode && (
                <button
                  className="ci-remove-btn"
                  onClick={() => removeDayFromMember(m.id, selDow)}
                  aria-label="Günden çıkar"
                >
                  <Icon name="x" size={12} stroke={2.6} />
                </button>
              )}
              <div
                className="av"
                style={{ width:40, height:40, borderRadius:12, background:colorFor(m.name), fontSize:14, flexShrink:0 }}
              >
                {initials(m.name)}
              </div>
              <div className="ci-info">
                <div className="ci-name">{m.name}</div>
                {m.trainer !== '—' && <div className="ci-sub">{m.trainer}</div>}
              </div>
              {!editMode && (
                isFuture
                  ? <span className="ci-fut">—</span>
                  : (
                    <button
                      className={'ci-toggle' + (came ? ' on' : '')}
                      onClick={() => toggleAttendance(ciDate, m.id)}
                    >
                      {came
                        ? <><Icon name="check" size={13} stroke={2.8} />{t.attended}</>
                        : <>✕ {t.absent}</>
                      }
                    </button>
                  )
              )}
            </div>
          );
        })}

        {/* ── Add member section (edit mode only) ── */}
        {editMode && addable.length > 0 && (
          <>
            <button className="ci-add-toggle" onClick={() => setShowAdd(s => !s)}>
              <span className="ci-add-ic"><Icon name="plus" size={14} stroke={2.4} /></span>
              <span>{t.addToSchedule}</span>
              <span style={{ marginLeft:'auto', fontSize:18, color:'var(--tx-3)', lineHeight:1 }}>
                {showAdd ? '−' : '+'}
              </span>
            </button>

            {showAdd && addable.map(m => (
              <div key={m.id} className="ci-row ci-addable-row">
                <div
                  className="av"
                  style={{ width:38, height:38, borderRadius:11, background:colorFor(m.name), fontSize:13, opacity:.65, flexShrink:0 }}
                >
                  {initials(m.name)}
                </div>
                <div className="ci-info" style={{ opacity:.7 }}>
                  <div className="ci-name">{m.name}</div>
                </div>
                <button className="ci-add-chip" onClick={() => addDayToMember(m.id, selDow)}>
                  <Icon name="plus" size={12} stroke={2.4} />{t.addBtn}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      </>}
    </div>
  );
}
