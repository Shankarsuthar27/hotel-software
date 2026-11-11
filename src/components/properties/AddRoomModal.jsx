import React, { useState, useEffect, useRef } from 'react';
import { DoorClosed, X, ChevronDown, Trash2 } from 'lucide-react';

export default function AddRoomModal({
  isOpen,
  onClose,
  roomTypes = [],
  onAddRooms,
  showToast
}) {
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stagedRooms, setStagedRooms] = useState([]);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRoomNumber('');
      setSelectedRoomType(null);
      setIsDropdownOpen(false);
      setStagedRooms([]);
      setError('');
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleStageRoom = () => {
    if (!roomNumber.trim()) {
      setError('Please enter a room number');
      return;
    }
    if (!selectedRoomType) {
      setError('Please select a room type');
      return;
    }

    // Check duplicate in staged rooms
    if (stagedRooms.some((r) => r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase())) {
      setError(`Room ${roomNumber.trim()} is already added`);
      return;
    }

    setStagedRooms((prev) => [
      ...prev,
      {
        id: `staged_${Date.now()}_${Math.random()}`,
        roomNumber: roomNumber.trim(),
        roomTypeId: selectedRoomType.id,
        roomTypeName: selectedRoomType.name
      }
    ]);

    setRoomNumber('');
    setError('');
  };

  const handleRemoveStagedRoom = (id) => {
    setStagedRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stagedRooms.length === 0) {
      setError('Please add at least one room before submitting');
      return;
    }

    if (onAddRooms) {
      onAddRooms(
        stagedRooms.map((r) => ({
          roomNumber: r.roomNumber,
          roomTypeId: r.roomTypeId
        }))
      );
    }

    if (showToast) {
      showToast(
        `Success: Created ${stagedRooms.length} room${stagedRooms.length !== 1 ? 's' : ''}`
      );
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
        {/* Header (Matching Images 4 & 5) */}
        <div className="meal-plan-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="meal-plan-drawer-icon-badge">
              <DoorClosed size={18} color="#2563EB" />
            </div>
            <h3 className="meal-plan-drawer-title">Add Room</h3>
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

        {/* Form Body (Matching Images 4 & 5) */}
        <form onSubmit={handleSubmit} className="meal-plan-drawer-form">
          <div className="meal-plan-drawer-body">
            {error && (
              <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* Inputs Row: Room Number, Room Type, + Add button */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.6fr auto',
                gap: '12px',
                alignItems: 'flex-end'
              }}
            >
              {/* Field 1: Room Number */}
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">Room Number</label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="e.g. 101"
                  value={roomNumber}
                  onChange={(e) => {
                    setRoomNumber(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleStageRoom();
                    }
                  }}
                />
              </div>

              {/* Field 2: Room Type Custom Dropdown */}
              <div className="meal-plan-drawer-field" style={{ position: 'relative' }} ref={dropdownRef}>
                <label className="meal-plan-drawer-label">Room Type</label>
                <div
                  className="meal-plan-drawer-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span style={{ color: selectedRoomType ? '#0F172A' : '#94A3B8' }}>
                    {selectedRoomType ? selectedRoomType.name : 'Select room type'}
                  </span>
                  <ChevronDown
                    size={16}
                    color="#64748B"
                    style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                </div>

                {/* Dropdown Menu (Matching Image 5) */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                      zIndex: 100,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      padding: '4px'
                    }}
                  >
                    {roomTypes.map((rt) => (
                      <div
                        key={rt.id}
                        style={{
                          padding: '10px 14px',
                          fontSize: '13.5px',
                          color: '#1E293B',
                          fontWeight: selectedRoomType?.id === rt.id ? 600 : 500,
                          backgroundColor:
                            selectedRoomType?.id === rt.id ? '#EFF6FF' : 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedRoomType?.id !== rt.id) {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedRoomType?.id !== rt.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        onClick={() => {
                          setSelectedRoomType(rt);
                          setIsDropdownOpen(false);
                          if (error) setError('');
                        }}
                      >
                        {rt.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* + Add Button */}
              <div>
                <button
                  type="button"
                  onClick={handleStageRoom}
                  disabled={!roomNumber.trim() || !selectedRoomType}
                  style={{
                    height: '40px',
                    padding: '0 18px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor:
                      roomNumber.trim() && selectedRoomType ? '#0F172A' : '#F1F5F9',
                    color: roomNumber.trim() && selectedRoomType ? '#FFFFFF' : '#94A3B8',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor:
                      roomNumber.trim() && selectedRoomType ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Added Rooms Section */}
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '10px'
                }}
              >
                {stagedRooms.length} Added Rooms
              </div>

              {/* Dashed Box (Matching Image 4) */}
              {stagedRooms.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      marginBottom: '10px'
                    }}
                  >
                    <DoorClosed size={20} />
                  </div>
                  <span style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 500 }}>
                    No rooms added yet.
                  </span>
                </div>
              ) : (
                /* Staged Rooms List */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}
                >
                  {stagedRooms.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '13.5px',
                            color: '#0F172A'
                          }}
                        >
                          Room {item.roomNumber}
                        </span>
                        <span style={{ color: '#94A3B8' }}>•</span>
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#2563EB',
                            fontWeight: 600,
                            backgroundColor: '#EFF6FF',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {item.roomTypeName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedRoom(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer (Matching Images 4 & 5) */}
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
              disabled={stagedRooms.length === 0}
              style={{
                opacity: stagedRooms.length === 0 ? 0.6 : 1,
                cursor: stagedRooms.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Create {stagedRooms.length} Room{stagedRooms.length === 1 ? '' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

