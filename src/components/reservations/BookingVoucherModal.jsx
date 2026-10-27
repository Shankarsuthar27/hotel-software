import React from 'react';
import { X, Printer, Send, Building, CheckCircle, Calendar, User, ShieldCheck } from 'lucide-react';

export default function BookingVoucherModal({ isOpen, onClose, reservation, property }) {
  if (!isOpen || !reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay printable-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Actions Bar (hidden on print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Booking Voucher — {reservation.bookingReference}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Voucher</span>
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                alert(`Voucher dispatched to ${reservation.primaryGuest?.email || reservation.primaryGuest?.phone} via WhatsApp & Email!`);
              }}
            >
              <Send size={15} />
              <span>Send to Guest</span>
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="modal-body printable-document" style={{ padding: '2rem' }}>
          {/* Hotel Letterhead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{property?.name}</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{property?.addressLine}, {property?.city}, {property?.state} - {property?.postalCode}</p>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Tel: {property?.phone} • Email: {property?.email}</p>
              <p style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>GSTIN: {property?.gstin}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'inline-block',
                marginBottom: '0.5rem'
              }}>
                GUEST BOOKING VOUCHER
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {reservation.bookingReference}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Booked via {reservation.bookingSource}
              </div>
            </div>
          </div>

          {/* Guest & Stay Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>
                GUEST INFORMATION
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                {reservation.primaryGuest?.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Phone: {reservation.primaryGuest?.phone}
              </div>
              {reservation.primaryGuest?.email && (
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  Email: {reservation.primaryGuest?.email}
                </div>
              )}
              {reservation.primaryGuest?.gstin && (
                <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>
                  Guest GSTIN: {reservation.primaryGuest?.gstin}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>
                RESERVATION ALLOCATION
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                Room {reservation.roomNumber} • Plan: {reservation.ratePlanCode}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Occupancy: {reservation.adults} Adults {reservation.children > 0 ? `, ${reservation.children} Children` : ''}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Dates: <strong>{reservation.checkInDate}</strong> to <strong>{reservation.checkOutDate}</strong> ({reservation.nights} Nights)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Check-in: 14:00 • Check-out: 11:00
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Nights</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Tariff/Night</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Tax (GST)</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>
                  <strong>Room Accommodation (SAC: 996311)</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Room {reservation.roomNumber} ({reservation.ratePlanCode})</div>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{reservation.nights}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{reservation.baseRatePerNight?.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{reservation.taxAmount?.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>₹{reservation.totalAmount?.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>Total Booking Cost:</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>₹{reservation.totalAmount?.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#059669', fontWeight: 600 }}>Amount Paid / Advance:</td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', color: '#059669', fontWeight: 700 }}>-₹{reservation.paidAmount?.toLocaleString()}</td>
              </tr>
              <tr style={{ fontSize: '0.96rem', borderTop: '2px solid #0f172a' }}>
                <td colSpan={4} style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800 }}>Balance Payable at Check-In:</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: reservation.balanceDue > 0 ? '#dc2626' : '#059669' }}>
                  ₹{reservation.balanceDue?.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Hotel Policies & Verification */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.6 }}>
            <p><strong>Hotel Policies & Terms:</strong></p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>Government-issued photo identification (Aadhaar, Passport, or Driving License) is mandatory for all adults upon check-in.</li>
              <li>Standard Check-In time is 14:00 hrs and Check-Out time is 11:00 hrs. Early check-in or late check-out is subject to room availability.</li>
              <li>Smoking is strictly prohibited in all indoor guest rooms and public spaces.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
