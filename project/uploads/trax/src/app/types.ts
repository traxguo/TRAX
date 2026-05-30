export type MemberKind = 'aylik' | 'paket';
export type MemberStatus = 'active' | 'expiring' | 'expired' | 'frozen';
export type MemberGlow = 's-green' | 's-yellow' | 's-red' | 's-frozen';
export type TabKey = 'home' | 'members' | 'checkin' | 'whatsapp';
export type SheetKey = 'search' | 'notif' | 'profile' | 'add' | null;

export interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  plan: 'Aylık' | 'Paket';
  kind: MemberKind;
  adet?: number;
  status: MemberStatus;
  joined: string;
  expires: string;
  daysLeft: number;
  lastVisit: string;
  visits: number;
  attendance: number;
  trainer: string;
}

export interface Profile {
  salonName: string;
  businessName: string;
  ownerName: string;
  ownerFull: string;
  city: string;
  email: string;
}

export interface Session {
  email: string;
  at: number;
}

export interface ActivityItem {
  type: 'checkin' | 'payment' | 'join' | 'renew';
  who: string;
  text: string;
  time: string;
  acc?: boolean;
}

export interface WeekVisit {
  d: string;
  v: number;
  today?: boolean;
}

export interface CheckinItem {
  id: number;
  name: string;
  time: string;
}

export interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  plan: 'Aylık' | 'Paket';
  trainer: string;
  date: string;
  adet: string;
}
