// Firebase Authentication Service for Hotel PMS Pro
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Sign in staff member with email and password
 * @param {string} email
 * @param {string} password
 */
export async function loginStaff(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Staff login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Quick sign-in as front desk staff (for local/demo operations)
 */
export async function quickStaffLogin(displayName = 'Front Desk Operator') {
  try {
    const cred = await signInAnonymously(auth);
    return { success: true, user: cred.user };
  } catch (error) {
    console.warn('Anonymous auth note:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Log out currently authenticated staff
 */
export async function logoutStaff() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Listen to staff auth state changes
 * @param {Function} callback
 */
export function subscribeToStaffAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentStaff() {
  return auth.currentUser;
}
