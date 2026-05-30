import { useState } from 'react';
import { useStore } from '../store';
import { glowOf, kalanText } from '../utils';
import { colorFor, initials } from '../data';
import type { Member } from '../types';
import Icon from './Icon';

const TEMPLATES = [
  {
    id: 'renew', name: 'Yenileme hatırlatması', tag: 'warn',
    body: <span>Merhaba <b>{`{isim}`}</b>! TRAX üyeliğinin bitmesine <b>{`{kalan}`}</b> gün kaldı. Yenilemek için stüdyoya uğrayabilirsin. 💪</span>,
    text: 'Merhaba {isim}! TRAX üyeliğinin bitmesine {kalan} kaldı. Yenilemek için stüdyoya uğrayabilirsin. 💪',
  },
  {
    id: 'winback', name: 'Geri kazanım', tag: 'bad',
    body: <span>Seni özledik <b>{`{isim}`}</b>! Bu hafta dönersen ilk aya <b>%20 indirim</b> hediye. 🎁</span>,
    text: 'Seni özledik {isim}! Bu hafta dönersen ilk aya %20 indirim hediye. 🎁',
  },
  {
    id: 'welcome', name: 'Hoş geldin', tag: 'ok',
    body: <span>TRAX ailesine hoş geldin <b>{`{isim}`}</b>! İyi antrenmanlar! 🔥</span>,
    text: 'TRAX ailesine hoş geldin {isim}! İyi antrenmanlar! 🔥',
  },
] as const;

type TemplateId = typeof TEMPLATES[number]['id'];

function buildMsg(text: string, m: Member) {
  return text
    .replace('{isim}', m.name.split(' ')[0])
    .replace('{kalan}', kalanText(m));
}

function waUrl(m: Member, text: string) {
  const phone = '90' + m.phone.replace(/\D/g, '').replace(/^0/, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildMsg(text, m))}`;
}

export default function WhatsApp() {
  const { members } = useStore();
  const [tmpl, setTmpl] = useState<TemplateId>('renew');
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
    window.open(waUrl(queue[idx], template.text), '_blank');
    setSentIdx(idx);
  }

  return (
    <div className="fade">
      <div className="section-h" style={{ marginTop: 8 }}><h2>Şablon</h2></div>
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
        <h2>Alıcılar</h2>
        <span className="link tnum" onClick={() => { setSel(sel.size === targets.length ? new Set() : new Set(targets.map(t => t.id))); setSentIdx(-1); }}>
          {sel.size === targets.length ? 'Hiçbiri' : 'Tümü'}
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
              <div className="muted" style={{ fontSize: 12 }}>{kalanText(m)}</div>
            </div>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: glowOf(m) === 's-red' ? 'var(--bad)' : 'var(--warn)' }} />
          </div>
        ))}
        {targets.length === 0 && (
          <div className="muted" style={{ textAlign: 'center', padding: '30px 0' }}>Mesaj bekleyen üye yok 🎉</div>
        )}
      </div>

      {done ? (
        <div className="row" style={{ justifyContent: 'center', gap: 9, color: 'var(--ok)', fontWeight: 650, padding: '18px 0' }}>
          <Icon name="check" size={18} stroke={2.4} />{queue.length} mesaj gönderildi
        </div>
      ) : sentIdx >= 0 ? (
        <button className="btn primary" style={{ marginTop: 18 }} onClick={sendNext}>
          <Icon name="send" size={17} />
          Sonraki: {queue[sentIdx + 1]?.name} ({sentIdx + 1}/{queue.length})
        </button>
      ) : (
        <button className="btn primary" style={{ marginTop: 18 }} disabled={sel.size === 0} onClick={sendNext}>
          <Icon name="send" size={17} />{sel.size} kişiye gönder
        </button>
      )}
    </div>
  );
}
