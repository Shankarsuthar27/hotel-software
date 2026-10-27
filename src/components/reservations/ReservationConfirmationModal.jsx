import React from 'react';
import {
  CheckCircle2,
  Calendar,
  User,
  BedDouble,
  DollarSign,
  Printer,
  ArrowRight,
  X,
  Phone,
  Mail,
  Share2
} from 'lucide-react';

export default function ReservationConfirmationModal({
  isOpen,
  onClose,
  reservation,
  onGoToArrivals,
  onPrintVoucher
}) {
  if (!isOpen || !reservation) return null;

  const guestName = reservation.primaryGuest?.name || reservation.guestName || 'Guest';
  const phone = reservation.primaryGuest?.phone || reservation.phone || '-';
  const email = reservation.primaryGuest?.email || reservation.email || '-';
  const resNumber = reservation.bookingReference || '#RES_5';
  const roomTypeName = reservation.roomTypeName || 'Delux Room';
  const roomNumber = reservation.roomNumber || '101';
  const checkInDate = reservation.checkInDate || '26/10/2026';
  const checkOutDate = reservation.checkOutDate || '27/10/2026';
  const nights = reservation.nights || 1;
  const adults = reservation.adults || 1;
  const children = reservation.children !== undefined ? reservation.children : 2;
  const totalAmount = Number(reservation.totalAmount || 2625).toFixed(2);
  const paidAmount = Number(reservation.paidAmount || 0).toFixed(2);
  const balanceDue = Number(reservation.balanceDue !== undefined ? reservation.balanceDue : 2625).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '580px',
          width: '95%',
          borderRadius: '18px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Celebration Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={16} />
          </button>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}
          >
            <CheckCircle2 size={34} color="#ffffff" />
          </div>

          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
            Booking Confirmed!
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#d1fae5' }}>
            The reservation has been successfully booked into the system.
          </p>

          {/* Reservation Number Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#065f46',
              padding: '0.45rem 1.25rem',
              borderRadius: '30px',
              fontWeight: 800,
              fontSize: '1.05rem',
              marginTop: '1rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              letterSpacing: '0.04em'
            }}
          >
            <span>Reservation Number:</span>
            <span style={{ color: '#2563eb' }}>{resNumber}</span>
          </div>
        </div>

        {/* Summary Card Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Guest info card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="#6366f1" />
              <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{guestName}</strong>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.84rem', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} color="#64748b" /> {phone}
              </span>
              {email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} color="#64748b" /> {email}
                </span>
              )}
            </div>
          </div>

          {/* Stay & Room details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}
          >
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Stay Dates ({nights} Night)</span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{checkInDate} — {checkOutDate}</strong>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Room Configuration</span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{roomTypeName} (Room {roomNumber})</strong>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>
                {adults} Adult, {children} Child
              </span>
            </div>
          </div>

          {/* Financials Breakdown */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Amount</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>₹{totalAmount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Advance Paid</span>
              <strong style={{ fontSize: '1rem', color: '#16a34a' }}>₹{paidAmount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Balance Due</span>
              <strong style={{ fontSize: '1.05rem', color: Number(balanceDue) > 0 ? '#ef4444' : '#16a34a' }}>
                ₹{balanceDue}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onPrintVoucher) onPrintVoucher(reservation);
            }}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Printer size={15} />
            <span>Print Voucher</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Reservations
            </button>

            {/* Go to Arrivals Button for direct next step in workflow */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onGoToArrivals) onGoToArrivals();
              }}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
              }}
            >
              <span>Go to Arrivals</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
