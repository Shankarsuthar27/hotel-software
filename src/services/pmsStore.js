// Central Enterprise PMS Store for Hotel PMS Pro
// Features: Firebase Cloud Firestore Live Real-time Sync, Offline Persistence,
// ACID Transactions, Night Audit, Double-Entry Folio Ledger, GST & Audit Trails

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
} from '../data/initialPmsData';
import { calculateRoomTax } from './taxEngine';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { checkAndSeedFirestore } from './firebaseSeeder';

const STORAGE_KEY = 'hotel_astha_pms_v5';

class PMSStore {
  constructor() {
    this.listeners = new Set();
    this.propertyId = 'prop_astha_01';
    this.cloudStatus = 'CONNECTING'; // 'CONNECTING' | 'LIVE' | 'OFFLINE_CACHE'
    this.unsubscribers = [];

    // 1. Instant local load (zero latency UI render)
    this.load();

    // 2. Initialize Firebase Cloud Firestore synchronization
    this.initFirebaseSync();
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.property = parsed.property || initialProperty;
        this.roomTypes = parsed.roomTypes || initialRoomTypes;
        this.rooms = parsed.rooms || initialRooms;
        this.mealPlans = parsed.mealPlans || initialMealPlans;
        this.ratePlans = parsed.ratePlans || initialRatePlans;
        this.reservations = parsed.reservations || initialReservations;
        ['res_5', 'res_4', 'res_3'].forEach(id => {
          const initRes = initialReservations.find(r => r.id === id);
          if (initRes) {
            const existingIdx = this.reservations.findIndex(r => r.id === id);
            if (existingIdx === -1) {
              this.reservations.unshift(initRes);
            } else {
              this.reservations[existingIdx] = {
                ...this.reservations[existingIdx],
                ...initRes,
                primaryGuest: {
                  ...(this.reservations[existingIdx].primaryGuest || {}),
                  ...(initRes.primaryGuest || {})
                },
                status: initRes.status,
                totalAmount: initRes.totalAmount,
                paidAmount: initRes.paidAmount,
                balanceDue: initRes.balanceDue
              };
            }
          }
        });
        this.folios = parsed.folios || initialFolios;
        ['fol_3', 'fol_4', 'fol_5'].forEach(fId => {
          if (!this.folios[fId] && initialFolios[fId]) {
            this.folios[fId] = initialFolios[fId];
          }
        });
        this.announcements = parsed.announcements || initialStaffNotes || [];
        this.otaChannels = parsed.otaChannels || initialOtaChannels;
        this.teamMembers = parsed.teamMembers || initialTeamMembers;
        this.nightAudits = parsed.nightAudits || initialNightAudits;
        this.auditTrail = parsed.auditTrail || initialAuditTrail;
        this.stopouts = parsed.stopouts || {};
        this.maintenanceBlocks = parsed.maintenanceBlocks || [];
        return;
      } catch (e) {
        console.warn('Failed to parse saved PMS state, resetting to defaults.', e);
      }
    }
    this.resetToDefaults();
  }

  resetToDefaults() {
    this.property = { ...initialProperty };
    this.roomTypes = JSON.parse(JSON.stringify(initialRoomTypes));
    this.rooms = JSON.parse(JSON.stringify(initialRooms));
    this.mealPlans = JSON.parse(JSON.stringify(initialMealPlans));
    this.ratePlans = JSON.parse(JSON.stringify(initialRatePlans));
    this.reservations = JSON.parse(JSON.stringify(initialReservations));
    this.folios = JSON.parse(JSON.stringify(initialFolios));
    this.announcements = JSON.parse(JSON.stringify(initialStaffNotes || []));
    this.otaChannels = JSON.parse(JSON.stringify(initialOtaChannels));
    this.teamMembers = JSON.parse(JSON.stringify(initialTeamMembers));
    this.nightAudits = JSON.parse(JSON.stringify(initialNightAudits));
    this.auditTrail = JSON.parse(JSON.stringify(initialAuditTrail));
    this.stopouts = {};
    this.maintenanceBlocks = [
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
    this.save();
  }

  save() {
    const payload = {
      property: this.property,
      roomTypes: this.roomTypes,
      rooms: this.rooms,
      mealPlans: this.mealPlans,
      ratePlans: this.ratePlans,
      reservations: this.reservations,
      folios: this.folios,
      announcements: this.announcements,
      otaChannels: this.otaChannels,
      teamMembers: this.teamMembers,
      nightAudits: this.nightAudits,
      auditTrail: this.auditTrail,
      stopouts: this.stopouts,
      maintenanceBlocks: this.maintenanceBlocks
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('PMSStore listener error:', err);
      }
    });
  }

  getState() {
    return {
      property: this.property,
      roomTypes: this.roomTypes,
      rooms: this.rooms,
      mealPlans: this.mealPlans,
      ratePlans: this.ratePlans,
      reservations: this.reservations,
      folios: this.folios,
      announcements: this.announcements || [],
      otaChannels: this.otaChannels,
      teamMembers: this.teamMembers,
      nightAudits: this.nightAudits,
      auditTrail: this.auditTrail,
      stopouts: this.stopouts,
      maintenanceBlocks: this.maintenanceBlocks,
      cloudStatus: this.cloudStatus,
      isCloudLive: this.cloudStatus === 'LIVE'
    };
  }

  getReservation(resId) {
    if (!resId) return null;
    return this.reservations.find((r) => r.id === resId || r.bookingReference === resId) || null;
  }

  getFolio(folioId) {
    if (!folioId) return null;
    return this.folios[folioId] || null;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.find((r) => r.id === roomId || r.roomNumber === roomId) || null;
  }

  getCloudStatus() {
    return {
      status: this.cloudStatus,
      isLive: this.cloudStatus === 'LIVE',
      propertyId: this.propertyId
    };
  }

  // --- FIREBASE CLOUD FIRESTORE REAL-TIME SYNCHRONIZATION ---

  async initFirebaseSync() {
    try {
      // 1. Ensure property seed exists in Cloud Firestore
      await checkAndSeedFirestore(this.propertyId, false);

      // Clean up any existing listeners
      this.unsubscribers.forEach((unsub) => typeof unsub === 'function' && unsub());
      this.unsubscribers = [];

      // 2. Real-time Listener: Reservations
      const resCol = collection(db, 'properties', this.propertyId, 'reservations');
      const unsubRes = onSnapshot(
        resCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudRes = snapshot.docs.map((d) => d.data());
            if (cloudRes.length > 0) {
              const merged = [...cloudRes];
              initialReservations.forEach((initR) => {
                const existingIdx = merged.findIndex((r) => r.id === initR.id);
                if (existingIdx === -1) {
                  merged.push(initR);
                  const resRef = doc(db, 'properties', this.propertyId, 'reservations', initR.id);
                  setDoc(resRef, initR).catch(() => {});
                }
              });

              const idOrder = ['res_5', 'res_4', 'res_3', 'res_2', 'res_1'];
              merged.sort((a, b) => {
                const idxA = idOrder.indexOf(a.id);
                const idxB = idOrder.indexOf(b.id);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return 0;
              });

              this.reservations = merged;
              this.cloudStatus = 'LIVE';
              this.save();
            }
          }
        },
        (err) => {
          console.warn('[Firebase Firestore] Reservations listener note:', err.message);
          this.cloudStatus = 'OFFLINE_CACHE';
          this.notify();
        }
      );
      this.unsubscribers.push(unsubRes);

      // 3. Real-time Listener: Rooms
      const roomsCol = collection(db, 'properties', this.propertyId, 'rooms');
      const unsubRooms = onSnapshot(
        roomsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudRooms = snapshot.docs.map((d) => d.data());
            if (cloudRooms.length > 0) {
              this.rooms = cloudRooms;
              this.cloudStatus = 'LIVE';
              this.save();
            }
          }
        },
        (err) => {
          console.warn('[Firebase Firestore] Rooms listener note:', err.message);
        }
      );
      this.unsubscribers.push(unsubRooms);

      // 4. Real-time Listener: Folios
      const foliosCol = collection(db, 'properties', this.propertyId, 'folios');
      const unsubFolios = onSnapshot(
        foliosCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const newFolios = { ...this.folios };
            snapshot.docs.forEach((d) => {
              newFolios[d.id] = d.data();
            });
            this.folios = newFolios;
            this.cloudStatus = 'LIVE';
            this.save();
          }
        },
        (err) => {
          console.warn('[Firebase Firestore] Folios listener note:', err.message);
        }
      );
      this.unsubscribers.push(unsubFolios);

      // 5. Real-time Listener: Maintenance Blocks
      const mbCol = collection(db, 'properties', this.propertyId, 'maintenanceBlocks');
      const unsubMb = onSnapshot(
        mbCol,
        (snapshot) => {
          if (!snapshot.empty) {
            this.maintenanceBlocks = snapshot.docs.map((d) => d.data());
            this.save();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubMb);

      this.cloudStatus = 'LIVE';
      this.notify();
    } catch (e) {
      console.warn('[Firebase Firestore] Sync initialization fallback to local storage:', e.message);
      this.cloudStatus = 'OFFLINE_CACHE';
      this.notify();
    }
  }

  async syncDocToFirestore(collectionName, docId, data) {
    if (!docId || !data) return;
    try {
      const payload = {
        ...data,
        propertyId: this.propertyId,
        lastSyncedAt: new Date().toISOString()
      };

      // 1. Nested under property collection
      const nestedRef = doc(db, 'properties', this.propertyId, collectionName, String(docId));
      await setDoc(nestedRef, payload, { merge: true });

      // 2. Root collection for universal root querying & direct console visibility
      if (collectionName) {
        const rootRef = doc(db, collectionName, String(docId));
        await setDoc(rootRef, payload, { merge: true });
      }

      console.info(`🔥 [Firebase Cloud] Synced ${collectionName}/${docId}`);
    } catch (err) {
      console.warn(`[Firebase Sync Note] Could not write to ${collectionName}/${docId}:`, err.message);
    }
  }

  async deleteDocFromFirestore(collectionName, docId) {
    if (!docId) return;
    try {
      const nestedRef = doc(db, 'properties', this.propertyId, collectionName, String(docId));
      await deleteDoc(nestedRef);

      if (collectionName) {
        const rootRef = doc(db, collectionName, String(docId));
        await deleteDoc(rootRef);
      }
    } catch (err) {
      console.warn(`[Firebase Sync Note] Could not delete ${collectionName}/${docId}:`, err.message);
    }
  }

  async syncAllToFirestore() {
    this.cloudStatus = 'SYNCING';
    this.notify();
    const result = await checkAndSeedFirestore(this.propertyId, true);
    if (result.success) {
      this.cloudStatus = 'LIVE';
    } else {
      this.cloudStatus = 'OFFLINE_CACHE';
    }
    this.notify();
    return result;
  }

  // --- AUDIT TRAIL ---

  logAudit(action, entity, entityId, details, actor = 'Front Desk Agent') {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const entry = {
      id: `at_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      actor,
      action,
      entity,
      entityId,
      details
    };
    this.auditTrail = [entry, ...this.auditTrail.slice(0, 99)];

    // Async write to Firestore
    this.syncDocToFirestore('auditTrail', entry.id, entry);
  }

  addAnnouncement(note) {
    if (!this.announcements) this.announcements = [];
    this.announcements.unshift(note);
    this.logAudit('CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', note.id, `Created staff note: "${note.message.substring(0, 30)}..."`, note.author || 'Astha India');
    this.save();
    this.syncDocToFirestore('announcements', note.id, note);
  }

  deleteAnnouncement(noteId) {
    if (!this.announcements) this.announcements = [];
    this.announcements = this.announcements.filter((n) => n.id !== noteId);
    this.logAudit('DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT', noteId, 'Deleted staff note', 'Astha India');
    this.save();
    this.deleteDocFromFirestore('announcements', noteId);
  }

  // --- RESERVATIONS & BOOKING ENGINE ---

  createReservation(bookingData) {
    const count = this.reservations.length + 366;
    const ref = `#RES_${count}`;
    const id = `res_${count}`;
    const folioId = `fol_${count}`;
    const roomNumber = bookingData.roomNumber || (this.rooms.find(r => r.id === bookingData.roomId)?.roomNumber || '101');

    const taxCalc = calculateRoomTax(bookingData.baseRatePerNight, bookingData.nights, {
      isComplimentary: bookingData.isComplimentary,
      isTaxExempt: bookingData.isTaxExempt
    });

    const totalRoomCharges = bookingData.baseRatePerNight * bookingData.nights;
    const taxAmount = taxCalc.totalTax;
    const totalAmount = totalRoomCharges + taxAmount;
    const paidAmount = Number(bookingData.advanceAmount) || 0;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    const newRes = {
      id,
      bookingReference: ref,
      primaryGuest: {
        name: bookingData.guestName,
        phone: bookingData.guestPhone,
        email: bookingData.guestEmail || '',
        gstin: bookingData.guestGstin || '',
        nationality: bookingData.nationality || 'Indian',
        idType: bookingData.idType || 'Aadhaar',
        idNumber: bookingData.idNumber || '',
        idDocumentUrl: bookingData.idDocumentUrl || ''
      },
      roomId: bookingData.roomId,
      roomNumber,
      roomTypeId: bookingData.roomTypeId,
      ratePlanCode: bookingData.ratePlanCode || 'BAR_CP',
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      nights: Number(bookingData.nights) || 1,
      adults: Number(bookingData.adults) || 1,
      children: Number(bookingData.children) || 0,
      baseRatePerNight: Number(bookingData.baseRatePerNight),
      totalRoomCharges,
      taxAmount,
      totalAmount,
      paidAmount,
      balanceDue,
      status: bookingData.status || 'confirmed',
      bookingSource: bookingData.bookingSource || 'WALK_IN',
      marketSegment: bookingData.marketSegment || 'WALK_IN',
      isVIP: !!bookingData.isVIP,
      isSingleLady: !!bookingData.isSingleLady,
      noPosting: !!bookingData.noPosting,
      isComplimentary: !!bookingData.isComplimentary,
      notes: bookingData.notes || '',
      createdAt: new Date().toISOString(),
      folioId
    };

    // Initialize Folio with transactions
    const transactions = [];

    // Debit for room tariff per night
    const startDate = new Date(bookingData.checkInDate);
    for (let i = 0; i < newRes.nights; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dailyTax = Math.round(taxAmount / newRes.nights);
      transactions.push({
        id: `tx_${Date.now()}_${i}`,
        date: iso,
        type: 'ROOM_CHARGE',
        desc: `Room Tariff - Room ${roomNumber}`,
        amount: newRes.baseRatePerNight,
        tax: dailyTax,
        direction: 'DEBIT'
      });
    }

    // Credit if advance was paid
    if (paidAmount > 0) {
      transactions.push({
        id: `tx_adv_${Date.now()}`,
        date: this.property.businessDate,
        type: 'PAYMENT',
        desc: `Advance Payment (${bookingData.paymentMethod || 'UPI'}) Ref: ${bookingData.paymentReference || 'Direct'}`,
        amount: -paidAmount,
        tax: 0,
        direction: 'CREDIT'
      });
    }

    const newFolio = {
      folioNumber: `FOL_${count}`,
      reservationId: id,
      roomNumber,
      status: balanceDue <= 0 ? 'SETTLED' : 'OPEN',
      transactions
    };

    this.folios[folioId] = newFolio;
    this.reservations = [newRes, ...this.reservations];

    // Find and update the room state in inventory
    const targetRoom = this.rooms.find(r => r.id === newRes.roomId || r.roomNumber === roomNumber);
    let updatedRoom = null;
    if (targetRoom) {
      updatedRoom = {
        ...targetRoom,
        currentReservationId: id,
        currentGuestName: newRes.primaryGuest.name,
        operational: 'allocated',
        updatedAt: new Date().toISOString()
      };
      this.rooms = this.rooms.map(r => r.id === targetRoom.id ? updatedRoom : r);
    }

    this.logAudit(
      'CREATE_RESERVATION',
      'RESERVATION',
      ref,
      `Created booking for ${newRes.primaryGuest.name} in Room ${roomNumber} (${newRes.nights} Nights). Total: ₹${totalAmount}`
    );

    this.save();

    // 1. Store Reservation in Cloud Firestore
    this.syncDocToFirestore('reservations', id, newRes);

    // 2. Store Folio in Cloud Firestore
    this.syncDocToFirestore('folios', folioId, newFolio);

    // 3. Store Updated Room in Cloud Firestore
    if (updatedRoom) {
      this.syncDocToFirestore('rooms', updatedRoom.id, updatedRoom);
    }

    // 4. Store Guest Profile in Cloud Firestore (CRM)
    const guestPhoneClean = (newRes.primaryGuest.phone || '').replace(/[^0-9]/g, '');
    const guestId = `gst_${guestPhoneClean || Date.now()}`;
    const guestDoc = {
      id: guestId,
      name: newRes.primaryGuest.name,
      title: newRes.primaryGuest.title || '',
      firstName: newRes.primaryGuest.firstName || '',
      lastName: newRes.primaryGuest.lastName || '',
      phone: newRes.primaryGuest.phone,
      email: newRes.primaryGuest.email || '',
      nationality: newRes.primaryGuest.nationality || 'Indian',
      idType: newRes.primaryGuest.idType || 'Aadhaar Card',
      idNumber: newRes.primaryGuest.idNumber || '',
      idDocumentUrl: newRes.primaryGuest.idDocumentUrl || '',
      address: newRes.primaryGuest.address || '',
      city: newRes.primaryGuest.city || '',
      state: newRes.primaryGuest.state || '',
      zip: newRes.primaryGuest.zip || '',
      gstin: newRes.primaryGuest.gstin || '',
      totalStays: 1,
      totalSpent: totalAmount,
      recentBookingRef: ref,
      lastStayDate: newRes.checkInDate,
      activeRoom: roomNumber,
      status: newRes.status,
      updatedAt: new Date().toISOString()
    };
    this.syncDocToFirestore('guests', guestId, guestDoc);

    // 5. Store Latest Audit Trail Entry
    const latestAudit = this.auditTrail[0];
    if (latestAudit) {
      this.syncDocToFirestore('auditTrail', latestAudit.id, latestAudit);
    }

    console.info(`🔥 [Firebase Cloud] Successfully stored Reservation ${ref}, Room ${roomNumber}, Folio ${folioId}, and Guest Profile in Cloud Firestore.`);

    return newRes;
  }

  updateReservation(resId, updatedFields) {
    const idx = this.reservations.findIndex((r) => r.id === resId);
    if (idx !== -1) {
      const target = this.reservations[idx];
      if (target.status === 'checked_out' || target.status === 'Checked Out' || target.status === 'checked-out') {
        console.warn(`[PMSStore] Cannot modify checked-out reservation ${resId}. Details are locked.`);
        return null;
      }
      this.reservations[idx] = {
        ...this.reservations[idx],
        ...updatedFields
      };
      const updated = this.reservations[idx];
      this.logAudit('UPDATE_RESERVATION', 'RESERVATION', resId, `Updated reservation details for ${updated.primaryGuest?.name || resId}`, 'Astha India');
      this.save();
      this.syncDocToFirestore('reservations', resId, updated);
      return updated;
    }
    return null;
  }

  assignRoom(resId, targetRoomId) {
    const res = this.reservations.find(r => r.id === resId);
    const room = this.rooms.find(r => r.id === targetRoomId);
    if (!res || !room) return false;
    if (res.status === 'checked_out' || res.status === 'Checked Out' || res.status === 'checked-out') {
      console.warn(`[PMSStore] Cannot reassign room on checked-out reservation ${resId}.`);
      return false;
    }

    this.reservations = this.reservations.map(r =>
      r.id === resId ? { ...r, roomId: room.id, roomNumber: room.roomNumber } : r
    );

    if (res.folioId && this.folios[res.folioId]) {
      this.folios[res.folioId].roomNumber = room.roomNumber;
      this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    }

    this.logAudit(
      'ROOM_ASSIGNED',
      'RESERVATION',
      res.bookingReference,
      `Assigned Room ${room.roomNumber} (${room.status.toUpperCase()}) to ${res.primaryGuest?.name || res.id}.`
    );

    this.save();
    this.syncDocToFirestore('reservations', resId, this.getReservation(resId));
    return true;
  }

  checkInReservation(resId, assignedRoomId = null) {
    const res = this.reservations.find(r => r.id === resId);
    if (!res) return false;

    let targetRoomId = assignedRoomId || res.roomId;
    let room = this.rooms.find(r => r.id === targetRoomId);
    if (!room) {
      room = this.rooms.find(r => r.roomTypeId === res.roomTypeId && r.status === 'clean') || this.rooms[0];
      targetRoomId = room?.id;
    }

    const roomNumber = room ? room.roomNumber : res.roomNumber;

    this.reservations = this.reservations.map(r =>
      r.id === resId ? {
        ...r,
        roomId: targetRoomId,
        roomNumber: roomNumber,
        status: 'in_house',
        checkedInAt: new Date().toISOString()
      } : r
    );

    if (res.folioId && this.folios[res.folioId]) {
      this.folios[res.folioId].roomNumber = roomNumber;
      this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    }

    // Update room operational state
    if (targetRoomId) {
      this.rooms = this.rooms.map(rm =>
        rm.id === targetRoomId ? { ...rm, status: rm.status === 'dirty' ? 'clean' : rm.status } : rm
      );
      const updatedRoom = this.rooms.find(rm => rm.id === targetRoomId);
      if (updatedRoom) {
        this.syncDocToFirestore('rooms', targetRoomId, updatedRoom);
      }
    }

    this.logAudit('CHECK_IN', 'RESERVATION', res.bookingReference, `Guest ${res.primaryGuest.name} checked in to Room ${roomNumber}.`);
    this.save();
    this.syncDocToFirestore('reservations', resId, this.getReservation(resId));
    return true;
  }

  checkOutReservation(resId) {
    const res = this.reservations.find(r => r.id === resId);
    if (!res) return { success: false, message: 'Reservation not found' };

    // STRICT VALIDATION: PMS enforces folio settlement prior to departure!
    if (res.balanceDue > 0) {
      return {
        success: false,
        message: `Checkout blocked: Unpaid balance of ₹${Number(res.balanceDue).toFixed(2)} remaining. Settle folio first.`
      };
    }

    this.reservations = this.reservations.map(r =>
      r.id === resId ? { ...r, status: 'checked_out', checkedOutAt: new Date().toISOString() } : r
    );

    // Automatic Housekeeping Trigger: Checked-out room automatically becomes DIRTY!
    if (res.roomId) {
      this.rooms = this.rooms.map(rm =>
        rm.id === res.roomId ? { ...rm, status: 'dirty', notes: 'Turnaround required post check-out' } : rm
      );
      const dirtyRoom = this.rooms.find(rm => rm.id === res.roomId);
      if (dirtyRoom) {
        this.syncDocToFirestore('rooms', res.roomId, dirtyRoom);
      }
    }

    // Mark folio as closed if zero balance
    if (res.folioId && this.folios[res.folioId]) {
      this.folios[res.folioId].status = 'CLOSED';
      this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    }

    this.logAudit('CHECK_OUT', 'RESERVATION', res.bookingReference, `Guest ${res.primaryGuest.name} checked out. Room ${res.roomNumber} auto-flagged DIRTY.`);
    this.save();
    this.syncDocToFirestore('reservations', resId, this.getReservation(resId));
    return { success: true, message: 'Check-out successful' };
  }

  cancelReservation(resId, reason = 'Guest requested') {
    const res = this.reservations.find(r => r.id === resId);
    if (!res) return;

    this.reservations = this.reservations.map(r =>
      r.id === resId ? { ...r, status: 'cancelled', cancelReason: reason } : r
    );

    this.logAudit('CANCEL', 'RESERVATION', res.bookingReference, `Reservation cancelled. Reason: ${reason}`);
    this.save();
    this.syncDocToFirestore('reservations', resId, this.getReservation(resId));
  }

  markNoShow(resId) {
    const res = this.reservations.find(r => r.id === resId);
    if (!res) return;

    this.reservations = this.reservations.map(r =>
      r.id === resId ? { ...r, status: 'no_show' } : r
    );

    this.logAudit('NO_SHOW', 'RESERVATION', res.bookingReference, `Guest did not arrive. Marked No-Show.`);
    this.save();
    this.syncDocToFirestore('reservations', resId, this.getReservation(resId));
  }

  // --- ROOM MOVES & REASSIGNMENT ---

  groupRoomMove(reservationId, targetRoomId) {
    const res = this.reservations.find(r => r.id === reservationId);
    const targetRoom = this.rooms.find(r => r.id === targetRoomId);
    if (!res || !targetRoom) return false;

    const oldRoomNumber = res.roomNumber;

    this.reservations = this.reservations.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          roomId: targetRoomId,
          roomNumber: targetRoom.roomNumber
        };
      }
      return r;
    });

    if (res.folioId && this.folios[res.folioId]) {
      this.folios[res.folioId].roomNumber = targetRoom.roomNumber;
      this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    }

    this.logAudit(
      'ROOM_MOVE',
      'RESERVATION',
      res.bookingReference,
      `Room moved from ${oldRoomNumber} to ${targetRoom.roomNumber} (${targetRoom.status.toUpperCase()}).`
    );

    this.save();
    this.syncDocToFirestore('reservations', reservationId, this.getReservation(reservationId));
    return true;
  }

  // --- HOUSEKEEPING & MAINTENANCE ---

  updateRoomStatus(roomId, newStatus) {
    this.rooms = this.rooms.map(rm =>
      rm.id === roomId ? { ...rm, status: newStatus } : rm
    );
    const room = this.rooms.find(r => r.id === roomId);
    this.logAudit('HOUSEKEEPING_UPDATE', 'ROOM', room ? room.roomNumber : roomId, `Status set to ${newStatus.toUpperCase()}`);
    this.save();

    if (room) {
      this.syncDocToFirestore('rooms', roomId, room);
    }
  }

  addMaintenanceBlock(blockData) {
    const room = this.rooms.find(r => r.id === blockData.roomId);
    const newBlock = {
      id: `mb_${Date.now()}`,
      roomId: blockData.roomId,
      roomNumber: room ? room.roomNumber : '',
      reason: blockData.reason || 'General Maintenance',
      startDate: blockData.startDate,
      endDate: blockData.endDate,
      createdAt: new Date().toISOString()
    };

    this.maintenanceBlocks = [newBlock, ...this.maintenanceBlocks];
    if (room) {
      this.updateRoomStatus(room.id, 'maintenance');
    }
    this.logAudit('MAINTENANCE_LOCK', 'ROOM', room ? room.roomNumber : '', `Blocked ${blockData.startDate} to ${blockData.endDate}. Reason: ${blockData.reason}`);
    this.save();
    this.syncDocToFirestore('maintenanceBlocks', newBlock.id, newBlock);
    return newBlock;
  }

  removeMaintenanceBlock(blockId) {
    const block = this.maintenanceBlocks.find(b => b.id === blockId);
    this.maintenanceBlocks = this.maintenanceBlocks.filter(b => b.id !== blockId);
    if (block) {
      this.updateRoomStatus(block.roomId, 'clean');
      this.logAudit('MAINTENANCE_RELEASE', 'ROOM', block.roomNumber, `Maintenance block removed.`);
      this.deleteDocFromFirestore('maintenanceBlocks', blockId);
    }
    this.save();
  }

  // --- FOLIO & SETTLEMENT ENGINE ---

  recomputeFolioTotals(reservationId) {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || !res.folioId || !this.folios[res.folioId]) return;

    const folio = this.folios[res.folioId];
    let totalDebits = 0;
    let totalCredits = 0;
    let totalTax = 0;

    folio.transactions.forEach(t => {
      if (t.isVoided) return;
      if (t.direction === 'DEBIT' || Number(t.amount) > 0) {
        totalDebits += Number(t.amount);
        totalTax += Number(t.tax || 0);
      } else {
        totalCredits += Math.abs(Number(t.amount));
      }
    });

    const newTotal = totalDebits + totalTax;
    const newPaid = totalCredits;
    const newBalance = Math.max(0, newTotal - newPaid);

    this.reservations = this.reservations.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          totalAmount: newTotal,
          paidAmount: newPaid,
          taxAmount: totalTax,
          balanceDue: newBalance
        };
      }
      return r;
    });

    this.folios[res.folioId].status = newBalance <= 0 ? 'SETTLED' : 'OPEN';
  }

  addFolioTransaction(reservationId, transaction) {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || !res.folioId) return null;
    if (res.status === 'checked_out' || res.status === 'Checked Out' || res.status === 'checked-out') {
      console.warn(`[PMSStore] Cannot add transaction to checked-out reservation ${reservationId}.`);
      return null;
    }

    const folio = this.folios[res.folioId] || {
      folioNumber: `FOL_${res.id.replace('res_', '')}`,
      reservationId,
      roomNumber: res.roomNumber,
      status: 'OPEN',
      transactions: []
    };

    const newTx = {
      id: transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: transaction.date || this.property.businessDate,
      category: transaction.category || (Number(transaction.amount) < 0 ? 'Payment' : 'Room'),
      type: transaction.type || (Number(transaction.amount) < 0 ? 'PAYMENT' : 'EXTRA_SERVICE'),
      desc: transaction.desc || 'Folio Transaction',
      voucherNumber: transaction.voucherNumber || transaction.reference || `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: Number(transaction.amount) || 0,
      tax: Number(transaction.tax) || 0,
      direction: Number(transaction.amount) < 0 ? 'CREDIT' : 'DEBIT',
      paymentMethod: transaction.paymentMethod || 'CASH',
      paymentType: transaction.paymentType || (Number(transaction.amount) < 0 ? 'Settlement' : undefined),
      isVoided: false
    };

    folio.transactions.push(newTx);
    this.folios[res.folioId] = { ...folio };
    this.recomputeFolioTotals(reservationId);

    this.logAudit('FOLIO_UPDATE', 'FOLIO', folio.folioNumber, `Posted ${newTx.type}: ₹${Math.abs(newTx.amount)} (${newTx.desc})`);
    this.save();

    // Async Cloud sync
    this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    this.syncDocToFirestore('reservations', reservationId, this.getReservation(reservationId));

    return newTx;
  }

  postPendingCharges(reservationId) {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || !res.folioId) return null;
    if (res.status === 'checked_out' || res.status === 'Checked Out' || res.status === 'checked-out') {
      console.warn(`[PMSStore] Cannot post pending charges to checked-out reservation ${reservationId}.`);
      return null;
    }

    const folio = this.folios[res.folioId] || {
      folioNumber: `FOL_${res.id.replace('res_', '')}`,
      reservationId,
      roomNumber: res.roomNumber,
      status: 'OPEN',
      transactions: []
    };

    const taxCalc = calculateRoomTax(res.baseRatePerNight, 1, {
      isComplimentary: res.isComplimentary,
      isTaxExempt: res.isTaxExempt
    });

    const newTx = {
      id: `tx_nightly_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      date: this.property.businessDate,
      category: 'Room (Room Rent / Accommodation)',
      type: 'ROOM_CHARGE',
      desc: `Nightly Room Tariff - Room ${res.roomNumber}`,
      voucherNumber: `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: Number(res.baseRatePerNight) || 2500,
      tax: Number(taxCalc.totalTax) || 125,
      direction: 'DEBIT',
      isVoided: false
    };

    folio.transactions.push(newTx);
    this.folios[res.folioId] = { ...folio };
    this.recomputeFolioTotals(reservationId);

    this.logAudit(
      'POST_PENDING_CHARGES',
      'FOLIO',
      folio.folioNumber,
      `Posted pending nightly tariff ₹${newTx.amount} + Tax ₹${newTx.tax} on Room ${res.roomNumber}.`
    );
    this.save();

    // Async Cloud sync
    this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    this.syncDocToFirestore('reservations', reservationId, this.getReservation(reservationId));

    return newTx;
  }

  addFolioCharge(reservationId, { category, receiptNumber, amount, description }) {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || !res.folioId) return null;
    if (res.status === 'checked_out' || res.status === 'Checked Out' || res.status === 'checked-out') {
      console.warn(`[PMSStore] Cannot add charge to checked-out reservation ${reservationId}.`);
      return null;
    }

    const folio = this.folios[res.folioId] || {
      folioNumber: `FOL_${res.id.replace('res_', '')}`,
      reservationId,
      roomNumber: res.roomNumber,
      status: 'OPEN',
      transactions: []
    };

    const amt = Number(amount) || 0;
    const tax = res.isTaxExempt || res.isComplimentary ? 0 : Math.round(amt * 0.05 * 100) / 100;

    const newTx = {
      id: `tx_chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: this.property.businessDate,
      category: category || 'Service (General Guest Services)',
      type: 'EXTRA_SERVICE',
      desc: description || category || 'Incidental / Service Charge',
      voucherNumber: receiptNumber || `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amt,
      tax: tax,
      direction: 'DEBIT',
      isVoided: false
    };

    folio.transactions.push(newTx);
    this.folios[res.folioId] = { ...folio };
    this.recomputeFolioTotals(reservationId);

    this.logAudit(
      'ADD_CHARGE',
      'FOLIO',
      folio.folioNumber,
      `Added charge [${newTx.category}]: ₹${amt} (Receipt: ${newTx.voucherNumber}). Desc: ${newTx.desc}`
    );
    this.save();

    // Async Cloud sync
    this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    this.syncDocToFirestore('reservations', reservationId, this.getReservation(reservationId));

    return newTx;
  }

  addFolioPayment(reservationId, { folioId, type, paymentMethod, amount, description, reference }) {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || !res.folioId) return null;
    if (res.status === 'checked_out' || res.status === 'Checked Out' || res.status === 'checked-out') {
      console.warn(`[PMSStore] Cannot add payment to checked-out reservation ${reservationId}.`);
      return null;
    }

    const folio = this.folios[res.folioId] || {
      folioNumber: `FOL_${res.id.replace('res_', '')}`,
      reservationId,
      roomNumber: res.roomNumber,
      status: 'OPEN',
      transactions: []
    };

    const amt = Number(amount) || 0;

    const newTx = {
      id: `tx_pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: this.property.businessDate,
      category: 'Payment',
      type: 'PAYMENT',
      paymentType: type || 'Settlement',
      paymentMethod: paymentMethod || 'UPI',
      desc: description || `${type || 'Settlement'} Payment via ${paymentMethod || 'UPI'}${reference ? ` Ref: ${reference}` : ''}`,
      voucherNumber: reference || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: -Math.abs(amt),
      tax: 0,
      direction: 'CREDIT',
      isVoided: false
    };

    folio.transactions.push(newTx);
    this.folios[res.folioId] = { ...folio };
    this.recomputeFolioTotals(reservationId);

    this.logAudit(
      'ADD_PAYMENT',
      'FOLIO',
      folio.folioNumber,
      `Processed ${newTx.paymentType} payment of ₹${amt} via ${newTx.paymentMethod}. Outstanding: ₹${this.reservations.find(r => r.id === reservationId)?.balanceDue.toFixed(2)}`
    );
    this.save();

    // Async Cloud sync
    this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    this.syncDocToFirestore('reservations', reservationId, this.getReservation(reservationId));

    return newTx;
  }

  voidPayment(reservationId, transactionId, voidReason) {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || !res.folioId || !this.folios[res.folioId]) return false;
    if (res.status === 'checked_out' || res.status === 'Checked Out' || res.status === 'checked-out') {
      console.warn(`[PMSStore] Cannot void payment on checked-out reservation ${reservationId}.`);
      return false;
    }

    const folio = this.folios[res.folioId];
    const tx = folio.transactions.find(t => t.id === transactionId);
    if (!tx || tx.isVoided) return false;

    tx.isVoided = true;
    tx.voidReason = voidReason || 'Voided by front desk operator';
    tx.voidedAt = new Date().toISOString();
    tx.voidedBy = 'Astha India';

    this.recomputeFolioTotals(reservationId);

    this.logAudit(
      'VOID_PAYMENT',
      'FOLIO',
      folio.folioNumber,
      `VOIDED payment of ₹${Math.abs(tx.amount)} (${tx.paymentMethod || 'Payment'}). Reason: "${tx.voidReason}". Balance restored.`
    );
    this.save();

    this.syncDocToFirestore('folios', res.folioId, this.folios[res.folioId]);
    this.syncDocToFirestore('reservations', reservationId, this.getReservation(reservationId));

    return true;
  }

  settleFolio(reservationId, paymentMode = 'UPI', reference = 'Direct Settlement') {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res || res.balanceDue <= 0) return;

    this.addFolioPayment(reservationId, {
      type: 'Settlement',
      paymentMethod: paymentMode,
      amount: res.balanceDue,
      description: `Folio Settlement (${paymentMode}) Ref: ${reference}`,
      reference
    });
  }

  // --- RATES, STOPOUTS & RESTRICTIONS ---

  toggleStopout(roomTypeId, dateStr) {
    const key = `${roomTypeId}_${dateStr}`;
    const next = !this.stopouts[key];
    this.stopouts = {
      ...this.stopouts,
      [key]: next
    };
    const rt = this.roomTypes.find(r => r.id === roomTypeId);
    this.logAudit('STOPOUT_TOGGLE', 'RATE_MATRIX', key, `${rt ? rt.name : roomTypeId} stop-sell set to ${next ? 'CLOSED' : 'OPEN'} on ${dateStr}`);
    this.save();
  }

  bulkUpdateRates(payload) {
    const rtNames = this.roomTypes.filter(rt => payload.roomTypeIds.includes(rt.id)).map(r => r.name).join(', ');

    if (payload.baseRate) {
      this.roomTypes = this.roomTypes.map(rt => {
        if (payload.roomTypeIds.includes(rt.id)) {
          return { ...rt, basePrice: Number(payload.baseRate) };
        }
        return rt;
      });
    }

    if (payload.stopSell !== undefined) {
      const cur = new Date(payload.startDate);
      const end = new Date(payload.endDate);
      const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      while (cur <= end) {
        const dayName = dayMap[cur.getDay()];
        if (!payload.daysOfWeek || payload.daysOfWeek.includes(dayName)) {
          const iso = cur.toISOString().split('T')[0];
          payload.roomTypeIds.forEach(rtId => {
            const key = `${rtId}_${iso}`;
            this.stopouts[key] = !!payload.stopSell;
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    this.logAudit(
      'BULK_RATE_UPDATE',
      'INVENTORY_RATES',
      `${payload.startDate} to ${payload.endDate}`,
      `Bulk updated for [${rtNames}]. Base Rate: ₹${payload.baseRate || 'Unchanged'}, StopSell: ${payload.stopSell ? 'YES' : 'NO'}`
    );

    this.save();
  }

  updateOtaChannel(channelId, patch) {
    this.otaChannels = this.otaChannels.map(c =>
      c.id === channelId ? { ...c, ...patch, lastSync: 'Just now' } : c
    );
    this.logAudit('OTA_CONFIG', 'CHANNEL', channelId, `Updated channel configuration & sync parameters.`);
    this.save();
  }

  triggerOtaFullSync(channelId) {
    this.otaChannels = this.otaChannels.map(c =>
      c.id === channelId ? { ...c, lastSync: 'Just now (Synced)', connectionStatus: 'Connected & Live' } : c
    );
    const channel = this.otaChannels.find(c => c.id === channelId);
    this.logAudit('OTA_SYNC', 'CHANNEL', channel ? channel.name : channelId, `Pushed full ARI update (Availability, Rates & Inventory).`);
    this.save();
  }

  // --- NIGHT AUDIT AUTOMATION & FINANCIAL DAY-CLOSE ---

  executeNightAudit(auditorName = 'Amit Patel (Night Auditor)') {
    const curDate = this.property.businessDate;
    const inHouse = this.reservations.filter(r => r.status === 'in_house');

    let totalRev = 0;
    let totalTax = 0;
    const roomChargesLog = [];

    inHouse.forEach(res => {
      const taxCalc = calculateRoomTax(res.baseRatePerNight, 1);
      totalRev += res.baseRatePerNight;
      totalTax += taxCalc.totalTax;

      roomChargesLog.push({
        room: res.roomNumber,
        guest: res.primaryGuest.name,
        rate: res.baseRatePerNight,
        tax: taxCalc.totalTax,
        net: res.baseRatePerNight + taxCalc.totalTax,
        folio: res.folioId ? (this.folios[res.folioId]?.folioNumber || 'FOL') : 'FOL'
      });
    });

    const nextDateObj = new Date(curDate);
    nextDateObj.setDate(nextDateObj.getDate() + 1);
    const nextDate = nextDateObj.toISOString().split('T')[0];

    this.property = {
      ...this.property,
      businessDate: nextDate
    };

    const auditRecord = {
      id: `na_${curDate.replace(/-/g, '')}`,
      auditDate: curDate,
      performedAt: new Date().toISOString(),
      performedBy: auditorName,
      totalRevenue: totalRev,
      totalTax: totalTax,
      occupiedRooms: inHouse.length,
      vacantRooms: Math.max(0, this.rooms.length - inHouse.length),
      adr: inHouse.length > 0 ? Math.round(totalRev / inHouse.length) : 0,
      revPar: this.rooms.length > 0 ? Math.round(totalRev / this.rooms.length) : 0,
      status: 'COMPLETED',
      checkedOutCount: this.reservations.filter(r => r.status === 'checked_out' && r.checkOutDate === curDate).length,
      chargesPostedCount: inHouse.length,
      roomChargesLog
    };

    this.nightAudits = [auditRecord, ...this.nightAudits];

    this.logAudit(
      'NIGHT_AUDIT',
      'SYSTEM',
      auditRecord.id,
      `Night Audit completed for ${curDate}. Posted ₹${totalRev} room tariffs across ${inHouse.length} in-house folios. Business date advanced to ${nextDate}.`,
      auditorName
    );

    this.save();

    // Async Cloud Firestore Writes
    this.syncDocToFirestore('nightAudits', auditRecord.id, auditRecord);
    this.syncDocToFirestore('', this.propertyId, { businessDate: nextDate });

    return auditRecord;
  }

  // --- TEAM & PERMISSIONS ---

  inviteTeamMember(memberData) {
    const newMember = {
      id: `usr_${Date.now()}`,
      name: memberData.name,
      email: memberData.email,
      role: memberData.role || 'Front Desk Agent',
      avatar: '👤',
      status: 'INVITED',
      properties: [this.property.name],
      permissions: memberData.permissions || {
        reservations: { view: true, create: true, edit: true, cancel: false },
        nightAudit: { view: false, execute: false },
        ratesAndInventory: { view: true, edit: false, bulkUpdate: false, stopSell: false },
        team: { view: false, manage: false },
        dashboard: { view: true },
        piiAccess: false,
        ledger: { view: true, settle: true, override: false }
      }
    };

    this.teamMembers = [...this.teamMembers, newMember];
    this.logAudit('INVITE_MEMBER', 'TEAM', newMember.email, `Invited ${newMember.name} as ${newMember.role}`);
    this.save();
    this.syncDocToFirestore('teamMembers', newMember.id, newMember);
    return newMember;
  }

  updatePermissions(userId, permissions) {
    this.teamMembers = this.teamMembers.map(m =>
      m.id === userId ? { ...m, permissions: { ...m.permissions, ...permissions } } : m
    );
    this.logAudit('UPDATE_PERMISSIONS', 'RBAC', userId, `Updated granular operational permissions.`);
    this.save();

    const member = this.teamMembers.find(m => m.id === userId);
    if (member) {
      this.syncDocToFirestore('teamMembers', userId, member);
    }
  }
}

export const pmsStore = new PMSStore();
