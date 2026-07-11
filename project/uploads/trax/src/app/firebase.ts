import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLDskc9duTxG7z8hQjn48-_s1p4IQ_g4U",
  authDomain: "trax-5b78d.firebaseapp.com",
  projectId: "trax-5b78d",
  storageBucket: "trax-5b78d.firebasestorage.app",
  messagingSenderId: "902060686864",
  appId: "1:902060686864:web:6c52dd427779759d8ed495",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Offline persistence: writes are queued locally and synced when online.
// Multi-tab manager: Safari tab + installed PWA can be open at the same
// time without fighting over the IndexedDB lease (rare startup hangs).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true,
});
