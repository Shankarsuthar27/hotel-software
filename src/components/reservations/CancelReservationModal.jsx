import React from 'react';
import ReactDOM from 'react-dom';

export default function CancelReservationModal({
  isOpen,
  onClose,
  onConfirm,
  reservation
}) {
  if (!isOpen || !reservation) return null;

  const modalContent = (
    <div
      className="cancel-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="cancel-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '470px',
          padding: '24px 28px 22px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <h3
          style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: 1.2
          }}
        >
          Cancel Reservation
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '13.5px',
            color: '#64748B',
            lineHeight: 1.5
          }}
        >
          Are you sure you want to cancel this reservation? This action cannot be undone.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 22px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            Keep
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              backgroundColor: '#DC2626',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
            }}
          >
            Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}

