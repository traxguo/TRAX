import type { Member, ActivityItem, WeekVisit, CheckinItem } from './types';

const AVATAR_COLORS = ['#c8ff1e','#4be38a','#66a3ff','#ffb84d','#ff6358','#b388ff','#2de2c0','#ff8fab'];

export function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export const members: Member[] = [
  { id:1,  name:'Elif Yılmaz',  phone:'0532 114 22 81', plan:'Paket', kind:'paket', adet:18, status:'active',   joined:'12 Oca 2024', expires:'—',          daysLeft:9999, lastVisit:'Bugün, 08:42',  visits:142, attendance:88, trainer:'Mert K.',  email:'elif.yilmaz@gmail.com' },
  { id:2,  name:'Burak Demir',  phone:'0541 902 77 13', plan:'Aylık', kind:'aylik',          status:'expiring', joined:'03 Mar 2025', expires:'03 Haz 2026', daysLeft:4,   lastVisit:'Dün, 19:10',   visits:38,  attendance:64, trainer:'—',        email:'burak.demir@gmail.com' },
  { id:3,  name:'Zeynep Kaya',  phone:'0505 388 41 06', plan:'Aylık', kind:'aylik',          status:'active',   joined:'21 Eyl 2024', expires:'21 Haz 2026', daysLeft:22,  lastVisit:'Bugün, 07:15',  visits:96,  attendance:79, trainer:'Selin A.', email:'zeynep.kaya@gmail.com' },
  { id:4,  name:'Can Öztürk',   phone:'0533 671 09 54', plan:'Aylık', kind:'aylik',          status:'expired',  joined:'15 Tem 2024', expires:'15 May 2026', daysLeft:-15, lastVisit:'14 May, 18:20', visits:54,  attendance:41, trainer:'—',        email:'can.ozturk@gmail.com' },
  { id:5,  name:'Selin Arslan', phone:'0544 220 88 37', plan:'Paket', kind:'paket', adet:12, status:'active',   joined:'08 Şub 2025', expires:'—',          daysLeft:9999, lastVisit:'Bugün, 09:03',  visits:71,  attendance:92, trainer:'Mert K.',  email:'selin.arslan@gmail.com' },
  { id:6,  name:'Ahmet Şahin',  phone:'0537 145 63 90', plan:'Aylık', kind:'aylik',          status:'active',   joined:'18 Mar 2026', expires:'18 Haz 2026', daysLeft:19,  lastVisit:'2 gün önce',    visits:21,  attendance:58, trainer:'—',        email:'ahmet.sahin@gmail.com' },
  { id:7,  name:'Deniz Çelik',  phone:'0506 778 12 45', plan:'Paket', kind:'paket', adet:2,  status:'active',   joined:'29 Kas 2024', expires:'—',          daysLeft:9999, lastVisit:'Bugün, 10:28',  visits:103, attendance:84, trainer:'Selin A.', email:'deniz.celik@gmail.com' },
  { id:8,  name:'Merve Aydın',  phone:'0538 994 50 21', plan:'Aylık', kind:'aylik',          status:'frozen',   joined:'06 Oca 2025', expires:'06 Tem 2026', daysLeft:37,  lastVisit:'20 Nis, 17:45', visits:44,  attendance:33, trainer:'—',        email:'merve.aydin@gmail.com' },
  { id:9,  name:'Emre Koç',     phone:'0530 451 87 62', plan:'Paket', kind:'paket', adet:24, status:'active',   joined:'14 Eki 2024', expires:'—',          daysLeft:9999, lastVisit:'Dün, 06:50',   visits:188, attendance:95, trainer:'Mert K.',  email:'emre.koc@gmail.com' },
  { id:10, name:'Gizem Polat',  phone:'0542 308 19 74', plan:'Aylık', kind:'aylik',          status:'active',   joined:'24 Mar 2026', expires:'24 Haz 2026', daysLeft:25,  lastVisit:'3 gün önce',    visits:17,  attendance:48, trainer:'—',        email:'gizem.polat@gmail.com' },
  { id:11, name:'Onur Aksoy',   phone:'0535 660 23 18', plan:'Aylık', kind:'aylik',          status:'active',   joined:'11 May 2025', expires:'11 Haz 2026', daysLeft:12,  lastVisit:'Bugün, 12:11',  visits:62,  attendance:71, trainer:'Selin A.', email:'onur.aksoy@gmail.com' },
  { id:12, name:'Aslı Doğan',   phone:'0507 812 44 99', plan:'Aylık', kind:'aylik',          status:'expired',  joined:'02 Ağu 2024', expires:'02 May 2026', daysLeft:-27, lastVisit:'30 Nis, 20:05', visits:49,  attendance:36, trainer:'—',        email:'asli.dogan@gmail.com' },
];

export const todayCheckins: CheckinItem[] = [
  { id:9,  name:'Emre Koç',     time:'06:50' },
  { id:3,  name:'Zeynep Kaya',  time:'07:15' },
  { id:1,  name:'Elif Yılmaz',  time:'08:42' },
  { id:5,  name:'Selin Arslan', time:'09:03' },
  { id:7,  name:'Deniz Çelik',  time:'10:28' },
  { id:11, name:'Onur Aksoy',   time:'12:11' },
];

export const activity: ActivityItem[] = [
  { type:'checkin', who:'Onur Aksoy',   text:'giriş yaptı',                 time:'12:11', acc:true },
  { type:'payment', who:'Selin Arslan', text:'ödeme aldı · ₺1.450',         time:'11:38' },
  { type:'join',    who:'Gizem Polat',  text:'yeni üye kaydı · 3 Aylık',    time:'10:52', acc:true },
  { type:'checkin', who:'Deniz Çelik',  text:'giriş yaptı',                 time:'10:28' },
  { type:'renew',   who:'Emre Koç',     text:'üyeliğini yeniledi · Yıllık', time:'09:20' },
  { type:'checkin', who:'Elif Yılmaz',  text:'giriş yaptı',                 time:'08:42' },
];

export const weekVisits: WeekVisit[] = [
  { d:'Pzt', v:64 }, { d:'Sal', v:78 }, { d:'Çar', v:71 }, { d:'Per', v:92 },
  { d:'Cum', v:108 }, { d:'Cmt', v:124 }, { d:'Paz', v:46, today:true },
];
