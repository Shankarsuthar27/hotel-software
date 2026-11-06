import React from 'react';
import './room-card.css';

// Helper to format checkout date into: "Checkout: Tue 27, Oct 2026"
const formatCheckoutDate = (dateStr) => {
  if (!dateStr) return '';
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
  const isOccupied = !!activeReservation;
  const isDirty = room?.status === 'dirty';
  const isMaintenance = room?.status === 'maintenance';
  const status = isOccupied ? 'occupied' : (room?.status || 'clean');

  // =========================================================================
  // 1. CARD VARIANT A: OCCUPIED ROOM CARD (Exact match to OTAL PMS Specification)
  // =========================================================================
  if (isOccupied) {
    const guestName =
      activeReservation?.primaryGuest?.name ||
      `${activeReservation?.primaryGuest?.title || ''} ${activeReservation?.primaryGuest?.firstName || ''} ${activeReservation?.primaryGuest?.lastName || ''}`.trim() ||
      'Mr Kkk Suthar';
    const checkoutText = formatCheckoutDate(activeReservation?.checkOutDate);

    const occupiedBorderClass = isDirty
      ? 'border-[#EF4444]'
      : isMaintenance
      ? 'border-[#F59E0B]'
      : 'border-[#3B82F6]';

    return (
      <div
        className={`group relative bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md ${occupiedBorderClass} cursor-pointer sp-e6`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-4 sp-e7">
          <div className="flex items-center gap-2 sp-e8">
            <span className="title-3 font-bold text-slate-800 sp-e10">{roomNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 sp-e11">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3B82F6]/10 text-[#3B82F6]">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>
                person
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-1 sp-e16">
          <p className="small-title-2 font-semibold truncate text-[#3B82F6] sp-e17">
            {guestName}
          </p>
          <p className="small-title-2 text-slate-500 truncate sp-e18">
            {checkoutText}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CARD VARIANT B: VACANT / INTERACTIVE ROOM CARD (Exact match to OTAL PMS Specification)
  // =========================================================================
  let borderColorClass = 'border-[#22C55E]';
  let statusTitle = 'Available';
  let statusColorClass = 'text-[#22C55E]';
  let statusColor = '#22c55e';
  let statusSubtitle = room?.notes || 'Ready for check-in';

  if (isSelected) {
    borderColorClass = 'border-blue-600 ring-2 ring-blue-500/20';
  } else if (isDirty || status === 'dirty') {
    borderColorClass = 'border-[#EF4444]';
    statusTitle = 'Dirty';
    statusColorClass = 'text-[#EF4444]';
    statusColor = '#ef4444';
    statusSubtitle = room?.notes || 'Ready for check-in';
  } else if (isMaintenance || status === 'maintenance') {
    borderColorClass = 'border-[#F59E0B]';
    statusTitle = 'Out of order';
    statusColorClass = 'text-[#F59E0B]';
    statusColor = '#f59e0b';
    statusSubtitle = room?.notes || 'Under maintenance';
  }

  // Housekeeping toggle handler (toggles Available <-> Dirty)
  const handleToggleDirty = (e) => {
    e.stopPropagation();
    if (onUpdateStatus) {
      onUpdateStatus(room.id, isDirty || status === 'dirty' ? 'clean' : 'dirty');
    }
  };

  // Maintenance modal open handler
  const handleMaintenanceClick = (e) => {
    e.stopPropagation();
    if (onOpenMaintenance) {
      onOpenMaintenance(room);
    } else if (onUpdateStatus) {
      onUpdateStatus(room.id, status === 'maintenance' ? 'clean' : 'maintenance');
    }
  };

  // Create reservation click handler
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
      onClick={onClick}
      className={`group relative bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md ${borderColorClass} cursor-pointer sp-e6`}
    >
      <div className="flex justify-between items-start mb-4 sp-e7">
        <div className="flex items-center gap-2 sp-e8">
          <button
            type="button"
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
              isSelected
                ? 'border-blue-600 bg-blue-600'
                : 'border-slate-300 hover:border-blue-400 bg-white'
            } sp-e9`}
            title="Select room for reservation"
            aria-label={`Select room ${roomNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSelect) onToggleSelect(room?.id);
            }}
          >
            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
          </button>
          <span className="title-3 font-bold text-slate-800 sp-e10">{roomNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 sp-e11">
          <button
            type="button"
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isDirty || status === 'dirty'
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
            } sp-e12`}
            title={isDirty || status === 'dirty' ? 'Mark Clean' : 'Mark Dirty'}
            onClick={handleToggleDirty}
          >
            <span className="material-symbols-outlined select-none sp-e13" style={{ fontSize: '16px' }}>
              cleaning_services
            </span>
          </button>
          <button
            type="button"
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isMaintenance || status === 'maintenance'
                ? 'text-rose-600 bg-rose-50'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            } sp-e12`}
            title="Mark Maintenance"
            onClick={handleMaintenanceClick}
          >
            <span className="material-symbols-outlined select-none sp-e13" style={{ fontSize: '16px' }}>
              build
            </span>
          </button>
          <button
            type="button"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer sp-e14"
            title="Create Reservation"
            onClick={handleReservationClick}
          >
            <span className="material-symbols-outlined select-none sp-e15" style={{ fontSize: '18px' }}>
              add_circle
            </span>
          </button>
        </div>
      </div>
      <div className="space-y-1 sp-e16">
        <p
          className={`small-title-2 font-semibold truncate ${statusColorClass} sp-e17`}
          style={{ color: statusColor }}
        >
          {statusTitle}
        </p>
        <p className="small-title-2 text-slate-500 truncate sp-e18">
          {statusSubtitle}
        </p>
      </div>
    </div>
  );
}
