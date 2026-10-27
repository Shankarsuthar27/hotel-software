import React, { useState } from 'react';
import { ArrowRightLeft, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function GroupRoomMoveModal({
  isOpen,
  onClose,
  reservation,
  rooms,
  onMoveRoom
}) {
  if (!isOpen || !reservation) return null;

  const currentRoom = rooms.find((r) => r.id === reservation.roomId);
  
  // Available target rooms
  const candidateRooms = rooms.filter(
    (r) => r.id !== reservation.roomId && r.status !== 'maintenance'
  );

  const [targetRoomId, setTargetRoomId] = useState(candidateRooms[0]?.id || '');

  const selectedTargetRoom = rooms.find((r) => r.id === targetRoomId);

  const handleMove = (e) => {
    e.preventDefault();
    if (!targetRoomId) return;

    if (selectedTargetRoom?.status === 'dirty') {
      if (!confirm(`Warning: Room ${selectedTargetRoom.roomNumber} is currently DIRTY. Are you sure you want to move the guest to this room?`)) {
        return;
      }
    }

    onMoveRoom(reservation.id, targetRoomId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ padding: '0.45rem', background: '#eff6ff', borderRadius: 'var(--radius-md)' }}>
              <ArrowRightLeft size={18} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Room Move & Reassignment
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Reallocate {reservation.bookingReference} ({reservation.primaryGuest?.name})
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleMove}>
          <div className="modal-body">
            {/* Current Room Details */}
            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Current Allocation</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Room {reservation.roomNumber} ({currentRoom?.status?.toUpperCase() || 'OCCUPIED'})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Dates: {reservation.checkInDate} to {reservation.checkOutDate} ({reservation.nights} Nights)
              </div>
            </div>

            {/* Target Room Dropdown */}
            <div className="form-group">
              <label className="form-label">Proposed Target Room</label>
              <select
                className="form-select"
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                required
              >
                {candidateRooms.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    Room {rm.roomNumber} (Floor {rm.floor} • Status: {rm.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Dirty / Inspected Status Badge Alert */}
            {selectedTargetRoom && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: selectedTargetRoom.status === 'dirty' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${selectedTargetRoom.status === 'dirty' ? '#fecaca' : '#bbf7d0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: selectedTargetRoom.status === 'dirty' ? '#991b1b' : '#166534'
              }}>
                {selectedTargetRoom.status === 'dirty' ? (
                  <>
                    <AlertTriangle size={16} />
                    <span>Room {selectedTargetRoom.roomNumber} is currently <strong>DIRTY</strong>. Housekeeping turnaround will be required prior to guest occupation.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Room {selectedTargetRoom.roomNumber} is <strong>{selectedTargetRoom.status.toUpperCase()}</strong> and immediately available for key handoff.</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <ArrowRightLeft size={14} />
              <span>Confirm Room Move</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
