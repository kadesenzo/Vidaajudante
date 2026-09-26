import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  });
} catch {
  authInstance = getAuth(app);
}

// Ensure persistent session across browser restarts and device reboots
setPersistence(authInstance, browserLocalPersistence).catch((err) => {
  console.warn('Set auth persistence notice:', err);
});

export const auth: Auth = authInstance;
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default app;
