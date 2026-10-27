import React, { useState } from 'react';
import { Wrench, X, Trash2, Calendar, AlertTriangle } from 'lucide-react';

export default function MaintenanceBlockModal({
  isOpen,
  onClose,
  initialData, // { room, date } or existing block object
  rooms,
  onSubmit,
  onDelete
}) {
  if (!isOpen) return null;

  const isExisting = !!initialData?.id;

  const [roomId, setRoomId] = useState(initialData?.roomId || (initialData?.room?.id || rooms[0]?.id));
  const [startDate, setStartDate] = useState(initialData?.startDate || initialData?.date || '2026-10-24');
  const [endDate, setEndDate] = useState(initialData?.endDate || '2026-10-27');
  const [reason, setReason] = useState(initialData?.reason || 'Air conditioning maintenance & filter replacement');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      roomId,
      startDate,
      endDate,
      reason
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
              <Wrench size={20} color="#d97706" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {isExisting ? 'Manage Maintenance Block' : 'Schedule Out-Of-Order Room Block'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Locks physical room from tape chart and prevents OTA inventory allocation
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Physical Room to Block</label>
              <select
                className="form-select"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={isExisting}
              >
                {rooms.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    Room {rm.roomNumber} (Floor {rm.floor} • Currently {rm.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Block Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isExisting}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isExisting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Maintenance Reason / Work Order</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Plumbing inspection, wall repainting, deep upholstery wash..."
                required
              />
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              color: '#92400e'
            }}>
              <AlertTriangle size={16} />
              <span>While blocked, this room cannot be checked-in and will show in orange on the tape chart.</span>
            </div>
          </div>

          <div className="modal-footer">
            {isExisting && onDelete && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={14} />
                <span>Release Block</span>
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {!isExisting && (
              <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>
                <Wrench size={14} />
                <span>Schedule Block</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
