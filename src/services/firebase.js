// Firebase Cloud Backend Configuration for Hotel PMS Pro
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAdHlCHjFIZuS9LyiO0HTUL4DFhg7XO3yE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "hotel-263a3.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "hotel-263a3",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "hotel-263a3.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "172374373154",
  appId: env.VITE_FIREBASE_APP_ID || "1:172374373154:web:6747af4581d2d678abeb7b",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-LTCZMXG0XN"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Clean up stale Firestore multi-tab state keys from localStorage that exceed the 5MB browser quota
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToPurge = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('firestore_') || k.startsWith('firebase:'))) {
        keysToPurge.push(k);
      }
    }
    keysToPurge.forEach((k) => localStorage.removeItem(k));
  } catch (_) {}
}

// Initialize Cloud Firestore using memory cache to eliminate multi-tab IndexedDB lock contention
// and prevent localStorage quota exhaustion. The PMS maintains its own instant offline persistence
// in localStorage (hotel_astha_pms_v5), while Firestore operates purely as a live cloud synchronization engine.
let firestoreInstance = null;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
} catch (e) {
  try {
    firestoreInstance = getFirestore(app);
  } catch (err) {
    console.warn('[Firebase] Firestore fallback initialization error:', err);
  }
}
export const db = firestoreInstance;

// Initialize Firebase Auth lazily on demand to avoid automatic CONFIGURATION_NOT_FOUND errors
// when Authentication has not yet been activated in the Firebase Console.
let _authInstance = null;
export const getFirebaseAuth = () => {
  if (!_authInstance && typeof window !== 'undefined') {
    try {
      _authInstance = getAuth(app);
    } catch (e) {
      console.warn('Firebase Auth initialization deferred:', e);
    }
  }
  return _authInstance;
};

export const auth = new Proxy({}, {
  get(target, prop) {
    const instance = getFirebaseAuth();
    if (!instance) return undefined;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

// Initialize Cloud Storage
export const storage = getStorage(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional fallback
  });
}

export default app;
