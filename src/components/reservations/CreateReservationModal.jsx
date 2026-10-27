import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { calculateRoomTax } from '../../services/taxEngine';

export default function CreateReservationModal({
  isOpen,
  onClose,
  initialData, // { room, date } if clicked from tape chart slot
  roomTypes,
  rooms,
  ratePlans,
  onSubmit
}) {
  if (!isOpen) return null;

  // Form State
  const [checkInDate, setCheckInDate] = useState(initialData?.date || '2026-10-24');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-26');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [marketSegment, setMarketSegment] = useState('WALK_IN');
  const [bookingSource, setBookingSource] = useState('WALK_IN');

  // Flags
  const [isVIP, setIsVIP] = useState(false);
  const [isSingleLady, setIsSingleLady] = useState(false);
  const [noPosting, setNoPosting] = useState(false);
  const [isComplimentary, setIsComplimentary] = useState(false);
  const [isTaxExempt, setIsTaxExempt] = useState(false);

  // Room config
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(
    initialData?.room?.roomTypeId || roomTypes[0]?.id || 'rt_cs'
  );

  const availableRoomsForType = useMemo(() => {
    return rooms.filter((r) => r.roomTypeId === selectedRoomTypeId);
  }, [rooms, selectedRoomTypeId]);

  const [selectedRoomId, setSelectedRoomId] = useState(
    initialData?.room?.id || availableRoomsForType[0]?.id || rooms[0]?.id
  );

  const selectedRoomType = useMemo(() => {
    return roomTypes.find((rt) => rt.id === selectedRoomTypeId) || roomTypes[0];
  }, [roomTypes, selectedRoomTypeId]);

  const [ratePlanCode, setRatePlanCode] = useState('BAR_CP');
  const [adults, setAdults] = useState(selectedRoomType?.baseAdults || 2);
  const [children, setChildren] = useState(0);
  const [baseRate, setBaseRate] = useState(selectedRoomType?.basePrice || 4800);

  // Update base rate when room type changes
  useEffect(() => {
    if (selectedRoomType) {
      setBaseRate(selectedRoomType.basePrice);
      setAdults(selectedRoomType.baseAdults || 2);
      if (availableRoomsForType.length > 0 && !availableRoomsForType.some(r => r.id === selectedRoomId)) {
        setSelectedRoomId(availableRoomsForType[0].id);
      }
    }
  }, [selectedRoomType]);

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+91 ');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestGstin, setGuestGstin] = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [notes, setNotes] = useState('');

  // Advance Payment
  const [collectAdvance, setCollectAdvance] = useState(true);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentReference, setPaymentReference] = useState('');

  // Duration computation
  const nights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  // Live GST Tax Calculation
  const billingTax = useMemo(() => {
    return calculateRoomTax(Number(baseRate) || 0, nights, {
      isComplimentary,
      isTaxExempt
    });
  }, [baseRate, nights, isComplimentary, isTaxExempt]);

  const totalRoomCharges = (Number(baseRate) || 0) * nights;
  const grandTotal = isComplimentary ? 0 : totalRoomCharges + billingTax.totalTax;

  // Auto-populate advance amount on first load
  useEffect(() => {
    if (collectAdvance && !advanceAmount) {
      setAdvanceAmount(Math.round(grandTotal * 0.5) || 2000);
    }
  }, [grandTotal]);

  const balanceDue = Math.max(0, grandTotal - (collectAdvance ? Number(advanceAmount) || 0 : 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Please enter guest full name');
      return;
    }

    const assignedRoom = rooms.find((r) => r.id === selectedRoomId);

    onSubmit({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim(),
      guestGstin: guestGstin.trim(),
      nationality,
      roomId: selectedRoomId,
      roomNumber: assignedRoom ? assignedRoom.roomNumber : '101',
      roomTypeId: selectedRoomTypeId,
      ratePlanCode,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      nights,
      adults,
      children,
      baseRatePerNight: Number(baseRate),
      isVIP,
      isSingleLady,
      noPosting,
      isComplimentary,
      isTaxExempt,
      bookingSource,
      marketSegment,
      notes,
      advanceAmount: collectAdvance ? Number(advanceAmount) || 0 : 0,
      paymentMethod,
      paymentReference
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '880px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', background: '#eff6ff', borderRadius: 'var(--radius-md)' }}>
              <Building size={20} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                New Walk-In Reservation
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Capture guest details, allocate room, calculate Indian GST, and collect advance
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', maxHeight: '72vh' }}>
            {/* Left Form Column */}
            <div>
              {/* Section 1: Stay Details */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    1. Stay Duration & Market Segment
                  </h4>
                  <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Check-In Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Check-Out Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Booking Source</label>
                    <select
                      className="form-select"
                      value={bookingSource}
                      onChange={(e) => setBookingSource(e.target.value)}
                    >
                      <option value="WALK_IN">Direct Walk-In</option>
                      <option value="PHONE">Phone Reservation</option>
                      <option value="WEBSITE">Hotel Website</option>
                      <option value="CORPORATE">Corporate Direct</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Market Segment</label>
                    <select
                      className="form-select"
                      value={marketSegment}
                      onChange={(e) => setMarketSegment(e.target.value)}
                    >
                      <option value="WALK_IN">Walk-In Guest</option>
                      <option value="CORPORATE">Corporate Travel</option>
                      <option value="FIT">Free Independent Traveler</option>
                      <option value="LEISURE">Leisure / Family</option>
                    </select>
                  </div>
                </div>

                {/* Operational Flags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={isVIP} onChange={(e) => setIsVIP(e.target.checked)} />
                    <span>⭐ VIP Guest</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={isSingleLady} onChange={(e) => setIsSingleLady(e.target.checked)} />
                    <span>👩 Single Lady</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={isComplimentary} onChange={(e) => setIsComplimentary(e.target.checked)} />
                    <span>🎁 Complimentary</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={isTaxExempt} onChange={(e) => setIsTaxExempt(e.target.checked)} />
                    <span>Tax Exempt</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Room Allocation */}
              <div style={{ marginBottom: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  2. Room Tier & Rate Plan
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.65rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Room Type Tier</label>
                    <select
                      className="form-select"
                      value={selectedRoomTypeId}
                      onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                    >
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} (Base ₹{rt.basePrice?.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Assign Physical Room</label>
                    <select
                      className="form-select"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                    >
                      {availableRoomsForType.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          Room {rm.roomNumber} ({rm.status.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Rate Plan</label>
                    <select
                      className="form-select"
                      value={ratePlanCode}
                      onChange={(e) => setRatePlanCode(e.target.value)}
                    >
                      <option value="BAR_EP">EP (Room Only)</option>
                      <option value="BAR_CP">CP (With Breakfast)</option>
                      <option value="CORP_MAP">MAP (Breakfast + Dinner)</option>
                      <option value="LUX_CP">Luxury Package</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Adults / Children</label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        className="form-input"
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        title="Adults"
                      />
                      <input
                        type="number"
                        min="0"
                        max="3"
                        className="form-input"
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        title="Children"
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Daily Tariff (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={baseRate}
                      onChange={(e) => setBaseRate(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Guest Information */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  3. Primary Guest Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Guest Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Vikramaditya Reddy"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Phone / WhatsApp *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="guest@domain.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">Guest GSTIN (For B2B Credit)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="29AAAAA0000A1Z5"
                      value={guestGstin}
                      onChange={(e) => setGuestGstin(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sticky Billing & Advance Collection Panel */}
            <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                <DollarSign size={18} color="#2563eb" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  Live Folio Billing & GST
                </h4>
              </div>

              {/* Price Calculation Table */}
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Daily Base Rate:</span>
                  <span style={{ fontWeight: 600 }}>₹{Number(baseRate)?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Stay Duration:</span>
                  <span style={{ fontWeight: 600 }}>{nights} Nights</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Net Room Tariff:</span>
                  <span style={{ fontWeight: 600 }}>₹{totalRoomCharges?.toLocaleString()}</span>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-strong)', margin: '0.25rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>CGST ({billingTax.cgstRate}%):</span>
                  <span>₹{billingTax.cgstAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>SGST ({billingTax.sgstRate}%):</span>
                  <span>₹{billingTax.sgstAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
                  <span>SAC Code: {billingTax.sacCode}</span>
                  <span style={{ fontWeight: 700, color: billingTax.gstRate === 18 ? '#d97706' : '#2563eb' }}>
                    {billingTax.gstRate}% Slab Rate
                  </span>
                </div>

                <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#2563eb' }}>₹{grandTotal?.toLocaleString()}</span>
                </div>

                {/* Advance Payment Collection Block */}
                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', marginBottom: '0.65rem' }}>
                    <input
                      type="checkbox"
                      checked={collectAdvance}
                      onChange={(e) => setCollectAdvance(e.target.checked)}
                    />
                    <span>Collect Advance Payment</span>
                  </label>

                  {collectAdvance && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Advance Amount (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(e.target.value)}
                          placeholder="e.g. 2000"
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>Mode</label>
                          <select
                            className="form-select"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ fontSize: '0.78rem', padding: '0.4rem 0.5rem' }}
                          >
                            <option value="UPI">UPI / QR</option>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Credit/Debit Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>Reference / UTR</label>
                          <input
                            type="text"
                            className="form-input"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Tx ID"
                            style={{ fontSize: '0.78rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Outstanding Balance */}
                <div style={{
                  padding: '0.75rem',
                  background: balanceDue > 0 ? '#fff1f2' : '#ecfdf5',
                  border: `1px solid ${balanceDue > 0 ? '#fecdd3' : '#a7f3d0'}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: balanceDue > 0 ? '#9f1239' : '#065f46' }}>
                    Balance Due on Arrival:
                  </span>
                  <span style={{ fontSize: '0.96rem', fontWeight: 800, color: balanceDue > 0 ? '#e11d48' : '#059669' }}>
                    ₹{balanceDue?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
              <CheckCircle2 size={16} />
              <span>Confirm & Create Reservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
