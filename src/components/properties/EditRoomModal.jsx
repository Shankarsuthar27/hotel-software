import React, { useState, useEffect, useRef } from 'react';
import { SquarePen, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

export default function EditRoomModal({
  isOpen,
  onClose,
  room,
  roomTypes = [],
  onUpdateRoom,
  showToast
}) {
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && room) {
      setRoomNumber(room.roomNumber || '');
      const currentRt =
        roomTypes.find((rt) => rt.id === room.roomTypeId) ||
        roomTypes.find((rt) => rt.name?.toLowerCase() === room.roomTypeName?.toLowerCase()) ||
        roomTypes[0] ||
        null;
      setSelectedRoomType(currentRt);
      setIsDropdownOpen(false);
      setError('');
    }
  }, [isOpen, room, roomTypes]);

  // Click outside to close custom room type popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!isOpen || !room) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError('Please enter a room number');
      return;
    }
    if (!selectedRoomType) {
      setError('Please select a room type');
      return;
    }

    if (onUpdateRoom) {
      onUpdateRoom(room.id, {
        roomNumber: roomNumber.trim(),
        roomTypeId: selectedRoomType.id,
        roomTypeName: selectedRoomType.name,
        status: room.status || 'clean'
      });
    }

    if (showToast) {
      showToast(`Success: Updated room ${roomNumber.trim()}`);
    }

    onClose();
  };

  return (
    <div className="meal-plan-drawer-overlay" onClick={onClose}>
      <div
        className="meal-plan-drawer-container"
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="meal-plan-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="meal-plan-drawer-icon-badge">
              <SquarePen size={18} color="#2563EB" />
            </div>
            <h3 className="meal-plan-drawer-title">Edit Room</h3>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="meal-plan-drawer-form">
          <div className="meal-plan-drawer-body">
            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                {error}
              </div>
            )}

            {/* Side-by-Side: Room Number and Room Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
              {/* 1. Room Number */}
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  Room Number
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Enter room number"
                  required
                />
              </div>

              {/* 2. Room Type Custom Select */}
              <div className="meal-plan-drawer-field" style={{ position: 'relative' }} ref={dropdownRef}>
                <label className="meal-plan-drawer-label" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  Room Type
                </label>
                <button
                  type="button"
                  className="meal-plan-drawer-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff'
                  }}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <span style={{ color: selectedRoomType ? '#0F172A' : '#64748B', fontWeight: 500, fontSize: '13.5px' }}>
                    {selectedRoomType ? selectedRoomType.name : 'Select Room Type'}
                  </span>
                  {isDropdownOpen ? (
                    <ChevronUp size={16} color="#64748B" />
                  ) : (
                    <ChevronDown size={16} color="#64748B" />
                  )}
                </button>

                {/* Dropdown Options matching screenshot */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                      zIndex: 100,
                      overflow: 'hidden',
                      padding: '4px 0'
                    }}
                  >
                    {roomTypes.map((rt) => {
                      const isSelected = selectedRoomType?.id === rt.id;
                      return (
                        <div
                          key={rt.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            fontSize: '13.5px',
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? '#0F172A' : '#334155',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#F8FAFC' : 'transparent',
                            transition: 'background-color 0.12s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={() => {
                            setSelectedRoomType(rt);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span>{rt.name}</span>
                          {isSelected && <Check size={16} color="#2563EB" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="meal-plan-drawer-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              className="meal-plan-drawer-btn-cancel"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#0F172A',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="meal-plan-drawer-btn-create"
              style={{
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
              }}
            >
              Update Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

