import { useState } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf, waPhone, fillTmpl } from '../utils';
import { colorFor, initials } from '../data';
import type { Member } from '../types';
import Icon from './Icon';
import Empty from './Empty';

type TemplateId = 'renew' | 'winback' | 'welcome';

export default function WhatsApp() {
  const { members, lang, profile, waTemplates, setWaTemplate } = useStore();
  const t = useT();
  const [tmpl, setTmpl] = useState<TemplateId>('renew');
  const [editing, setEditing] = useState<TemplateId | null>(null);
  const [draft, setDraft] = useState('');

  const salon = profile?.salonName || 'TRAX';
  const DEFAULTS: Record<TemplateId, string> = {
    renew: t.tmplRenewRaw, winback: t.tmplWinbackRaw, welcome: t.tmplWelcomeRaw,
  };
  const rawOf = (id: TemplateId) => waTemplates[id] || DEFAULTS[id];
  const fillFor = (id: TemplateId, m: Member) =>
    fillTmpl(rawOf(id), { isim: m.name.split(' ')[0], kalan: t.kalan(m), salon });

  const TEMPLATES = [
    {
      id: 'renew' as TemplateId, name: t.tmplRenewName, tag: 'warn',
      // "expires in 15 days ago" reads broken — expired members get the win-back text
      getText: (m: Member) => glowOf(m) === 's-red' ? fillFor('winback', m) : fillFor('renew', m),
    },
    { id: 'winback' as TemplateId, name: t.tmplWinback, tag: 'bad',  getText: (m: Member) => fillFor('winback', m) },
    { id: 'welcome' as TemplateId, name: t.tmplWelcome, tag: 'ok',   getText: (m: Member) => fillFor('welcome', m) },
  ];

  function startEdit(id: TemplateId) { setEditing(id); setDraft(rawOf(id)); }
  function saveEdit() { if (editing) setWaTemplate(editing, draft); setEditing(null); }
  function resetEdit() { if (editing) { setWaTemplate(editing, null); setEditing(null); } }

  function waUrl(m: Member, getText: (m: Member) => string) {
    const phone = waPhone(m.phone, lang);
    return `https://wa.me/${phone}?text=${encodeURIComponent(getText(m))}`;
  }
  const targets = members.filter(m => glowOf(m) === 's-red' || glowOf(m) === 's-yellow');
  const [sel, setSel] = useState<Set<number>>(() => new Set(targets.filter(x => glowOf(x) === 's-yellow').map(x => x.id)));
  const [sentIdx, setSentIdx] = useState(-1);

  const toggle = (id: number) => {
    setSel(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setSentIdx(-1);
  };

  const template = TEMPLATES.find(x => x.id === tmpl)!;
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
        {TEMPLATES.map(tp => (
          <div key={tp.id} className={'tmpl' + (tmpl === tp.id ? ' on' : '')} onClick={() => { setTmpl(tp.id); setSentIdx(-1); }}>
            <div className="row">
              <span className={'pill ' + tp.tag}><span className="d" /></span>
              <span style={{ fontWeight: 650, fontSize: 14 }}>{tp.name}</span>
              {tmpl === tp.id && <Icon name="check" size={16} style={{ marginLeft: 'auto', color: 'var(--acc)' }} stroke={2.4} />}
            </div>
            {tmpl === tp.id && editing !== tp.id && (
              <>
                <div className="preview">{fillTmpl(rawOf(tp.id), { isim: '{isim}', kalan: '{kalan}', salon })}</div>
                <button className="tmpl-edit" onClick={e => { e.stopPropagation(); startEdit(tp.id); }}>
                  <Icon name="edit" size={13} />{t.tmplEditBtn}
                </button>
              </>
            )}
            {editing === tp.id && (
              <div onClick={e => e.stopPropagation()}>
                <textarea className="tmpl-ta" rows={4} value={draft} onChange={e => setDraft(e.target.value)} />
                <div className="muted" style={{ fontSize: 11, margin: '6px 2px 10px' }}>{t.tmplHint}</div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn" style={{ flex: 1, fontSize: 12.5, padding: '10px' }} onClick={resetEdit}>{t.tmplResetBtn}</button>
                  <button className="btn primary" style={{ flex: 1, fontSize: 12.5, padding: '10px' }} onClick={saveEdit}>{t.saveBtn}</button>
                </div>
              </div>
            )}
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
