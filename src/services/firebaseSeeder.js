// Firebase Cloud Firestore Seeder & Sync Utility
// Migrates seed fixtures from initialPmsData.js into Cloud Firestore
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  collection
} from "firebase/firestore";
import { db } from "./firebase";
import {
  initialProperty,
  initialRoomTypes,
  initialRooms,
  initialMealPlans,
  initialRatePlans,
  initialReservations,
  initialFolios,
  initialStaffNotes,
  initialOtaChannels,
  initialTeamMembers,
  initialNightAudits,
  initialAuditTrail
} from "../data/initialPmsData";

export async function checkAndSeedFirestore(propertyId = 'prop_astha_01', force = false) {
  try {
    const propRef = doc(db, 'properties', propertyId);
    const propSnap = await getDoc(propRef);

    if (propSnap.exists() && !force) {
      return {
        alreadySeeded: true,
        message: `Property ${propertyId} already exists in Firestore.`
      };
    }

    console.info(`[FirebaseSeeder] Seeding property ${propertyId} into Cloud Firestore...`);

    // 1. Save Root Property Document
    await setDoc(propRef, {
      ...initialProperty,
      id: propertyId,
      updatedAt: new Date().toISOString()
    });

    // 2. Batch write Room Types
    const batch1 = writeBatch(db);
    initialRoomTypes.forEach((rt) => {
      const rtRef = doc(db, 'properties', propertyId, 'roomTypes', rt.id);
      batch1.set(rtRef, rt);
    });
    await batch1.commit();

    // 3. Batch write Rooms
    const batch2 = writeBatch(db);
    initialRooms.forEach((r) => {
      const rRef = doc(db, 'properties', propertyId, 'rooms', r.id);
      batch2.set(rRef, r);
    });
    await batch2.commit();

    // 4. Batch write Meal Plans & Rate Plans
    const batch3 = writeBatch(db);
    initialMealPlans.forEach((mp) => {
      const mpRef = doc(db, 'properties', propertyId, 'mealPlans', mp.code);
      batch3.set(mpRef, mp);
    });
    initialRatePlans.forEach((rp) => {
      const rpRef = doc(db, 'properties', propertyId, 'ratePlans', rp.code);
      batch3.set(rpRef, rp);
    });
    await batch3.commit();

    // 5. Batch write Reservations
    const batch4 = writeBatch(db);
    initialReservations.forEach((res) => {
      const resRef = doc(db, 'properties', propertyId, 'reservations', res.id);
      batch4.set(resRef, res);
    });
    await batch4.commit();

    // 6. Batch write Folios
    const batch5 = writeBatch(db);
    Object.entries(initialFolios).forEach(([folioKey, folioData]) => {
      const folioRef = doc(db, 'properties', propertyId, 'folios', folioKey);
      batch5.set(folioRef, folioData);
    });
    await batch5.commit();

    // 7. Batch write Team Members & Announcements
    const batch6 = writeBatch(db);
    initialTeamMembers.forEach((member) => {
      const mRef = doc(db, 'properties', propertyId, 'teamMembers', member.id);
      batch6.set(mRef, member);
    });
    (initialStaffNotes || []).forEach((note) => {
      const nRef = doc(db, 'properties', propertyId, 'announcements', note.id);
      batch6.set(nRef, note);
    });
    await batch6.commit();

    // 8. Maintenance Blocks & Audit Trail
    const batch7 = writeBatch(db);
    const initialMaintenanceBlocks = [
      {
        id: 'mb_01',
        roomId: 'rm_203',
        roomNumber: '203',
        reason: 'AC Compressor overhaul & coolant flush',
        startDate: '2026-10-23',
        endDate: '2026-10-26',
        createdAt: '2026-10-23T08:00:00Z'
      }
    ];
    initialMaintenanceBlocks.forEach((mb) => {
      const mbRef = doc(db, 'properties', propertyId, 'maintenanceBlocks', mb.id);
      batch7.set(mbRef, mb);
    });

    initialNightAudits.forEach((na) => {
      const naRef = doc(db, 'properties', propertyId, 'nightAudits', na.id);
      batch7.set(naRef, na);
    });
    await batch7.commit();

    console.info(`[FirebaseSeeder] Cloud Firestore seeding complete for ${propertyId}`);
    return {
      alreadySeeded: false,
      success: true,
      message: 'Cloud Firestore successfully seeded with all initial Hotel PMS records!'
    };
  } catch (error) {
    console.error('[FirebaseSeeder] Error seeding Firestore:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
