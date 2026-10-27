// Excel (.xlsx) and Document Export Service for Hotel PMS
import * as XLSX from 'xlsx';

/**
 * Exports JSON data array directly to an Excel file (.xlsx)
 */
export function exportToExcel(data, fileName = 'Report.xlsx', sheetName = 'Data') {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

/**
 * Generates Manager Audit Report dataset for Excel download
 */
export function generateManagerReportData(property, rooms, reservations, nightAudits) {
  const inHouseCount = reservations.filter(r => r.status === 'in_house').length;
  const arrivalsCount = reservations.filter(r => r.status === 'confirmed').length;
  const departuresCount = reservations.filter(r => r.status === 'in_house' && r.checkOutDate === property.businessDate).length;
  const totalRevenue = reservations.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
  const totalBalanceDue = reservations.reduce((acc, r) => acc + (r.balanceDue || 0), 0);
  const occupancyRate = rooms.length > 0 ? Math.round((inHouseCount / rooms.length) * 100) : 0;

  return [
    { 'Metric': 'Property Name', 'Value': property.name },
    { 'Metric': 'Business Date', 'Value': property.businessDate },
    { 'Metric': 'Total Physical Rooms', 'Value': rooms.length },
    { 'Metric': 'Occupied Rooms (In-House)', 'Value': inHouseCount },
    { 'Metric': 'Vacant Rooms', 'Value': Math.max(0, rooms.length - inHouseCount) },
    { 'Metric': 'Occupancy Percentage', 'Value': `${occupancyRate}%` },
    { 'Metric': 'Expected Arrivals Today', 'Value': arrivalsCount },
    { 'Metric': 'Expected Departures Today', 'Value': departuresCount },
    { 'Metric': 'Total Collected Payments (₹)', 'Value': totalRevenue },
    { 'Metric': 'Total Outstanding Ledger Balance (₹)', 'Value': totalBalanceDue },
    { 'Metric': 'Completed Night Audits Count', 'Value': nightAudits.length }
  ];
}

/**
 * Generates Reservations Excel dataset
 */
export function generateReservationsExport(reservations) {
  return reservations.map(r => ({
    'Booking Ref': r.bookingReference,
    'Guest Name': r.primaryGuest?.name || 'Unknown',
    'Phone': r.primaryGuest?.phone || '',
    'Email': r.primaryGuest?.email || '',
    'Room Number': r.roomNumber || '',
    'Check-In': r.checkInDate,
    'Check-Out': r.checkOutDate,
    'Nights': r.nights,
    'Status': r.status.toUpperCase(),
    'Source': r.bookingSource,
    'Tariff (₹)': r.totalRoomCharges,
    'Tax (₹)': r.taxAmount,
    'Total (₹)': r.totalAmount,
    'Paid (₹)': r.paidAmount,
    'Balance Due (₹)': r.balanceDue,
    'VIP': r.isVIP ? 'YES' : 'NO',
    'Single Lady': r.isSingleLady ? 'YES' : 'NO'
  }));
}

export function exportReservationsToExcel(reservations, hotelName = 'HOTEL ASTHA') {
  const data = generateReservationsExport(reservations);
  return exportToExcel(data, `${hotelName.replace(/\s+/g, '_')}_Reservations_${Date.now()}.xlsx`, 'Reservations');
}
