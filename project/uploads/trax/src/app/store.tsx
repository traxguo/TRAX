import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  deleteUser,
  sendEmailVerification,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getDocFromCache, setDoc, deleteDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';
import type { Member, Profile, Session, MemberFormData, Lang, Subscription, GymSummary, WaTemplates } from './types';

export const ADMIN_EMAIL = 'goktugslv@gmail.com';

const TRIAL_DAYS = 14;
const MONTHLY_PRICE_USD = 19.99;

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

function freshTrial(): Subscription {
  const now = new Date();
  const end = new Date(now.getTime() + TRIAL_DAYS * 864e5);
  return { status: 'trial', endDate: isoDate(end), plan: 'monthly', priceUsd: MONTHLY_PRICE_USD, startedAt: isoDate(now) };
}

// Accounts created before subscriptions existed: their trial is considered
// spent — they hit the paywall and the admin can extend manually if desired.
function expiredLegacy(): Subscription {
  return { status: 'trial', endDate: '2024-01-01', plan: 'monthly', priceUsd: MONTHLY_PRICE_USD, startedAt: '2024-01-01' };
}
import { derivePlan, fmtDate, load, save, PLAN_LEN, refreshMembers, daysUntil } from './utils';
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
  loadFailed: boolean;
  notifRead: boolean;
  markNotifsRead: () => void;
  attendanceLog: Record<string, number[]>;
  toggleAttendance: (date: string, memberId: number) => void;
  addDayToMember: (memberId: number, day: number) => void;
  removeDayFromMember: (memberId: number, day: number) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  waTemplates: WaTemplates;
  setWaTemplate: (id: keyof WaTemplates, text: string | null) => void;
  // subscription / admin
  subscription: Subscription | null;
  subBlocked: boolean;
  isAdmin: boolean;
  fetchAllGyms: () => Promise<GymSummary[]>;
  updateGymSubscription: (uid: string, patch: Partial<Subscription>) => Promise<void>;
  deleteGym: (uid: string) => Promise<void>;
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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [waTemplates, setWaTemplates] = useState<WaTemplates>({});

  // undefined = Firebase still initializing, null = signed out, User = signed in
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const dataReadyRef = useRef(false);
  // set during signup so the missing-doc branch knows this is a brand-new
  // account (gets a trial) and not a deleted one (stays locked out)
  const pendingSignupRef = useRef(false);
  // live subscription listener (admin suspend / webhook renew apply instantly)
  const subUnsubRef = useRef<(() => void) | null>(null);

  const session: Session | null = firebaseUser
    ? { email: firebaseUser.email || '', uid: firebaseUser.uid, at: Date.now() }
    : null;

  const loading = firebaseUser === undefined;

  // Live subscription updates: an open session must react to an admin
  // suspension or a webhook renewal without waiting for a restart.
  const watchSubscription = (uid: string) => {
    subUnsubRef.current?.();
    subUnsubRef.current = onSnapshot(doc(db, 'users', uid), snap => {
      const sub = snap.data()?.subscription;
      if (sub) setSubscription(prev =>
        JSON.stringify(prev) === JSON.stringify(sub) ? prev : sub);
    }, e => console.error('subscription watch failed:', e));
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      subUnsubRef.current?.(); subUnsubRef.current = null;
      dataReadyRef.current = false;
      setLoadFailed(false);
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid);
          // never hang on the splash: if the server read stalls (slow cold-start
          // handshake, tab-lease contention) fall back to the offline cache so
          // returning users still get in. Only a truly empty cache → retry screen.
          let snap;
          try {
            snap = await Promise.race([
              getDoc(ref),
              new Promise<never>((_, rej) => setTimeout(() => rej(new Error('load timeout')), 12000)),
            ]);
          } catch (netErr) {
            snap = await getDocFromCache(ref); // throws if nothing cached → outer catch
            console.warn('served user doc from cache (server slow/unreachable):', netErr);
          }
          if (snap.exists()) {
            const data = snap.data();
            // recompute daysLeft/status from expiry dates — stored values rot
            if (data.members)       setMembers(refreshMembers(data.members));
            if (data.profile)       setProfile(data.profile);
            if (data.attendanceLog) setAttendanceLog(data.attendanceLog);
            if (data.notifRead !== undefined) setNotifRead(data.notifRead);
            if (data.lang)          setLangState(data.lang);
            if (data.waTemplates)   setWaTemplates(data.waTemplates);
            if (data.subscription) {
              setSubscription(data.subscription);
            } else {
              // legacy doc from before subscriptions existed: trial counts as spent
              // read-only derivation: the subscription field is server-owned
              // (Firestore rules), so the admin panel repairs these accounts.
              setSubscription(expiredLegacy());
            }
            dataReadyRef.current = true;
            watchSubscription(user.uid);
          } else if (pendingSignupRef.current) {
            // brand-new signup whose doc write may still be in flight
            pendingSignupRef.current = false;
            setMembers([]); setProfile(null); setAttendanceLog({}); setNotifRead(false);
            const trial = freshTrial();
            setSubscription(trial);
            setDoc(doc(db, 'users', user.uid), { subscription: trial, email: user.email || '' }, { merge: true }).catch(console.error);
            dataReadyRef.current = true;
            watchSubscription(user.uid);
          } else {
            // no doc and not signing up: account was deleted by the admin.
            // Lock it instead of handing out a fresh trial (zombie-login exploit).
            setMembers([]); setProfile(null); setAttendanceLog({}); setNotifRead(false);
            setSubscription({ status: 'suspended', endDate: '2000-01-01', plan: 'monthly', priceUsd: MONTHLY_PRICE_USD, startedAt: '2000-01-01' });
            // dataReady stays false: nothing this session may write a doc back
          }
        } catch (e) {
          // Load failed: keep sync disabled and show the retry screen —
          // never render the app on unknown data (fails closed, not open)
          console.error('Firestore load failed:', e);
          setLoadFailed(true);
        }
      } else {
        setMembers([]);
        setProfile(null);
        setAttendanceLog({});
        setNotifRead(false);
        setSubscription(null);
      }
      setFirebaseUser(user);
    });
    return () => { unsubAuth(); subUnsubRef.current?.(); };
  }, []);

  // Immediate Firestore sync on every state change — offline cache handles gaps.
  // NOTE: subscription is deliberately NOT synced here; a stale local copy would
  // clobber admin suspensions/extensions. It is written only at trial creation
  // and through updateGymSubscription.
  useEffect(() => {
    if (!firebaseUser || !dataReadyRef.current) return;
    setDoc(doc(db, 'users', firebaseUser.uid), {
      members, profile, attendanceLog, notifRead, lang, waTemplates,
      email: firebaseUser.email || '',
    }, { merge: true }).catch(e => console.error('Firestore sync failed:', e));
  }, [members, profile, attendanceLog, notifRead, lang, waTemplates, firebaseUser]);

  const setWaTemplate = useCallback((id: keyof WaTemplates, text: string | null) => {
    setWaTemplates(prev => {
      const next = { ...prev };
      if (text === null || !text.trim()) delete next[id]; else next[id] = text;
      return next;
    });
  }, []);

  // Date checks only run on render — force one every minute and whenever the
  // app returns to the foreground, so expiry trips without a restart. Member
  // day counters are refreshed on resume too (identity-guarded: no-op sync
  // unless something actually changed).
  const [, forceTick] = useState(0);
  useEffect(() => {
    const tick = () => forceTick(t => t + 1);
    const iv = setInterval(tick, 60_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        tick();
        setMembers(ms => {
          const next = refreshMembers(ms);
          return next.some((m, i) => m !== ms[i]) ? next : ms;
        });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); };
  }, []);

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
    pendingSignupRef.current = true;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // create the doc immediately so this account is never mistaken for a deleted one
    await setDoc(doc(db, 'users', cred.user.uid), { subscription: freshTrial(), email }, { merge: true }).catch(console.error);
    // non-blocking: verification unlocks future rule hardening (email_verified)
    sendEmailVerification(cred.user).catch(console.error);
  }, []);

  const logout = useCallback(() => {
    dataReadyRef.current = false;
    fbSignOut(auth).catch(console.error);
  }, []);

  const deleteAccount = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    // Delete the Auth user FIRST: if it throws (requires-recent-login) nothing
    // is lost. On success the ID token stays valid long enough to remove the doc.
    dataReadyRef.current = false;
    await deleteUser(user);
    await deleteDoc(doc(db, 'users', user.uid)).catch(console.error);
  }, []);

  const addMember = useCallback((f: MemberFormData): number => {
    const now = new Date();
    const joinedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const base: Member = {
      id: Date.now(), name: f.name.trim(), phone: f.phone.trim(),
      email: (f.email || '').trim(), joined: fmtDate(now), joinedAt, lastVisit: '—',
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
      // extend from the current expiry if still in the future, else from today
      const baseTime = m.expiresAt && daysUntil(m.expiresAt) > 0
        ? new Date(m.expiresAt + 'T12:00:00').getTime() : Date.now();
      const exp = new Date(baseTime + len * 864e5);
      const expiresAt = `${exp.getFullYear()}-${String(exp.getMonth() + 1).padStart(2, '0')}-${String(exp.getDate()).padStart(2, '0')}`;
      return { ...m, daysLeft: daysUntil(expiresAt), status: 'active' as const, expires: fmtDate(exp), expiresAt };
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
      return { ...m, adet: wasAttended ? adet + 1 : Math.max(0, adet - 1) };
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

  const isAdmin = (firebaseUser?.email || '').toLowerCase() === ADMIN_EMAIL;

  // Admin: read every gym account (allowed by Firestore rules for the admin email)
  const fetchAllGyms = useCallback(async (): Promise<GymSummary[]> => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => {
      const data = d.data();
      return {
        uid: d.id,
        email: data.email || data.profile?.email || '—',
        salonName: data.profile?.salonName || '—',
        city: data.profile?.city || '',
        memberCount: Array.isArray(data.members) ? data.members.length : 0,
        subscription: data.subscription || expiredLegacy(),
      };
    }).filter(g => g.email.toLowerCase() !== ADMIN_EMAIL); // own account isn't a customer
  }, []);

  const updateGymSubscription = useCallback(async (uid: string, patch: Partial<Subscription>) => {
    await setDoc(doc(db, 'users', uid), { subscription: patch }, { merge: true });
    if (firebaseUser && uid === firebaseUser.uid) {
      setSubscription(prev => (prev ? { ...prev, ...patch } : prev));
    }
  }, [firebaseUser]);

  const deleteGym = useCallback(async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid));
  }, []);

  // Lock the app when the period has ended or the account is suspended.
  // Admin is always exempt; null subscription means "still loading".
  const subBlocked = (() => {
    if (isAdmin || !subscription) return false;
    if (subscription.status === 'suspended') return true;
    const end = new Date(subscription.endDate + 'T23:59:59').getTime();
    // an unreadable end date must lock the app, never hand out free access
    if (!Number.isFinite(end)) return true;
    return Date.now() > end;
  })();

  return {
    members, addMember, updateMember, deleteMember, restoreMember, renewMember,
    profile, updateProfile, completeOnboarding, session, login, signup, logout, deleteAccount, loading, loadFailed,
    notifRead, markNotifsRead, attendanceLog, toggleAttendance,
    addDayToMember, removeDayFromMember, lang, setLang, waTemplates, setWaTemplate,
    subscription, subBlocked, isAdmin, fetchAllGyms, updateGymSubscription, deleteGym,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStoreValue();
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}
