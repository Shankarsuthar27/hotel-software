import React, { useState, useEffect, useRef } from 'react';
import { User, Smile } from 'lucide-react';
import './reservations-list.css';
import './reservation-card.css';

// SVG Bed icon matching image
const BedIcon = ({ size = 18, color = '#2563eb' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

// Date formatter matching image: "Mon 26, Oct 2026"
export const formatStayDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  if (isNaN(d.getTime())) return dateStr;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} ${d.getDate()}, ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function ReservationsListView({
  reservations = [],
  onSelectReservation,
  onEditReservation,
  onCheckIn,
  onCheckOut,
  onRoomMove,
  onOpenVoucher,
  onOpenInvoice,
  onCancelReservation,
  onNoShowReservation,
  onOpenDetailsDrawer,
  onGroupList
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showPrintSubmenu, setShowPrintSubmenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside or escape
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
        setShowPrintSubmenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
        setShowPrintSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  const getStatusBadge = (rawStatus) => {
    const status = (rawStatus || '').toLowerCase().replace('-', '_').replace(' ', '_');
    switch (status) {
      case 'checked_out':
        return { label: 'Checked Out', className: 'status-checked-out' };
      case 'confirmed':
        return { label: 'Confirmed', className: 'status-confirmed' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'status-cancelled' };
      case 'in_house':
        return { label: 'In-House', className: 'status-in-house' };
      case 'no_show':
        return { label: 'No-Show', className: 'status-no-show' };
      default:
        return { label: rawStatus || 'In-House', className: 'status-in-house' };
    }
  };

  return (
    <div className="res-list-container">
      <div className="res-table-wrap">
        <table className="res-list-table">
          <thead>
            <tr className="res-list-thead-row">
              <th className="res-th-guest">Guest</th>
              <th className="res-th-code">Number/Code</th>
              <th className="res-th-booking-date">Booking Date</th>
              <th className="res-th-nights">Nights</th>
              <th className="res-th-stay-dates">Stay Dates</th>
              <th className="res-th-status">Status</th>
              <th className="res-th-actions th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No reservations found matching the current filters.
                </td>
              </tr>
            ) : (
              reservations.map((res, idx) => {
                const guest = res.primaryGuest || {};
                const guestName =
                  guest.name ||
                  `${guest.title || ''} ${guest.firstName || ''} ${guest.lastName || ''}`.trim() ||
                  res.guestName ||
                  'Mr Krishna Kumar';

                const bookingRef =
                  res.bookingReference ||
                  (res.id ? `#${res.id.toUpperCase()}` : '#RES_5');

                const bookingDate =
                  res.bookingDateFormatted || res.createdAt || '26 Oct 2026, 1:08 PM';

                const nights =
                  res.nights !== undefined
                    ? res.nights
                    : res.checkInDate && res.checkOutDate
                    ? Math.max(
                        1,
                        Math.round(
                          (new Date(res.checkOutDate) - new Date(res.checkInDate)) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                    : 1;

                const checkInFormatted = formatStayDate(res.checkInDate || '2026-10-26');
                const checkOutFormatted = formatStayDate(res.checkOutDate || '2026-10-27');

                const adults = res.adults !== undefined ? res.adults : 1;
                const children = res.children !== undefined ? res.children : 0;

                const statusInfo = getStatusBadge(res.status);
                const isMenuOpen = openMenuId === res.id;

                const statusNorm = (res.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
                const isConfirmed = statusNorm === 'confirmed';
                const isInHouse = statusNorm === 'in_house';
                const isCheckedOut = statusNorm === 'checked_out';
                const isCancelled = statusNorm === 'cancelled';
                const isNoShow = statusNorm === 'no_show';

                const openUpwards = reservations.length > 2 && idx >= reservations.length - 2;

                return (
                  <tr key={res.id} className={`res-list-tbody-row ${isMenuOpen ? 'row-menu-open' : ''}`}>
                    {/* 1. Guest Column */}
                    <td className="res-td-guest">
                      <div className="res-guest-cell">
                        <div className="res-bed-icon-box">
                          <BedIcon size={18} color="#2563eb" />
                        </div>
                        <div className="res-guest-info">
                          <span
                            className="res-guest-name"
                            onClick={() => onOpenDetailsDrawer && onOpenDetailsDrawer(res)}
                            title="Click to view booking details"
                          >
                            {guestName}
                          </span>
                          <div className="res-guest-occupancy">
                            <span className="res-occupancy-item">
                              <User size={13} className="res-occupancy-icon" />
                              <span>{adults}</span>
                            </span>
                            <span className="res-occupancy-item">
                              <Smile size={13} className="res-occupancy-icon" />
                              <span>{children}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Number/Code Column */}
                    <td className="res-td-code">
                      <span
                        className="res-code-cell"
                        onClick={() => onOpenDetailsDrawer && onOpenDetailsDrawer(res)}
                        title="Click to view details"
                      >
                        {bookingRef}
                      </span>
                    </td>

                    {/* 3. Booking Date Column */}
                    <td className="res-td-booking-date">
                      <span className="res-date-cell">{bookingDate}</span>
                    </td>

                    {/* 4. Nights Column */}
                    <td className="res-td-nights">
                      <span className="res-nights-cell">{nights}</span>
                    </td>

                    {/* 5. Stay Dates Column */}
                    <td className="res-td-stay-dates">
                      <div className="res-stay-dates-cell">
                        <span>{checkInFormatted}</span>
                        <span className="res-stay-dates-arrow">→</span>
                        <span>{checkOutFormatted}</span>
                      </div>
                    </td>

                    {/* 6. Status Column */}
                    <td className="res-td-status">
                      <span className={`res-status-pill ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* 7. Actions Column */}
                    <td className={`res-td-actions res-actions-cell ${isMenuOpen ? 'menu-open' : ''}`} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`res-action-btn ${isMenuOpen ? 'active' : ''}`}
                        title="More Actions"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        data-state={isMenuOpen ? 'open' : 'closed'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : res.id);
                          setShowPrintSubmenu(false);
                        }}
                      >
                        <span className="material-symbols-outlined select-none text-slate-500" style={{ fontSize: '20px' }}>
                          more_vert
                        </span>
                      </button>

                      {/* Radix Menu Dropdown - Matching exact OTAL PMS specification */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className={`radix-card-menu ${openUpwards ? 'open-upwards' : ''}`}
                          role="menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isInHouse ? (
                            /* Exact In-House Reservation Menu matching user specification */
                            <>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onEditReservation) onEditReservation(res);
                                  else if (onSelectReservation) onSelectReservation(res);
                                }}
                              >
                                <span className="material-symbols-outlined">edit_square</span>
                                <span>Edit</span>
                              </button>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onEditReservation) onEditReservation(res);
                                  else if (onSelectReservation) onSelectReservation(res);
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
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onRoomMove) onRoomMove(res);
                                }}
                              >
                                <span className="material-symbols-outlined">bed</span>
                                <span>Room Move</span>
                              </button>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onGroupList) onGroupList(res);
                                  else if (onSelectReservation) onSelectReservation(res);
                                  else if (onOpenDetailsDrawer) onOpenDetailsDrawer(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenVoucher) onOpenVoucher(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenInvoice) onOpenInvoice(res);
                                      }}
                                    >
                                      <span className="material-symbols-outlined">description</span>
                                      <span>Print Invoice</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                className="radix-menu-item action-checkout"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onCheckOut) onCheckOut(res);
                                }}
                              >
                                <span className="material-symbols-outlined">logout</span>
                                <span>Check-out</span>
                              </button>
                            </>
                          ) : isCheckedOut ? (
                            /* Checked Out Menu: View, Group List, Print */
                            <>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onOpenDetailsDrawer) onOpenDetailsDrawer(res);
                                  else if (onEditReservation) onEditReservation(res);
                                  else if (onSelectReservation) onSelectReservation(res);
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
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onGroupList) onGroupList(res);
                                  else if (onSelectReservation) onSelectReservation(res);
                                  else if (onOpenDetailsDrawer) onOpenDetailsDrawer(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenVoucher) onOpenVoucher(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenInvoice) onOpenInvoice(res);
                                      }}
                                    >
                                      <span className="material-symbols-outlined">description</span>
                                      <span>Print Invoice</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (isCancelled || isNoShow) ? (
                            /* Cancelled / No-Show Menu: View, Group List, Print */
                            <>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onOpenDetailsDrawer) onOpenDetailsDrawer(res);
                                  else if (onSelectReservation) onSelectReservation(res);
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
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onGroupList) onGroupList(res);
                                  else if (onSelectReservation) onSelectReservation(res);
                                  else if (onOpenDetailsDrawer) onOpenDetailsDrawer(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenVoucher) onOpenVoucher(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenInvoice) onOpenInvoice(res);
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
                            /* Confirmed Reservation Menu matching exact specification */
                            <>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onEditReservation) onEditReservation(res);
                                  else if (onSelectReservation) onSelectReservation(res);
                                }}
                              >
                                <span className="material-symbols-outlined">edit_square</span>
                                <span>Edit</span>
                              </button>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onEditReservation) onEditReservation(res);
                                  else if (onSelectReservation) onSelectReservation(res);
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
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onRoomMove) onRoomMove(res);
                                }}
                              >
                                <span className="material-symbols-outlined">bed</span>
                                <span>Room Move</span>
                              </button>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onGroupList) onGroupList(res);
                                  else if (onSelectReservation) onSelectReservation(res);
                                  else if (onOpenDetailsDrawer) onOpenDetailsDrawer(res);
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
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onCancelReservation) onCancelReservation(res.id);
                                }}
                              >
                                <span className="material-symbols-outlined">close</span>
                                <span>Cancel Reservation</span>
                              </button>
                              <button
                                className="radix-menu-item"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onNoShowReservation) onNoShowReservation(res.id);
                                  else if (onCancelReservation) onCancelReservation(res.id);
                                }}
                              >
                                <span className="material-symbols-outlined">block</span>
                                <span>No-Show</span>
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenVoucher) onOpenVoucher(res);
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
                                        setOpenMenuId(null);
                                        setShowPrintSubmenu(false);
                                        if (onOpenInvoice) onOpenInvoice(res);
                                      }}
                                    >
                                      <span className="material-symbols-outlined">description</span>
                                      <span>Print Invoice</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                className="radix-menu-item action-checkin"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setShowPrintSubmenu(false);
                                  if (onCheckIn) onCheckIn(res);
                                }}
                              >
                                <span className="material-symbols-outlined">login</span>
                                <span>Check-in</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
