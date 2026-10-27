// Seed Data for Hotel PMS - HOTEL ASTHA
// Aligned with Dashboard design specifications

export const initialProperty = {
  id: 'prop_hotel_astha',
  name: 'HOTEL ASTHA',
  tagline: 'HOTEL ASTHA',
  initials: 'HA',
  addressLine: 'Station Road, Civil Lines',
  city: 'Jaipur',
  state: 'Rajasthan',
  country: 'India',
  postalCode: '302006',
  phone: '+91 141 234 5678',
  email: 'stay@hotelastha.com',
  website: 'https://hotelastha.com',
  currency: 'INR',
  currencySymbol: 'Rs',
  timezone: 'Asia/Kolkata',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  businessDate: '2026-10-26', // System operational date
  gstin: '08ABCDE1234F1Z5',
  legalName: 'HOTEL ASTHA INDIA',
  tradeName: 'HOTEL ASTHA',
  sacCode: '996311', // Accommodation SAC
  fnbSacCode: '996331', // F&B SAC
  userProfile: {
    name: 'Astha India',
    role: 'Owner',
    initials: 'AI'
  }
};

export const initialRoomTypes = [
  {
    id: 'rt_standard',
    name: 'Standard Room',
    code: 'STD',
    description: 'Comfortable air-conditioned room with king bed and work desk.',
    baseAdults: 2,
    maxAdults: 2,
    baseChildren: 0,
    maxChildren: 1,
    basePrice: 2625,
    extraAdultPrice: 800,
    extraChildPrice: 400,
    color: '#06b6d4'
  },
  {
    id: 'rt_deluxe',
    name: 'Delux Room',
    code: 'DLX',
    description: 'Spacious deluxe room with premium linen, balcony, and mini-bar.',
    baseAdults: 2,
    maxAdults: 3,
    baseChildren: 0,
    maxChildren: 2,
    basePrice: 3500,
    extraAdultPrice: 1000,
    extraChildPrice: 500,
    color: '#3b82f6'
  }
];

export const initialRooms = [
  { id: 'rm_101', roomNumber: '101', roomTypeId: 'rt_standard', floor: '1', status: 'clean', operational: 'available', notes: 'Ready for check-in' },
  { id: 'rm_102', roomNumber: '102', roomTypeId: 'rt_standard', floor: '1', status: 'clean', operational: 'available', notes: 'Ready for check-in' },
  { id: 'rm_201', roomNumber: '201', roomTypeId: 'rt_deluxe', floor: '2', status: 'clean', operational: 'available', notes: 'Ready for check-in' },
  { id: 'rm_202', roomNumber: '202', roomTypeId: 'rt_deluxe', floor: '2', status: 'clean', operational: 'available', notes: 'Ready for check-in' }
];

export const initialMealPlans = [
  {
    id: 'mp_ep',
    code: 'EP',
    name: 'European Plan (Room Only)',
    inclusions: [],
    pricingModel: 'INCLUDED_IN_TARIFF',
    adultPrice: 0,
    childPrice: 0,
    status: 'ACTIVE'
  },
  {
    id: 'mp_cp',
    code: 'CP',
    name: 'Continental Plan (Bed & Breakfast)',
    inclusions: ['Breakfast (07:30 - 10:30)'],
    pricingModel: 'INCLUDED_IN_TARIFF',
    adultPrice: 350,
    childPrice: 200,
    status: 'ACTIVE'
  }
];

export const initialRatePlans = [
  {
    id: 'rp_bar_ep',
    roomTypeId: 'rt_standard',
    mealPlanId: 'mp_ep',
    code: 'BAR_EP',
    name: 'Best Available Rate - Room Only',
    status: 'ACTIVE'
  }
];

