// Indian GST Regional Tax Compliance Engine for Hotel PMS
// Compliant with Central Goods and Services Tax Act & Hospitality Slabs

export const SAC_CODES = {
  ACCOMMODATION: '996311',
  RESTAURANT_FNB: '996331',
  LAUNDRY: '999799',
  CONFERENCE_BANQUET: '996332'
};

/**
 * Computes GST for hotel room accommodation based on declared per-night tariff slab.
 * Indian Slab Rules:
 * - Tariff < ₹7,500/night: 12% GST (6% CGST + 6% SGST, or 12% IGST)
 * - Tariff >= ₹7,500/night: 18% GST (9% CGST + 9% SGST, or 18% IGST)
 */
export function calculateRoomTax(tariffPerNight, nights = 1, options = {}) {
  const { isComplimentary = false, isTaxExempt = false, isInterstate = false } = options;

  if (isComplimentary || isTaxExempt || tariffPerNight <= 0) {
    return {
      taxableAmount: 0,
      gstRate: 0,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
      grossTotal: 0,
      sacCode: SAC_CODES.ACCOMMODATION
    };
  }

  const taxableAmount = tariffPerNight * nights;
  const gstRate = tariffPerNight >= 7500 ? 18 : 12;

  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterstate) {
    igstRate = gstRate;
    igstAmount = Math.round((taxableAmount * igstRate) / 100 * 100) / 100;
  } else {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = Math.round((taxableAmount * cgstRate) / 100 * 100) / 100;
    sgstAmount = Math.round((taxableAmount * sgstRate) / 100 * 100) / 100;
  }

  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const grossTotal = taxableAmount + totalTax;

  return {
    taxableAmount,
    gstRate,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    grossTotal,
    sacCode: SAC_CODES.ACCOMMODATION
  };
}

/**
 * Formats GSTIN and extracts 2-digit state code
 */
export function getGstinStateCode(gstin) {
  if (!gstin || typeof gstin !== 'string' || gstin.trim().length < 2) return null;
  return gstin.trim().substring(0, 2);
}

/**
 * Checks if a guest GSTIN is interstate compared to property GSTIN
 */
export function isInterstateBilling(propertyGstin, guestGstin) {
  const propCode = getGstinStateCode(propertyGstin);
  const guestCode = getGstinStateCode(guestGstin);
  if (!propCode || !guestCode) return false;
  return propCode !== guestCode;
}

/**
 * Aggregates all debit transactions of a folio into legal GST invoice rows
 */
export function generateTaxInvoiceSummary(transactions = [], property, guest) {
  const isInterstate = isInterstateBilling(property.gstin, guest?.gstin);
  
  const lineItems = [];
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalGross = 0;

  transactions.forEach((tx, idx) => {
    if (tx.direction !== 'DEBIT' && tx.amount <= 0) return; // Skip payments/credits

    const isFnb = tx.type === 'EXTRA_SERVICE' || tx.type === 'FNB';
    const sacCode = isFnb ? SAC_CODES.RESTAURANT_FNB : SAC_CODES.ACCOMMODATION;
    const baseAmount = Number(tx.amount) || 0;

    // Rate selection
    const taxRate = isFnb ? 5 : (baseAmount >= 7500 ? 18 : 12);
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterstate) {
      igst = Math.round((baseAmount * taxRate) / 100 * 100) / 100;
    } else {
      cgst = Math.round((baseAmount * (taxRate / 2)) / 100 * 100) / 100;
      sgst = Math.round((baseAmount * (taxRate / 2)) / 100 * 100) / 100;
    }

    const rowTotal = baseAmount + cgst + sgst + igst;

    lineItems.push({
      itemIndex: idx + 1,
      date: tx.date || property.businessDate,
      description: tx.desc || (isFnb ? 'Food & Beverage Service' : 'Hotel Accommodation Room Tariff'),
      sacCode,
      taxableValue: baseAmount,
      taxRate,
      cgstRate: isInterstate ? 0 : taxRate / 2,
      cgstAmount: cgst,
      sgstRate: isInterstate ? 0 : taxRate / 2,
      sgstAmount: sgst,
      igstRate: isInterstate ? taxRate : 0,
      igstAmount: igst,
      totalAmount: rowTotal
    });

    totalTaxable += baseAmount;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;
    totalGross += rowTotal;
  });

  return {
    lineItems,
    totalTaxable,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTax: totalCgst + totalSgst + totalIgst,
    totalGross,
    isInterstate
  };
}
