import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  BedDouble,
  Calendar,
  LogOut,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function GuestCheckOutModal({
  isOpen,
  onClose,
  reservation,
  onSettleFolio,
  onConfirmCheckOut
}) {
  if (!isOpen || !reservation) return null;

  const [paymentMode, setPaymentMode] = useState('UPI');
  const [settlementRef, setSettlementRef] = useState('');
  const [isSettling, setIsSettling] = useState(false);

  const guestName = reservation.primaryGuest?.name || 'Guest';
  const roomNumber = reservation.roomNumber || '102';
  const roomType = reservation.roomTypeName || 'Delux Room';
  const checkInDate = reservation.checkInDate || '24/10/2026';
  const checkOutDate = reservation.checkOutDate || '26/10/2026';
  const nights = reservation.nights || 2;

  const totalAmount = Number(reservation.totalAmount || 0).toFixed(2);
  const paidAmount = Number(reservation.paidAmount || 0).toFixed(2);
  const balanceDue = Number(
    reservation.balanceDue !== undefined ? reservation.balanceDue : (totalAmount - paidAmount)
  );

  const isSettled = balanceDue <= 0.01;

  // Handle Quick Settlement directly in the modal
  const handleQuickSettle = () => {
    if (balanceDue <= 0) return;
    setIsSettling(true);
    if (onSettleFolio) {
      onSettleFolio(reservation.id, paymentMode, settlementRef || 'Front Desk Checkout Settlement');
    }
    setTimeout(() => {
      setIsSettling(false);
    }, 400);
  };

  // Handle Check-Out Submission
  const handleCheckOutSubmit = () => {
    if (!isSettled) {
      alert(`Cannot check out: Outstanding balance of ₹${balanceDue.toFixed(2)} must be settled first.`);
      return;
    }

    if (onConfirmCheckOut) {
      onConfirmCheckOut(reservation.id);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  const modalElement = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          width: '95%',
          maxHeight: '90vh',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: isSettled
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Guest Check-Out Details
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#fee2e2', margin: 0, marginTop: '2px' }}>
                Res. No: <strong style={{ color: '#ffffff' }}>{reservation.bookingReference || '#RES_1'}</strong> — Room {roomNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Guest and Room Info */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              fontSize: '0.86rem'
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Guest Name</span>
              <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{guestName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Assigned Room</span>
              <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>Room {roomNumber}</strong>
              <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>{roomType}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Stay Duration</span>
              <strong style={{ color: '#0f172a' }}>{nights} Nights</strong>
              <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>{checkInDate} to {checkOutDate}</span>
            </div>
          </div>

          {/* Folio Balance Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              textAlign: 'center'
            }}
          >
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Charges</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>₹{totalAmount}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Paid</span>
              <strong style={{ fontSize: '1.05rem', color: '#16a34a' }}>₹{paidAmount}</strong>
            </div>
            <div
              style={{
                background: isSettled ? '#f0fdf4' : '#fef2f2',
                padding: '0.75rem',
                borderRadius: '10px',
                border: isSettled ? '1px solid #86efac' : '1px solid #fecaca'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: isSettled ? '#166534' : '#991b1b', display: 'block', fontWeight: 600 }}>
                Folio Balance
              </span>
              <strong style={{ fontSize: '1.15rem', color: isSettled ? '#16a34a' : '#dc2626' }}>
                ₹{balanceDue.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Validation Check Container */}
          {!isSettled ? (
            /* UNSETTLED WARNING STATE */
            <div
              style={{
                background: '#fff1f2',
                border: '2px solid #f43f5e',
                borderRadius: '12px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <AlertTriangle size={24} color="#e11d48" style={{ shrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#9f1239' }}>
                    Folio Settlement Required (Balance: ₹{balanceDue.toFixed(2)})
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#be123c', lineHeight: 1.4 }}>
                    The PMS strictly enforces folio settlement prior to departure. Unpaid balances or unposted night charges block checkout.
                  </p>
                </div>
              </div>

              {/* Direct Quick Settle Action */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #fecdd3',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  Quick Settle Remaining Balance: ₹{balanceDue.toFixed(2)}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '0.6rem' }}>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: '#ffffff'
                    }}
                  >
                    <option value="UPI">UPI Payment</option>
                    <option value="CARD">Credit/Debit CARD</option>
                    <option value="CASH">CASH</option>
                    <option value="BANK">BANK Transfer</option>
                    <option value="CITY LEDGER">CITY LEDGER</option>
                    <option value="TDS">TDS Deducted</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Ref / Voucher #"
                    value={settlementRef}
                    onChange={(e) => setSettlementRef(e.target.value)}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleQuickSettle}
                    disabled={isSettling}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.55rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <CreditCard size={15} />
                    <span>Post & Settle</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* SETTLED SUCCESS STATE */
            <div
              style={{
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              <CheckCircle2 size={24} color="#16a34a" style={{ shrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                  Room Status: Settled (Balance: 0.00)
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#15803d', lineHeight: 1.4 }}>
                  System validation check confirmed: All room charges, incidental vouchers, and taxes are fully settled.
                  Room {roomNumber} is ready to be released back to housekeeping inventory.
                </p>
              </div>
            </div>
          )}

          {/* Operational Note */}
          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
            ℹ️ <strong>Operational Policy:</strong> Checking out this reservation will release Room {roomNumber} back to housekeeping and automatically flag it as <strong>DIRTY</strong> for turnaround. The reservation will move to the Departures archive.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          {/* Blue Check-Out Confirmation Button */}
          <button
            type="button"
            onClick={handleCheckOutSubmit}
            disabled={!isSettled}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.6rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: !isSettled ? 'not-allowed' : 'pointer',
              opacity: !isSettled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: isSettled ? '0 2px 6px rgba(37, 99, 235, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
            title={!isSettled ? 'Checkout blocked: Folio balance must be 0.00' : 'Confirm Check-Out'}
          >
            <LogOut size={16} />
            <span>Check-Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalElement, document.body)
    : modalElement;
}
