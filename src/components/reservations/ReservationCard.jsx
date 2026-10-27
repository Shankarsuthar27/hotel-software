import React from 'react';
import './reservation-card.css';

/**
 * ReservationCard Component
 * Rebuilt exactly according to the authoritative OTAL PMS specification (https://app.otalpms.com/reservations)
 */
export default function ReservationCard({
  reservation = {},
  onSelect,
  onEdit,
  onCardClick,
  isMenuOpen = false,
  onToggleMenu,
  menuRef,
  onCheckIn,
  onCheckOut,
  onRoomMove,
  onCancel,
  onVoucher,
  onInvoice
}) {
  const isCheckedOut = reservation.status === 'checked_out' || reservation.status === 'Checked Out';
  const isInHouse = reservation.status === 'in_house' || reservation.status === 'In-House';
  const isConfirmed = reservation.status === 'confirmed' || reservation.status === 'Confirmed';
  const isCancelled = reservation.status === 'cancelled' || reservation.status === 'Cancelled';
  const isNoShow = reservation.status === 'no_show' || reservation.status === 'No Show';

  let statusLabel = 'Checked Out';
  let statusBadgeStyle = 'bg-lime-600/10 text-lime-600';

  if (isCheckedOut) {
    statusLabel = 'Checked Out';
    statusBadgeStyle = 'bg-lime-600/10 text-lime-600';
  } else if (isNoShow) {
    statusLabel = 'No Show';
    statusBadgeStyle = 'bg-rose-600/10 text-rose-600';
  } else if (isInHouse) {
    statusLabel = 'In-House';
    statusBadgeStyle = 'bg-blue-600/10 text-blue-600';
  } else if (isConfirmed) {
    statusLabel = 'Confirmed';
    statusBadgeStyle = 'bg-emerald-600/10 text-emerald-600';
  } else if (isCancelled) {
    statusLabel = 'Cancelled';
    statusBadgeStyle = 'bg-slate-500/10 text-slate-500';
  } else {
    statusLabel = reservation.status || 'In-House';
    statusBadgeStyle = 'bg-blue-600/10 text-blue-600';
  }

  // Format date helper: "Mon 26, Oct 2026", "Tue 27, Oct 2026"
  const formatCardDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]} ${d.getDate()}, ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const guest = reservation.primaryGuest || {};
  const guestName = guest.name || `${guest.title || ''} ${guest.firstName || ''} ${guest.lastName || ''}`.trim() || reservation.guestName || 'Mr Krishna Kumar';
  const bookingRef = reservation.bookingReference || (reservation.id ? `#${reservation.id.toUpperCase()}` : '#RES_5');

  const checkInDateText = reservation.checkInDate ? formatCardDate(reservation.checkInDate) : 'Mon 26, Oct 2026';
  const checkOutDateText = reservation.checkOutDate ? formatCardDate(reservation.checkOutDate) : 'Tue 27, Oct 2026';

  const nightsCount = reservation.nights !== undefined
    ? reservation.nights
    : (reservation.checkInDate && reservation.checkOutDate
        ? Math.max(1, Math.round((new Date(reservation.checkOutDate) - new Date(reservation.checkInDate)) / (1000 * 60 * 60 * 24)))
        : 1);
  const nightsText = `${nightsCount} ${nightsCount === 1 ? 'Night' : 'Nights'}`;

  const bookingDateText = reservation.bookingDateFormatted || '26 Oct 2026, 1:08 PM';
  const roomsCount = reservation.roomsCount || 1;
  const adultsCount = reservation.adults !== undefined ? reservation.adults : 1;
  const childrenCount = reservation.children !== undefined ? reservation.children : 2;
  const sourceText = reservation.bookingSource === 'WALK_IN' ? 'walk-in' : (reservation.bookingSource?.toLowerCase() || 'walk-in');

  const totalText = Number(reservation.totalAmount !== undefined ? reservation.totalAmount : 2625).toFixed(2);
  const paidText = Number(reservation.paidAmount !== undefined ? reservation.paidAmount : 2625).toFixed(2);
  const balanceVal = reservation.balanceDue !== undefined
    ? Number(reservation.balanceDue)
    : (Number(totalText) - Number(paidText));
  const balanceText = Number(Math.max(0, balanceVal)).toFixed(2);

  const radixButtonId = reservation.buttonId || (reservation.id ? `radix-${reservation.id}` : 'radix-_r_8h_');

  const [showPrintSubmenu, setShowPrintSubmenu] = React.useState(false);

  React.useEffect(() => {
    if (!isMenuOpen) {
      setShowPrintSubmenu(false);
    }
  }, [isMenuOpen]);

  return (
    <div
      className={`res-card-wrapper ${isMenuOpen ? 'menu-active' : ''}`}
      onClick={() => {
        if (onCardClick) onCardClick(reservation);
        else if (onEdit) onEdit(reservation);
        else if (onSelect) onSelect(reservation);
      }}
    >
      <div className="p-3 sm:p-4 flex flex-col max-[1260px]:gap-2 gap-4">
        {/* Header Row: Hotel Icon, Guest Name, Ref, Status Badge, More Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="bg-blue-100 flex p-2 rounded-sm shrink-0">
              <span className="material-symbols-outlined select-none text-blue-500" style={{ fontSize: '20px' }}>
                hotel
              </span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="cursor-pointer group/name inline-block w-fit">
                <p className="small-title-4 font-bold text-[#1E293B] group-hover/name:text-blue-600 group-hover/name:underline transition-colors text-ellipsis overflow-hidden whitespace-nowrap">
                  {guestName}
                </p>
              </div>
              <p className="small-title-2 text-gray-500 font-medium">
                {bookingRef}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5">
              <div className={`inline-flex items-center justify-center gap-1 small-title-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${statusBadgeStyle} rounded-full px-2 py-0.5 small-title-2 font-semibold border-none shrink-0 whitespace-nowrap`}>
                {statusLabel}
              </div>
            </div>
          </div>

          <div
            className="res-card-menu-anchor relative shrink-0 ml-2"
            style={{ position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="inline-flex items-center justify-center whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent-foreground hover:bg-slate-100/80 rounded-lg cursor-pointer h-8 w-8 p-0 transition-all duration-200 active:scale-95"
              type="button"
              id={radixButtonId}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              data-state={isMenuOpen ? "open" : "closed"}
              onClick={onToggleMenu}
            >
              <span className="material-symbols-outlined select-none text-slate-500" style={{ fontSize: '20px' }}>
                more_vert
              </span>
            </button>

            {/* Radix Menu Dropdown */}
            {isMenuOpen && (
              <div ref={menuRef} className="radix-card-menu" role="menu">
                {isCheckedOut ? (
                  <>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(reservation);
                        else if (onCardClick) onCardClick(reservation);
                        else if (onSelect) onSelect(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                      <span>View</span>
                    </button>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelect) onSelect(reservation);
                        else if (onCardClick) onCardClick(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">group</span>
                      <span>Group List</span>
                    </button>
                    <div
                      className="radix-menu-item-sub-trigger"
                      onMouseEnter={() => setShowPrintSubmenu(true)}
                      onMouseLeave={() => setShowPrintSubmenu(false)}
                    >
                      <button
                        className={`radix-menu-item ${showPrintSubmenu ? 'active' : ''}`}
                        role="menuitem"
                        aria-haspopup="menu"
                        aria-expanded={showPrintSubmenu}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPrintSubmenu((prev) => !prev);
                        }}
                      >
                        <span className="material-symbols-outlined">print</span>
                        <span>Print</span>
                        <span className="material-symbols-outlined chevron-icon">chevron_right</span>
                      </button>

                      {showPrintSubmenu && (
                        <div className="radix-card-submenu" role="menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="radix-menu-item"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onVoucher) onVoucher(reservation);
                              setShowPrintSubmenu(false);
                              if (onToggleMenu) onToggleMenu(e);
                            }}
                          >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span>Print Voucher</span>
                          </button>
                          <button
                            className="radix-menu-item"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onInvoice) onInvoice(reservation);
                              setShowPrintSubmenu(false);
                              if (onToggleMenu) onToggleMenu(e);
                            }}
                          >
                            <span className="material-symbols-outlined">description</span>
                            <span>Print Invoice</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCardClick) onCardClick(reservation);
                        else if (onSelect) onSelect(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                      <span>View</span>
                    </button>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelect) onSelect(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">group</span>
                      <span>Group List</span>
                    </button>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(reservation);
                        else if (onSelect) onSelect(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelect) onSelect(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">calendar_today</span>
                      <span>Amend Stay</span>
                    </button>
                    <button
                      className="radix-menu-item"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRoomMove) onRoomMove(reservation);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">bed</span>
                      <span>Room Move</span>
                    </button>
                    <div
                      className="radix-menu-item-sub-trigger"
                      onMouseEnter={() => setShowPrintSubmenu(true)}
                      onMouseLeave={() => setShowPrintSubmenu(false)}
                    >
                      <button
                        className={`radix-menu-item ${showPrintSubmenu ? 'active' : ''}`}
                        role="menuitem"
                        aria-haspopup="menu"
                        aria-expanded={showPrintSubmenu}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPrintSubmenu((prev) => !prev);
                        }}
                      >
                        <span className="material-symbols-outlined">print</span>
                        <span>Print</span>
                        <span className="material-symbols-outlined chevron-icon">chevron_right</span>
                      </button>

                      {showPrintSubmenu && (
                        <div className="radix-card-submenu" role="menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="radix-menu-item"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onVoucher) onVoucher(reservation);
                              setShowPrintSubmenu(false);
                              if (onToggleMenu) onToggleMenu(e);
                            }}
                          >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span>Print Voucher</span>
                          </button>
                          <button
                            className="radix-menu-item"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onInvoice) onInvoice(reservation);
                              setShowPrintSubmenu(false);
                              if (onToggleMenu) onToggleMenu(e);
                            }}
                          >
                            <span className="material-symbols-outlined">description</span>
                            <span>Print Invoice</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {isConfirmed && (
                      <button
                        className="radix-menu-item action-checkin"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCheckIn) onCheckIn(reservation);
                          if (onToggleMenu) onToggleMenu(e);
                        }}
                      >
                        <span className="material-symbols-outlined">login</span>
                        <span>Check-in</span>
                      </button>
                    )}
                    {isInHouse && (
                      <button
                        className="radix-menu-item action-checkout"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCheckOut) onCheckOut(reservation);
                          if (onToggleMenu) onToggleMenu(e);
                        }}
                      >
                        <span className="material-symbols-outlined">logout</span>
                        <span>Check-out</span>
                      </button>
                    )}
                    <div className="radix-menu-divider" />
                    <button
                      className="radix-menu-item danger"
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCancel) onCancel(reservation.id);
                        if (onToggleMenu) onToggleMenu(e);
                      }}
                    >
                      <span className="material-symbols-outlined">close</span>
                      <span>Cancel Reservation</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Check-in / Check-out Row */}
        <div className="flex flex-col gap-3 border-y border-gray-100 py-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="small-title-2 font-semibold text-gray-600">Check-in</span>
              <span className="small-title-2 font-semibold text-gray-700">{checkInDateText}</span>
            </div>
            <div className="bg-[#DBEAFE] text-blue-600 px-2.5 sm:px-3 py-1 rounded-full small-title-2 sm:small-title-2 font-semibold shrink-0">
              {nightsText}
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="small-title-2 font-semibold text-gray-600">Check-out</span>
              <span className="small-title-2 font-semibold text-gray-700">{checkOutDateText}</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-1 flex">
              <div className="w-1/2 flex flex-col">
                <span className="small-title-2 text-black font-semibold">Booking Date</span>
                <span className="small-title-2 text-gray-600 font-medium">{bookingDateText}</span>
              </div>
              <div className="w-1/2 flex justify-end items-center gap-2">
              </div>
            </div>
          </div>

          <div className="w-full flex justify-between">
            <div className="flex-1 flex justify-between">
              <div className="w-[30%] flex flex-col">
                <span className="small-title-2 text-black font-semibold">Rooms</span>
                <span className="small-title-2 text-gray-700 font-medium">{roomsCount}</span>
              </div>
              <div className="w-[30%] flex items-center justify-end gap-2">
                <div className="flex items-end gap-0.5 cursor-pointer" data-state="closed">
                  <div className="h-5.75">
                    <span className="material-symbols-outlined select-none text-gray-600" style={{ fontSize: '20px' }}>
                      man
                    </span>
                  </div>
                  <span className="small-title-2 text-gray-500 font-medium -ml-1">{adultsCount}</span>
                </div>
                <div className="flex items-end gap-0.5 cursor-pointer" data-state="closed">
                  <div className="h-4.75">
                    <span className="material-symbols-outlined select-none text-gray-600" style={{ fontSize: '17px' }}>
                      child_care
                    </span>
                  </div>
                  <span className="small-title-2 text-gray-500 font-medium -ml-px">{childrenCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-between">
            <div className="w-[40%] flex flex-col">
              <span className="small-title-2 text-black font-semibold">Source</span>
              <span className="small-title-2 text-gray-700 font-medium truncate" title={sourceText}>
                {sourceText}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary Box */}
        <div className="bg-[#F8FAFC]/80 rounded-sm max-[1260px]:p-2 p-2.5 flex flex-col gap-1.5 border border-slate-100">
          <div className="flex items-center justify-between small-title-2 text-gray-600">
            <span>Total</span>
            <span className="small-title-4 font-semibold text-gray-900">{totalText}</span>
          </div>
          <div className="flex items-center justify-between small-title-2 text-gray-600">
            <span>Paid</span>
            <span className="small-title-4 font-semibold text-gray-900">{paidText}</span>
          </div>
          <div className="flex items-center justify-between small-title-2 font-bold pt-1 border-t border-dashed border-slate-200">
            <span className="text-gray-800">Balance</span>
            <span className={Number(balanceVal) > 0 ? "text-rose-600" : "text-black"}>{balanceText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
