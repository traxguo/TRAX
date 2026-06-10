import { useState } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf } from '../utils';
import { colorFor, initials } from '../data';
import type { Member } from '../types';
import Icon from './Icon';
import Empty from './Empty';

type TemplateId = 'renew' | 'winback' | 'welcome';

export default function WhatsApp() {
  const { members } = useStore();
  const t = useT();
  const [tmpl, setTmpl] = useState<TemplateId>('renew');

  const TEMPLATES = [
    {
      id: 'renew' as TemplateId, name: t.tmplRenewName, tag: 'warn',
      body: <span>{t.tmplRenewBody('{name}', '{kalan}').split('{name}').join('').split('{kalan}').join('')}</span>,
      getText: (m: Member) => t.tmplRenewBody(m.name.split(' ')[0], t.kalan(m)),
    },
    {
      id: 'winback' as TemplateId, name: t.tmplWinback, tag: 'bad',
      body: <span>{t.tmplWinbackBody('{name}')}</span>,
      getText: (m: Member) => t.tmplWinbackBody(m.name.split(' ')[0]),
    },
    {
      id: 'welcome' as TemplateId, name: t.tmplWelcome, tag: 'ok',
      body: <span>{t.tmplWelcomeBody('{name}')}</span>,
      getText: (m: Member) => t.tmplWelcomeBody(m.name.split(' ')[0]),
    },
  ];

  function waUrl(m: Member, getText: (m: Member) => string) {
    const phone = '90' + m.phone.replace(/\D/g, '').replace(/^0/, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(getText(m))}`;
  }
  const targets = members.filter(m => glowOf(m) === 's-red' || glowOf(m) === 's-yellow');
  const [sel, setSel] = useState<Set<number>>(() => new Set(targets.filter(t => glowOf(t) === 's-yellow').map(t => t.id)));
  const [sentIdx, setSentIdx] = useState(-1);

  const toggle = (id: number) => {
    setSel(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setSentIdx(-1);
  };

  const template = TEMPLATES.find(t => t.id === tmpl)!;
  const queue = targets.filter(m => sel.has(m.id));
  const done = sentIdx >= queue.length - 1 && sentIdx >= 0;

  function sendNext() {
    const idx = sentIdx + 1;
    if (idx >= queue.length) return;
    window.open(waUrl(queue[idx], template.getText), '_blank');
    setSentIdx(idx);
  }

  return (
    <div className="fade">
      <div className="section-h" style={{ marginTop: 8 }}><h2>{t.templateSec}</h2></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} className={'tmpl' + (tmpl === t.id ? ' on' : '')} onClick={() => { setTmpl(t.id); setSentIdx(-1); }}>
            <div className="row">
              <span className={'pill ' + t.tag}><span className="d" /></span>
              <span style={{ fontWeight: 650, fontSize: 14 }}>{t.name}</span>
              {tmpl === t.id && <Icon name="check" size={16} style={{ marginLeft: 'auto', color: 'var(--acc)' }} stroke={2.4} />}
            </div>
            {tmpl === t.id && <div className="preview">{t.body}</div>}
          </div>
        ))}
      </div>

      <div className="section-h">
        <h2>{t.recipientsSec}</h2>
        <span className="link tnum" onClick={() => { setSel(sel.size === targets.length ? new Set() : new Set(targets.map(x => x.id))); setSentIdx(-1); }}>
          {sel.size === targets.length ? t.noneBtn : t.allBtn}
        </span>
      </div>
      <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {targets.map(m => (
          <div key={m.id} className="wa-rec" onClick={() => toggle(m.id)}>
            <div className={'check' + (sel.has(m.id) ? ' on' : '')}>
              {sel.has(m.id) && <Icon name="check" size={13} stroke={3} style={{ color: '#fff' }} />}
            </div>
            <div className="av" style={{ width: 34, height: 34, background: colorFor(m.name), fontSize: 13 }}>
              {initials(m.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{t.kalan(m)}</div>
            </div>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: glowOf(m) === 's-red' ? 'var(--bad)' : 'var(--warn)' }} />
          </div>
        ))}
        {targets.length === 0 && <Empty ico="chat" text={t.noRecipients} />}
      </div>

      {done ? (
        <div className="row" style={{ justifyContent: 'center', gap: 9, color: 'var(--ok)', fontWeight: 650, padding: '18px 0' }}>
          <Icon name="check" size={18} stroke={2.4} />{t.sentMsg(queue.length)}
        </div>
      ) : sentIdx >= 0 ? (
        <button className="btn primary" style={{ marginTop: 18 }} onClick={sendNext}>
          <Icon name="send" size={17} />
          {t.nextBtn(queue[sentIdx + 1]?.name ?? '', sentIdx + 1, queue.length)}
        </button>
      ) : (
        <button className="btn primary" style={{ marginTop: 18 }} disabled={sel.size === 0} onClick={sendNext}>
          <Icon name="send" size={17} />{t.sendNBtn(sel.size)}
        </button>
      )}
    </div>
  );
}
