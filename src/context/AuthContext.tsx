import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';

const STORAGE_KEY_AUTO_LOGIN = 'life_os_auto_login';
const STORAGE_KEY_SAVED_CREDS = 'life_os_device_creds';
const STORAGE_KEY_LAST_ACCOUNT = 'life_os_last_account';
const STORAGE_KEY_GUEST_ACTIVE = 'life_os_guest_active';

export interface SavedAccountInfo {
  uid: string;
  email: string;
  displayName: string;
  preferredName?: string;
  photoURL?: string;
  authProvider: 'password' | 'google' | 'guest';
  lastLogin: number;
}

// Helper to safely store local device credentials
function encodeCreds(email: string, pass: string): string {
  try {
    return btoa(encodeURIComponent(`${email}:::${pass}`));
  } catch {
    return '';
  }
}

function decodeCreds(encoded: string): { email: string; pass: string } | null {
  try {
    const raw = decodeURIComponent(atob(encoded));
    const parts = raw.split(':::');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { email: parts[0], pass: parts[1] };
    }
  } catch {}
  return null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isRestoringSession: boolean;
  autoLoginEnabled: boolean;
  lastAccount: SavedAccountInfo | null;
  setAutoLoginEnabled: (enabled: boolean) => void;
  clearDeviceMemory: () => void;
  signInWithGoogle: (remember?: boolean) => Promise<void>;
  signInGuest: (remember?: boolean) => Promise<void>;
  loginEmail: (email: string, pass: string, remember?: boolean) => Promise<void>;
  signupEmail: (email: string, pass: string, name: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(false);
  const [autoLoginEnabled, setAutoLoginState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY_AUTO_LOGIN);
    return stored === null ? true : stored === 'true';
  });
  const [lastAccount, setLastAccount] = useState<SavedAccountInfo | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAST_ACCOUNT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAutoLoginEnabled = (enabled: boolean) => {
    setAutoLoginState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, enabled ? 'true' : 'false');
      if (!enabled) {
        localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
        localStorage.removeItem(STORAGE_KEY_GUEST_ACTIVE);
      }
    }
  };

  const clearDeviceMemory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
      localStorage.removeItem(STORAGE_KEY_LAST_ACCOUNT);
      localStorage.removeItem(STORAGE_KEY_GUEST_ACTIVE);
      setLastAccount(null);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (isCancelled) return;

      if (currentUser) {
        setUser(currentUser);
        setIsRestoringSession(false);

        // Update persistent device account record
        const accInfo: SavedAccountInfo = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Usuário',
          photoURL: currentUser.photoURL || undefined,
          authProvider: currentUser.isAnonymous ? 'guest' : currentUser.email ? 'password' : 'google',
          lastLogin: Date.now(),
        };
        setLastAccount(accInfo);
        try {
          localStorage.setItem(STORAGE_KEY_LAST_ACCOUNT, JSON.stringify(accInfo));
          localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, 'true');
        } catch {}

        const userDocRef = doc(db, 'users', currentUser.uid, 'profile', 'main');

        const unsubProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (isCancelled) return;
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setProfile(data);
              if (data.preferredName) {
                const updatedAcc = { ...accInfo, preferredName: data.preferredName };
                setLastAccount(updatedAcc);
                localStorage.setItem(STORAGE_KEY_LAST_ACCOUNT, JSON.stringify(updatedAcc));
              }
            } else {
              const initialProfile: UserProfile = {
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Usuário',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || undefined,
                preferredName: currentUser.displayName?.split(' ')[0] || 'Você',
                language: 'pt-BR',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
                currency: 'BRL',
                wakeTime: '07:00',
                sleepTime: '23:00',
                studiesActive: true,
                worksActive: true,
                hasProjects: true,
                mainGoals: ['Produtividade', 'Estudos', 'Organização'],
                forgetfulnessReason: 'tenho muitas coisas para fazer',
                onboardingCompleted: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              setDoc(userDocRef, initialProfile, { merge: true }).catch((err) => {
                console.warn('Profile write notice (offline or sync):', err);
              });
              setProfile(initialProfile);
            }
            setLoading(false);
          },
          (err) => {
            console.warn('Profile snapshot warning:', err.message);
            if (!profile && !isCancelled) {
              setProfile({
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Usuário',
                email: currentUser.email || '',
                preferredName: currentUser.displayName?.split(' ')[0] || 'Você',
                language: 'pt-BR',
                timeZone: 'America/Sao_Paulo',
                currency: 'BRL',
                wakeTime: '07:00',
                sleepTime: '23:00',
                studiesActive: true,
                worksActive: true,
                hasProjects: true,
                mainGoals: ['Produtividade', 'Estudos'],
                forgetfulnessReason: 'muitas coisas simultâneas',
                onboardingCompleted: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
            setLoading(false);
          }
        );

        return () => unsubProfile();
      } else {
        // No current Firebase session in memory. Check if device has auto-login configured!
        const autoLoginPref = localStorage.getItem(STORAGE_KEY_AUTO_LOGIN);
        const isAutoLogin = autoLoginPref === null || autoLoginPref === 'true';

        if (isAutoLogin) {
          const rawCreds = localStorage.getItem(STORAGE_KEY_SAVED_CREDS);
          if (rawCreds) {
            const creds = decodeCreds(rawCreds);
            if (creds?.email && creds?.pass) {
              setIsRestoringSession(true);
              try {
                await setPersistence(auth, browserLocalPersistence);
                await signInWithEmailAndPassword(auth, creds.email, creds.pass);
                // onAuthStateChanged will be invoked with the logged-in user!
                return;
              } catch (autoErr) {
                console.warn('Silent auto-login attempt failed:', autoErr);
                // If credentials are stale/invalid, clear them so user can enter new credentials
                localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
                setIsRestoringSession(false);
              }
            }
          }

          // If previous session was Guest and auto-login is active
          const wasGuest = localStorage.getItem(STORAGE_KEY_GUEST_ACTIVE) === 'true';
          if (wasGuest) {
            setIsRestoringSession(true);
            try {
              await setPersistence(auth, browserLocalPersistence);
              await signInAnonymously(auth);
              return;
            } catch (guestErr) {
              console.warn('Silent guest auto-login failed:', guestErr);
              localStorage.removeItem(STORAGE_KEY_GUEST_ACTIVE);
              setIsRestoringSession(false);
            }
          }
        }

        setUser(null);
        setProfile(null);
        setIsRestoringSession(false);
        setLoading(false);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribeAuth();
    };
  }, []);

  const signInWithGoogle = async (remember: boolean = true) => {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    if (remember) {
      localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, 'true');
    }
  };

  const signInGuest = async (remember: boolean = true) => {
    await setPersistence(auth, browserLocalPersistence);
    await signInAnonymously(auth);
    if (remember) {
      localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, 'true');
      localStorage.setItem(STORAGE_KEY_GUEST_ACTIVE, 'true');
    }
  };

  const loginEmail = async (email: string, pass: string, remember: boolean = true) => {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, pass);
    if (remember) {
      localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, 'true');
      localStorage.setItem(STORAGE_KEY_SAVED_CREDS, encodeCreds(email, pass));
    } else {
      localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
    }
  };

  const signupEmail = async (email: string, pass: string, name: string, remember: boolean = true) => {
    await setPersistence(auth, browserLocalPersistence);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (remember) {
      localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, 'true');
      localStorage.setItem(STORAGE_KEY_SAVED_CREDS, encodeCreds(email, pass));
    }

    const initialProfile: UserProfile = {
      uid: cred.user.uid,
      displayName: name || 'Usuário',
      email: cred.user.email || email,
      preferredName: name || 'Você',
      language: 'pt-BR',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'BRL',
      wakeTime: '07:00',
      sleepTime: '23:00',
      studiesActive: true,
      worksActive: true,
      hasProjects: true,
      mainGoals: ['Produtividade', 'Estudos'],
      forgetfulnessReason: 'muitas coisas simultâneas',
      onboardingCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await setDoc(doc(db, 'users', cred.user.uid, 'profile', 'main'), initialProfile, { merge: true });
    } catch (e) {
      console.warn('Initial profile write:', e);
    }
  };

  const logout = async () => {
    // Explicit logout clears auto-login credentials so the user won't be trapped in auto-login loop
    localStorage.setItem(STORAGE_KEY_AUTO_LOGIN, 'false');
    localStorage.removeItem(STORAGE_KEY_SAVED_CREDS);
    localStorage.removeItem(STORAGE_KEY_GUEST_ACTIVE);
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'profile', 'main');
    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };
    try {
      await setDoc(docRef, updatedData, { merge: true });
      setProfile(prev => prev ? ({ ...prev, ...updatedData }) : (updatedData as UserProfile));
    } catch (err: any) {
      console.warn('Update profile error:', err);
      setProfile(prev => prev ? ({ ...prev, ...updatedData }) : (updatedData as UserProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isRestoringSession,
        autoLoginEnabled,
        lastAccount,
        setAutoLoginEnabled,
        clearDeviceMemory,
        signInWithGoogle,
        signInGuest,
        loginEmail,
        signupEmail,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

