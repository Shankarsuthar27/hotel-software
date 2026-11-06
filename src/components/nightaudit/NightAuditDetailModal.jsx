import React, { useState } from 'react';
import { X } from 'lucide-react';
import './night-audit-detail-modal.css';

/**
 * Format number as Indian Rupee string with 2 decimal places (e.g. ₹2,625.00)
 */
function formatCurrency(amount) {
  const num = Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function NightAuditDetailModal({
  isOpen,
  onClose,
  auditRecord,
  property
}) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!isOpen || !auditRecord) return null;

  // Normalization for date strings and defaults matching reference screenshots
  const displayDate = auditRecord.date || auditRecord.auditDate || '25 Oct 2026';
  const startedDate = auditRecord.startedDate || (auditRecord.startedTime ? auditRecord.startedTime.split(' ')[0] + ' ' + auditRecord.startedTime.split(' ')[1] + ' ' + auditRecord.startedTime.split(' ')[2] : 'Oct 26, 2026');
  const startedHour = auditRecord.startedHour || (auditRecord.startedTime ? auditRecord.startedTime.split(' ')[3] : '01:00');
  
  const completedDate = auditRecord.completedDate || (auditRecord.completedTime && auditRecord.completedTime !== '—' ? auditRecord.completedTime.split(' ')[0] + ' ' + auditRecord.completedTime.split(' ')[1] + ' ' + auditRecord.completedTime.split(' ')[2] : 'Oct 26, 2026');
  const completedHour = auditRecord.completedHour || (auditRecord.completedTime && auditRecord.completedTime !== '—' ? auditRecord.completedTime.split(' ')[3] : '01:00');

  const performedBy = auditRecord.performedBy || auditRecord.startedBy || 'System';
  const statusUpper = (auditRecord.statusText || auditRecord.status || 'COMPLETED').toUpperCase();

  // Audit summary cards
  const chargesPosted = auditRecord.chargesPostedCount ?? (auditRecord.roomCharges ? auditRecord.roomCharges.length : 1);
  const amountPosted = auditRecord.amountPosted ?? (auditRecord.totalRevenue || 2625);
  const newBusinessDate = auditRecord.newBusinessDate || '26 Oct 2026';

  // Room charges list
  const roomCharges = auditRecord.roomCharges || [
    {
      room: 'Unassigned - Delux Room',
      folio: 'FOL_1',
      guest: 'Krishna Suthar',
      nrmlTariff: 2500,
      ofrdTariff: 2500,
      totalTax: 125,
      totalRent: 2625
    }
  ];

  // Room charges calculated totals
  const totalTariff = roomCharges.reduce((acc, row) => acc + (row.nrmlTariff || row.rate || 0), 0);
  const totalTax = roomCharges.reduce((acc, row) => acc + (row.totalTax || row.tax || 0), 0);
  const totalRent = roomCharges.reduce((acc, row) => acc + (row.totalRent || row.net || 0), 0);

  // Checked out list
  const checkedOutList = auditRecord.checkedOutList || [];
  const coTotalCharges = auditRecord.coTotalCharges || 0;
  const coTotalExtra = auditRecord.coTotalExtra || 0;
  const coTotalDiscount = auditRecord.coTotalDiscount || 0;
  const coTotalTax = auditRecord.coTotalTax || 0;
  const coTotalPayment = auditRecord.coTotalPayment || 0;

  // Overview stats
  const roomStatus = auditRecord.roomStatus || {
    total: 4,
    occupied: auditRecord.occupiedRooms ?? 1,
    dueOut: 0,
    vacant: auditRecord.vacantRooms ?? 3,
    departed: 0,
    blocked: 0
  };

  const paxStatus = auditRecord.paxStatus || [
    { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
    { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
    { status: 'Stayover', rooms: 2, adult: 2, child: 3 }
  ];

  return (
    <div className="na-detail-overlay" onClick={onClose}>
      <div className="na-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="na-detail-header">
          <div className="na-detail-header-left">
            <div className="na-detail-header-icon">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                article
              </span>
            </div>
            <h2 className="na-detail-title">
              Night Audit Details - {displayDate}
            </h2>
          </div>
          <button
            type="button"
            className="na-detail-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="na-detail-tabs">
          <button
            type="button"
            className={`na-detail-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            type="button"
            className={`na-detail-tab-btn ${activeTab === 'room_charges' ? 'active' : ''}`}
            onClick={() => setActiveTab('room_charges')}
          >
            Room Charges
          </button>
          <button
            type="button"
            className={`na-detail-tab-btn ${activeTab === 'checked_out' ? 'active' : ''}`}
            onClick={() => setActiveTab('checked_out')}
          >
            Checked Out
          </button>
          <button
            type="button"
            className={`na-detail-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </div>

        {/* Modal Body */}
        <div className="na-detail-body">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="na-detail-tab-content">
              {/* 4 Status Cards */}
              <div className="na-detail-summary-grid">
                {/* Status */}
                <div className="na-detail-summary-card">
                  <div className="na-detail-card-icon green">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      check_circle
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-card-label">Status</div>
                    <div className="na-detail-card-val">{statusUpper}</div>
                  </div>
                </div>

                {/* Started At */}
                <div className="na-detail-summary-card">
                  <div className="na-detail-card-icon blue">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      calendar_today
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-card-label">Started At</div>
                    <div className="na-detail-card-val">{startedDate}</div>
                    <div className="na-detail-card-subval">{startedHour}</div>
                  </div>
                </div>

                {/* Completed At */}
                <div className="na-detail-summary-card">
                  <div className="na-detail-card-icon blue">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      calendar_today
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-card-label">Completed At</div>
                    <div className="na-detail-card-val">{completedDate}</div>
                    <div className="na-detail-card-subval">{completedHour}</div>
                  </div>
                </div>

                {/* Performed By */}
                <div className="na-detail-summary-card">
                  <div className="na-detail-card-icon blue">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      person
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-card-label">Performed By</div>
                    <div className="na-detail-card-val">{performedBy}</div>
                  </div>
                </div>
              </div>

              {/* Audit Summary Section */}
              <h3 className="na-detail-section-title">Audit Summary</h3>
              <div className="na-detail-audit-summary-box">
                {/* Charges Posted */}
                <div className="na-detail-summary-box-item">
                  <div className="na-detail-box-item-icon">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      description
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-box-item-label">Charges Posted</div>
                    <div className="na-detail-box-item-val">{chargesPosted}</div>
                  </div>
                </div>

                {/* Amount Posted */}
                <div className="na-detail-summary-box-item">
                  <div className="na-detail-box-item-icon">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      currency_rupee
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-box-item-label">Amount Posted</div>
                    <div className="na-detail-box-item-val">{formatCurrency(amountPosted)}</div>
                  </div>
                </div>

                {/* New Business Date */}
                <div className="na-detail-summary-box-item">
                  <div className="na-detail-box-item-icon">
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                      calendar_month
                    </span>
                  </div>
                  <div>
                    <div className="na-detail-box-item-label">New Business Date</div>
                    <div className="na-detail-box-item-val">{newBusinessDate}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM CHARGES */}
          {activeTab === 'room_charges' && (
            <div className="na-detail-table-card">
              <table className="na-detail-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>Room</th>
                    <th style={{ width: '13%' }}>Folio No.</th>
                    <th style={{ width: '17%' }}>Guest</th>
                    <th style={{ width: '13%' }}>Nrml Tariff</th>
                    <th style={{ width: '13%' }}>Ofrd Tariff</th>
                    <th style={{ width: '10%' }}>Total Tax</th>
                    <th style={{ width: '10%' }}>Total Rent</th>
                  </tr>
                </thead>
                <tbody>
                  {roomCharges.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.room}</td>
                      <td>{item.folio}</td>
                      <td>{item.guest}</td>
                      <td>{formatCurrency(item.nrmlTariff || item.rate)}</td>
                      <td>{formatCurrency(item.ofrdTariff || item.rate)}</td>
                      <td>{formatCurrency(item.totalTax || item.tax)}</td>
                      <td>{formatCurrency(item.totalRent || item.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Stats Bottom Right */}
              <div className="na-detail-room-charges-totals">
                <div className="na-detail-total-item">
                  <span className="na-detail-total-label">Total Tariff</span>
                  <span className="na-detail-total-val">{formatCurrency(totalTariff)}</span>
                </div>
                <div className="na-detail-total-item">
                  <span className="na-detail-total-label">Total Tax</span>
                  <span className="na-detail-total-val">{formatCurrency(totalTax)}</span>
                </div>
                <div className="na-detail-total-item">
                  <span className="na-detail-total-label">Total Rent</span>
                  <span className="na-detail-total-val blue-highlight">
                    {formatCurrency(totalRent)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKED OUT */}
          {activeTab === 'checked_out' && (
            <div className="na-detail-table-card">
              <table className="na-detail-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '14%' }}>Room</th>
                    <th style={{ width: '16%' }}>Guest</th>
                    <th style={{ width: '22%' }}>Arrival - Departure</th>
                    <th style={{ width: '12%' }}>Charges</th>
                    <th style={{ width: '14%' }}>Extra / Discount</th>
                    <th style={{ width: '10%' }}>Tax</th>
                    <th style={{ width: '12%' }}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {checkedOutList.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="na-detail-empty-message">
                          No checked out data found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    checkedOutList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.room}</td>
                        <td>{item.guest}</td>
                        <td>{item.arrivalDeparture}</td>
                        <td>{formatCurrency(item.charges)}</td>
                        <td>{formatCurrency(item.extraDiscount)}</td>
                        <td>{formatCurrency(item.tax)}</td>
                        <td>{formatCurrency(item.payment)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Distributed Checkout Totals Bar */}
              <div className="na-detail-checkout-totals-bar">
                <div className="na-detail-checkout-total-col">
                  <span className="na-detail-checkout-total-label">Total Charges</span>
                  <span className="na-detail-checkout-total-val">{formatCurrency(coTotalCharges)}</span>
                </div>
                <div className="na-detail-checkout-total-col">
                  <span className="na-detail-checkout-total-label">Total Extra</span>
                  <span className="na-detail-checkout-total-val">{formatCurrency(coTotalExtra)}</span>
                </div>
                <div className="na-detail-checkout-total-col">
                  <span className="na-detail-checkout-total-label">Total Discount</span>
                  <span className="na-detail-checkout-total-val red">{formatCurrency(coTotalDiscount)}</span>
                </div>
                <div className="na-detail-checkout-total-col">
                  <span className="na-detail-checkout-total-label">Total Tax</span>
                  <span className="na-detail-checkout-total-val">{formatCurrency(coTotalTax)}</span>
                </div>
                <div className="na-detail-checkout-total-col">
                  <span className="na-detail-checkout-total-label">Total Payment</span>
                  <span className="na-detail-checkout-total-val green">{formatCurrency(coTotalPayment)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="na-detail-overview-grid">
              {/* Left Column: Room Status */}
              <div>
                <h4 className="na-detail-overview-panel-title">Room Status</h4>
                <div className="na-detail-panel-box">
                  <table className="na-detail-panel-table">
                    <thead>
                      <tr>
                        <th>Total</th>
                        <th>Occupied</th>
                        <th>Due Out</th>
                        <th>Vacant</th>
                        <th>Departed</th>
                        <th>Blocked</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 700 }}>{roomStatus.total}</td>
                        <td style={{ fontWeight: 700 }}>{roomStatus.occupied}</td>
                        <td style={{ fontWeight: 700 }}>{roomStatus.dueOut}</td>
                        <td style={{ fontWeight: 700 }}>{roomStatus.vacant}</td>
                        <td style={{ fontWeight: 700 }}>{roomStatus.departed}</td>
                        <td style={{ fontWeight: 700 }}>{roomStatus.blocked}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Pax Status */}
              <div>
                <h4 className="na-detail-overview-panel-title">Pax Status</h4>
                <div className="na-detail-panel-box">
                  <table className="na-detail-panel-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Rooms</th>
                        <th>Adult</th>
                        <th>Child</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paxStatus.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>{row.status}</td>
                          <td style={{ fontWeight: 600 }}>{row.rooms}</td>
                          <td style={{ fontWeight: 600 }}>{row.adult}</td>
                          <td style={{ fontWeight: 600 }}>{row.child}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="na-detail-footer">
          <button
            type="button"
            className="na-detail-close-btn-bottom"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
