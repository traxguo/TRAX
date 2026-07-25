// Security tests for firestore.rules — run against the Firestore emulator.
//   node test/firestore.rules.test.mjs
// Requires the emulator (firebase-tools) to be listening on 127.0.0.1:8080.
import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const ADMIN = 'goktugslv@gmail.com';
const iso = (off) => {
  const d = new Date(); d.setDate(d.getDate() + off);
  return d.toISOString().slice(0, 10);
};
const trial = () => ({ status: 'trial', endDate: iso(14), plan: 'monthly', priceUsd: 19.99, startedAt: iso(0) });

const env = await initializeTestEnvironment({
  projectId: 'trax-rules-test',
  firestore: { rules: fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
});

const anon = env.unauthenticatedContext().firestore();
const gym = env.authenticatedContext('gym1', { email: 'owner@gym.com' }).firestore();
const other = env.authenticatedContext('gym2', { email: 'other@gym.com' }).firestore();
const admin = env.authenticatedContext('adminuid', { email: ADMIN }).firestore();

let pass = 0, fail = 0;
const t = async (name, fn) => {
  try { await fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + '  →  ' + String(e.message).split('\n')[0].slice(0, 120)); fail++; }
};

// seed existing docs bypassing rules
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  await setDoc(doc(db, 'users/gym1'), { email: 'owner@gym.com', members: [], subscription: trial() });
  await setDoc(doc(db, 'users/gym2'), { email: 'other@gym.com', members: [], subscription: trial() });
});

console.log('\n--- anonymous ---');
await t('anon cannot read a gym doc', () => assertFails(getDoc(doc(anon, 'users/gym1'))));
await t('anon cannot write a gym doc', () => assertFails(setDoc(doc(anon, 'users/gym1'), { hacked: true })));

console.log('\n--- cross-account ---');
await t('gym1 cannot read gym2', () => assertFails(getDoc(doc(other, 'users/gym1'))));
await t('gym1 cannot write gym2', () => assertFails(updateDoc(doc(other, 'users/gym1'), { members: [] })));
await t('gym cannot list all accounts', () => assertFails(getDocs(collection(gym, 'users'))));

console.log('\n--- owner: normal app usage ---');
await t('owner reads own doc', () => assertSucceeds(getDoc(doc(gym, 'users/gym1'))));
await t('owner writes members/profile', () => assertSucceeds(updateDoc(doc(gym, 'users/gym1'), {
  members: [{ id: 1, name: 'A' }], profile: { salonName: 'X' }, attendanceLog: {}, lang: 'en',
})));
await t('owner writes the same subscription back (no-op sync)', () => assertSucceeds(
  setDoc(doc(gym, 'users/gym1'), { members: [], subscription: trial() }, { merge: true })));

console.log('\n--- PAYWALL: owner must not self-serve a subscription ---');
await t('owner CANNOT extend own endDate', () => assertFails(updateDoc(doc(gym, 'users/gym1'), {
  subscription: { status: 'active', endDate: '2099-01-01', plan: 'monthly', priceUsd: 19.99, startedAt: iso(0) },
})));
await t('owner CANNOT flip status to active', () => assertFails(updateDoc(doc(gym, 'users/gym1'), {
  'subscription.status': 'active',
})));
await t('owner CANNOT lift an admin suspension', () => assertFails(updateDoc(doc(gym, 'users/gym1'), {
  'subscription.endDate': '2099-01-01',
})));

console.log('\n--- signup (create) ---');
await t('new gym creates doc with a 14-day trial', async () => {
  const fresh = env.authenticatedContext('gym3', { email: 'new@gym.com' }).firestore();
  await assertSucceeds(setDoc(doc(fresh, 'users/gym3'), { email: 'new@gym.com', subscription: trial() }));
});
await t('new gym CANNOT create a 10-year trial', async () => {
  const cheat = env.authenticatedContext('gym4', { email: 'cheat@gym.com' }).firestore();
  await assertFails(setDoc(doc(cheat, 'users/gym4'), {
    email: 'cheat@gym.com',
    subscription: { status: 'trial', endDate: '2099-01-01', plan: 'monthly', priceUsd: 19.99, startedAt: iso(0) },
  }));
});
await t('new gym CANNOT create an active subscription', async () => {
  const cheat = env.authenticatedContext('gym5', { email: 'cheat2@gym.com' }).firestore();
  await assertFails(setDoc(doc(cheat, 'users/gym5'), {
    email: 'cheat2@gym.com',
    subscription: { status: 'active', endDate: iso(14), plan: 'monthly', priceUsd: 19.99, startedAt: iso(0) },
  }));
});
await t('new gym may create a doc with no subscription at all', async () => {
  const plain = env.authenticatedContext('gym6', { email: 'plain@gym.com' }).firestore();
  await assertSucceeds(setDoc(doc(plain, 'users/gym6'), { email: 'plain@gym.com', members: [] }));
});

console.log('\n--- admin ---');
await t('admin reads any doc', () => assertSucceeds(getDoc(doc(admin, 'users/gym1'))));
await t('admin lists all accounts', () => assertSucceeds(getDocs(collection(admin, 'users'))));
await t('admin extends a subscription', () => assertSucceeds(updateDoc(doc(admin, 'users/gym1'), {
  subscription: { status: 'active', endDate: iso(365), plan: 'monthly', priceUsd: 19.99, startedAt: iso(0) },
})));
await t('admin suspends an account', () => assertSucceeds(updateDoc(doc(admin, 'users/gym1'), { 'subscription.status': 'suspended' })));
await t('admin deletes an account', () => assertSucceeds(deleteDoc(doc(admin, 'users/gym2'))));

console.log('\n--- account deletion ---');
await t('owner deletes own account', () => assertSucceeds(deleteDoc(doc(gym, 'users/gym1'))));

console.log(`\n===== ${pass} passed, ${fail} failed =====`);
await env.cleanup();
process.exit(fail ? 1 : 0);