export const initialReservations = [
  {
    id: 'res_5',
    bookingReference: '#RES_5',
    primaryGuest: {
      name: 'Mr Krishna Kumar',
      title: 'Mr.',
      firstName: 'Krishna',
      lastName: 'Kumar',
      phone: '9898398334',
      email: 'ss2137789@gmail.com',
      country: 'India',
      isPrimary: true
    },
    roomId: 'rm_101',
    roomNumber: '101',
    roomTypeId: 'rt_standard',
    roomTypeName: 'Standard Room',
    ratePlanCode: 'test_plan',
    ratePlanName: 'test plan',
    checkInDate: '2026-10-26', // Mon 26, Oct 2026
    checkOutDate: '2026-10-27', // Tue 27, Oct 2026
    actualCheckOutDate: '2026-10-26', // Mon 26, Oct 2026 (Early Check-out)
    isEarlyCheckOut: true,
    nights: 1,
    adults: 1,
    children: 2,
    baseRatePerNight: 2625.00,
    totalRoomCharges: 2625.00,
    taxAmount: 0,
    totalAmount: 2625.00,
    paidAmount: 2625.00,
    balanceDue: 0.00,
    status: 'checked_out',
    bookingSource: 'walk-in',
    marketSegment: 'FIT',
    createdAt: '2026-10-26 1:08 PM',
    bookingDateFormatted: '26 Oct 2026, 1:08 PM',
    specialRequests: '..',
    notes: '..',
    folioId: 'fol_5'
  },
  {
    id: 'res_4',
    bookingReference: '#RES_4',
    primaryGuest: {
      name: 'Mr Shankar Suthar',
      title: 'Mr.',
      firstName: 'Shankar',
      lastName: 'Suthar',
      phone: '9664471637',
      email: 'ss2137789@gmail.com',
      isPrimary: true
    },
    roomId: 'rm_102',
    roomNumber: '102',
    roomTypeId: 'rt_standard',
    roomTypeName: 'Standard Room',
    ratePlanCode: 'BAR_EP',
    checkInDate: '2026-10-26', // Mon 26, Oct 2026
    checkOutDate: '2026-10-27', // Tue 27, Oct 2026
    nights: 1,
    adults: 1,
    children: 2,
    baseRatePerNight: 2625.00,
    totalRoomCharges: 2625.00,
    taxAmount: 0,
    totalAmount: 2625.00,
    paidAmount: 2625.00,
    balanceDue: 0.00,
    status: 'checked_out',
    bookingSource: 'WALK_IN',
    marketSegment: 'FIT',
    createdAt: '2026-10-26 1:02 PM',
    bookingDateFormatted: '26 Oct 2026, 1:02 PM',
    folioId: 'fol_4'
  },
  {
    id: 'res_3',
    bookingReference: '#RES_3',
    primaryGuest: {
      name: 'Mr Shankar Suthar',
      title: 'Mr.',
      firstName: 'Shankar',
      lastName: 'Suthar',
      phone: '9664471637',
      email: 'ss2137789@gmail.com',
      isPrimary: true
    },
    roomId: 'rm_201',
    roomNumber: '201',
    roomTypeId: 'rt_deluxe',
    roomTypeName: 'Delux Room',
    ratePlanCode: 'BAR_EP',
    checkInDate: '2026-10-26', // Mon 26, Oct 2026
    checkOutDate: '2026-10-27', // Tue 27, Oct 2026
    nights: 1,
    adults: 1,
    children: 2,
    baseRatePerNight: 0.00,
    totalRoomCharges: 0.00,
    taxAmount: 0,
    totalAmount: 0.00,
    paidAmount: 0.00,
    balanceDue: 0.00,
    status: 'no_show',
    bookingSource: 'WALK_IN',
    marketSegment: 'FIT',
    createdAt: '2026-10-26 1:02 PM',
    bookingDateFormatted: '26 Oct 2026, 1:02 PM',
    folioId: 'fol_3'
  },
  {
    id: 'res_2',
    bookingReference: '#RES_2',
    primaryGuest: {
      name: 'Mr Krishna Suthar',
      phone: '+91 98450 11223',
      email: 'krishna.suthar@example.com',
      gstin: '',
      nationality: 'Indian'
    },
    roomId: 'rm_102',
    roomNumber: '102',
    roomTypeId: 'rt_standard',
    ratePlanCode: 'BAR_EP',
    checkInDate: '2026-10-26', // Mon 26, Oct 2026
    checkOutDate: '2026-10-31', // Sat 31, Oct 2026
    nights: 5,
    adults: 1,
    children: 1,
    baseRatePerNight: 3345.24,
    totalRoomCharges: 16726.19,
    taxAmount: 2007.14,
    totalAmount: 18733.33,
    paidAmount: 0.00,
    balanceDue: 18733.33,
    status: 'confirmed',
    bookingSource: 'WALK_IN',
    marketSegment: 'FIT',
    isVIP: false,
    isSingleLady: false,
    noPosting: false,
    isComplimentary: false,
    notes: 'Advance booking via Walk-in desk.',
    createdAt: '2026-10-24 12:27 PM',
    bookingDateFormatted: '24 Oct 2026, 12:27 PM',
    folioId: 'fol_2'
  },
  {
    id: 'res_1',
    bookingReference: '#RES_1',
    primaryGuest: {
      name: 'Mr Shankar Suthar',
      title: 'Mr.',
      firstName: 'shankar',
      lastName: 'suthar',
      phone: '9664471637',
      countryCode: '+91',
      email: 'ss2137789@gmail.com',
      birthDate: '2002-09-27',
      nationality: '',
      gender: 'Male',
      guestType: 'Adult',
      isPrimary: true,
      isVIP: false,
      address: 'jalore',
      zip: '343001',
      country: 'Algeria',
      state: 'Ain Defla',
      city: '',
      idType: 'Aadhaar Card',
      idNumber: '990969609690',
      issuingCountry: 'India',
      issuingCity: 'jalore',
      expiryDate: '2026-10-28',
      gstin: ''
    },
    roomId: 'rm_102',
    roomNumber: '102',
    roomTypeId: 'rt_deluxe',
    roomTypeName: 'Delux Room',
    ratePlanCode: 'BAR_EP',
    checkInDate: '2026-10-24', // Sat 24, Oct 2026
    checkOutDate: '2026-10-26', // Mon 26, Oct 2026
    nights: 2,
    adults: 1,
    children: 2,
    baseRatePerNight: 2625.00,
    totalRoomCharges: 5250.00,
    taxAmount: 0,
    totalAmount: 5250.00,
    paidAmount: 2500.00,
    balanceDue: 2750.00,
    status: 'in_house',
    bookingSource: 'WALK_IN',
    marketSegment: 'corporate',
    billTo: 'Guest',
    company: '',
    specialRequests: '',
    isVIP: false,
    isSingleLady: false,
    noPosting: false,
    isComplimentary: false,
    notes: 'In-house guest, partial advance paid.',
    createdAt: '2026-10-24 12:07 PM',
    bookingDateFormatted: '24 Oct 2026, 12:07 PM',
    folioId: 'fol_1'
  }
];

