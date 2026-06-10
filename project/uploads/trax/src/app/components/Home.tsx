import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf, toKey, toDow, getWeek } from '../utils';
import { colorFor, initials } from '../data';
import type { TabKey } from '../types';
import Icon from './Icon';

interface HomeProps {
  go: (tab: TabKey) => void;
  open: (id: number) => void;
  owner: string;
}

export default function Home({ go, open }: HomeProps) {
  const { members, attendanceLog } = useStore();
  const t = useT();

  const today    = new Date();
  const todayKey = toKey(today);
  const week     = getWeek(today);

  // real weekly counts from attendance log
  const counts   = week.map(d => (attendanceLog[toKey(d)] || []).length);
  const todayIdx = week.findIndex(d => toKey(d) === todayKey);
  const todayCount = counts[todayIdx] ?? 0;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yCount = (attendanceLog[toKey(yesterday)] || []).length;
  const delta  = todayCount - yCount;

  const scheduled = members.filter(m => m.status !== 'frozen' && (m.days || []).includes(toDow(today))).length;
  const weekTotal = counts.reduce((a, b) => a + b, 0);
  const activeCount = members.filter(m => { const g = glowOf(m); return g === 's-green' || g === 's-yellow'; }).length;
  const renewCount  = members.filter(m => { const g = glowOf(m); return g === 's-red' || g === 's-yellow'; }).length;

  const maxV = Math.max(...counts, 1);
  const busiestIdx = counts.indexOf(Math.max(...counts));
  const busiestLbl = weekTotal > 0 ? t.busiest(t.days7[busiestIdx]) : '';

  // recent check-ins derived from attendance log (latest first)
  const recent: { name: string; when: string }[] = [];
  for (let off = 0; off < 7 && recent.length < 4; off++) {
    const d = new Date(today);
    d.setDate(today.getDate() - off);
    const ids = [...(attendanceLog[toKey(d)] || [])].reverse();
    for (const id of ids) {
      if (recent.length >= 4) break;
      const m = members.find(x => x.id === id);
      if (m) recent.push({
        name: m.name,
        when: off === 0 ? t.todayLbl : off === 1 ? t.yesterdayLbl : `${d.getDate()} ${t.months12s[d.getMonth()]}`,
      });
    }
  }

  const soon = members
    .filter(m => glowOf(m) === 's-yellow' || glowOf(m) === 's-red')
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return (
    <div className="fade">
      {/* hero */}
      <div className="hero">
        <div className="h-row">
          <span className="h-live"><i />{t.liveToday}</span>
          <span className="h-date">{t.dateLong(t.daysFull[toDow(today)], today.getDate(), t.months12[today.getMonth()])}</span>
        </div>
        <div className="h-main">
          <div>
            <div className="h-val tnum">{todayCount}</div>
            <div className="h-label">
              {t.entries}
              {delta !== 0 && <span className="h-delta">{delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}</span>}
              {' '}· {t.scheduledToday(scheduled)}
            </div>
          </div>
          <div className="h-spark">
            {counts.map((v, i) => (
              <i key={i} className={i === todayIdx ? 'dim' : ''} style={{ height: (v / maxV * 100) + '%' }} />
            ))}
          </div>
        </div>
        <div className="h-foot">
          <div className="hf"><div className="v tnum">{activeCount}</div><div className="l">{t.activeMembers}</div></div>
          <div className="sep" />
          <div className="hf"><div className="v tnum">{weekTotal}</div><div className="l">{t.thisWeek}</div></div>
          <div className="sep" />
          <div className="hf"><div className="v tnum">{renewCount}</div><div className="l">{t.renewal}</div></div>
        </div>
      </div>

      {/* week chart */}
      <div className="section-h">
        <h2>{t.weeklyChart}</h2>
        {busiestLbl && <span className="link tnum">{busiestLbl}</span>}
      </div>
      <div className="card">
        <div className="mchart">
          {counts.map((v, i) => (
            <div key={i} className={'col' + (i === todayIdx ? ' today' : '')}>
              <div className="stack" style={{ height: (v / maxV * 100) + '%' }} />
              <div className="lbl">{t.days7[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* renewals due */}
      <div className="section-h">
        <h2>{t.renewalDue}</h2>
        <span className="link" onClick={() => go('members')}>{t.seeAll}</span>
      </div>
      <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {soon.map(m => {
          const g = glowOf(m);
          const c = g === 's-red' ? 'var(--bad)' : 'var(--warn)';
          return (
            <div key={m.id} className="mini-row" onClick={() => open(m.id)}>
              <div className="av" style={{ width: 34, height: 34, fontSize: 13, background: colorFor(m.name) }}>
                {initials(m.name)}
              </div>
              <div>
                <div className="nm">{m.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{m.plan}</div>
              </div>
              <span className="kln tnum" style={{ color: c }}>{t.kalan(m)}</span>
            </div>
          );
        })}
        {soon.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>
            {t.noRenewals}
          </div>
        )}
      </div>

      {/* activity */}
      <div className="section-h"><h2>{t.recentAct}</h2></div>
      <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {recent.map((a, i) => (
          <div key={i} className="feed">
            <div className="ic acc">
              <Icon name="scan" size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5 }}>
                <b style={{ fontWeight: 650 }}>{a.name}</b>{' '}
                <span className="muted">{t.checkedIn.toLowerCase()}</span>
              </div>
            </div>
            <div className="t tnum">{a.when}</div>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>
            {t.noActivity}
          </div>
        )}
      </div>
    </div>
  );
}
