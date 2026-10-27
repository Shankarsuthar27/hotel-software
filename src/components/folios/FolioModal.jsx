import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  ArrowRightLeft,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  User,
  History
} from 'lucide-react';

import AddPaymentModal from './AddPaymentModal';
import AddChargeModal from './AddChargeModal';

export default function FolioModal({
  isOpen,
  onClose,
  reservation,
  folios,
  auditTrail = [],
  onCheckIn,
  onCheckOut,
  onAddTransaction,
  onSettleFolio,
  onOpenRoomMove,
  onOpenVoucher,
  onOpenInvoice
}) {
  if (!isOpen || !reservation) return null;

  const [activeSubTab, setActiveSubTab] = useState('folio'); // 'details' | 'folio' | 'charges' | 'audit' | 'guest'
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Add Charge Form State
  const [chargeType, setChargeType] = useState('EXTRA_SERVICE');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  // Add Payment Form State
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const folio = folios[reservation.folioId] || {
    folioNumber: `FOL_${reservation.id.replace('res_', '')}`,
    status: reservation.balanceDue <= 0 ? 'SETTLED' : 'OPEN',
    transactions: []
  };

  const transactions = folio.transactions || [];

  // Filter audit trail for this reservation
  const resAudits = auditTrail.filter(
    (a) => a.entityId === reservation.bookingReference || a.entityId === reservation.id
  );

  const handleAddChargeSubmit = (e) => {
    e.preventDefault();
    if (!chargeAmount || Number(chargeAmount) <= 0) return;

    const amt = Number(chargeAmount);
    const tax = Math.round(amt * 0.05 * 100) / 100; // 5% GST on F&B/service

    onAddTransaction(reservation.id, {
      type: chargeType,
      desc: chargeDesc || 'Extra Room Service / F&B',
      amount: amt,
      tax: tax,
      direction: 'DEBIT'
    });

    setChargeDesc('');
    setChargeAmount('');
    setShowAddChargeModal(false);
  };

  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    onAddTransaction(reservation.id, {
      type: 'PAYMENT',
      desc: `Guest Payment (${paymentMode}) Ref: ${paymentRef || 'Front Desk Cashier'}`,
      amount: -Number(paymentAmount),
      tax: 0,
      direction: 'CREDIT'
    });

    setPaymentAmount('');
    setPaymentRef('');
    setShowAddPaymentModal(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '880px', height: '86vh' }}>
        {/* Header with Quick Actions */}
        <div className="modal-header" style={{ background: '#f8fafc' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {reservation.bookingReference} — {reservation.primaryGuest?.name}
              </h3>
              <span
                className={`booking-block status-${reservation.status}`}
                style={{
                  position: 'static',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.15rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {reservation.status.replace('_', ' ')}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Room <strong>{reservation.roomNumber}</strong> • {reservation.checkInDate} to {reservation.checkOutDate} ({reservation.nights} Nights) • Folio: <strong>{folio.folioNumber}</strong>
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {reservation.status === 'confirmed' && (
              <button
                className="btn-primary"
                onClick={() => onCheckIn(reservation.id)}
                style={{ background: '#059669', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <CheckCircle2 size={14} />
                <span>Check-In</span>
              </button>
            )}

            {reservation.status === 'in_house' && (
              <button
                className="btn-primary"
                onClick={() => {
                  if (reservation.balanceDue > 0) {
                    if (confirm(`Outstanding balance of ₹${reservation.balanceDue.toLocaleString()} remains on folio. Settle automatically and complete check-out?`)) {
                      onSettleFolio(reservation.id, 'UPI', 'Auto-Checkout');
                      onCheckOut(reservation.id);
                    }
                  } else {
                    onCheckOut(reservation.id);
                  }
                }}
                style={{ background: '#475569', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Clock size={14} />
                <span>Check-Out</span>
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={() => onOpenRoomMove(reservation)}
              title="Reassign Room"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <ArrowRightLeft size={14} />
              <span>Room Move</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() => onOpenVoucher(reservation)}
              title="Print Booking Voucher"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Printer size={14} />
              <span>Voucher</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() => onOpenInvoice(reservation, folio)}
              title="Print Legal GST Tax Invoice"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <FileText size={14} />
              <span>Tax Invoice</span>
            </button>

            <button className="btn-secondary" onClick={onClose} style={{ padding: '0.45rem 0.6rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1.5rem', background: '#ffffff' }}>
          {[
            { id: 'details', label: 'Booking Details', icon: ShieldCheck },
            { id: 'folio', label: 'Folio Operations', icon: CreditCard },
            { id: 'charges', label: 'Daily Room Charges', icon: DollarSign },
            { id: 'audit', label: `Audit Trail (${resAudits.length})`, icon: History },
            { id: 'guest', label: 'Guest Details', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '0.75rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* TAB 1: BOOKING DETAILS */}
          {activeSubTab === 'details' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Room & Tier</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Room {reservation.roomNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{reservation.ratePlanCode}</div>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Stay Nights</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{reservation.nights} Nights</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{reservation.adults}A {reservation.children > 0 ? `, ${reservation.children}C` : ''}</div>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Amount</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>₹{reservation.totalAmount?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Paid: ₹{reservation.paidAmount?.toLocaleString()}</div>
                </div>

                <div style={{ padding: '1rem', background: reservation.balanceDue > 0 ? '#fff1f2' : '#ecfdf5', borderRadius: 'var(--radius-md)', border: `1px solid ${reservation.balanceDue > 0 ? '#fecdd3' : '#a7f3d0'}` }}>
                  <div style={{ fontSize: '0.72rem', color: reservation.balanceDue > 0 ? '#9f1239' : '#065f46', fontWeight: 600, textTransform: 'uppercase' }}>Balance Due</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: reservation.balanceDue > 0 ? '#e11d48' : '#059669' }}>
                    ₹{reservation.balanceDue?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {folio.status}</div>
                </div>
              </div>

              {/* Attributes & Flags */}
              <div style={{ background: '#ffffff', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: '#334155' }}>
                  Reservation Attributes & Badges
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700 }}>
                    Source: {reservation.bookingSource}
                  </span>
                  <span style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', fontWeight: 700 }}>
                    Segment: {reservation.marketSegment}
                  </span>
                  {reservation.isVIP && (
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: '#fef3c7', color: '#b45309', fontSize: '0.78rem', fontWeight: 800 }}>
                      ⭐ VIP Guest
                    </span>
                  )}
                  {reservation.isSingleLady && (
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: '#fdf2f8', color: '#db2777', fontSize: '0.78rem', fontWeight: 700 }}>
                      👩 Single Lady
                    </span>
                  )}
                  {reservation.isComplimentary && (
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: '#f5f3ff', color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700 }}>
                      🎁 Complimentary Stay
                    </span>
                  )}
                </div>
                {reservation.notes && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#334155' }}>
                    <strong>Special Requests:</strong> {reservation.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FOLIO OPERATIONS & LEDGER */}
          {activeSubTab === 'folio' && (
            <div>
              {/* Financial Summary & Actions Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.86rem' }}>
                    <span style={{ color: '#64748b' }}>Charges: </span>
                    <strong>₹{reservation.totalAmount?.toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.86rem' }}>
                    <span style={{ color: '#64748b' }}>Paid: </span>
                    <strong style={{ color: '#059669' }}>₹{reservation.paidAmount?.toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.86rem' }}>
                    <span style={{ color: '#64748b' }}>Balance: </span>
                    <strong style={{ color: reservation.balanceDue > 0 ? '#e11d48' : '#059669' }}>
                      ₹{reservation.balanceDue?.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowAddChargeModal(true)}
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Charge</span>
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setShowAddPaymentModal(true)}
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                  >
                    <CreditCard size={14} />
                    <span>Add Payment</span>
                  </button>
                  {reservation.balanceDue > 0 && (
                    <button
                      className="btn-primary"
                      onClick={() => onSettleFolio(reservation.id, 'UPI', 'Direct Settle')}
                      style={{ background: '#059669', fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                    >
                      <span>Settle All (₹{reservation.balanceDue?.toLocaleString()})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Type</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Description</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Tax (₹)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Debit (Charge)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Credit (Payment)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{tx.date}</td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: tx.direction === 'DEBIT' ? '#eff6ff' : '#ecfdf5',
                          color: tx.direction === 'DEBIT' ? '#2563eb' : '#059669'
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 500 }}>{tx.desc}</td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#64748b' }}>
                        {tx.tax ? `₹${tx.tax?.toLocaleString()}` : '-'}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {tx.direction === 'DEBIT' ? `₹${tx.amount?.toLocaleString()}` : '-'}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {tx.direction === 'CREDIT' ? `₹${Math.abs(tx.amount)?.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: DAILY ROOM CHARGES */}
          {activeSubTab === 'charges' && (
            <div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                Itemized daily room tariff and GST tax schedule posted by the Night Audit engine:
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Stay Date</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Room #</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Rate Plan</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Tariff (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>GST Slab (₹)</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Net Daily (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: reservation.nights }).map((_, idx) => {
                    const d = new Date(reservation.checkInDate);
                    d.setDate(d.getDate() + idx);
                    const iso = d.toISOString().split('T')[0];
                    const dailyTax = Math.round((reservation.taxAmount || 0) / reservation.nights);

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{iso}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{reservation.roomNumber}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{reservation.ratePlanCode}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>₹{reservation.baseRatePerNight?.toLocaleString()}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#64748b' }}>₹{dailyTax?.toLocaleString()}</td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                          ₹{(reservation.baseRatePerNight + dailyTax)?.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeSubTab === 'audit' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resAudits.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No logged audit events recorded for this reservation.</p>
                ) : (
                  resAudits.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <div style={{ marginTop: '2px' }}>
                        <History size={16} color="#2563eb" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                            {item.action.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.timestamp}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569' }}>{item.details}</p>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Performed by: <strong>{item.actor}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GUEST DETAILS */}
          {activeSubTab === 'guest' && (
            <div style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={reservation.primaryGuest?.name || ''} readOnly />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={reservation.primaryGuest?.phone || ''} readOnly />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="text" className="form-input" value={reservation.primaryGuest?.email || 'N/A'} readOnly />
                </div>
                <div>
                  <label className="form-label">GSTIN</label>
                  <input type="text" className="form-input" value={reservation.primaryGuest?.gstin || 'None (Consumer)'} readOnly />
                </div>
                <div>
                  <label className="form-label">Nationality</label>
                  <input type="text" className="form-input" value={reservation.primaryGuest?.nationality || 'Indian'} readOnly />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nested Add Charge Modal (Exact OTAL PMS Specification & Design) */}
        <AddChargeModal
          isOpen={showAddChargeModal}
          reservation={reservation}
          folio={folio}
          onClose={() => setShowAddChargeModal(false)}
          onConfirmCharge={(chargeData) => {
            if (onAddTransaction) {
              onAddTransaction(reservation.id, {
                folioId: chargeData.folioId,
                type: 'CHARGE',
                category: chargeData.category,
                particulars: chargeData.particulars,
                amount: Number(chargeData.amount),
                reference: chargeData.receiptNumber || chargeData.reference,
                desc: chargeData.description || chargeData.category
              });
            }
            setShowAddChargeModal(false);
          }}
        />

        {/* Nested Add Payment Modal (Exact OTAL PMS Specification & Design) */}
        <AddPaymentModal
          isOpen={showAddPaymentModal}
          reservation={reservation}
          folio={folio}
          onClose={() => setShowAddPaymentModal(false)}
          onConfirmPayment={(paymentData) => {
            if (onAddTransaction) {
              onAddTransaction(reservation.id, {
                folioId: paymentData.folioId,
                type: 'PAYMENT',
                mode: paymentData.paymentMethod,
                amount: Number(paymentData.amount),
                reference: paymentData.receiptNumber || paymentData.reference,
                desc: paymentData.description || `${paymentData.paymentMethod} Payment`
              });
            }
            setShowAddPaymentModal(false);
          }}
        />
      </div>
    </div>
  );
}
