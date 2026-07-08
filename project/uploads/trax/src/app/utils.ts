import type { Member, MemberGlow, MemberFormData, MemberStatus, Lang } from './types';

const MON = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

export function fmtDate(d: Date): string {
  return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
}

/** Format an ISO date (or legacy TR string as-is) using the active language's month names. */
export function fmtIso(iso: string | undefined, legacy: string, months: string[]): string {
  if (!iso) return legacy;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return legacy;
  return `${d} ${months[m - 1]} ${y}`;
}

/** Parse a legacy TR display date ("3 Haz 2026") back to ISO; null if unparseable. */
function parseLegacyTr(s: string): string | null {
  const parts = (s || '').trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const mi = MON.indexOf(parts[1]);
  const year = parseInt(parts[2], 10);
  if (!day || mi < 0 || !year) return null;
  return `${year}-${String(mi + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Whole calendar days from today (local midnight) until the ISO date. 0 = expires today. */
export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const end = new Date(y, (m || 1) - 1, d || 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end.getTime() - today.getTime()) / 864e5);
}

/**
 * Recompute daysLeft/status for monthly members from their expiry date.
 * Stored daysLeft is a snapshot that rots as calendar days pass — this runs on
 * every data load. Also migrates legacy members (no expiresAt) by parsing the
 * TR display string, falling back to the stale daysLeft offset once.
 */
export function refreshMembers(members: Member[]): Member[] {
  return members.map(m => {
    if (m.kind !== 'aylik') return m;
    let expiresAt = m.expiresAt;
    if (!expiresAt) {
      expiresAt = parseLegacyTr(m.expires) || (() => {
        const d = new Date(Date.now() + (m.daysLeft || 0) * 864e5);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })();
    }
    const dl = daysUntil(expiresAt);
    const status: MemberStatus = m.status === 'frozen' ? 'frozen'
      : dl < 0 ? 'expired' : dl <= 7 ? 'expiring' : 'active';
    if (m.expiresAt === expiresAt && m.daysLeft === dl && m.status === status) return m;
    return { ...m, expiresAt, daysLeft: dl, status };
  });
}

/**
 * Build a wa.me phone: honors an explicit +CC; otherwise assumes a local
 * number in the app language's market (tr → +90, en → +1).
 */
export function waPhone(phone: string, lang: Lang): string {
  const raw = (phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  const cc = lang === 'tr' ? '90' : '1';
  const local = digits.replace(/^0+/, '');
  if (local.startsWith(cc) && local.length > 10) return local;
  return cc + local;
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

export function derivePlan(f: MemberFormData): Partial<Member> {
  if (f.plan === 'Paket') {
    const adet = Math.max(1, parseInt(f.adet, 10) || 1);
    return { plan: 'Paket', kind: 'paket', adet, daysLeft: 9999, expires: '—', status: 'active' };
  }
  const fallback = new Date(Date.now() + 30 * 864e5);
  const expiresAt = /^\d{4}-\d{2}-\d{2}$/.test(f.date) ? f.date
    : `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
  const dl = daysUntil(expiresAt);
  const [y, mo, da] = expiresAt.split('-').map(Number);
  return {
    plan: 'Aylık', kind: 'aylik', adet: undefined, daysLeft: dl,
    expiresAt, expires: fmtDate(new Date(y, mo - 1, da)),
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
