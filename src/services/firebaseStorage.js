// Firebase Cloud Storage Helper for Hotel PMS Pro
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a guest KYC identity document (Aadhaar / Passport / DL)
 * @param {string} propertyId
 * @param {string} guestId
 * @param {File|Blob} file
 * @param {string} docType
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadGuestIdDocument(propertyId = 'prop_astha_01', guestId, file, docType = 'kyc') {
  if (!file || !guestId) {
    throw new Error('File and guestId are required for upload');
  }

  const timestamp = Date.now();
  const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
  const cleanDocType = docType.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const storagePath = `properties/${propertyId}/guests/${guestId}/${cleanDocType}_${timestamp}.${fileExt}`;

  const storageRef = ref(storage, storagePath);
  const metadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      propertyId,
      guestId,
      docType,
      uploadedAt: new Date().toISOString()
    }
  };

  const snapshot = await uploadBytes(storageRef, file, metadata);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    url: downloadUrl,
    path: storagePath,
    fileName: file.name || `doc_${timestamp}.${fileExt}`
  };
}

/**
 * Uploads a reservation attachment or invoice PDF
 * @param {string} propertyId
 * @param {string} reservationId
 * @param {File|Blob} file
 * @param {string} fileName
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadReservationDocument(propertyId = 'prop_astha_01', reservationId, file, fileName) {
  const timestamp = Date.now();
  const safeName = fileName || (file.name ? file.name : `doc_${timestamp}.pdf`);
  const storagePath = `properties/${propertyId}/reservations/${reservationId}/${safeName}`;

  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'application/pdf'
  });
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    url: downloadUrl,
    path: storagePath
  };
}

/**
 * Deletes a file from Firebase Storage
 * @param {string} storagePath
 */
export async function deleteStorageFile(storagePath) {
  if (!storagePath) return;
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
