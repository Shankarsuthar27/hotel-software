import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  CheckCircle2,
  BedDouble,
  User,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  Tag,
  Star
} from 'lucide-react';

export default function GuestCheckInModal({
  isOpen,
  onClose,
  reservation,
  rooms = [],
  roomTypes = [],
  onAssignRoom,
  onConfirmCheckIn
}) {
  if (!isOpen || !reservation) return null;

  const [selectedRoomId, setSelectedRoomId] = useState(
    reservation.roomId || ''
  );
  const [assignedRoomNumber, setAssignedRoomNumber] = useState(
    reservation.roomNumber || ''
  );
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Sync when reservation changes
  useEffect(() => {
    if (reservation) {
      setSelectedRoomId(reservation.roomId || '');
      setAssignedRoomNumber(reservation.roomNumber || '');
      setAssignSuccessMsg('');
    }
  }, [reservation]);

  // Clean available rooms matching category or all clean rooms
  const matchingRooms = rooms.filter((rm) => {
    if (reservation.roomTypeId) {
      return rm.roomTypeId === reservation.roomTypeId && rm.status === 'clean';
    }
    return rm.status === 'clean';
  });

  // Fallback to any clean rooms if none in category
  const candidateRooms = matchingRooms.length > 0
    ? matchingRooms
    : rooms.filter((rm) => rm.status === 'clean' || rm.operational === 'available');

  const guestName = reservation.primaryGuest?.name || 'Guest';
  const phone = reservation.primaryGuest?.phone || reservation.phone || '-';
  const email = reservation.primaryGuest?.email || reservation.email || '-';
  const checkInDate = reservation.checkInDate || '26/10/2026';
  const checkOutDate = reservation.checkOutDate || '27/10/2026';
  const nights = reservation.nights || 1;
  const adults = reservation.adults || 1;
  const children = reservation.children !== undefined ? reservation.children : 0;
  const totalAmount = Number(reservation.totalAmount || 0).toFixed(2);
  const paidAmount = Number(reservation.paidAmount || 0).toFixed(2);
  const balanceDue = Number(reservation.balanceDue !== undefined ? reservation.balanceDue : (totalAmount - paidAmount)).toFixed(2);

  const bookedCategoryName = reservation.roomTypeName ||
    roomTypes.find((rt) => rt.id === reservation.roomTypeId)?.name ||
    'Delux Room';

  // Handle clicking "Assign"
  const handleAssignClick = () => {
    if (!selectedRoomId) {
      alert('Please select a room to assign.');
      return;
    }
    const rm = rooms.find((r) => r.id === selectedRoomId);
    if (rm) {
      setIsAssigning(true);
      if (onAssignRoom) {
        onAssignRoom(reservation.id, selectedRoomId);
      }
      setAssignedRoomNumber(rm.roomNumber);
      setAssignSuccessMsg(`Success: Room ${rm.roomNumber} assigned successfully`);
      setTimeout(() => setIsAssigning(false), 300);
    }
  };

  // Handle clicking primary "Check-in" button
  const handleCheckInSubmit = () => {
    if (!assignedRoomNumber && !selectedRoomId) {
      alert('Please assign a room before proceeding with check-in.');
      return;
    }

    if (onConfirmCheckIn) {
      onConfirmCheckIn(reservation.id, selectedRoomId);
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
          maxWidth: '680px',
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
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
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
              <BedDouble size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Guest Check-In Details
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#e0e7ff', margin: 0, marginTop: '2px' }}>
                Booking Ref: <strong style={{ color: '#ffffff' }}>{reservation.bookingReference || '#RES_5'}</strong>
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
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Success Banner if room assigned */}
          {assignSuccessMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" />
              <span>{assignSuccessMsg}</span>
            </div>
          )}

          {/* 1. Guest Information Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} color="#6366f1" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Guest Information
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {reservation.isVIP && (
                  <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={11} /> VIP
                  </span>
                )}
                {reservation.isSingleLady && (
                  <span style={{ background: '#fdf4ff', color: '#c026d3', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    Single Lady
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem', fontSize: '0.86rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Primary Guest</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{guestName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Contact Phone</span>
                <span style={{ color: '#1e293b', fontWeight: 500 }}>{phone}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Email Address</span>
                <span style={{ color: '#1e293b', fontWeight: 500, wordBreak: 'break-all' }}>{email}</span>
              </div>
            </div>
          </div>

          {/* 2. Stay & Occupancy Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Calendar size={16} color="#6366f1" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dates & Occupancy
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Check-In</span>
                <strong style={{ color: '#0f172a' }}>{checkInDate}</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>14:00</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Check-Out</span>
                <strong style={{ color: '#0f172a' }}>{checkOutDate}</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>11:00</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Duration</span>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', display: 'inline-block' }}>
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Occupancy</span>
                <strong style={{ color: '#0f172a' }}>
                  {adults} Adult{adults > 1 ? 's' : ''}, {children} Child{children !== 1 ? 'ren' : ''}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Total Tariff: </span>
                <strong style={{ color: '#0f172a' }}>₹{totalAmount}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Advance Paid: </span>
                <strong style={{ color: '#16a34a' }}>₹{paidAmount}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Balance Due: </span>
                <strong style={{ color: Number(balanceDue) > 0 ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
                  ₹{balanceDue}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Room Assignment Section (Core Feature) */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #818cf8',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🛏️</span>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1e293b' }}>
                  Room Assignment
                </h4>
              </div>
              <span
                style={{
                  background: assignedRoomNumber ? '#ecfdf5' : '#fff1f2',
                  color: assignedRoomNumber ? '#047857' : '#be123c',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: assignedRoomNumber ? '1px solid #a7f3d0' : '1px solid #fecdd3'
                }}
              >
                {assignedRoomNumber ? `Assigned: Room ${assignedRoomNumber}` : 'Room Unassigned'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
              Booked Category: <strong style={{ color: '#4338ca' }}>{bookedCategoryName}</strong>. Select an inspected, clean room from the inventory to allocate to this guest.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Select Room (Clean & Ready) --</option>
                  {candidateRooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.roomNumber} ({rm.roomTypeId === 'rt_deluxe' ? 'Delux Room' : 'Standard Room'}) — {rm.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purple Assign Button */}
              <button
                type="button"
                onClick={handleAssignClick}
                disabled={!selectedRoomId || isAssigning}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: !selectedRoomId ? 'not-allowed' : 'pointer',
                  opacity: !selectedRoomId ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)'
                }}
              >
                <span>Assign</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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

          {/* Primary Blue Check-in Button */}
          <button
            type="button"
            onClick={handleCheckInSubmit}
            disabled={!assignedRoomNumber && !selectedRoomId}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.6rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: !assignedRoomNumber && !selectedRoomId ? 'not-allowed' : 'pointer',
              opacity: !assignedRoomNumber && !selectedRoomId ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Check-in</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalElement, document.body)
    : modalElement;
}
