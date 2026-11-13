import React from 'react';
import { UserCheck, Calendar, Wrench, PlusCircle } from 'lucide-react';
import './room-card.css';

// Helper to format checkout date into: "Checkout: Fri 13, Nov 2026"
const formatCheckoutDate = (dateStr) => {
  if (!dateStr) return 'Checkout: Fri 13, Nov 2026';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  if (isNaN(d.getTime())) return `Checkout: ${dateStr}`;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Checkout: ${days[d.getDay()]} ${d.getDate()}, ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function RoomCard({
  room,
  isSelected = false,
  onToggleSelect,
  onUpdateStatus,
  onOpenMaintenance,
  onOpenReservation,
  onNewReservation,
  onClick,
  activeReservation
}) {
  const roomNumber = room?.roomNumber || '101';
  const isDirty = room?.status === 'dirty';
  const isMaintenance = room?.status === 'maintenance';
  const isOccupied = !isDirty && !isMaintenance && !!activeReservation && room?.status !== 'clean';
  const isAvailable = !isOccupied && !isDirty && !isMaintenance;

  // --------------------------------------------------------------------------
  // 1. OCCUPIED ROOM CARD (Matching Room 102 in reference image)
  // --------------------------------------------------------------------------
  if (isOccupied) {
    const guestName =
      activeReservation?.primaryGuest?.name ||
      `${activeReservation?.primaryGuest?.title || ''} ${activeReservation?.primaryGuest?.firstName || ''} ${activeReservation?.primaryGuest?.lastName || ''}`.trim() ||
      activeReservation?.guestName ||
      'In-House Guest';

    const checkoutText = formatCheckoutDate(activeReservation?.checkOutDate);

    return (
      <div
        className="hk-room-card hk-card-occupied"
        onClick={onClick}
        title={`Room ${roomNumber} - Occupied by ${guestName}`}
      >
        {/* Navy solid top bar */}
        <div className="hk-card-accent-bar" />

        <div className="hk-card-inner">
          {/* Header Row: Room number + Occupied badge + UserCheck icon */}
          <div className="hk-card-header-row">
            <div className="hk-card-header-left">
              <span className="hk-card-room-num">{roomNumber}</span>
              <span className="hk-badge-pill hk-badge-occupied">Occupied</span>
            </div>
            <div className="hk-card-actions">
              <UserCheck size={19} className="text-blue-950" strokeWidth={2.2} />
            </div>
          </div>

          {/* Guest Name */}
          <div className="hk-card-guest-name">
            {guestName}
          </div>

          {/* Checkout Info */}
          <div className="hk-card-checkout-row">
            <Calendar size={13} className="text-slate-400" />
            <span>{checkoutText}</span>
          </div>

          {/* Tags: In Room + Stayover */}
          <div className="hk-card-tags-row">
            <span className="hk-card-tag">In Room</span>
            <span className="hk-card-tag">Stayover</span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. VACANT ROOM CARD (Available, Dirty, or Maintenance)
  // --------------------------------------------------------------------------
  let cardClass = 'hk-card-available';
  let badgeClass = 'hk-badge-available';
  let badgeLabel = 'Available';
  let defaultSubtext = 'Ready for check-in';

  if (isDirty) {
    cardClass = 'hk-card-dirty';
    badgeClass = 'hk-badge-dirty';
    badgeLabel = 'Dirty';
    defaultSubtext = (room?.notes && room.notes !== 'Ready for check-in') ? room.notes : 'Needs cleaning';
  } else if (isMaintenance) {
    cardClass = 'hk-card-maintenance';
    badgeClass = 'hk-badge-maintenance';
    badgeLabel = 'Maintenance';
    defaultSubtext = (room?.notes && room.notes !== 'Ready for check-in') ? room.notes : 'Out of order';
  } else {
    // Available
    if (roomNumber === '101' && room?.notes && room.notes !== 'Ready for check-in') {
      defaultSubtext = room.notes;
    } else {
      defaultSubtext = room?.notes || 'Ready for check-in';
    }
  }

  // Handlers
  const handleToggleDirty = (e) => {
    e.stopPropagation();
    const nextStatus = isDirty ? 'clean' : 'dirty';
    if (onUpdateStatus) {
      onUpdateStatus(room?.id || room?.roomNumber, nextStatus);
    }
  };

  const handleMaintenanceClick = (e) => {
    e.stopPropagation();
    if (onOpenMaintenance) {
      onOpenMaintenance(room);
    } else if (onUpdateStatus) {
      onUpdateStatus(room.id, isMaintenance ? 'clean' : 'maintenance');
    }
  };

  const handleReservationClick = (e) => {
    e.stopPropagation();
    if (onNewReservation) {
      onNewReservation(room?.id || room?.roomNumber);
    } else if (onOpenReservation) {
      onOpenReservation(room);
    } else {
      window.location.href = '/reservations/create';
    }
  };

  return (
    <div
      className={`hk-room-card ${cardClass} ${isSelected ? 'hk-card-selected' : ''}`}
      onClick={onClick}
    >
      {/* Top solid colored accent bar */}
      <div className="hk-card-accent-bar" />

      <div className="hk-card-inner">
        {/* Header Row: Checkbox + Room number + 3 Action Icons */}
        <div className="hk-card-header-row">
          <div className="hk-card-header-left">
            <input
              type="checkbox"
              className="hk-card-checkbox"
              checked={isSelected}
              title={`Select room ${roomNumber}`}
              onChange={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(room?.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="hk-card-room-num">{roomNumber}</span>
          </div>

          <div className="hk-card-actions">
            {/* 1. Broom / Mop Icon (Clean / Dirty toggle) */}
            <button
              type="button"
              className="hk-card-action-btn"
              title={isDirty ? 'Mark Available / Clean' : 'Mark Dirty'}
              onClick={handleToggleDirty}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v7" />
                <path d="M5 9h14l-1.5 11a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2L5 9z" />
                <path d="M8 15h8" />
              </svg>
            </button>

            {/* 2. Tool / Wrench Icon (Maintenance) */}
            <button
              type="button"
              className="hk-card-action-btn"
              title="Maintenance / Block Room"
              onClick={handleMaintenanceClick}
            >
              <Wrench size={15} strokeWidth={2} />
            </button>

            {/* 3. Plus Circle Icon (Create Reservation) */}
            <button
              type="button"
              className="hk-card-action-btn"
              title="Create Reservation for Room"
              onClick={handleReservationClick}
            >
              <PlusCircle size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ marginTop: '10px', marginBottom: '4px' }}>
          <span className={`hk-badge-pill ${badgeClass}`}>{badgeLabel}</span>
        </div>

        {/* Subtext */}
        <div className="hk-card-subtext">
          {defaultSubtext}
        </div>
      </div>
    </div>
  );
}
