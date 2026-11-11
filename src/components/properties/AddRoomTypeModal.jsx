import React, { useState, useEffect } from 'react';
import { BedDouble, X } from 'lucide-react';

export default function AddRoomTypeModal({
  isOpen,
  onClose,
  onCreateRoomType,
  onUpdateRoomType,
  roomTypeToEdit = null,
  showToast
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [baseAdults, setBaseAdults] = useState('0');
  const [maxAdults, setMaxAdults] = useState('0');
  const [baseChildren, setBaseChildren] = useState('0');
  const [maxChildren, setMaxChildren] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (roomTypeToEdit) {
        setName(roomTypeToEdit.name || '');
        setCode(roomTypeToEdit.code || '');
        setBaseAdults(String(roomTypeToEdit.baseAdults ?? '0'));
        setMaxAdults(String(roomTypeToEdit.maxAdults ?? '0'));
        setBaseChildren(String(roomTypeToEdit.baseChildren ?? '0'));
        setMaxChildren(String(roomTypeToEdit.maxChildren ?? '0'));
        setError('');
      } else {
        setName('');
        setCode('');
        setBaseAdults('0');
        setMaxAdults('0');
        setBaseChildren('0');
        setMaxChildren('0');
        setError('');
      }
    }
  }, [isOpen, roomTypeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a room type name');
      return;
    }
    if (!code.trim()) {
      setError('Please enter a room type code');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      baseAdults: parseInt(baseAdults, 10) || 0,
      maxAdults: parseInt(maxAdults, 10) || 0,
      baseChildren: parseInt(baseChildren, 10) || 0,
      maxChildren: parseInt(maxChildren, 10) || 0,
      status: 'ACTIVE'
    };

    if (roomTypeToEdit) {
      if (onUpdateRoomType) {
        onUpdateRoomType(roomTypeToEdit.id, payload);
      }
      if (showToast) {
        showToast('Success: Room type updated successfully');
      }
    } else {
      if (onCreateRoomType) {
        onCreateRoomType(payload);
      }
      if (showToast) {
        showToast('Success: Room type created successfully');
      }
    }

    onClose();
  };

  return (
    <div className="meal-plan-drawer-overlay" onClick={onClose}>
      <div
        className="meal-plan-drawer-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header (Matching Image 2) */}
        <div className="meal-plan-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="meal-plan-drawer-icon-badge">
              <BedDouble size={18} color="#2563EB" />
            </div>
            <h3 className="meal-plan-drawer-title">
              {roomTypeToEdit ? 'Edit Room Type' : 'Add Room Type'}
            </h3>
          </div>
          <button
            type="button"
            className="meal-plan-drawer-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Matching Image 2) */}
        <form onSubmit={handleSubmit} className="meal-plan-drawer-form">
          <div className="meal-plan-drawer-body">
            {error && (
              <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* Row 1: Name * & Code * */}
            <div className="meal-plan-drawer-row-2col">
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="e.g. Deluxe Room"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Code <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="e.g. DXL"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Base Adult Occupancy * & Max Adults Occupancy * */}
            <div className="meal-plan-drawer-row-2col">
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Base Adult Occupancy <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="meal-plan-drawer-input"
                  value={baseAdults}
                  onChange={(e) => setBaseAdults(e.target.value)}
                  required
                />
              </div>

              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Max Adults Occupancy <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="meal-plan-drawer-input"
                  value={maxAdults}
                  onChange={(e) => setMaxAdults(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 3: Base Child Occupancy & Max Children Occupancy */}
            <div className="meal-plan-drawer-row-2col">
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Base Child Occupancy
                </label>
                <input
                  type="number"
                  min="0"
                  className="meal-plan-drawer-input"
                  value={baseChildren}
                  onChange={(e) => setBaseChildren(e.target.value)}
                />
              </div>

              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Max Children Occupancy
                </label>
                <input
                  type="number"
                  min="0"
                  className="meal-plan-drawer-input"
                  value={maxChildren}
                  onChange={(e) => setMaxChildren(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer (Matching Image 2) */}
          <div className="meal-plan-drawer-footer">
            <button
              type="button"
              className="meal-plan-drawer-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="meal-plan-drawer-btn-create"
            >
              {roomTypeToEdit ? 'Update Room Type' : 'Create Room Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

