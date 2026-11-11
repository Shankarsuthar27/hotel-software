// Predefined Roles and Granular RBAC Permission Presets for Hotel PMS
// Matches OTAL PMS Specifications and Enterprise Role-Based Access Matrix

export const PREDEFINED_ROLES = [
  'Hotel Manager / GM',
  'Front Desk / Receptionist',
  'Finance / Accountant',
  'Housekeeping'
];

export const FULL_PERMISSIONS_TEMPLATE = {
  allowAll: true,
  reservations: {
    view: true,
    create: true,
    actions: {
      checkIn: true,
      checkOut: true,
      assignRoom: true,
      roomMove: true,
      amendStay: true,
      noShow: true,
      cancel: true,
      posVoucher: true,
      estimateInvoice: true
    },
    nightAudit: true
  },
  dashboard: {
    viewDashboard: true,
    viewCalendar: true
  },
  ratesInventory: {
    view: true,
    actions: {
      editRates: true,
      stopSell: true,
      cta: true,
      ctd: true,
      minMaxNights: true
    }
  },
  taxesAddons: {
    manageTaxes: true,
    taxActions: {
      createTax: true,
      editTax: true,
      deleteTax: true,
      exemptTax: true
    },
    manageServices: true,
    serviceActions: {
      createService: true,
      editService: true,
      deleteService: true
    }
  },
  reports: {
    accessReports: true,
    reportActions: {
      managerReport: true,
      folioList: true,
      nightAudit: true,
      reservationReport: true,
      guestDetails: true
    }
  },
  cashier: {
    viewShiftLogs: true,
    openShift: true,
    closeShift: true,
    pettyCash: true,
    safeDrop: true,
    forceClose: true,
    manageRegisters: true
  },
  team: {
    viewTeam: true,
    memberManagement: true,
    permissionManagement: true
  },
  advanced: {
    guestDatabase: {
      all: true,
      view: true,
      piiInfo: true
    },
    settings: {
      all: true,
      view: true,
      overbooking: true,
      scheduleNightAudit: true,
      generateApiKey: true
    },
    roomInventory: {
      all: true,
      view: true,
      create: true,
      edit: true,
      delete: true,
      changeRoomStatus: true
    },
    mealOptions: {
      all: true,
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    corporateAccounts: {
      all: true,
      view: true,
      create: true,
      edit: true,
      delete: true,
      viewArLedger: true
    }
  }
};

export const DEFAULT_ROLE_PERMISSIONS = {
  'Hotel Manager / GM': JSON.parse(JSON.stringify(FULL_PERMISSIONS_TEMPLATE)),

  'Front Desk / Receptionist': {
    allowAll: false,
    reservations: {
      view: true,
      create: true,
      actions: {
        checkIn: true,
        checkOut: true,
        assignRoom: true,
        roomMove: true,
        amendStay: true,
        noShow: true,
        cancel: false,
        posVoucher: true,
        estimateInvoice: true
      },
      nightAudit: false
    },
    dashboard: {
      viewDashboard: true,
      viewCalendar: true
    },
    ratesInventory: {
      view: true,
      actions: {
        editRates: false,
        stopSell: false,
        cta: false,
        ctd: false,
        minMaxNights: false
      }
    },
    taxesAddons: {
      manageTaxes: false,
      taxActions: { createTax: false, editTax: false, deleteTax: false, exemptTax: false },
      manageServices: true,
      serviceActions: { createService: false, editService: false, deleteService: false }
    },
    reports: {
      accessReports: true,
      reportActions: { managerReport: false, folioList: true, nightAudit: false, reservationReport: true, guestDetails: true }
    },
    cashier: {
      viewShiftLogs: true,
      openShift: true,
      closeShift: true,
      pettyCash: true,
      safeDrop: true,
      forceClose: false,
      manageRegisters: false
    },
    team: {
      viewTeam: true,
      memberManagement: false,
      permissionManagement: false
    },
    advanced: {
      guestDatabase: { all: false, view: true, piiInfo: false },
      settings: { all: false, view: false, overbooking: false, scheduleNightAudit: false, generateApiKey: false },
      roomInventory: { all: false, view: true, create: false, edit: false, delete: false, changeRoomStatus: true },
      mealOptions: { all: false, view: true, create: false, edit: false, delete: false },
      corporateAccounts: { all: false, view: true, create: false, edit: false, delete: false, viewArLedger: false }
    }
  },

  'Finance / Accountant': {
    allowAll: false,
    reservations: {
      view: true,
      create: false,
      actions: {
        checkIn: false,
        checkOut: true,
        assignRoom: false,
        roomMove: false,
        amendStay: false,
        noShow: false,
        cancel: false,
        posVoucher: true,
        estimateInvoice: true
      },
      nightAudit: true
    },
    dashboard: {
      viewDashboard: true,
      viewCalendar: false
    },
    ratesInventory: {
      view: true,
      actions: {
        editRates: false,
        stopSell: false,
        cta: false,
        ctd: false,
        minMaxNights: false
      }
    },
    taxesAddons: {
      manageTaxes: true,
      taxActions: { createTax: true, editTax: true, deleteTax: true, exemptTax: true },
      manageServices: true,
      serviceActions: { createService: true, editService: true, deleteService: false }
    },
    reports: {
      accessReports: true,
      reportActions: { managerReport: true, folioList: true, nightAudit: true, reservationReport: true, guestDetails: true }
    },
    cashier: {
      viewShiftLogs: true,
      openShift: true,
      closeShift: true,
      pettyCash: true,
      safeDrop: true,
      forceClose: true,
      manageRegisters: true
    },
    team: {
      viewTeam: true,
      memberManagement: false,
      permissionManagement: false
    },
    advanced: {
      guestDatabase: { all: false, view: true, piiInfo: false },
      settings: { all: false, view: true, overbooking: false, scheduleNightAudit: true, generateApiKey: false },
      roomInventory: { all: false, view: true, create: false, edit: false, delete: false, changeRoomStatus: false },
      mealOptions: { all: false, view: true, create: false, edit: false, delete: false },
      corporateAccounts: { all: true, view: true, create: true, edit: true, delete: true, viewArLedger: true }
    }
  },

  'Housekeeping': {
    allowAll: false,
    reservations: {
      view: false,
      create: false,
      actions: {
        checkIn: false,
        checkOut: false,
        assignRoom: false,
        roomMove: false,
        amendStay: false,
        noShow: false,
        cancel: false,
        posVoucher: false,
        estimateInvoice: false
      },
      nightAudit: false
    },
    dashboard: {
      viewDashboard: true,
      viewCalendar: true
    },
    ratesInventory: {
      view: false,
      actions: { editRates: false, stopSell: false, cta: false, ctd: false, minMaxNights: false }
    },
    taxesAddons: {
      manageTaxes: false,
      taxActions: { createTax: false, editTax: false, deleteTax: false, exemptTax: false },
      manageServices: false,
      serviceActions: { createService: false, editService: false, deleteService: false }
    },
    reports: {
      accessReports: false,
      reportActions: { managerReport: false, folioList: false, nightAudit: false, reservationReport: false, guestDetails: false }
    },
    cashier: {
      viewShiftLogs: false,
      openShift: false,
      closeShift: false,
      pettyCash: false,
      safeDrop: false,
      forceClose: false,
      manageRegisters: false
    },
    team: {
      viewTeam: false,
      memberManagement: false,
      permissionManagement: false
    },
    advanced: {
      guestDatabase: { all: false, view: false, piiInfo: false },
      settings: { all: false, view: false, overbooking: false, scheduleNightAudit: false, generateApiKey: false },
      roomInventory: { all: false, view: true, create: false, edit: false, delete: false, changeRoomStatus: true },
      mealOptions: { all: false, view: false, create: false, edit: false, delete: false },
      corporateAccounts: { all: false, view: false, create: false, edit: false, delete: false, viewArLedger: false }
    }
  }
};

/**
 * Returns a deep copy of the default permissions for the requested role.
 */
export function getRoleDefaultPermissions(roleName) {
  const template = DEFAULT_ROLE_PERMISSIONS[roleName] || DEFAULT_ROLE_PERMISSIONS['Hotel Manager / GM'];
  return JSON.parse(JSON.stringify(template));
}
