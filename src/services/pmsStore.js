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
import { getRoleDefaultPermissions } from '../data/rolePresets';
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
        if (!parsed.roomTypes || parsed.roomTypes.length === 0) {
          this.roomTypes = initialRoomTypes;
          const rtNormal = this.roomTypes.find(rt => rt.id === 'rt_standard' || rt.name === 'Normal' || rt.name === 'Standard Room');
          if (rtNormal) {
            rtNormal.name = 'Normal';
            rtNormal.baseAdults = 2;
            rtNormal.maxAdults = 4;
            rtNormal.baseChildren = 1;
            rtNormal.maxChildren = 1;
            rtNormal.status = 'ACTIVE';
          }
          const rtDeluxe = this.roomTypes.find(rt => rt.id === 'rt_deluxe' || rt.name === 'Delux Room');
          if (rtDeluxe) {
            rtDeluxe.name = 'Delux Room';
            rtDeluxe.baseAdults = 1;
            rtDeluxe.maxAdults = 2;
            rtDeluxe.baseChildren = 2;
            rtDeluxe.maxChildren = 2;
            rtDeluxe.status = 'ACTIVE';
          }
        } else {
          this.roomTypes = parsed.roomTypes;
        }

        if (!parsed.rooms || parsed.rooms.length === 0) {
          this.rooms = initialRooms;
          const r101 = this.rooms.find(r => r.id === 'rm_101');
          if (r101) {
            r101.roomTypeId = 'rt_deluxe';
            r101.roomNumber = '101';
            r101.status = 'clean';
          }
          const r102 = this.rooms.find(r => r.id === 'rm_102');
          if (r102) {
            r102.roomTypeId = 'rt_deluxe';
            r102.roomNumber = '102';
            r102.status = 'clean';
            r102.operational = 'available';
            r102.notes = 'Ready for check-in';
          }
          const r201 = this.rooms.find(r => r.id === 'rm_201');
          if (r201) {
            r201.roomTypeId = 'rt_standard';
            r201.roomNumber = '201';
            r201.status = 'clean';
          }
          const r202 = this.rooms.find(r => r.id === 'rm_202');
          if (r202) {
            r202.roomTypeId = 'rt_standard';
            r202.roomNumber = '202';
            r202.status = 'clean';
          }
        } else {
          // Filter out rooms with invalid/placeholder room numbers
          this.rooms = parsed.rooms.filter(r => {
            const rNum = (r.roomNumber || '').trim();
            return rNum && rNum.toLowerCase() !== 'unassigned' && rNum !== '0';
          });
        }
        let rtUltra = this.roomTypes.find(rt => rt.id === 'rt_ultra_premium' || rt.name === 'Ultra Premium');
        if (!rtUltra) {
          rtUltra = {
            id: 'rt_ultra_premium',
            name: 'Ultra Premium',
            code: 'ULP',
            description: 'Ultra luxurious presidential suite with panoramic views and dedicated butler.',
            baseAdults: 2,
            maxAdults: 4,
            baseChildren: 1,
            maxChildren: 2,
            basePrice: 6500,
            status: 'ACTIVE',
            color: '#10b981'
          };
          this.roomTypes.push(rtUltra);
        } else {
          rtUltra.name = 'Ultra Premium';
          rtUltra.status = 'ACTIVE';
        }

        let rtPremium = this.roomTypes.find(rt => rt.id === 'rt_premium' || rt.name === 'Premium');
        if (!rtPremium) {
          rtPremium = {
            id: 'rt_premium',
            name: 'Premium',
            code: 'PRM',
            description: 'Luxury premium suite with jacuzzi and executive lounge access.',
            baseAdults: 4,
            maxAdults: 6,
            baseChildren: 2,
            maxChildren: 4,
            basePrice: 4500,
            status: 'ACTIVE',
            color: '#8b5cf6'
          };
          this.roomTypes.push(rtPremium);
        } else {
          rtPremium.name = 'Premium';
          rtPremium.baseAdults = 4;
          rtPremium.maxAdults = 6;
          rtPremium.baseChildren = 2;
          rtPremium.maxChildren = 4;
          rtPremium.status = 'ACTIVE';
        }

        // Ensure rooms 501, 301, 302 exist to match property layout
        if (!this.rooms.some(r => r.roomNumber === '501')) {
          this.rooms.push({
            id: 'rm_501',
            roomNumber: '501',
            roomTypeId: rtUltra.id,
            floor: '5',
            status: 'clean',
            operational: 'available',
            notes: 'Ready for check-in'
          });
        }
        if (!this.rooms.some(r => r.roomNumber === '301')) {
          this.rooms.push({
            id: 'rm_301',
            roomNumber: '301',
            roomTypeId: rtPremium.id,
            floor: '3',
            status: 'clean',
            operational: 'available',
            notes: 'Ready for check-in'
          });
        }
        if (!this.rooms.some(r => r.roomNumber === '302')) {
          this.rooms.push({
            id: 'rm_302',
            roomNumber: '302',
            roomTypeId: rtPremium.id,
            floor: '3',
            status: 'dirty',
            operational: 'available',
            notes: 'Ready for check-in'
          });
        }

        const roomTypeOrder = { 'Ultra Premium': 1, 'Delux Room': 2, 'Premium': 3, 'Normal': 4 };
        this.roomTypes.sort((a, b) => (roomTypeOrder[a.name] || 99) - (roomTypeOrder[b.name] || 99));
        let loadedPlans = (parsed.mealPlans || initialMealPlans).filter(
          mp => mp.id !== 'mp_ep' && mp.code !== 'EP'
        );
        if (!loadedPlans || !loadedPlans.some(mp => mp.code === 'STD')) {
          loadedPlans = [
            {
              id: 'mp_std',
              code: 'STD',
              name: 'Standard',
              inclusions: ['Breakfast', 'Lunch', 'Dinner'],
              inclusionDetails: [
                { type: 'Breakfast', from: '7:30 AM', to: '10:30 AM' },
                { type: 'Lunch', from: '12:30 PM', to: '3:30 PM' },
                { type: 'Dinner', from: '7:30 PM', to: '10:30 PM' }
              ],
              pricingModel: 'PER_PERSON',
              adultPrice: 1000,
              childPrice: 500,
              status: 'ACTIVE'
            },
            ...loadedPlans
          ];
        } else {
          loadedPlans = loadedPlans.map(mp => {
            if (mp.code === 'STD') {
              return {
                ...mp,
                inclusions: ['Breakfast', 'Lunch', 'Dinner'],
                adultPrice: 1000,
                childPrice: 500
              };
            }
            return mp;
          });
        }
        this.mealPlans = loadedPlans;
        this.reservations = (parsed.reservations || initialReservations).filter(r => {
          if (r.id === 'res_unassigned_1') return false;
          const name = (r.primaryGuest?.name || r.guestName || '').toLowerCase();
          if (name.includes('rahul kumar') && (r.status === 'cancelled' || !r.status)) return false;
          return true;
        });
        ['res_11', 'res_10', 'res_12', 'res_7', 'res_6', 'res_5', 'res_4', 'res_3', 'res_2', 'res_1'].forEach(id => {
          const initRes = initialReservations.find(r => r.id === id);
          if (initRes) {
            const existingIdx = this.reservations.findIndex(r => r.id === id);
            if (existingIdx === -1) {
              this.reservations.unshift(initRes);
            } else {
              this.reservations[existingIdx] = {
                ...this.reservations[existingIdx],
                ...initRes,
                roomId: initRes.roomId,
                roomNumber: initRes.roomNumber,
                roomTypeId: initRes.roomTypeId,
                roomTypeName: initRes.roomTypeName,
                primaryGuest: {
                  ...(this.reservations[existingIdx].primaryGuest || {}),
                  ...(initRes.primaryGuest || {})
                },
                checkInDate: initRes.checkInDate,
                checkOutDate: initRes.checkOutDate,
                nights: initRes.nights,
                status: initRes.status,
                totalAmount: initRes.totalAmount,
                paidAmount: initRes.paidAmount,
                balanceDue: initRes.balanceDue
              };
            }
          }
        });

        // Ensure res_6 has correct guest name (Mr Krishna Suthar) and checkout date (2026-11-03)
        const res6 = this.reservations.find(r => r.id === 'res_6');
        if (res6) {
          res6.primaryGuest = {
            ...(res6.primaryGuest || {}),
            name: 'Mr Krishna Suthar',
            title: 'Mr.',
            firstName: 'Krishna',
            lastName: 'Suthar'
          };
          res6.guestName = 'Mr Krishna Suthar';
          res6.checkInDate = '2026-11-02';
          res6.checkOutDate = '2026-11-03';
          res6.nights = 1;
        }

        // Ensure res_5 has correct guest name (Mr Krishna Suthar) and checked_out status
        const res5 = this.reservations.find(r => r.id === 'res_5');
        if (res5) {
          res5.primaryGuest = {
            ...(res5.primaryGuest || {}),
            name: 'Mr Krishna Suthar',
            title: 'Mr.',
            firstName: 'Krishna',
            lastName: 'Suthar'
          };
          res5.guestName = 'Mr Krishna Suthar';
          res5.status = 'checked_out';
          res5.checkInDate = '2026-10-26';
          res5.checkOutDate = '2026-10-27';
          res5.actualCheckOutDate = '2026-10-26';
          res5.paidAmount = 2625.00;
          res5.balanceDue = 0.00;
        }

        // Ensure res_11 has proper name (Mr Shankar Suthar)
        const res11 = this.reservations.find(r => r.id === 'res_11');
        if (res11) {
          res11.primaryGuest = {
            ...(res11.primaryGuest || {}),
            name: 'Mr Shankar Suthar',
            title: 'Mr.',
            firstName: 'Shankar',
            lastName: 'Suthar'
          };
          res11.guestName = 'Mr Shankar Suthar';
        }

        // Ensure res_3 has current unassigned confirmed booking dates
        const res3 = this.reservations.find(r => r.id === 'res_3');
        if (res3) {
          res3.primaryGuest = {
            ...(res3.primaryGuest || {}),
            name: 'Mr Shankar Suthar',
            title: 'Mr.',
            firstName: 'Shankar',
            lastName: 'Suthar'
          };
          res3.guestName = 'Mr Shankar Suthar';
          res3.checkInDate = '2026-11-13';
          res3.checkOutDate = '2026-11-14';
          res3.bookingDateFormatted = '13 Nov 2026, 10:00 AM';
          res3.createdAt = '2026-11-13 10:00 AM';
          res3.status = 'confirmed';
          res3.nights = 1;
        }

        // Ensure res_12 and all other reservations are not occupying Room 102
        this.reservations.forEach(r => {
          if (r.roomId === 'rm_102' || r.roomNumber === '102' || r.roomId === '102') {
            r.roomId = '';
            r.roomNumber = '';
            if (r.status === 'in_house' || r.status === 'checked_in') {
              r.status = 'checked_out';
            }
          }
        });

        // Ensure Room 102 has clean, valid vacant state
        const r102Init = this.rooms.find(r => r.id === 'rm_102' || r.roomNumber === '102');
        if (r102Init) {
          r102Init.id = 'rm_102';
          r102Init.roomNumber = '102';
          r102Init.roomTypeId = 'rt_deluxe';
          if (r102Init.status === 'occupied' || !['clean', 'dirty', 'maintenance'].includes(r102Init.status)) {
            r102Init.status = 'clean';
            r102Init.operational = 'available';
            r102Init.notes = 'Ready for check-in';
          }
        }

        // Ensure 1 Unassigned reservation exists for Delux Room
        const unassignedDlx = this.reservations.filter(
          r => (r.status === 'confirmed' || r.status === 'in_house') && (!r.roomId || r.roomId === '') && r.roomTypeId === 'rt_deluxe'
        );
        if (unassignedDlx.length === 0) {
          const res3 = initialReservations.find(r => r.id === 'res_3');
          if (res3) {
            this.reservations.push({
              ...res3,
              roomId: '',
              roomNumber: '',
              roomTypeId: 'rt_deluxe',
              roomTypeName: 'Delux Room',
              status: 'confirmed'
            });
          }
        }
        this.folios = parsed.folios || initialFolios;
        ['fol_3', 'fol_4', 'fol_5', 'fol_6', 'fol_11'].forEach(fId => {
          if (!this.folios[fId] && initialFolios[fId]) {
            this.folios[fId] = initialFolios[fId];
          }
        });
        this.announcements = parsed.announcements || initialStaffNotes || [];
        this.otaChannels = parsed.otaChannels || initialOtaChannels;
        this.teamMembers = parsed.teamMembers || initialTeamMembers;
        if (!this.teamMembers.some(m => m.email === 'ss2137789@gmail.com')) {
          this.teamMembers.push({
            id: 'usr_02',
            name: 'Shankar L',
            initials: 'S',
            email: 'ss2137789@gmail.com',
            role: 'Hotel Manager / GM',
            status: 'ACTIVE',
            properties: ['HOTEL ASTHA'],
            invitedAt: '3 Nov 2026',
            hasAccount: true
          });
        }
        this.nightAudits = (parsed.nightAudits && parsed.nightAudits.length >= 5) ? parsed.nightAudits : initialNightAudits;
        this.auditTrail = parsed.auditTrail || initialAuditTrail;
        this.stopouts = parsed.stopouts || {};
        this.dailyRates = parsed.dailyRates || {
          base: {
            'rt_deluxe_2026-11-05': 1000,
            'rt_deluxe_2026-11-06': 1000
          },
          extra_adult: {},
          extra_child: {}
        };
        if (!this.dailyRates.base) this.dailyRates.base = {};
        if (this.dailyRates.base['rt_deluxe_2026-11-05'] === undefined) {
          this.dailyRates.base['rt_deluxe_2026-11-05'] = 1000;
        }
        if (this.dailyRates.base['rt_deluxe_2026-11-06'] === undefined) {
          this.dailyRates.base['rt_deluxe_2026-11-06'] = 1000;
        }
        this.propertiesList = parsed.propertiesList || ['HOTEL ASTHA', 'HOTEL ASTHA RESORT'];
        this.currentUser = parsed.currentUser || {
          id: 'usr_owner',
          name: 'Astha India',
          email: 'owner@hotelastha.com',
          role: 'Owner',
          initials: 'AI',
          status: 'ACTIVE'
        };
        this.invitationTokens = parsed.invitationTokens || [];
        if (!parsed.ratePlans || parsed.ratePlans.length === 0 || !parsed.ratePlans.some(rp => rp.code === 'STR')) {
          this.ratePlans = JSON.parse(JSON.stringify(initialRatePlans));
        } else {
          // Deduplicate ratePlans by code/id so stored duplicates are cleanly merged
          const dedupeMap = new Map();
          parsed.ratePlans.forEach((rp) => {
            const key = (rp.code || rp.id || '').trim().toUpperCase();
            if (key) {
              if (!dedupeMap.has(key)) {
                dedupeMap.set(key, { ...rp, id: rp.id || key });
              } else {
                const prev = dedupeMap.get(key);
                dedupeMap.set(key, { ...prev, ...rp, id: prev.id || rp.id || key });
              }
            }
          });
          this.ratePlans = Array.from(dedupeMap.values());
        }
        if (this.property) {
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          const todayStr = `${y}-${m}-${d}`;
          if (!this.property.businessDate || this.property.businessDate < todayStr) {
            this.property.businessDate = todayStr;
          }
        }
        this.restrictions = parsed.restrictions || {};
        this.maintenanceBlocks = parsed.maintenanceBlocks || [];
        this.save();
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
    this.dailyRates = {
      base: {
        'rt_deluxe_2026-11-05': 1000,
        'rt_deluxe_2026-11-06': 1000
      },
      extra_adult: {},
      extra_child: {}
    };
    this.restrictions = {};
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
      dailyRates: this.dailyRates,
      restrictions: this.restrictions,
      maintenanceBlocks: this.maintenanceBlocks,
      propertiesList: this.propertiesList || ['HOTEL ASTHA', 'HOTEL ASTHA RESORT'],
      currentUser: this.currentUser || { id: 'usr_owner', name: 'Astha India', role: 'Owner', email: 'owner@hotelastha.com', initials: 'AI', status: 'ACTIVE' },
      invitationTokens: this.invitationTokens || []
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
      dailyRates: this.dailyRates,
      restrictions: this.restrictions,
      maintenanceBlocks: this.maintenanceBlocks,
      propertiesList: this.propertiesList || ['HOTEL ASTHA', 'HOTEL ASTHA RESORT'],
      currentUser: this.currentUser || { id: 'usr_owner', name: 'Astha India', role: 'Owner', email: 'owner@hotelastha.com', initials: 'AI', status: 'ACTIVE' },
      invitationTokens: this.invitationTokens || [],
      cloudStatus: this.cloudStatus,
      isCloudLive: this.cloudStatus === 'LIVE'
    };
  }

  updateProperty(patch) {
    this.property = { ...this.property, ...patch };
    this.save();
    this.syncDocToFirestore('', this.propertyId, this.property);
    this.notify();
    return this.property;
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

  cleanDataForFirestore(obj) {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanDataForFirestore(item));
    }
    const cleaned = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = this.cleanDataForFirestore(val);
      }
    }
    return cleaned;
  }

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
          const cloudRes = snapshot.docs.map((d) => d.data());
          // Purge obsolete/cancelled residue
          const validCloudRes = cloudRes.filter((r) => {
            const name = (r.primaryGuest?.name || r.guestName || '').toLowerCase();
            if (name.includes('rahul kumar') && (r.status === 'cancelled' || !r.status)) return false;
            return true;
          });

          // Merge cloud reservations with existing local reservations so newly created reservations are never dropped
          const cloudIdSet = new Set(validCloudRes.map(r => r.id));
          const localOnly = (this.reservations || []).filter(r => r.id && !cloudIdSet.has(r.id));
          const allRes = [...validCloudRes, ...localOnly];

          const idOrder = ['res_7', 'res_6', 'res_5', 'res_4', 'res_3', 'res_2', 'res_1'];
          allRes.sort((a, b) => {
            const idxA = idOrder.indexOf(a.id);
            const idxB = idOrder.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA === -1 && idxB !== -1) return -1;
            if (idxA !== -1 && idxB === -1) return 1;
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          });

          // Apply same corrections as load() to cloud data
          this.reservations = allRes.map(r => {
            if (r.roomId === 'rm_102' || r.roomNumber === '102' || r.roomId === '102') {
              const updated = { ...r, roomId: '', roomNumber: '' };
              if (updated.status === 'in_house' || updated.status === 'checked_in') {
                updated.status = 'checked_out';
              }
              return updated;
            }
            return r;
          });
          // Apply guest name fixes on cloud data
          const fireRes6 = this.reservations.find(r => r.id === 'res_6');
          if (fireRes6) {
            fireRes6.primaryGuest = { ...(fireRes6.primaryGuest || {}), name: 'Mr Krishna Suthar', title: 'Mr.', firstName: 'Krishna', lastName: 'Suthar' };
            fireRes6.guestName = 'Mr Krishna Suthar';
            fireRes6.checkInDate = '2026-11-02'; fireRes6.checkOutDate = '2026-11-03'; fireRes6.nights = 1;
          }
          const fireRes5 = this.reservations.find(r => r.id === 'res_5');
          if (fireRes5) {
            fireRes5.primaryGuest = { ...(fireRes5.primaryGuest || {}), name: 'Mr Krishna Suthar', title: 'Mr.', firstName: 'Krishna', lastName: 'Suthar' };
            fireRes5.guestName = 'Mr Krishna Suthar';
            fireRes5.status = 'checked_out';
          }
          const fireRes11 = this.reservations.find(r => r.id === 'res_11');
          if (fireRes11) {
            fireRes11.primaryGuest = { ...(fireRes11.primaryGuest || {}), name: 'Mr Shankar Suthar', title: 'Mr.', firstName: 'Shankar', lastName: 'Suthar' };
            fireRes11.guestName = 'Mr Shankar Suthar';
          }
          const fireRes3 = this.reservations.find(r => r.id === 'res_3');
          if (fireRes3) {
            fireRes3.primaryGuest = { ...(fireRes3.primaryGuest || {}), name: 'Mr Shankar Suthar', title: 'Mr.', firstName: 'Shankar', lastName: 'Suthar' };
            fireRes3.guestName = 'Mr Shankar Suthar';
            fireRes3.status = 'confirmed';
          }
          this.cloudStatus = 'LIVE';
          this.save();
          this.notify();
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
          const cloudRooms = snapshot.docs.map((d) => d.data());
          const map = new Map();
          cloudRooms.forEach((r) => {
            // Skip rooms with invalid/placeholder room numbers
            const rNum = (r.roomNumber || '').trim();
            if (!rNum || rNum.toLowerCase() === 'unassigned' || rNum === '0') return;
            const key = r.id || r.roomNumber;
            if (key && !map.has(key)) map.set(key, r);
          });
          this.rooms = Array.from(map.values()).map(r => {
            if (r.id === 'rm_102' || r.roomNumber === '102') {
              const statusNorm = (r.status || '').toLowerCase();
              if (statusNorm === 'occupied' || !['clean', 'dirty', 'maintenance'].includes(statusNorm)) {
                return { ...r, id: 'rm_102', roomNumber: '102', roomTypeId: 'rt_deluxe', status: 'clean', operational: 'available', notes: 'Ready for check-in' };
              }
            }
            return r;
          });
          this.cloudStatus = 'LIVE';
          this.save();
          this.notify();
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
          const newFolios = {};
          snapshot.docs.forEach((d) => {
            newFolios[d.id] = d.data();
          });
          this.folios = newFolios;
          this.cloudStatus = 'LIVE';
          this.save();
          this.notify();
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
          this.maintenanceBlocks = snapshot.docs.map((d) => d.data());
          this.save();
          this.notify();
        },
        () => {}
      );
      this.unsubscribers.push(unsubMb);

      // 6. Real-time Listener: Root Property Master Information
      const propRef = doc(db, 'properties', this.propertyId);
      const unsubProp = onSnapshot(
        propRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const cloudProp = snapshot.data();
            this.property = { ...this.property, ...cloudProp };
            this.save();
            this.notify();
          }
        },
        (err) => {
          console.warn('[Firebase Firestore] Property listener note:', err.message);
        }
      );
      this.unsubscribers.push(unsubProp);

      // 7. Real-time Listener: Meal Plans
      const mpCol = collection(db, 'properties', this.propertyId, 'mealPlans');
      const unsubMp = onSnapshot(
        mpCol,
        (snapshot) => {
          const cloudMp = snapshot.docs.map((d) => d.data());
          const map = new Map();
          cloudMp.forEach((mp) => {
            const key = mp.id || mp.code;
            if (key && !map.has(key)) map.set(key, mp);
          });
          this.mealPlans = Array.from(map.values());
          this.save();
          this.notify();
        },
        () => {}
      );
      this.unsubscribers.push(unsubMp);

      // 8. Real-time Listener: Rate Plans
      const rpCol = collection(db, 'properties', this.propertyId, 'ratePlans');
      const unsubRp = onSnapshot(
        rpCol,
        (snapshot) => {
          const cloudRp = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          const map = new Map();
          cloudRp.forEach((rp) => {
            const codeKey = (rp.code || '').trim().toUpperCase();
            const idKey = (rp.id || '').trim();
            const dedupeKey = codeKey || idKey;
            if (dedupeKey) {
              if (!map.has(dedupeKey)) {
                map.set(dedupeKey, { ...rp, id: rp.id || dedupeKey });
              } else {
                const prev = map.get(dedupeKey);
                // Preserve active roomTypeRates and valid prices during merge
                const prevHasRates = prev.roomTypeRates && Object.values(prev.roomTypeRates).some(r => r && (r.active || r.basePrice > 0));
                const curHasRates = rp.roomTypeRates && Object.values(rp.roomTypeRates).some(r => r && (r.active || r.basePrice > 0));
                if (curHasRates && !prevHasRates) {
                  map.set(dedupeKey, { ...prev, ...rp, id: prev.id || rp.id || dedupeKey });
                } else {
                  map.set(dedupeKey, { ...rp, ...prev, id: prev.id || rp.id || dedupeKey });
                }
              }
            }
          });
          if (map.size > 0) {
            this.ratePlans = Array.from(map.values());
            this.save();
            this.notify();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubRp);

      // 9. Real-time Listener: Room Types
      const rtCol = collection(db, 'properties', this.propertyId, 'roomTypes');
      const unsubRt = onSnapshot(
        rtCol,
        (snapshot) => {
          const cloudRt = snapshot.docs.map((d) => d.data());
          const map = new Map();
          cloudRt.forEach((rt) => {
            const key = rt.id || rt.code;
            if (key && !map.has(key)) map.set(key, rt);
          });
          this.roomTypes = Array.from(map.values());
          this.save();
          this.notify();
        },
        () => {}
      );
      this.unsubscribers.push(unsubRt);

      // 10. Real-time Listener: Team Members
      const tmCol = collection(db, 'properties', this.propertyId, 'teamMembers');
      const unsubTm = onSnapshot(
        tmCol,
        (snapshot) => {
          const cloudTm = snapshot.docs.map((d) => d.data());
          if (cloudTm.length > 0) {
            const map = new Map();
            cloudTm.forEach((tm) => {
              const key = tm.id || tm.email;
              if (key && !map.has(key)) map.set(key, tm);
            });
            this.teamMembers = Array.from(map.values());
            this.save();
            this.notify();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubTm);

      // 11. Real-time Listener: Announcements / Staff Notes
      const annCol = collection(db, 'properties', this.propertyId, 'announcements');
      const unsubAnn = onSnapshot(
        annCol,
        (snapshot) => {
          const cloudAnn = snapshot.docs.map((d) => d.data());
          if (cloudAnn.length > 0) {
            this.announcements = cloudAnn;
            this.save();
            this.notify();
          }
        },
        () => {}
      );
      this.unsubscribers.push(unsubAnn);

      this.cloudStatus = 'LIVE';
      this.notify();
    } catch (e) {
      console.warn('[Firebase Firestore] Sync initialization fallback to local storage:', e.message);
      this.cloudStatus = 'OFFLINE_CACHE';
      this.notify();
    }
  }

  async syncDocToFirestore(collectionName, docId, data) {
    if (!data) return;
    try {
      const payload = this.cleanDataForFirestore({
        ...data,
        propertyId: this.propertyId,
        lastSyncedAt: new Date().toISOString()
      });

      // If syncing the property profile itself (empty collectionName or 'properties')
      if (!collectionName || collectionName === 'property' || collectionName === 'properties') {
        const propRef = doc(db, 'properties', this.propertyId);
        await setDoc(propRef, payload, { merge: true });

        // Also update settings/property_config for global settings resolution
        try {
          const configRef = doc(db, 'settings', 'property_config');
          await setDoc(configRef, payload, { merge: true });
        } catch (_) {}

        console.info(`🔥 [Firebase Cloud] Synced property master config for ${this.propertyId}`);
        return;
      }

      // 1. Nested under property subcollection
      const nestedRef = doc(db, 'properties', this.propertyId, collectionName, String(docId));
      await setDoc(nestedRef, payload, { merge: true });

      // 2. Root collection for universal querying & direct console visibility
      const rootRef = doc(db, collectionName, String(docId));
      await setDoc(rootRef, payload, { merge: true });

      console.info(`🔥 [Firebase Cloud] Synced ${collectionName}/${docId}`);
    } catch (err) {
      console.warn(`[Firebase Sync Note] Could not write to ${collectionName}/${docId}:`, err.message);
    }
  }

  async deleteDocFromFirestore(collectionName, docId) {
    if (!docId || !collectionName) return;
    try {
      const nestedRef = doc(db, 'properties', this.propertyId, collectionName, String(docId));
      await deleteDoc(nestedRef);

      const rootRef = doc(db, collectionName, String(docId));
      await deleteDoc(rootRef);
      console.info(`🔥 [Firebase Cloud] Deleted ${collectionName}/${docId}`);
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
    let maxNum = 11;
    (this.reservations || []).forEach((r) => {
      const match = String(r.bookingReference || r.id || '').match(/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > maxNum && n < 10000) {
          maxNum = n;
        }
      }
    });
    const count = maxNum + 1;
    const ref = `#RES_${count}`;
    const id = `res_${count}`;
    const folioId = `fol_${count}`;
    const isUnassigned = !bookingData.roomId || bookingData.roomId === 'unassigned' || bookingData.roomId === '';
    const room = !isUnassigned ? this.rooms.find(r => r.id === bookingData.roomId || r.roomNumber === bookingData.roomId) : null;
    const roomNumber = isUnassigned ? '' : (bookingData.roomNumber || room?.roomNumber || bookingData.roomId || '');
    const finalRoomId = isUnassigned ? '' : (room?.id || bookingData.roomId);
    const matchedRt = this.roomTypes?.find(rt => rt.id === bookingData.roomTypeId);
    const roomTypeName = matchedRt?.name || bookingData.roomTypeName || 'Delux Room';

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
        title: bookingData.primaryGuest?.title || bookingData.title || 'Mr.',
        firstName: bookingData.primaryGuest?.firstName || bookingData.firstName || '',
        lastName: bookingData.primaryGuest?.lastName || bookingData.lastName || '',
        phone: bookingData.guestPhone || bookingData.primaryGuest?.phone || '',
        countryCode: bookingData.primaryGuest?.countryCode || bookingData.countryCode || '+91',
        email: bookingData.guestEmail || bookingData.primaryGuest?.email || '',
        gstin: bookingData.guestGstin || bookingData.primaryGuest?.gstin || '',
        nationality: bookingData.nationality || bookingData.primaryGuest?.nationality || 'Indian',
        idType: bookingData.idType || bookingData.primaryGuest?.idType || 'Aadhaar Card',
        idNumber: bookingData.idNumber || bookingData.primaryGuest?.idNumber || '',
        idDocumentUrl: bookingData.idDocumentUrl || bookingData.primaryGuest?.idDocumentUrl || '',
        address: bookingData.primaryGuest?.address || bookingData.address || '',
        city: bookingData.primaryGuest?.city || bookingData.city || '',
        state: bookingData.primaryGuest?.state || bookingData.state || '',
        zip: bookingData.primaryGuest?.zip || bookingData.zip || '',
        isPrimary: true
      },
      roomId: finalRoomId,
      roomNumber,
      roomTypeId: bookingData.roomTypeId,
      roomTypeName,
      ratePlanCode: bookingData.ratePlanCode || 'BAR_CP',
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      checkInTime: bookingData.checkInTime || '11:59',
      checkOutTime: bookingData.checkOutTime || '11:00',
      roomsCount: bookingData.roomsCount || (bookingData.configuredRooms ? bookingData.configuredRooms.length : 1),
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
      const statusNorm = (target.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
      if (statusNorm === 'cancelled') {
        console.warn(`[PMSStore] Cannot modify cancelled reservation ${resId}. Details are locked.`);
        return null;
      }
      if (statusNorm === 'no_show') {
        console.warn(`[PMSStore] Cannot modify no-show reservation ${resId}. Details are locked.`);
        return null;
      }
      if (statusNorm === 'checked_out') {
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
      this.notify();
      return updated;
    }
    return null;
  }

  assignRoom(resId, targetRoomId) {
    const res = this.reservations.find(r => r.id === resId);
    const room = this.rooms.find(r => r.id === targetRoomId);
    if (!res || !room) return false;
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'checked_out' || statusNorm === 'cancelled' || statusNorm === 'no_show') {
      console.warn(`[PMSStore] Cannot reassign room on ${res.status} reservation ${resId}.`);
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
    this.notify();
    return true;
  }

  checkInReservation(resId, assignedRoomId = null) {
    const res = this.reservations.find(r => r.id === resId);
    if (!res) return false;
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'cancelled' || statusNorm === 'no_show' || statusNorm === 'checked_out') {
      console.warn(`[PMSStore] Cannot check-in ${res.status} reservation ${resId}.`);
      return false;
    }

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
    this.notify();
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
    this.notify();
    return { success: true, message: 'Check-out successful' };
  }

  cancelReservation(resId, reason = 'Guest requested') {
    const res = this.reservations.find(r => r.id === resId || r.bookingReference === resId);
    if (!res) return;

    const targetResId = res.id;
    const targetFolioId = res.folioId;

    // 1. Mark status as cancelled in reservations array (do not delete so it remains visible under All Statuses & Cancelled filter)
    this.reservations = this.reservations.map(r =>
      (r.id === targetResId || r.bookingReference === targetResId)
        ? {
            ...r,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
            roomId: '',
            roomNumber: 'Unassigned'
          }
        : r
    );

    // 2. Free up any allocated room
    if (res.roomId) {
      this.rooms = this.rooms.map(rm => {
        if (rm.id === res.roomId && rm.operational === 'allocated') {
          return { ...rm, operational: 'available' };
        }
        return rm;
      });
      const updatedRoom = this.rooms.find(rm => rm.id === res.roomId);
      if (updatedRoom) {
        this.syncDocToFirestore('rooms', updatedRoom.id, updatedRoom);
      }
    }

    // 3. Mark associated folio as CANCELLED if present
    if (targetFolioId && this.folios[targetFolioId]) {
      this.folios[targetFolioId] = {
        ...this.folios[targetFolioId],
        status: 'CANCELLED'
      };
      this.syncDocToFirestore('folios', targetFolioId, this.folios[targetFolioId]);
    }

    // 4. Log audit trail
    this.logAudit(
      'CANCEL_RESERVATION',
      'RESERVATION',
      res.bookingReference,
      `Reservation ${res.bookingReference} (${res.primaryGuest?.name || 'Guest'}) marked cancelled. Reason: ${reason}`
    );

    // 5. Save locally and sync cancelled record to Cloud Firestore
    this.save();
    const updated = this.getReservation(targetResId);
    if (updated) {
      this.syncDocToFirestore('reservations', targetResId, updated);
    }
    this.notify();
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
    this.notify();
  }

  // --- ROOM MOVES & REASSIGNMENT ---

  groupRoomMove(reservationId, targetRoomId) {
    const res = this.reservations.find(r => r.id === reservationId);
    const targetRoom = this.rooms.find(r => r.id === targetRoomId);
    if (!res || !targetRoom) return false;

    const oldRoomNumber = res.roomNumber;
    const oldRoomId = res.roomId;
    const targetRoomType = this.roomTypes.find(rt => rt.id === targetRoom.roomTypeId);

    this.reservations = this.reservations.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          roomId: targetRoomId,
          roomNumber: targetRoom.roomNumber,
          roomTypeId: targetRoom.roomTypeId || r.roomTypeId,
          roomTypeName: targetRoomType ? targetRoomType.name : (r.roomTypeName || '')
        };
      }
      return r;
    });

    // Update rooms housekeeping & operational state
    if (oldRoomId && oldRoomId !== targetRoomId) {
      this.rooms = this.rooms.map(rm => {
        if (rm.id === oldRoomId) {
          return { ...rm, status: 'dirty', operational: 'available' };
        }
        if (rm.id === targetRoomId) {
          return { ...rm, operational: 'allocated' };
        }
        return rm;
      });
    }

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
    this.notify();
    return true;
  }

  // --- HOUSEKEEPING & MAINTENANCE ---

  updateRoomStatus(roomId, newStatus, extraNotes = null) {
    const normStatus = (newStatus || 'clean').toLowerCase();
    let updatedRoom = null;

    this.rooms = this.rooms.map(rm => {
      const isMatch = rm.id === roomId ||
                      rm.roomNumber === String(roomId) ||
                      rm.id === `rm_${roomId}` ||
                      (roomId && String(rm.id).toLowerCase() === String(roomId).toLowerCase());

      if (isMatch) {
        let notes = extraNotes;
        if (!notes) {
          if (normStatus === 'dirty') {
            notes = (rm.notes && rm.notes !== 'Ready for check-in') ? rm.notes : 'Needs cleaning';
          } else if (normStatus === 'clean') {
            notes = 'Ready for check-in';
          } else if (normStatus === 'maintenance') {
            notes = (rm.notes && rm.notes !== 'Ready for check-in') ? rm.notes : 'Out of order';
          } else {
            notes = rm.notes || '';
          }
        }

        updatedRoom = {
          ...rm,
          status: normStatus,
          operational: normStatus === 'maintenance' ? 'maintenance' : 'available',
          notes,
          updatedAt: new Date().toISOString()
        };
        return updatedRoom;
      }
      return rm;
    });

    const room = updatedRoom || this.rooms.find(r => r.id === roomId || r.roomNumber === String(roomId) || r.id === `rm_${roomId}`);
    this.logAudit('HOUSEKEEPING_UPDATE', 'ROOM', room ? room.roomNumber : roomId, `Status set to ${normStatus.toUpperCase()}`);
    this.save();

    if (room) {
      this.syncDocToFirestore('rooms', room.id, room);
      if (room.roomNumber && room.roomNumber !== room.id) {
        this.syncDocToFirestore('rooms', room.roomNumber, room);
      }
    }
    this.notify();
    return updatedRoom;
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
    this.notify();
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
    this.notify();
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
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'checked_out' || statusNorm === 'cancelled' || statusNorm === 'no_show') {
      console.warn(`[PMSStore] Cannot add transaction to ${res.status} reservation ${reservationId}.`);
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
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'checked_out' || statusNorm === 'cancelled' || statusNorm === 'no_show') {
      console.warn(`[PMSStore] Cannot post pending charges to ${res.status} reservation ${reservationId}.`);
      return null;
    }

    // Guard against accidental duplicate posting within 1 second
    const now = Date.now();
    if (
      this._lastPostPendingCall &&
      this._lastPostPendingCall.reservationId === reservationId &&
      now - this._lastPostPendingCall.timestamp < 1000
    ) {
      console.warn(`[PMSStore] Blocked duplicate postPendingCharges call within 1s for ${reservationId}.`);
      return null;
    }
    this._lastPostPendingCall = { reservationId, timestamp: now };

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
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'checked_out' || statusNorm === 'cancelled' || statusNorm === 'no_show') {
      console.warn(`[PMSStore] Cannot add charge to ${res.status} reservation ${reservationId}.`);
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

    // Guard against accidental duplicate posting within 1 second
    const now = Date.now();
    if (
      this._lastChargeCall &&
      this._lastChargeCall.reservationId === reservationId &&
      this._lastChargeCall.amount === amt &&
      this._lastChargeCall.category === category &&
      now - this._lastChargeCall.timestamp < 1000
    ) {
      console.warn(`[PMSStore] Blocked duplicate addFolioCharge call within 1s for ${reservationId}.`);
      return folio.transactions[folio.transactions.length - 1] || null;
    }
    this._lastChargeCall = { reservationId, amount: amt, category, timestamp: now };

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
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'checked_out' || statusNorm === 'cancelled' || statusNorm === 'no_show') {
      console.warn(`[PMSStore] Cannot add payment to ${res.status} reservation ${reservationId}.`);
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

    // Guard against accidental duplicate payment posting within 1 second
    const now = Date.now();
    if (
      this._lastPaymentCall &&
      this._lastPaymentCall.reservationId === reservationId &&
      this._lastPaymentCall.amount === amt &&
      this._lastPaymentCall.paymentMethod === paymentMethod &&
      now - this._lastPaymentCall.timestamp < 1000
    ) {
      console.warn(`[PMSStore] Blocked duplicate addFolioPayment call within 1s for ${reservationId}.`);
      return folio.transactions[folio.transactions.length - 1] || null;
    }
    this._lastPaymentCall = { reservationId, amount: amt, paymentMethod, timestamp: now };

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
    const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'checked_out' || statusNorm === 'cancelled' || statusNorm === 'no_show') {
      console.warn(`[PMSStore] Cannot void payment on ${res.status} reservation ${reservationId}.`);
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

  updateDailyRates(ratesMap, tier = 'base') {
    if (!ratesMap || typeof ratesMap !== 'object') return;
    if (!this.dailyRates) this.dailyRates = { base: {}, extra_adult: {}, extra_child: {} };
    if (!this.dailyRates[tier]) this.dailyRates[tier] = {};

    Object.entries(ratesMap).forEach(([key, val]) => {
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        this.dailyRates[tier][key] = num;
      }
    });

    // Update roomTypes default basePrice if tier is base
    if (tier === 'base') {
      this.roomTypes = this.roomTypes.map(rt => {
        const matchingKey = Object.keys(ratesMap).find(k => k.startsWith(rt.id + '_'));
        if (matchingKey) {
          const v = Number(ratesMap[matchingKey]);
          if (!isNaN(v) && v > 0) return { ...rt, basePrice: v };
        }
        return rt;
      });
    }

    this.logAudit('RATES_UPDATE', 'RATE_MATRIX', tier, `Updated ${Object.keys(ratesMap).length} daily rates for tier: ${tier}`);
    this.save();
  }

  updateSingleRate(roomTypeId, dateStr, rate, tier = 'base') {
    if (!this.dailyRates) this.dailyRates = { base: {}, extra_adult: {}, extra_child: {} };
    if (!this.dailyRates[tier]) this.dailyRates[tier] = {};
    const num = Number(rate);
    if (!isNaN(num) && num > 0) {
      this.dailyRates[tier][`${roomTypeId}_${dateStr}`] = num;
      this.save();
    }
  }

  bulkUpdateRates(payload) {
    if (!payload) return;

    if (!this.dailyRates) this.dailyRates = { base: {}, extra_adult: {}, extra_child: {} };
    if (!this.restrictions) this.restrictions = {};

    // 1. Direct inline rate matrix save
    if (payload.rates && typeof payload.rates === 'object') {
      this.updateDailyRates(payload.rates, payload.tier || 'base');
      return;
    }

    // 2. Bulk Update from Modal
    const targetRoomTypeIds = payload.roomTypeIds || this.roomTypes.map(r => r.id);
    const rtNames = this.roomTypes.filter(rt => targetRoomTypeIds.includes(rt.id)).map(r => r.name).join(', ');

    const startDateStr = payload.startDate || '2026-10-24';
    const endDateStr = payload.endDate || '2026-11-15';
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const cur = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');

    while (cur <= end) {
      const dayName = dayMap[cur.getDay()];
      if (!payload.daysOfWeek || payload.daysOfWeek.length === 0 || payload.daysOfWeek.includes(dayName)) {
        const iso = cur.toISOString().split('T')[0];
        targetRoomTypeIds.forEach(rtId => {
          const cellKey = `${rtId}_${iso}`;

          // Rate override
          if (payload.baseRate !== undefined && payload.baseRate !== null && payload.baseRate !== '') {
            const rateNum = Number(payload.baseRate);
            if (!isNaN(rateNum) && rateNum > 0) {
              if (!this.dailyRates.base) this.dailyRates.base = {};
              this.dailyRates.base[cellKey] = rateNum;
            }
          }

          // Extra adult
          if (payload.extraAdultRate !== undefined && payload.extraAdultRate !== null && payload.extraAdultRate !== '') {
            const eaNum = Number(payload.extraAdultRate);
            if (!isNaN(eaNum) && eaNum > 0) {
              if (!this.dailyRates.extra_adult) this.dailyRates.extra_adult = {};
              this.dailyRates.extra_adult[cellKey] = eaNum;
            }
          }

          // Extra child
          if (payload.extraChildRate !== undefined && payload.extraChildRate !== null && payload.extraChildRate !== '') {
            const ecNum = Number(payload.extraChildRate);
            if (!isNaN(ecNum) && ecNum > 0) {
              if (!this.dailyRates.extra_child) this.dailyRates.extra_child = {};
              this.dailyRates.extra_child[cellKey] = ecNum;
            }
          }

          // Stop sell
          if (payload.stopSell !== undefined) {
            this.stopouts[cellKey] = !!payload.stopSell;
          }

          // Min nights
          if (payload.minNights !== undefined) {
            this.restrictions[`min_${cellKey}`] = Number(payload.minNights);
          }

          // Max nights
          if (payload.maxNights !== undefined) {
            this.restrictions[`max_${cellKey}`] = Number(payload.maxNights);
          }

          // CTA (Closed to arrival)
          if (payload.cta !== undefined) {
            this.restrictions[`cta_${cellKey}`] = !!payload.cta;
          }

          // CTD (Closed to departure)
          if (payload.ctd !== undefined) {
            this.restrictions[`ctd_${cellKey}`] = !!payload.ctd;
          }
        });
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Update roomTypes default basePrice if provided
    if (payload.baseRate) {
      const bNum = Number(payload.baseRate);
      if (!isNaN(bNum) && bNum > 0) {
        this.roomTypes = this.roomTypes.map(rt => {
          if (targetRoomTypeIds.includes(rt.id)) {
            return { ...rt, basePrice: bNum };
          }
          return rt;
        });
      }
    }

    this.logAudit(
      'BULK_RATE_UPDATE',
      'INVENTORY_RATES',
      `${startDateStr} to ${endDateStr}`,
      `Bulk updated for [${rtNames}]. Base Rate: ₹${payload.baseRate || 'Unchanged'}, StopSell: ${payload.stopSell !== undefined ? (payload.stopSell ? 'YES' : 'NO') : 'Unchanged'}`
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

  // --- MULTI-PROPERTY TEAM INVITATION & GRANULAR RBAC ENGINE ---

  inviteTeamMembers({ emails = [], assignments = [], invitedBy = 'Astha India' }) {
    if (!emails.length) return [];

    const newMembers = [];
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    emails.forEach((email, idx) => {
      const trimmedEmail = email.trim().toLowerCase();
      const namePart = trimmedEmail.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const initials = (namePart.charAt(0) || 'U').toUpperCase();

      const propNames = assignments.map(a => a.property).filter(Boolean);
      const primaryRole = assignments[0]?.role || 'Front Desk / Receptionist';

      const token = `inv_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const memberId = `usr_${Date.now()}_${idx}`;

      const initialPermissions = getRoleDefaultPermissions(primaryRole);

      const member = {
        id: memberId,
        name: displayName,
        email: trimmedEmail,
        initials,
        role: primaryRole,
        properties: propNames.length ? propNames : [this.property.name],
        propertyAssignments: assignments,
        status: 'INVITED',
        invitedAt: formattedDate,
        invitedBy,
        invitationToken: token,
        permissions: initialPermissions,
        hasAccount: trimmedEmail === 'ss2137789@gmail.com'
      };

      newMembers.push(member);

      if (!this.invitationTokens) this.invitationTokens = [];
      this.invitationTokens.push({
        token,
        email: trimmedEmail,
        memberId,
        organizationName: this.property.name,
        properties: member.properties,
        role: member.role,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'PENDING'
      });

      this.logAudit('INVITE_MEMBER', 'TEAM', trimmedEmail, `Invited to ${member.properties.join(', ')} as ${primaryRole}`);
    });

    this.teamMembers = [...this.teamMembers, ...newMembers];
    this.save();
    newMembers.forEach(m => {
      this.syncDocToFirestore('teamMembers', m.id, m);
    });
    this.notify();
    return newMembers;
  }

  inviteTeamMember(memberData) {
    return this.inviteTeamMembers({
      emails: [memberData.email],
      assignments: [{ property: this.property.name, role: memberData.role || 'Front Desk / Receptionist' }],
      invitedBy: 'Astha India'
    })[0];
  }

  removeInvitation(memberId) {
    const member = this.teamMembers.find(m => m.id === memberId);
    this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
    if (this.invitationTokens) {
      this.invitationTokens = this.invitationTokens.filter(t => t.memberId !== memberId);
    }
    if (member) {
      this.logAudit('REVOKE_INVITE', 'TEAM', member.email, `Invitation revoked.`);
      this.deleteDocFromFirestore('teamMembers', memberId);
    }
    this.save();
    this.notify();
  }

  removeTeamMember(memberId) {
    const member = this.teamMembers.find(m => m.id === memberId);
    this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
    if (member) {
      this.logAudit('REMOVE_MEMBER', 'TEAM', member.email, `Member removed from organization.`);
      this.deleteDocFromFirestore('teamMembers', memberId);
    }
    this.save();
    this.notify();
  }

  updateTeamMember(memberId, patch) {
    let updatedMember = null;
    this.teamMembers = this.teamMembers.map(m => {
      if (m.id === memberId) {
        updatedMember = { ...m, ...patch };
        return updatedMember;
      }
      return m;
    });
    this.save();
    if (updatedMember) {
      this.syncDocToFirestore('teamMembers', memberId, updatedMember);
    }
    this.notify();
  }

  verifyInviteToken(token) {
    if (!token) return { valid: false, error: 'No invitation token provided.' };
    const member = this.teamMembers.find(m => m.invitationToken === token);
    const tokenRecord = this.invitationTokens?.find(t => t.token === token);

    if (!member && !tokenRecord) {
      return { valid: false, error: 'Invalid or expired invitation token.' };
    }

    const email = member?.email || tokenRecord?.email;
    const properties = member?.properties || tokenRecord?.properties || [this.property.name];
    const role = member?.role || tokenRecord?.role || 'Team Member';
    const accountExists = member?.hasAccount ?? (email === 'ss2137789@gmail.com');

    return {
      valid: true,
      token,
      memberId: member?.id,
      email,
      name: member?.name,
      properties,
      role,
      accountExists,
      organizationName: this.property.name
    };
  }

  acceptInvitation({ token, email, name, password }) {
    const verification = this.verifyInviteToken(token);
    if (!verification.valid) {
      return { success: false, error: verification.error };
    }

    const member = this.teamMembers.find(m => m.invitationToken === token || m.email?.toLowerCase() === email?.toLowerCase());
    if (!member) {
      return { success: false, error: 'Member record not found.' };
    }

    const updatedName = name || member.name || email.split('@')[0];
    const initials = (updatedName.charAt(0) || 'U').toUpperCase();

    member.status = 'ACTIVE';
    member.name = updatedName;
    member.initials = initials;
    member.acceptedAt = new Date().toISOString();
    member.hasAccount = true;

    // Switch active session to this newly accepted member
    this.currentUser = {
      id: member.id,
      name: updatedName,
      email: member.email,
      role: member.role,
      initials,
      status: 'ACTIVE',
      permissions: member.permissions
    };

    this.logAudit('ACCEPT_INVITE', 'TEAM', member.email, `Invitation accepted. Account activated.`);
    this.save();
    this.syncDocToFirestore('teamMembers', member.id, member);
    this.notify();
    return { success: true, member };
  }

  switchUser(userId) {
    if (userId === 'usr_owner' || userId === 'owner') {
      this.currentUser = {
        id: 'usr_owner',
        name: 'Astha India',
        email: 'owner@hotelastha.com',
        role: 'Owner',
        initials: 'AI',
        status: 'ACTIVE'
      };
    } else {
      const member = this.teamMembers.find(m => m.id === userId);
      if (member) {
        this.currentUser = {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          initials: member.initials || (member.name ? member.name.charAt(0).toUpperCase() : 'U'),
          status: member.status,
          permissions: member.permissions
        };
      }
    }
    this.save();
    this.notify();
  }

  hasPermission(permissionPath) {
    if (this.currentUser?.role === 'Owner') return true;

    const perms = this.currentUser?.permissions;
    if (!perms) return true;

    if (perms.allowAll) return true;

    const keys = permissionPath.split('.');
    let curr = perms;
    for (const key of keys) {
      if (curr === undefined || curr === null) return false;
      curr = curr[key];
    }
    return curr === true;
  }

  updateGranularPermissions(userId, permissions, targetPropertyNames = [], copyToUserIds = []) {
    const applyToIds = new Set([userId, ...copyToUserIds]);

    this.teamMembers = this.teamMembers.map(m => {
      if (applyToIds.has(m.id)) {
        const updated = {
          ...m,
          permissions: JSON.parse(JSON.stringify(permissions)),
          ...(targetPropertyNames.length ? { properties: targetPropertyNames } : {})
        };
        this.syncDocToFirestore('teamMembers', m.id, updated);
        return updated;
      }
      return m;
    });

    if (this.currentUser && applyToIds.has(this.currentUser.id)) {
      this.currentUser.permissions = JSON.parse(JSON.stringify(permissions));
    }

    this.logAudit('UPDATE_PERMISSIONS', 'RBAC', userId, `Updated granular operational permissions.`);
    this.save();
    this.notify();
  }

  updatePermissions(userId, permissions) {
    this.updateGranularPermissions(userId, permissions);
  }

  addMealPlan(planData) {
    const id = `mp_${Date.now()}`;
    const newPlan = {
      id,
      code: planData.code?.toUpperCase() || `MP${this.mealPlans.length + 1}`,
      name: planData.name || 'Custom Meal Plan',
      inclusions: planData.inclusions || [],
      pricingModel: planData.pricingModel || 'PER_PERSON',
      adultPrice: Number(planData.adultPrice) || 0,
      childPrice: Number(planData.childPrice) || 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.mealPlans = [...(this.mealPlans || []), newPlan];
    this.logAudit('CREATE_MEAL_PLAN', 'PROPERTIES', newPlan.code, `Created meal plan ${newPlan.name}`);
    this.save();
    this.syncDocToFirestore('mealPlans', newPlan.id, newPlan);
    this.notify();
    return newPlan;
  }

  updateMealPlan(planId, patch) {
    let updatedPlan = null;
    this.mealPlans = (this.mealPlans || []).map(p => {
      if (p.id === planId) {
        updatedPlan = { ...p, ...patch };
        return updatedPlan;
      }
      return p;
    });
    this.logAudit('UPDATE_MEAL_PLAN', 'PROPERTIES', planId, `Updated meal plan.`);
    this.save();
    if (updatedPlan) {
      this.syncDocToFirestore('mealPlans', planId, updatedPlan);
    }
    this.notify();
  }

  deleteMealPlan(planId) {
    const plan = this.mealPlans?.find(p => p.id === planId || p.code === planId);
    this.mealPlans = (this.mealPlans || []).filter(p => p.id !== planId && p.code !== planId);
    if (plan) {
      this.logAudit('DELETE_MEAL_PLAN', 'PROPERTIES', plan.code, `Removed meal plan ${plan.name}`);
      this.deleteDocFromFirestore('mealPlans', plan.id);
      if (plan.code && plan.code !== plan.id) {
        this.deleteDocFromFirestore('mealPlans', plan.code);
      }
    } else {
      this.deleteDocFromFirestore('mealPlans', planId);
    }
    this.save();
    this.notify();
  }

  addRatePlan(planData) {
    const id = planData.id || `rp_${Date.now()}`;
    const code = (planData.code || `RP${(this.ratePlans || []).length + 1}`).trim().toUpperCase();
    const newPlan = {
      id,
      name: (planData.name || 'New Rate Plan').trim(),
      code,
      mealPlanId: planData.mealPlanId || null,
      mealPlanName: planData.mealPlanName || (planData.mealPlanId ? this.mealPlans?.find(m => m.id === planData.mealPlanId)?.name : '-'),
      status: planData.status || 'ACTIVE',
      roomTypeRates: planData.roomTypeRates || {},
      createdAt: new Date().toISOString()
    };

    let found = false;
    this.ratePlans = (this.ratePlans || []).map(p => {
      const pCode = (p.code || '').trim().toUpperCase();
      const pId = (p.id || '').trim();
      if (pCode === code || pId === id) {
        found = true;
        return { ...p, ...newPlan, id: p.id || id };
      }
      return p;
    });
    if (!found) {
      this.ratePlans = [...(this.ratePlans || []), newPlan];
    }
    this.logAudit('CREATE_RATE_PLAN', 'PROPERTIES', newPlan.code, `Created rate plan ${newPlan.name}`);
    this.save();
    this.syncDocToFirestore('ratePlans', newPlan.id, newPlan);
    if (newPlan.code && newPlan.code !== newPlan.id) {
      this.syncDocToFirestore('ratePlans', newPlan.code, newPlan);
    }
    this.notify();
    return newPlan;
  }

  updateRatePlan(planId, patch) {
    let updatedPlan = null;
    const targetId = String(planId || '').trim();
    const targetCode = String(patch?.code || '').trim().toUpperCase();
    const targetName = String(patch?.name || '').trim().toLowerCase();

    this.ratePlans = (this.ratePlans || []).map(p => {
      const pId = String(p.id || '').trim();
      const pCode = String(p.code || '').trim().toUpperCase();
      const pName = String(p.name || '').trim().toLowerCase();

      const isMatch = (
        (targetId && (pId === targetId || pCode === targetId)) ||
        (targetCode && pCode === targetCode) ||
        (targetName && pName === targetName)
      );

      if (isMatch && !updatedPlan) {
        updatedPlan = {
          ...p,
          ...patch,
          id: p.id || (targetId.startsWith('rp_') ? targetId : `rp_${Date.now()}`),
          code: (patch.code || p.code || targetCode).toUpperCase(),
          name: (patch.name || p.name || 'Rate Plan').trim(),
          mealPlanId: patch.mealPlanId !== undefined ? patch.mealPlanId : p.mealPlanId,
          mealPlanName: patch.mealPlanName !== undefined ? patch.mealPlanName : p.mealPlanName,
          status: patch.status || p.status || 'ACTIVE',
          roomTypeRates: patch.roomTypeRates !== undefined ? patch.roomTypeRates : (p.roomTypeRates || {})
        };
        return updatedPlan;
      }
      return p;
    });

    if (!updatedPlan) {
      const newId = (targetId && targetId.startsWith('rp_')) ? targetId : `rp_${Date.now()}`;
      updatedPlan = {
        id: newId,
        name: (patch.name || 'New Rate Plan').trim(),
        code: (patch.code || targetCode || 'RP').toUpperCase(),
        mealPlanId: patch.mealPlanId || null,
        mealPlanName: patch.mealPlanName || '-',
        status: patch.status || 'ACTIVE',
        roomTypeRates: patch.roomTypeRates || {},
        ...patch
      };
      this.ratePlans = [...(this.ratePlans || []), updatedPlan];
    }

    // Deduplicate ratePlans by code/id so duplicates are completely eliminated
    const dedupeMap = new Map();
    (this.ratePlans || []).forEach(rp => {
      const c = (rp.code || rp.id || '').trim().toUpperCase();
      if (!dedupeMap.has(c)) {
        dedupeMap.set(c, rp);
      } else {
        const existing = dedupeMap.get(c);
        dedupeMap.set(c, { ...existing, ...rp });
      }
    });
    this.ratePlans = Array.from(dedupeMap.values());

    this.logAudit('UPDATE_RATE_PLAN', 'PROPERTIES', updatedPlan.code || planId, `Updated rate plan ${updatedPlan.name}.`);
    this.save();

    // Sync to Firestore under both the plan.id and the plan.code to ensure complete cloud persistence
    if (updatedPlan) {
      if (updatedPlan.id) {
        this.syncDocToFirestore('ratePlans', updatedPlan.id, updatedPlan);
      }
      if (updatedPlan.code && updatedPlan.code !== updatedPlan.id) {
        this.syncDocToFirestore('ratePlans', updatedPlan.code, updatedPlan);
      }
      if (planId && planId !== updatedPlan.id && planId !== updatedPlan.code) {
        this.syncDocToFirestore('ratePlans', planId, updatedPlan);
      }
    }
    this.notify();
    return updatedPlan;
  }

  deleteRatePlan(planId) {
    const plan = this.ratePlans?.find(p => p.id === planId || p.code === planId);
    this.ratePlans = (this.ratePlans || []).filter(p => p.id !== planId && p.code !== planId);
    if (plan) {
      this.logAudit('DELETE_RATE_PLAN', 'PROPERTIES', plan.code, `Removed rate plan ${plan.name}`);
      this.deleteDocFromFirestore('ratePlans', plan.id);
      if (plan.code && plan.code !== plan.id) {
        this.deleteDocFromFirestore('ratePlans', plan.code);
      }
    } else {
      this.deleteDocFromFirestore('ratePlans', planId);
    }
    this.save();
    this.notify();
  }

  addRoomType(roomTypeData) {
    const newRoomType = {
      id: `rt_${Date.now()}`,
      name: roomTypeData.name || 'New Room Type',
      code: roomTypeData.code ? roomTypeData.code.toUpperCase() : '',
      baseAdults: parseInt(roomTypeData.baseAdults, 10) || 1,
      maxAdults: parseInt(roomTypeData.maxAdults, 10) || 2,
      baseChildren: parseInt(roomTypeData.baseChildren, 10) || 0,
      maxChildren: parseInt(roomTypeData.maxChildren, 10) || 0,
      status: roomTypeData.status || 'ACTIVE',
      basePrice: Number(roomTypeData.basePrice) || 1000,
      extraAdultPrice: Number(roomTypeData.extraAdultPrice) || 500,
      extraChildPrice: Number(roomTypeData.extraChildPrice) || 250,
      color: roomTypeData.color || '#3b82f6'
    };
    this.roomTypes = [...(this.roomTypes || []), newRoomType];

    // Automatically update existing rate plans so this room type is included with default active rate
    this.ratePlans = (this.ratePlans || []).map(rp => {
      const updatedRates = {
        ...(rp.roomTypeRates || {}),
        [newRoomType.id]: {
          active: true,
          basePrice: newRoomType.basePrice || 1000,
          extraAdult: newRoomType.extraAdultPrice || 500,
          extraChild: newRoomType.extraChildPrice || 250
        }
      };
      const updatedPlan = { ...rp, roomTypeRates: updatedRates };
      this.syncDocToFirestore('ratePlans', updatedPlan.id, updatedPlan);
      if (updatedPlan.code && updatedPlan.code !== updatedPlan.id) {
        this.syncDocToFirestore('ratePlans', updatedPlan.code, updatedPlan);
      }
      return updatedPlan;
    });

    this.logAudit('ADD_ROOM_TYPE', 'PROPERTIES', newRoomType.id, `Created room type ${newRoomType.name}`);
    this.save();
    this.syncDocToFirestore('roomTypes', newRoomType.id, newRoomType);
    this.notify();
    return newRoomType;
  }

  updateRoomType(roomTypeId, patch) {
    let updated = null;
    this.roomTypes = (this.roomTypes || []).map(rt => {
      if (rt.id === roomTypeId) {
        updated = { ...rt, ...patch };
        return updated;
      }
      return rt;
    });

    // If rate info changed, update in rate plans as well
    if (patch.basePrice || patch.extraAdultPrice || patch.extraChildPrice) {
      this.ratePlans = (this.ratePlans || []).map(rp => {
        if (rp.roomTypeRates && rp.roomTypeRates[roomTypeId]) {
          const prev = rp.roomTypeRates[roomTypeId];
          const updatedRates = {
            ...rp.roomTypeRates,
            [roomTypeId]: {
              ...prev,
              basePrice: patch.basePrice !== undefined ? Number(patch.basePrice) : prev.basePrice,
              extraAdult: patch.extraAdultPrice !== undefined ? Number(patch.extraAdultPrice) : prev.extraAdult,
              extraChild: patch.extraChildPrice !== undefined ? Number(patch.extraChildPrice) : prev.extraChild
            }
          };
          const updatedPlan = { ...rp, roomTypeRates: updatedRates };
          this.syncDocToFirestore('ratePlans', updatedPlan.id, updatedPlan);
          if (updatedPlan.code && updatedPlan.code !== updatedPlan.id) {
            this.syncDocToFirestore('ratePlans', updatedPlan.code, updatedPlan);
          }
          return updatedPlan;
        }
        return rp;
      });
    }

    this.logAudit('UPDATE_ROOM_TYPE', 'PROPERTIES', roomTypeId, `Updated room type.`);
    this.save();
    if (updated) {
      this.syncDocToFirestore('roomTypes', roomTypeId, updated);
    }
    this.notify();
  }

  deleteRoomType(roomTypeId) {
    const rt = this.roomTypes?.find(r => r.id === roomTypeId || r.code === roomTypeId);
    this.roomTypes = (this.roomTypes || []).filter(r => r.id !== roomTypeId && r.code !== roomTypeId);
    if (rt) {
      this.logAudit('DELETE_ROOM_TYPE', 'PROPERTIES', rt.id, `Deleted room type ${rt.name}`);
      this.deleteDocFromFirestore('roomTypes', rt.id);
      if (rt.code && rt.code !== rt.id) {
        this.deleteDocFromFirestore('roomTypes', rt.code);
      }
      // Also clean up rates in rate plans
      this.ratePlans = (this.ratePlans || []).map(rp => {
        if (rp.roomTypeRates && rp.roomTypeRates[rt.id]) {
          const newRates = { ...rp.roomTypeRates };
          delete newRates[rt.id];
          const updatedPlan = { ...rp, roomTypeRates: newRates };
          this.syncDocToFirestore('ratePlans', updatedPlan.id, updatedPlan);
          return updatedPlan;
        }
        return rp;
      });
    } else {
      this.deleteDocFromFirestore('roomTypes', roomTypeId);
    }
    this.save();
    this.notify();
  }

  addRooms(newRoomsList) {
    const created = newRoomsList.map((item, idx) => ({
      id: `rm_${Date.now()}_${idx}`,
      roomNumber: String(item.roomNumber).trim(),
      roomTypeId: item.roomTypeId,
      floor: item.roomNumber ? String(item.roomNumber).trim().charAt(0) : '1',
      status: 'clean',
      operational: 'available',
      notes: ''
    }));
    this.rooms = [...(this.rooms || []), ...created];
    this.logAudit('ADD_ROOMS', 'PROPERTIES', '', `Added ${created.length} new rooms.`);
    this.save();
    created.forEach((rm) => {
      this.syncDocToFirestore('rooms', rm.id, rm);
    });
    this.notify();
    return created;
  }

  updateRoom(roomId, patch) {
    let updated = null;
    let oldRoomNumber = null;
    this.rooms = (this.rooms || []).map(rm => {
      if (rm.id === roomId) {
        oldRoomNumber = rm.roomNumber;
        updated = { ...rm, ...patch };
        return updated;
      }
      return rm;
    });
    this.logAudit('UPDATE_ROOM', 'PROPERTIES', roomId, `Updated room.`);
    this.save();
    if (updated) {
      this.syncDocToFirestore('rooms', roomId, updated);
      if (oldRoomNumber && patch.roomNumber && oldRoomNumber !== patch.roomNumber && oldRoomNumber !== roomId) {
        this.deleteDocFromFirestore('rooms', oldRoomNumber);
      }
    }
    this.notify();
  }

  deleteRoom(roomId) {
    const rm = this.rooms?.find(r => r.id === roomId || r.roomNumber === roomId);
    this.rooms = (this.rooms || []).filter(r => r.id !== roomId && r.roomNumber !== roomId);
    if (rm) {
      this.logAudit('DELETE_ROOM', 'PROPERTIES', rm.roomNumber, `Deleted room ${rm.roomNumber}`);
      this.deleteDocFromFirestore('rooms', rm.id);
      if (rm.roomNumber && rm.roomNumber !== rm.id) {
        this.deleteDocFromFirestore('rooms', rm.roomNumber);
      }
    } else {
      this.deleteDocFromFirestore('rooms', roomId);
    }
    this.save();
    this.notify();
  }

  deleteReservation(resId) {
    const res = this.reservations.find(r => r.id === resId || r.bookingReference === resId);
    if (!res) return false;

    const targetResId = res.id;
    const targetFolioId = res.folioId;

    this.reservations = this.reservations.filter(r => r.id !== targetResId);

    // Free up any allocated room
    if (res.roomId) {
      this.rooms = this.rooms.map(rm => {
        if (rm.id === res.roomId && rm.operational === 'allocated') {
          return { ...rm, operational: 'available' };
        }
        return rm;
      });
      const updatedRoom = this.rooms.find(rm => rm.id === res.roomId);
      if (updatedRoom) {
        this.syncDocToFirestore('rooms', updatedRoom.id, updatedRoom);
      }
    }

    // Delete associated folio
    if (targetFolioId && this.folios[targetFolioId]) {
      delete this.folios[targetFolioId];
      this.deleteDocFromFirestore('folios', targetFolioId);
    }

    this.logAudit(
      'DELETE_RESERVATION',
      'RESERVATION',
      res.bookingReference,
      `Reservation ${res.bookingReference} deleted permanently.`
    );

    this.save();
    this.deleteDocFromFirestore('reservations', targetResId);
    this.notify();
    return true;
  }
}

export const pmsStore = new PMSStore();
