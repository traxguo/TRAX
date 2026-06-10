import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Member, Profile, Session, MemberFormData, Lang } from './types';
import { members as initialMembers } from './data';
import { derivePlan, fmtDate, load, save, PLAN_LEN } from './utils';

export interface StoreValue {
  members: Member[];
  addMember: (f: MemberFormData) => number;
  updateMember: (id: number, patch: Partial<Member>) => void;
  deleteMember: (id: number) => void;
  restoreMember: (m: Member) => void;
  renewMember: (id: number) => void;
  profile: Profile | null;
  updateProfile: (p: Partial<Profile>) => void;
  completeOnboarding: (p: Profile) => void;
  session: Session | null;
  login: (email: string) => void;
  logout: () => void;
  notifRead: boolean;
  markNotifsRead: () => void;
  attendanceLog: Record<string, number[]>;
  toggleAttendance: (date: string, memberId: number) => void;
  addDayToMember: (memberId: number, day: number) => void;
  removeDayFromMember: (memberId: number, day: number) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function useStoreValue(): StoreValue {
  const [members, setMembers] = useState<Member[]>(() => load('trax_members', initialMembers));
  const [profile, setProfile] = useState<Profile | null>(() => load('trax_profile', null));
  const [session, setSession] = useState<Session | null>(() => load('trax_session', null));
  const [notifRead, setNotifRead] = useState<boolean>(() => load('trax_notifread', false));
  const [lang, setLangState] = useState<Lang>(() => load('trax_lang', 'en' as Lang));
  const setLang = useCallback((l: Lang) => { setLangState(l); save('trax_lang', l); }, []);

  const [attendanceLog, setAttendanceLog] = useState<Record<string, number[]>>(() => {
    const saved = load('trax_attendance', null);
    if (saved) return saved;
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { [key]: [9, 3, 1, 5, 7, 11] };
  });

  useEffect(() => save('trax_members', members), [members]);
  useEffect(() => save('trax_profile', profile), [profile]);
  useEffect(() => save('trax_session', session), [session]);
  useEffect(() => save('trax_notifread', notifRead), [notifRead]);
  useEffect(() => save('trax_attendance', attendanceLog), [attendanceLog]);

  const addMember = useCallback((f: MemberFormData): number => {
    const now = new Date();
    const base: Member = {
      id: Date.now(), name: f.name.trim(), phone: f.phone.trim(),
      email: (f.email || '').trim(), joined: fmtDate(now), lastVisit: '—',
      visits: 0, attendance: 0, trainer: (f.trainer || '').trim() || '—',
      plan: 'Aylık', kind: 'aylik', status: 'active', daysLeft: 30, expires: '—', days: f.days || [],
    };
    const mem: Member = { ...base, ...derivePlan(f) };
    setMembers(ms => [mem, ...ms]);
    return mem.id;
  }, []);

  const updateMember = useCallback((id: number, patch: Partial<Member>) => {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
  }, []);

  const deleteMember = useCallback((id: number) => {
    setMembers(ms => ms.filter(m => m.id !== id));
  }, []);

  const restoreMember = useCallback((m: Member) => {
    setMembers(ms => ms.some(x => x.id === m.id) ? ms : [m, ...ms]);
  }, []);

  const renewMember = useCallback((id: number) => {
    setMembers(ms => ms.map(m => {
      if (m.id !== id) return m;
      if (m.kind === 'paket') return { ...m, adet: (m.adet || 0) + 10, status: 'active' as const };
      const len = PLAN_LEN[m.plan] || 30;
      const exp = new Date(Date.now() + len * 864e5);
      return { ...m, daysLeft: len, status: 'active' as const, expires: fmtDate(exp) };
    }));
  }, []);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...p } : null);
  }, []);

  const login = useCallback((email: string) => setSession({ email, at: Date.now() }), []);
  const logout = useCallback(() => setSession(null), []);
  const completeOnboarding = useCallback((p: Profile) => setProfile(p), []);
  const markNotifsRead = useCallback(() => setNotifRead(true), []);
  const toggleAttendance = useCallback((date: string, memberId: number) => {
    const curr = attendanceLog[date] || [];
    const wasAttended = curr.includes(memberId);
    setAttendanceLog(prev => ({
      ...prev,
      [date]: wasAttended ? curr.filter(id => id !== memberId) : [...curr, memberId],
    }));
    setMembers(ms => ms.map(m => {
      if (m.id !== memberId || m.kind !== 'paket') return m;
      const adet = m.adet || 0;
      if (!wasAttended && adet > 0) return { ...m, adet: adet - 1 };
      if (wasAttended) return { ...m, adet: adet + 1 };
      return m;
    }));
  }, [attendanceLog]);

  const addDayToMember = useCallback((memberId: number, day: number) => {
    setMembers(ms => ms.map(m => {
      if (m.id !== memberId) return m;
      const days = m.days || [];
      return days.includes(day) ? m : { ...m, days: [...days, day].sort() };
    }));
  }, []);

  const removeDayFromMember = useCallback((memberId: number, day: number) => {
    setMembers(ms => ms.map(m =>
      m.id === memberId ? { ...m, days: (m.days || []).filter(d => d !== day) } : m
    ));
  }, []);

  return {
    members, addMember, updateMember, deleteMember, restoreMember, renewMember,
    profile, updateProfile, completeOnboarding, session, login, logout,
    notifRead, markNotifsRead, attendanceLog, toggleAttendance,
    addDayToMember, removeDayFromMember, lang, setLang,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStoreValue();
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}
