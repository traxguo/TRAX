import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Member, Profile, Session, MemberFormData } from './types';
import { members as initialMembers } from './data';
import { derivePlan, fmtDate, load, save, PLAN_LEN } from './utils';

export interface StoreValue {
  members: Member[];
  addMember: (f: MemberFormData) => number;
  updateMember: (id: number, patch: Partial<Member>) => void;
  deleteMember: (id: number) => void;
  renewMember: (id: number) => void;
  profile: Profile | null;
  updateProfile: (p: Partial<Profile>) => void;
  completeOnboarding: (p: Profile) => void;
  session: Session | null;
  login: (email: string) => void;
  logout: () => void;
  notifRead: boolean;
  markNotifsRead: () => void;
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

  useEffect(() => save('trax_members', members), [members]);
  useEffect(() => save('trax_profile', profile), [profile]);
  useEffect(() => save('trax_session', session), [session]);
  useEffect(() => save('trax_notifread', notifRead), [notifRead]);

  const addMember = useCallback((f: MemberFormData): number => {
    const now = new Date();
    const base: Member = {
      id: Date.now(), name: f.name.trim(), phone: f.phone.trim(),
      email: (f.email || '').trim(), joined: fmtDate(now), lastVisit: '—',
      visits: 0, attendance: 0, trainer: (f.trainer || '').trim() || '—',
      plan: 'Aylık', kind: 'aylik', status: 'active', daysLeft: 30, expires: '—',
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

  return {
    members, addMember, updateMember, deleteMember, renewMember,
    profile, updateProfile, completeOnboarding, session, login, logout,
    notifRead, markNotifsRead,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStoreValue();
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}
