import type { Member, MemberGlow, MemberFormData } from './types';

const MON = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

export function fmtDate(d: Date): string {
  return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
}

export function glowOf(m: Member): MemberGlow {
  if (m.status === 'frozen') return 's-frozen';
  if (m.kind === 'paket') {
    if ((m.adet ?? 0) <= 0) return 's-red';
    if ((m.adet ?? 0) <= 2) return 's-yellow';
    return 's-green';
  }
  if (m.daysLeft < 0)  return 's-red';
  if (m.daysLeft <= 7) return 's-yellow';
  return 's-green';
}

export function kalanText(m: Member): string {
  if (m.status === 'frozen') return 'Donduruldu';
  if (m.kind === 'paket') return (m.adet ?? 0) <= 0 ? 'Paket bitti' : `${m.adet} seans kaldı`;
  if (m.daysLeft < 0) return `${Math.abs(m.daysLeft)} gün geçti`;
  if (m.daysLeft === 0) return 'Bugün bitiyor';
  return `${m.daysLeft} gün kaldı`;
}

export function derivePlan(f: MemberFormData): Partial<Member> {
  if (f.plan === 'Paket') {
    const adet = Math.max(1, parseInt(f.adet, 10) || 1);
    return { plan: 'Paket', kind: 'paket', adet, daysLeft: 9999, expires: '—', status: 'active' };
  }
  const now = new Date();
  const exp = f.date ? new Date(f.date) : new Date(now.getTime() + 30 * 864e5);
  const dl = Math.round((exp.getTime() - now.getTime()) / 864e5);
  return {
    plan: 'Aylık', kind: 'aylik', adet: undefined, daysLeft: dl,
    expires: fmtDate(exp),
    status: dl < 0 ? 'expired' : dl <= 7 ? 'expiring' : 'active',
  };
}

export const PLAN_LEN: Record<string, number> = {
  'Aylık': 30, 'Paket': 30,
  'Premium Yıllık': 365, 'Premium Aylık': 30,
  'Aylık Standart': 30, '3 Aylık': 90,
};

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// JS: 0=Sun,1=Mon... → our: 0=Mon...6=Sun
export function toDow(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

export function getWeek(today: Date): Date[] {
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

export function load<T>(k: string, fb: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; }
  catch { return fb; }
}

export function save<T>(k: string, v: T): void {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
}
