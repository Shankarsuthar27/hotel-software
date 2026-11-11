import React, { useState, useEffect } from 'react';
import { DoorClosed, X, Check, ArrowRight, ChevronDown } from 'lucide-react';

export default function GroupRoomMoveModal({
  isOpen,
  onClose,
  reservation,
  rooms = [],
  roomTypes = [],
  onMoveRoom
}) {
  if (!isOpen || !reservation) return null;

  const currentRoom = rooms.find((r) => r.id === reservation.roomId);

  const effectiveRoomTypes = (roomTypes && roomTypes.length > 0)
    ? roomTypes
    : [
        { id: 'rt_deluxe', name: 'Delux Room' },
        { id: 'rt_standard', name: 'Standard Room' }
      ];

  const [isSelected, setIsSelected] = useState(true);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [proposedRoomId, setProposedRoomId] = useState('');

  // Initialize or reset when modal opens or reservation changes
  useEffect(() => {
    if (isOpen && reservation) {
      setIsSelected(true);
      const currRoom = rooms.find((r) => r.id === reservation.roomId);
      const initialTypeId =
        reservation.roomTypeId ||
        currRoom?.roomTypeId ||
        (effectiveRoomTypes[0]?.id || '');
      setSelectedRoomTypeId(initialTypeId);
      setProposedRoomId('');
    }
  }, [isOpen, reservation]);

  // Filter available candidate rooms by selected room type
  const candidateRooms = rooms.filter((r) => {
    // Exclude current room
    if (r.id === reservation.roomId || r.roomNumber === reservation.roomNumber) return false;
    // Match selected room type if available
    if (selectedRoomTypeId && r.roomTypeId && r.roomTypeId !== selectedRoomTypeId) return false;
    // Exclude maintenance rooms
    if (r.status === 'maintenance') return false;
    return true;
  });

  const handleMove = (e) => {
    if (e) e.preventDefault();
    if (!isSelected) return;

    if (!proposedRoomId) {
      alert('Please select a proposed room to move to.');
      return;
    }

    const selectedTargetRoom = rooms.find((r) => r.id === proposedRoomId);
    if (selectedTargetRoom?.status === 'dirty') {
      if (!confirm(`Warning: Room ${selectedTargetRoom.roomNumber} is currently DIRTY. Are you sure you want to move the guest to this room?`)) {
        return;
      }
    }

    if (onMoveRoom) {
      onMoveRoom(reservation.id, proposedRoomId);
    }
    onClose();
  };

  return (
    <div
      className="room-move-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div
        className="room-move-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '24px 28px 22px',
          boxSizing: 'border-box',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                flexShrink: 0
              }}
            >
              <DoorClosed size={20} strokeWidth={1.9} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0F172A',
                  lineHeight: 1.2
                }}
              >
                Room Move
              </h3>
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '12.5px',
                  color: '#64748B',
                  lineHeight: 1.4
                }}
              >
                Move the guest to another available room or room type for their remaining stay
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'color 0.15s, background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.backgroundColor = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748B';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Selected Rooms Count Indicator */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '10px'
          }}
        >
          Selected Rooms ({isSelected ? 1 : 0})
        </div>

        {/* Room Move Selection Card */}
        <div
          style={{
            backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
            border: isSelected ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.15s ease'
          }}
        >
          {/* Checkbox */}
          <div
            onClick={() => setIsSelected(!isSelected)}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsSelected(!isSelected);
              }
            }}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
              border: isSelected ? '1.5px solid #2563EB' : '1.5px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginRight: '16px',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
          </div>

          {/* Current Room */}
          <div style={{ marginRight: '24px', minWidth: '95px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '3px' }}>
              Current Room
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#2563EB' }}>
              {reservation?.roomNumber || currentRoom?.roomNumber || '-'}
            </div>
          </div>

          {/* Room Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Room Type
            </label>
            <div style={{ position: 'relative', width: '175px' }}>
              <select
                value={selectedRoomTypeId}
                onChange={(e) => {
                  setSelectedRoomTypeId(e.target.value);
                  setProposedRoomId('');
                }}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 30px 0 12px',
                  fontSize: '13px',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer'
                }}
              >
                {effectiveRoomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748B'
                }}
              >
                <ChevronDown size={15} />
              </div>
            </div>
          </div>

          {/* Arrow Separator */}
          <div
            style={{
              margin: '18px 14px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8'
            }}
          >
            <ArrowRight size={18} strokeWidth={2} />
          </div>

          {/* Proposed Room */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Proposed Room
            </label>
            <div style={{ position: 'relative', width: '175px' }}>
              <select
                value={proposedRoomId}
                onChange={(e) => setProposedRoomId(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 30px 0 12px',
                  fontSize: '13px',
                  color: proposedRoomId ? '#0F172A' : '#64748B',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ color: '#64748B' }}>Select Room</option>
                {candidateRooms.map((rm) => (
                  <option key={rm.id} value={rm.id} style={{ color: '#0F172A' }}>
                    Room {rm.roomNumber}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748B'
                }}
              >
                <ChevronDown size={15} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div
          style={{
            marginTop: '26px',
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
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13.5px',
              fontWeight: 500,
              color: '#0F172A',
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={!isSelected}
            style={{
              backgroundColor: isSelected ? '#2563EB' : '#93C5FD',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: isSelected ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              if (isSelected) e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (isSelected) e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
