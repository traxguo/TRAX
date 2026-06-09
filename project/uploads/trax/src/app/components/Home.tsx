import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf } from '../utils';
import { weekVisits, activity, colorFor, initials } from '../data';
import type { TabKey } from '../types';
import Icon from './Icon';

const ACT_ICON: Record<string, string> = {
  checkin: 'scan', payment: 'money', join: 'plus', renew: 'trend',
};

interface HomeProps {
  go: (tab: TabKey) => void;
  open: (id: number) => void;
  owner: string;
}

export default function Home({ go, open }: HomeProps) {
  const { members } = useStore();
  const t = useT();
  const maxV = Math.max(...weekVisits.map(w => w.v));
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
          <span className="h-date">Cumartesi, 30 Mayıs</span>
        </div>
        <div className="h-main">
          <div>
            <div className="h-val tnum">46</div>
            <div className="h-label">
              {t.entries} <span className="h-delta">↑ +12</span> · 28 {t.inside}
            </div>
          </div>
          <div className="h-spark">
            {weekVisits.map((w, i) => (
              <i key={i} className={w.today ? 'dim' : ''} style={{ height: (w.v / maxV * 100) + '%' }} />
            ))}
          </div>
        </div>
        <div className="h-foot">
          <div className="hf"><div className="v tnum">1.142</div><div className="l">{t.activeMembers}</div></div>
          <div className="sep" />
          <div className="hf"><div className="v tnum">₺184K</div><div className="l">{t.monthlyRev}</div></div>
          <div className="sep" />
          <div className="hf"><div className="v tnum">72%</div><div className="l">{t.occupancy}</div></div>
        </div>
      </div>

      {/* secondary stats */}
      <div className="stat-row">
        <div className="statc">
          <div className="row1"><Icon name="trend" size={15} /><span className="l">{t.thisWeek}</span></div>
          <div className="v tnum">583</div>
          <div className="dl up">+6.4% {t.entries}</div>
        </div>
        <div className="statc">
          <div className="row1" style={{ color: 'var(--warn)' }}><Icon name="clock" size={15} /><span className="l muted">{t.renewal}</span></div>
          <div className="v tnum">37</div>
          <div className="dl warn">7 {t.daysLeftN(7).replace('7 ', '')}</div>
        </div>
      </div>

      {/* week chart */}
      <div className="section-h">
        <h2>{t.weeklyChart}</h2>
        <span className="link tnum">{t.busiestDay}</span>
      </div>
      <div className="card">
        <div className="mchart">
          {weekVisits.map((w, i) => (
            <div key={i} className={'col' + (w.today ? ' today' : '')}>
              <div className="stack" style={{ height: (w.v / maxV * 100) + '%' }} />
              <div className="lbl">{w.d}</div>
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
        {activity.slice(0, 4).map((a, i) => (
          <div key={i} className="feed">
            <div className={'ic' + (a.acc ? ' acc' : '')}>
              <Icon name={ACT_ICON[a.type] ?? 'scan'} size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5 }}>
                <b style={{ fontWeight: 650 }}>{a.who}</b>{' '}
                <span className="muted">{a.text}</span>
              </div>
            </div>
            <div className="t tnum">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
