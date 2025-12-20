import { useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase.js';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

export async function signInGoogle() {
  // Use redirect for mobile, popup for web
  if (Capacitor.isNativePlatform()) {
    await signInWithRedirect(auth, googleProvider);
  } else {
    // Dynamic import to avoid bundling issues
    const { signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, googleProvider);
  }
}

export async function logout() { await signOut(auth); }

async function ensureUserDoc(user) {
  if (!user) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      role: 'user',
      createdAt: serverTimestamp()
    });
  }
}

export function useAuthInit() {
  const [, setUser] = useState(null);
  useEffect(() => {
    // Handle redirect result for mobile
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await ensureUserDoc(result.user);
      }
    }).catch((error) => {
      console.error('Redirect sign-in error:', error);
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await ensureUserDoc(u);
    });
    return () => unsub();
  }, []);
}

export function useCurrentUser() {
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  return user;
}
