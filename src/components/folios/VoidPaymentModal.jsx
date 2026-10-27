import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Ban,
  Clock,
  CreditCard,
  DollarSign
} from 'lucide-react';

export default function VoidPaymentModal({
  isOpen,
  onClose,
  transaction,
  onConfirmVoid
}) {
  if (!isOpen || !transaction) return null;

  const [voidReason, setVoidReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const amount = Math.abs(Number(transaction.amount || 0)).toFixed(2);
  const paymentMethod = transaction.paymentMethod || transaction.particulars || 'Payment';
  const txDate = transaction.date || '-';
  const desc = transaction.desc || transaction.description || '-';

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!voidReason.trim() || voidReason.trim().length < 5) {
      setErrorMsg('Void reason is mandatory (minimum 5 characters, e.g. "not collected")');
      return;
    }

    if (onConfirmVoid) {
      onConfirmVoid(transaction.id, voidReason.trim());
    }
    setVoidReason('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '95%',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ban size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Void Payment
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#fee2e2' }}>
                Reverse erroneous payment & restore folio balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Transaction Summary Card */}
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#991b1b', display: 'block', fontWeight: 600 }}>
                Transaction to Void
              </span>
              <strong style={{ fontSize: '0.92rem', color: '#7f1d1d' }}>
                {paymentMethod} — {desc}
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#b91c1c', display: 'block' }}>Date: {txDate}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#991b1b', display: 'block' }}>Amount</span>
              <strong style={{ fontSize: '1.2rem', color: '#b91c1c', fontWeight: 800 }}>₹{amount}</strong>
            </div>
          </div>

          {/* Warning Notice */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.82rem', color: '#475569' }}>
            <AlertTriangle size={18} color="#eab308" style={{ shrink: 0, marginTop: '2px' }} />
            <span>
              This will mark the payment with a red <strong>VOIDED</strong> status badge and immediately restore the
              balance of <strong>₹{amount}</strong> to the outstanding balance. The void reason and operator credentials are permanently recorded in the Audit Trail.
            </span>
          </div>

          {/* Mandatory Reason Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
              Mandatory Void Reason <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={voidReason}
              onChange={(e) => {
                setVoidReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder='e.g., "not collected", "wrong payment mode selected", "duplicate entry"'
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: errorMsg ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'none'
              }}
              required
            />
            {errorMsg && (
              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                {errorMsg}
              </span>
            )}
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Minimum 5 characters required (current: {voidReason.trim().length})
            </span>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.15rem',
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

            <button
              type="submit"
              disabled={voidReason.trim().length < 5}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: voidReason.trim().length < 5 ? 'not-allowed' : 'pointer',
                opacity: voidReason.trim().length < 5 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
              }}
            >
              <Ban size={15} />
              <span>Confirm Void Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
