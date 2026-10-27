import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Table
} from 'lucide-react';
import {
  exportToExcel,
  generateManagerReportData,
  generateReservationsExport
} from '../../services/exportService';

export default function ReportsView({
  property,
  rooms,
  reservations,
  nightAudits,
  folios
}) {
  const [selectedReportType, setSelectedReportType] = useState('manager'); // 'manager' | 'reservations' | 'folios' | 'nightaudit'

  const handleExportXlsx = () => {
    if (selectedReportType === 'manager') {
      const data = generateManagerReportData(property, rooms, reservations, nightAudits);
      exportToExcel(data, `Manager_Report_${property.businessDate}.xlsx`, 'Manager Summary');
    } else if (selectedReportType === 'reservations') {
      const data = generateReservationsExport(reservations);
      exportToExcel(data, `Reservations_Ledger_${property.businessDate}.xlsx`, 'Reservations');
    } else if (selectedReportType === 'folios') {
      const folioData = reservations.map(r => ({
        'Folio No': folios[r.folioId]?.folioNumber || 'FOL',
        'Booking Ref': r.bookingReference,
        'Guest Name': r.primaryGuest?.name,
        'Room #': r.roomNumber,
        'Total Debits (₹)': r.totalAmount,
        'Total Credits (₹)': r.paidAmount,
        'Balance Due (₹)': r.balanceDue,
        'Status': folios[r.folioId]?.status || 'OPEN'
      }));
      exportToExcel(folioData, `Folio_Balances_${property.businessDate}.xlsx`, 'Folios');
    } else if (selectedReportType === 'nightaudit') {
      const naData = nightAudits.map(na => ({
        'Audit Date': na.auditDate,
        'Performed By': na.performedBy,
        'Revenue (₹)': na.totalRevenue,
        'Tax (₹)': na.totalTax,
        'Occupied Rooms': na.occupiedRooms,
        'ADR (₹)': na.adr,
        'RevPAR (₹)': na.revPar
      }));
      exportToExcel(naData, `Night_Audit_Archive_${property.businessDate}.xlsx`, 'Audits');
    }
  };

  const inHouseCount = reservations.filter(r => r.status === 'in_house').length;
  const totalRev = reservations.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
  const totalDue = reservations.reduce((acc, r) => acc + (r.balanceDue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Export Trigger */}
      <div style={{
        background: '#ffffff',
        padding: '1.25rem 1.75rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Financial & Operational Reports
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Audited financial statements, revenue reconciliations, and spreadsheet exports
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleExportXlsx}
          style={{ background: '#059669', boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)' }}
        >
          <Download size={15} />
          <span>Export to Excel (.xlsx)</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ padding: '1.15rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Occupancy Rate</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
            {rooms.length > 0 ? Math.round((inHouseCount / rooms.length) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
            {inHouseCount} of {rooms.length} Rooms Occupied
          </div>
        </div>

        <div style={{ padding: '1.15rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Collected (₹)</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669', margin: '0.2rem 0' }}>
            ₹{totalRev.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Across all payment modes
          </div>
        </div>

        <div style={{ padding: '1.15rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Outstanding Ledger (₹)</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626', margin: '0.2rem 0' }}>
            ₹{totalDue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Unsettled folio receivables
          </div>
        </div>

        <div style={{ padding: '1.15rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Current ADR</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
            ₹4,750
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            RevPAR: ₹3,654
          </div>
        </div>
      </div>

      {/* Report Selection Subtabs */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem', background: '#f8fafc' }}>
          {[
            { id: 'manager', label: 'Daily Manager Audit Report' },
            { id: 'reservations', label: 'Reservations & Revenue Ledger' },
            { id: 'folios', label: 'Guest Folios & Balances' },
            { id: 'nightaudit', label: 'Night Audit Financial History' }
          ].map((item) => {
            const isActive = selectedReportType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedReportType(item.id)}
                style={{
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  borderBottom: isActive ? '2px solid #2563eb' : 'none'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Selected Report Preview Table */}
        <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {selectedReportType === 'manager' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Operational Metric</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Audited Value</th>
                </tr>
              </thead>
              <tbody>
                {generateManagerReportData(property, rooms, reservations, nightAudits).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{row.Metric}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>
                      {typeof row.Value === 'number' ? `₹${row.Value.toLocaleString()}` : row.Value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'reservations' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Ref #</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Guest Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Room #</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Tariff (₹)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Tax (₹)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Balance Due (₹)</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{r.bookingReference}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.primaryGuest?.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>Room {r.roomNumber}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.checkInDate} → {r.checkOutDate}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹{r.totalRoomCharges?.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>₹{r.taxAmount?.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>₹{r.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: r.balanceDue > 0 ? '#dc2626' : '#059669' }}>
                      ₹{r.balanceDue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
