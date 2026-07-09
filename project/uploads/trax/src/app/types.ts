export type Lang = 'en' | 'tr';
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
  joined: string;       // legacy display string (TR); prefer joinedAt
  joinedAt?: string;    // ISO YYYY-MM-DD — source of truth
  expires: string;      // legacy display string (TR); prefer expiresAt
  expiresAt?: string;   // ISO YYYY-MM-DD — source of truth for expiry
  daysLeft: number;     // recomputed from expiresAt on every load
  lastVisit: string;
  visits: number;
  attendance: number;
  trainer: string;
  days: number[]; // 0=Pzt 1=Sal 2=Çar 3=Per 4=Cum 5=Cmt 6=Paz
}

export interface Profile {
  salonName: string;
  businessName: string;
  ownerName: string;
  ownerFull: string;
  city: string;
  email: string;
}

export type SubStatus = 'trial' | 'active' | 'expired' | 'suspended';

export interface Subscription {
  status: SubStatus;
  endDate: string;       // ISO YYYY-MM-DD — trial/paid period end
  plan: string;          // e.g. 'monthly'
  priceUsd: number;      // monthly price for revenue calc
  startedAt: string;     // ISO when the gym first signed up
}

// One row in the admin panel — a summary of each gym account
export interface GymSummary {
  uid: string;
  email: string;
  salonName: string;
  city: string;
  memberCount: number;
  subscription: Subscription;
}

// custom WhatsApp message templates ({isim}/{kalan}/{salon} tokens)
export type WaTemplates = Partial<Record<'renew' | 'winback' | 'welcome', string>>;

export interface Session {
  email: string;
  uid: string;
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
  days: number[];
}
