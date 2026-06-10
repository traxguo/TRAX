import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  deleteUser,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Member, Profile, Session, MemberFormData, Lang } from './types';
import { derivePlan, fmtDate, load, save, PLAN_LEN } from './utils';
import { auth, db } from './firebase';

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
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  loading: boolean;
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
  const [members, setMembers] = useState<Member[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifRead, setNotifRead] = useState(false);
  const [lang, setLangState] = useState<Lang>(() => load('trax_lang', 'en' as Lang));
  const [attendanceLog, setAttendanceLog] = useState<Record<string, number[]>>({});

  // undefined = Firebase still initializing, null = signed out, User = signed in
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined);
  const dataReadyRef = useRef(false);

  const session: Session | null = firebaseUser
    ? { email: firebaseUser.email || '', at: Date.now() }
    : null;

  const loading = firebaseUser === undefined;

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      dataReadyRef.current = false;
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data.members)       setMembers(data.members);
            if (data.profile)       setProfile(data.profile);
            if (data.attendanceLog) setAttendanceLog(data.attendanceLog);
            if (data.notifRead !== undefined) setNotifRead(data.notifRead);
            if (data.lang)          setLangState(data.lang);
          } else {
            setMembers([]);
            setProfile(null);
            setAttendanceLog({});
            setNotifRead(false);
          }
        } catch {
          setMembers([]);
          setProfile(null);
          setAttendanceLog({});
        }
        dataReadyRef.current = true;
      } else {
        setMembers([]);
        setProfile(null);
        setAttendanceLog({});
        setNotifRead(false);
      }
      setFirebaseUser(user);
    });
  }, []);

  // Immediate Firestore sync on every state change — offline cache handles network gaps
  useEffect(() => {
    if (!firebaseUser || !dataReadyRef.current) return;
    setDoc(doc(db, 'users', firebaseUser.uid), {
      members, profile, attendanceLog, notifRead, lang,
    }).catch(e => console.error('Firestore sync failed:', e));
  }, [members, profile, attendanceLog, notifRead, lang, firebaseUser]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    save('trax_lang', l);
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(() => {
    dataReadyRef.current = false;
    fbSignOut(auth).catch(console.error);
  }, []);

  const deleteAccount = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
  }, []);

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
      if (!wasAttended) return { ...m, adet: adet - 1 };
      if (wasAttended)  return { ...m, adet: adet + 1 };
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
    profile, updateProfile, completeOnboarding, session, login, signup, logout, deleteAccount, loading,
    notifRead, markNotifsRead, attendanceLog, toggleAttendance,
    addDayToMember, removeDayFromMember, lang, setLang,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStoreValue();
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}
