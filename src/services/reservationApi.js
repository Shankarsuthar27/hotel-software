// Reservation API Service for Hotel PMS Pro
// Directly creates reservations and synchronizes with Firebase Cloud Firestore and local store

import { pmsStore } from './pmsStore';

/**
 * Creates a reservation and persists to Firebase Cloud Firestore and local store.
 */
export async function createReservationViaApi(bookingData) {
  return pmsStore.createReservation(bookingData);
}

/**
 * Fetches all reservations from PMS store
 */
export async function fetchReservationsViaApi() {
  return pmsStore.getState().reservations;
}
