// Script to transfer all Hotel PMS data, settings, check-ins, check-outs, folios, and rooms to Firebase Cloud Firestore
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  writeBatch
} from "firebase/firestore";

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
} from "../src/data/initialPmsData.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Dynamically load environment variables from .env if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || "").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1]] = val;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID || "",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

console.log(`🚀 Initializing Firebase App for project: ${firebaseConfig.projectId || "hotel-263a3"}...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROPERTY_ID = "prop_astha_01";

async function transferAllData() {
  console.log("=================================================");
  console.log("🏨 STARTING CLOUD FIRESTORE DATA TRANSFER");
  console.log("=================================================");

  try {
    // 1. Property Settings & Master Config
    console.log("📦 Transferring Property Settings...");
    const propertyDoc = {
      ...initialProperty,
      id: PROPERTY_ID,
      transferredAt: new Date().toISOString(),
      operationalStatus: "ACTIVE_LIVE"
    };
    await setDoc(doc(db, "properties", PROPERTY_ID), propertyDoc);
    await setDoc(doc(db, "settings", "property_config"), propertyDoc);
    console.log("✅ Property Settings successfully written.");

    // 2. Room Types
    console.log("📦 Transferring Room Types...");
    for (const rt of initialRoomTypes) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "roomTypes", rt.id), rt);
      await setDoc(doc(db, "roomTypes", rt.id), { ...rt, propertyId: PROPERTY_ID });
    }
    console.log(`✅ ${initialRoomTypes.length} Room Types transferred.`);

    // 3. Physical Rooms & Live Clean/Dirty Statuses
    console.log("📦 Transferring Physical Rooms & Inventory...");
    for (const room of initialRooms) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "rooms", room.id), room);
      await setDoc(doc(db, "rooms", room.id), { ...room, propertyId: PROPERTY_ID });
    }
    console.log(`✅ ${initialRooms.length} Physical Rooms transferred.`);

    // 4. Meal Plans & Rate Plans
    console.log("📦 Transferring Meal & Rate Plans...");
    for (const mp of initialMealPlans) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "mealPlans", mp.code), mp);
      await setDoc(doc(db, "mealPlans", mp.code), mp);
    }
    for (const rp of initialRatePlans) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "ratePlans", rp.code), rp);
      await setDoc(doc(db, "ratePlans", rp.code), rp);
    }
    console.log("✅ Meal & Rate Plans transferred.");

    // 5. Current Reservations (Check-ins, Check-outs, In-House, Confirmed)
    console.log("📦 Transferring Reservations (Active Check-ins & Bookings)...");
    for (const res of initialReservations) {
      const resPayload = {
        ...res,
        propertyId: PROPERTY_ID,
        syncedToCloudAt: new Date().toISOString()
      };
      // Write to nested property collection
      await setDoc(doc(db, "properties", PROPERTY_ID, "reservations", res.id), resPayload);
      // Write to top-level reservations collection
      await setDoc(doc(db, "reservations", res.id), resPayload);
      console.log(`   ➔ Stored ${res.bookingReference} (${res.primaryGuest.name}) - Status: [${res.status.toUpperCase()}]`);
    }
    console.log(`✅ ${initialReservations.length} Active Reservations transferred.`);

    // 6. Folios & Financial Transactions (Debits, Credits, Taxes)
    console.log("📦 Transferring Folios & Financial Transactions...");
    for (const [folioId, folioData] of Object.entries(initialFolios)) {
      const folioPayload = {
        ...folioData,
        id: folioId,
        propertyId: PROPERTY_ID,
        syncedToCloudAt: new Date().toISOString()
      };
      await setDoc(doc(db, "properties", PROPERTY_ID, "folios", folioId), folioPayload);
      await setDoc(doc(db, "folios", folioId), folioPayload);
      console.log(`   ➔ Stored ${folioData.folioNumber} (Reservation: ${folioData.reservationId}) with ${folioData.transactions?.length || 0} transactions.`);
    }
    console.log("✅ Folios and Ledger transactions transferred.");

    // 7. Guests Directory & KYC Records
    console.log("📦 Creating Guest CRM records...");
    const guests = [
      {
        id: "gst_shankar_suthar",
        name: "Mr Shankar Suthar",
        title: "Mr.",
        firstName: "shankar",
        lastName: "suthar",
        phone: "9664471637",
        email: "ss2137789@gmail.com",
        birthDate: "2002-09-27",
        gender: "Male",
        address: "jalore, Rajasthan",
        zip: "343001",
        idType: "Aadhaar Card",
        idNumber: "990969609690",
        issuingCountry: "India",
        issuingCity: "jalore",
        totalStays: 1,
        totalSpent: 5250,
        currentStatus: "IN_HOUSE",
        activeRoom: "102",
        activeBookingRef: "#RES_1"
      },
      {
        id: "gst_krishna_suthar",
        name: "Mr Krishna Suthar",
        phone: "+91 98450 11223",
        email: "krishna.suthar@example.com",
        nationality: "Indian",
        totalStays: 1,
        totalSpent: 18733.33,
        currentStatus: "CONFIRMED_ARRIVAL",
        activeRoom: "102",
        activeBookingRef: "#RES_2"
      }
    ];

    for (const guest of guests) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "guests", guest.id), guest);
      await setDoc(doc(db, "guests", guest.id), guest);
    }
    console.log(`✅ ${guests.length} Guest Profiles transferred.`);

    // 8. Team Members & Granular RBAC Permissions
    console.log("📦 Transferring Team Members & Permissions...");
    const allTeamMembers = [
      ...initialTeamMembers,
      {
        id: "usr_02",
        name: "Rahul Verma",
        email: "reception@hotelastha.com",
        role: "Front Desk Agent",
        avatar: "👨‍💻",
        status: "ACTIVE",
        properties: ["HOTEL ASTHA"],
        permissions: {
          reservations: { view: true, create: true, edit: true, cancel: false },
          nightAudit: { view: false, execute: false },
          ratesAndInventory: { view: true, edit: false, bulkUpdate: false, stopSell: false },
          team: { view: false, manage: false },
          dashboard: { view: true },
          piiAccess: false,
          ledger: { view: true, settle: true, override: false }
        }
      },
      {
        id: "usr_03",
        name: "Sunita Meena",
        email: "housekeeping@hotelastha.com",
        role: "Housekeeping Supervisor",
        avatar: "🧹",
        status: "ACTIVE",
        properties: ["HOTEL ASTHA"],
        permissions: {
          reservations: { view: true, create: false, edit: false, cancel: false },
          nightAudit: { view: false, execute: false },
          ratesAndInventory: { view: false, edit: false, bulkUpdate: false, stopSell: false },
          team: { view: false, manage: false },
          dashboard: { view: true },
          piiAccess: false,
          ledger: { view: false, settle: false, override: false }
        }
      },
      {
        id: "usr_04",
        name: "Amit Patel",
        email: "auditor@hotelastha.com",
        role: "Night Auditor",
        avatar: "🌙",
        status: "ACTIVE",
        properties: ["HOTEL ASTHA"],
        permissions: {
          reservations: { view: true, create: true, edit: true, cancel: false },
          nightAudit: { view: true, execute: true },
          ratesAndInventory: { view: true, edit: false, bulkUpdate: false, stopSell: false },
          team: { view: false, manage: false },
          dashboard: { view: true },
          piiAccess: true,
          ledger: { view: true, settle: true, override: true }
        }
      }
    ];

    for (const member of allTeamMembers) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "teamMembers", member.id), member);
      await setDoc(doc(db, "teamMembers", member.id), member);
    }
    console.log(`✅ ${allTeamMembers.length} Team Members & Permission matrices transferred.`);

    // 9. Maintenance Blocks
    console.log("📦 Transferring Maintenance Blocks...");
    const maintenanceBlocks = [
      {
        id: "mb_01",
        roomId: "rm_203",
        roomNumber: "203",
        reason: "AC Compressor overhaul & coolant flush",
        startDate: "2026-10-23",
        endDate: "2026-10-26",
        createdAt: "2026-10-23T08:00:00Z"
      }
    ];
    for (const mb of maintenanceBlocks) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "maintenanceBlocks", mb.id), mb);
      await setDoc(doc(db, "maintenanceBlocks", mb.id), mb);
    }
    console.log("✅ Maintenance Blocks transferred.");

    // 10. Night Audit Records & Day-Close History
    console.log("📦 Transferring Night Audit History...");
    for (const na of initialNightAudits) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "nightAudits", na.id), na);
      await setDoc(doc(db, "nightAudits", na.id), na);
    }
    console.log("✅ Night Audit History transferred.");

    // 11. Audit Trail Activity Logs
    console.log("📦 Transferring Audit Trail Activity Logs...");
    for (const at of initialAuditTrail) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "auditTrail", at.id), at);
      await setDoc(doc(db, "auditTrail", at.id), at);
    }
    console.log("✅ Audit Trail transferred.");

    // 12. OTA Channel Manager Configs
    console.log("📦 Transferring OTA Channel Configs...");
    for (const ota of initialOtaChannels) {
      await setDoc(doc(db, "properties", PROPERTY_ID, "otaChannels", ota.id), ota);
      await setDoc(doc(db, "otaChannels", ota.id), ota);
    }
    console.log("✅ OTA Channels transferred.");

    console.log("=================================================");
    console.log("🎉 ALL HOTEL PMS DATA TRANSFERRED TO FIREBASE!");
    console.log("   Database: Cloud Firestore (hotel-263a3)");
    console.log("   Property ID: prop_astha_01");
    console.log("=================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Data transfer failed:", error);
    process.exit(1);
  }
}

transferAllData();
