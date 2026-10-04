import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, setDoc, getDoc } from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StreakData, UserStats } from '../types';

export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID from config
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : '(default)'
);

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Auto-authenticate anonymously if no active user session, ensuring immediate persistence
export function initFirebaseAuth(onUser: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      onUser(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        onUser(cred.user);
      } catch (err) {
        console.warn('Firebase anonymous auth fallback:', err);
        onUser(null);
      }
    }
  });
}

// Sign In with Email and Password
export async function logInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

// Sign Up with Email and Password
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn('Could not set displayName:', e);
    }
  }
  return cred.user;
}

// Sign In with Google popup
export async function logInWithGoogle(): Promise<FirebaseUser> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

// Sign Out
export async function logOut(): Promise<void> {
  await signOut(auth);
  // Re-initialize anonymous user so the app still functions seamlessly
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.warn('Signout anonymous re-init:', e);
  }
}

// Test Firestore connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firestore client is offline. Check Firebase configuration.');
    }
  }
}

// Save user data to Firestore
export async function syncUserDataToFirestore(
  userId: string,
  data: {
    email?: string | null;
    displayName?: string | null;
    username?: string;
    platform?: string;
    streak?: StreakData;
    stats?: UserStats;
    completedMilestones?: string[];
  }
) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        id: userId,
        ...data,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Could not sync to Firestore:', e);
  }
}

// Load user data from Firestore
export async function loadUserDataFromFirestore(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (e) {
    console.warn('Could not fetch user document from Firestore:', e);
    return null;
  }
}
