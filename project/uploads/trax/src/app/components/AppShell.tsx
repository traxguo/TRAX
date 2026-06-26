import { useState, useRef } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { derivePlan, glowOf } from '../utils';
import { initials } from '../data';
import type { TabKey, SheetKey, Member, MemberFormData } from '../types';
import Icon from './Icon';
import Home from './Home';
import Members from './Members';
import CheckIn from './CheckIn';
import WhatsApp from './WhatsApp';
import MemberDetail from './MemberDetail';
import SearchSheet from './SearchSheet';
import NotifSheet from './NotifSheet';
import ProfileSheet from './ProfileSheet';
import MemberFormSheet from './MemberFormSheet';
import ConfirmSheet from './ConfirmSheet';
import AdminPanel from './AdminPanel';

const TABS: { k: TabKey; ico: string }[] = [
  { k: 'home',     ico: 'grid' },
  { k: 'members',  ico: 'users' },
  { k: 'checkin',  ico: 'scan' },
  { k: 'whatsapp', ico: 'chat' },
];

export default function AppShell() {
  const store = useStore();
  const { members, profile, addMember, updateMember, deleteMember, restoreMember, notifRead } = store;
  const t = useT();
  const [undoM, setUndoM] = useState<Member | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showUndo = (m: Member) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoM(m);
    undoTimer.current = setTimeout(() => setUndoM(null), 5000);
  };
  const HEAD: Record<TabKey, { eyebrow: string; title: string; hasCount?: boolean }> = {
    home:     { eyebrow: '',               title: 'TRAX' },
    members:  { eyebrow: t.eyebrowMembers, title: t.membersTitle, hasCount: true },
    checkin:  { eyebrow: t.eyebrowCheckin, title: 'Check-In' },
    whatsapp: { eyebrow: t.eyebrowWhatsapp, title: 'WhatsApp' },
  };

  const [tab, setTab] = useState<TabKey>('home');
  const [detail, setDetail] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const owner = (profile?.ownerName) || 'Mert';
  const h = HEAD[tab];
  const tabIndex = TABS.findIndex(t => t.k === tab);
  const waCount = members.filter(m => { const g = glowOf(m); return g === 's-red' || g === 's-yellow'; }).length;

  const openMember = (id: number) => setDetail(id);

  return (
    <div className="phone">
      {detail !== null ? (
        <MemberDetail
          id={detail}
          back={() => setDetail(null)}
          onEdit={m => setEditing(m)}
          onDelete={m => setDeleting(m)}
        />
      ) : (
        <>
          <div className="m-head">
            <div style={{ minWidth: 0 }}>
              {tab === 'home'
                ? <div className="eyebrow">{t.hello(owner)}</div>
                : <div className="eyebrow">{h.eyebrow}</div>}
              <div className="title-row">
                {tab === 'home'
                  ? <img src="/wordmark.png" alt="TRAX" className="head-logo" />
                  : <h1>{h.title}</h1>}
                {h.hasCount && <span className="count-chip tnum">{t.memberCount(members.length)}</span>}
              </div>
            </div>
            <div className="actions">
              <button className="m-iconbtn" onClick={() => setSheet('search')} aria-label="Ara">
                <Icon name="search" size={18} />
              </button>
              <button className="m-iconbtn" onClick={() => setSheet('notif')} aria-label="Bildirimler">
                <Icon name="bell" size={18} />
                {!notifRead && <span className="dot" />}
              </button>
              <button className="m-iconbtn av-btn" onClick={() => setSheet('profile')} aria-label="Profil">
                {initials((profile?.salonName) || 'TRAX')}
              </button>
            </div>
          </div>

          <div className={'m-screen' + (tab === 'members' ? ' flush' : '')}>
            {tab === 'home'     && <Home go={setTab} open={openMember} owner={owner} />}
            {tab === 'members'  && <Members open={openMember} />}
            {tab === 'checkin'  && <CheckIn />}
            {tab === 'whatsapp' && <WhatsApp />}
          </div>

          {tab === 'members' && (
            <button className="fab" onClick={() => setSheet('add')} aria-label="Üye ekle">
              <Icon name="plus" size={24} stroke={2.4} />
            </button>
          )}

          <div className="m-scrim" />
          <div className="m-nav-tray" />
          <nav className="m-nav">
            <span className="nav-ind" style={{ '--i': tabIndex } as React.CSSProperties} />
            {TABS.map(tb => (
              <button key={tb.k} className={'m-tab' + (tab === tb.k ? ' on' : '')} onClick={() => setTab(tb.k)}>
                <Icon name={tb.ico} size={22} stroke={tab === tb.k ? 2.2 : 1.8} />
                {tb.k === 'whatsapp' && waCount > 0 && <span className="badge">{waCount}</span>}
              </button>
            ))}
          </nav>
        </>
      )}

      <SearchSheet open={sheet === 'search'} onClose={() => setSheet(null)} onOpenMember={openMember} />
      <NotifSheet  open={sheet === 'notif'}  onClose={() => setSheet(null)} onOpenMember={openMember} />
      <ProfileSheet open={sheet === 'profile'} onClose={() => setSheet(null)}
        onOpenAdmin={() => { setSheet(null); setShowAdmin(true); }} />
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      <MemberFormSheet
        open={sheet === 'add'} onClose={() => setSheet(null)} mode="add"
        onSubmit={(f: MemberFormData) => addMember(f)} />
      <MemberFormSheet
        open={!!editing} onClose={() => setEditing(null)} mode="edit" initial={editing}
        onSubmit={(f: MemberFormData) => {
          if (editing) updateMember(editing.id, { name: f.name, phone: f.phone, email: f.email, trainer: f.trainer || '—', days: f.days, ...derivePlan(f) });
        }} />
      <ConfirmSheet
        open={!!deleting} onClose={() => setDeleting(null)} name={deleting?.name}
        onConfirm={() => {
          if (deleting) {
            deleteMember(deleting.id);
            if (detail === deleting.id) setDetail(null);
            showUndo(deleting);
          }
        }} />

      {undoM && (
        <div className="undo-toast">
          <span className="undo-txt">{t.deletedToast(undoM.name)}</span>
          <button className="undo-btn" onClick={() => {
            restoreMember(undoM);
            setUndoM(null);
            if (undoTimer.current) clearTimeout(undoTimer.current);
          }}>{t.undoBtn}</button>
        </div>
      )}
    </div>
  );
}
