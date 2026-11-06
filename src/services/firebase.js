// Firebase Cloud Backend Configuration for Hotel PMS Pro
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

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

// Enable Offline Persistence for Front-Desk Continuity & Network Resilience
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.info('Firestore multi-tab persistence active.');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore persistence not supported in this client environment.');
      }
    });
  } catch (e) {
    // Hot-reload guard
  }
}

export default app;