export const initialFolios = {
  fol_1: {
    folioNumber: 'FOL_1',
    reservationId: 'res_1',
    roomNumber: '102',
    status: 'OPEN',
    transactions: [
      { id: 'tx_11', date: '2026-10-25', particulars: 'Room', type: 'ROOM_CHARGE', desc: 'Room charge for 2026-10-25', reference: '-', direction: 'Debit', amount: 2625, tax: 125 },
      { id: 'tx_12', date: '2026-10-24', particulars: 'Payment', type: 'PAYMENT', desc: 'Advance Payment', reference: '-', direction: 'Credit', amount: -2500, tax: 0 },
      { id: 'tx_13', date: '2026-10-24', particulars: 'Room', type: 'ROOM_CHARGE', desc: 'Room charge for 2026-10-24', reference: '-', direction: 'Debit', amount: 2625, tax: 125 }
    ]
  },
  fol_2: {
    folioNumber: 'FOL_2',
    reservationId: 'res_2',
    roomNumber: '102',
    status: 'OPEN',
    transactions: [
      { id: 'tx_21', date: '2026-10-24', type: 'ROOM_CHARGE', desc: 'Room Tariff (5 Nights)', amount: 18733.33, tax: 0, direction: 'DEBIT' }
    ]
  },
  fol_3: {
    folioNumber: 'FOL_3',
    reservationId: 'res_3',
    roomNumber: '201',
    status: 'CLOSED',
    transactions: []
  },
  fol_4: {
    folioNumber: 'FOL_4',
    reservationId: 'res_4',
    roomNumber: '102',
    status: 'SETTLED',
    transactions: [
      { id: 'tx_41', date: '2026-10-26', particulars: 'Room', type: 'ROOM_CHARGE', desc: 'Room Tariff (1 Night)', reference: '-', direction: 'Debit', amount: 2625, tax: 0 },
      { id: 'tx_42', date: '2026-10-26', particulars: 'Payment', type: 'PAYMENT', desc: 'Settlement Payment', reference: 'UPI', direction: 'Credit', amount: -2625, tax: 0 }
    ]
  },
  fol_5: {
    folioNumber: 'FOL_5',
    reservationId: 'res_5',
    roomNumber: '101',
    status: 'SETTLED',
    transactions: [
      { id: 'tx_51', date: '2026-10-26', particulars: 'Room', type: 'ROOM_CHARGE', desc: 'Room Tariff (1 Night)', reference: '-', direction: 'Debit', amount: 2625, tax: 0 },
      { id: 'tx_52', date: '2026-10-26', particulars: 'Payment', type: 'PAYMENT', desc: 'Settlement Payment', reference: 'CASH', direction: 'Credit', amount: -2625, tax: 0 }
    ]
  }
};

export const initialStaffNotes = [];

export const initialOtaChannels = [
  {
    id: 'ota_booking',
    name: 'Booking.com',
    channelCode: 'BOOKING_COM',
    icon: '🏨',
    status: 'ACTIVE',
    lastSync: '2 mins ago',
    mappedRoomsCount: 2,
    rateModel: 'MARKUP_PERCENT',
    rateModifier: 15,
    activeBookings: 0,
    connectionStatus: 'Connected (Two-Way XML)'
  },
  {
    id: 'ota_agoda',
    name: 'Agoda',
    channelCode: 'AGODA',
    icon: '🌐',
    status: 'ACTIVE',
    lastSync: '5 mins ago',
    mappedRoomsCount: 2,
    rateModel: 'DIRECT_SYNC',
    rateModifier: 0,
    activeBookings: 0,
    connectionStatus: 'Connected'
  }
];

export const initialTeamMembers = [
  {
    id: 'usr_01',
    name: 'Astha India',
    email: 'owner@hotelastha.com',
    role: 'Owner',
    avatar: '👩‍💼',
    status: 'ACTIVE',
    properties: ['HOTEL ASTHA'],
    permissions: {
      reservations: { view: true, create: true, edit: true, cancel: true },
      nightAudit: { view: true, execute: true },
      ratesAndInventory: { view: true, edit: true, bulkUpdate: true, stopSell: true },
      team: { view: true, manage: true },
      dashboard: { view: true },
      piiAccess: true,
      ledger: { view: true, settle: true, override: true }
    }
  }
];

export const initialNightAudits = [
  {
    id: 'na_20261023',
    auditDate: '2026-10-23',
    performedAt: '2026-10-24T00:05:00Z',
    performedBy: 'Astha India (Owner)',
    totalRevenue: 2625,
    totalTax: 315,
    occupiedRooms: 1,
    vacantRooms: 1,
    adr: 2625,
    revPar: 1312.5,
    status: 'COMPLETED',
    checkedOutCount: 1,
    chargesPostedCount: 1,
    roomChargesLog: [
      { room: '101', guest: 'Suresh Sharma', rate: 2625, tax: 315, net: 2940, folio: 'FOL_001' }
    ]
  }
];

export const initialAuditTrail = [
  {
    id: 'at_01',
    timestamp: '2026-10-24 10:15:30',
    actor: 'Astha India',
    action: 'CHECK_IN',
    entity: 'RESERVATION',
    entityId: '#RES_001',
    details: 'Guest Suresh Sharma checked in to Room 101.'
  },
  {
    id: 'at_02',
    timestamp: '2026-10-24 09:40:12',
    actor: 'Astha India',
    action: 'CHECK_OUT',
    entity: 'RESERVATION',
    entityId: '#RES_002',
    details: 'Guest Pooja Verma checked out. Room 102 transitioned to CLEAN.'
  }
];
