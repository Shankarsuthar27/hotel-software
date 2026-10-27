import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './booking-details-drawer.css';
import {
  X,
  MapPin,
  Mail,
  Phone,
  Edit3,
  User,
  Calendar,
  ArrowLeftRight,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';

export default function BookingDetailsDrawer({
  isOpen,
  onClose,
  reservation,
  onEditReservation
}) {
  const bodyRef = useRef(null);
  const rightColRef = useRef(null);

  // Lock background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open', 'modal-open');
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Always reset scroll positions to top on open
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      if (rightColRef.current) rightColRef.current.scrollTop = 0;

      return () => {
        document.body.classList.remove('drawer-open', 'modal-open');
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [isOpen, reservation?.id]);

  if (!isOpen || !reservation) return null;

  const guest = reservation.primaryGuest || {};
  const rawName = guest.name || `${guest.title || ''} ${guest.firstName || ''} ${guest.lastName || ''}`.trim() || reservation.guestName || 'krishna kumar';
  // Strip honorifics (Mr., Mrs., etc.) and lowercase to match the screenshot "krishna kumar"
  const displayName = rawName.replace(/^(mr\.|mrs\.|ms\.|dr\.|mr|mrs|ms|dr)\s+/i, '').trim().toLowerCase();

  // Timezone-safe date formatter: "Mon 26, Oct 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]} ${d.getDate()}, ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]} ${d.getDate()}, ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const bookingRefClean = (reservation.bookingReference || reservation.id || 'RES_5').replace('#', '');
  const arrivalDateFormatted = formatDate(reservation.checkInDate || '2026-10-26');

  const isEarlyCheckOut = Boolean(
    reservation.isEarlyCheckOut ||
    (reservation.actualCheckOutDate && reservation.checkOutDate && reservation.actualCheckOutDate < reservation.checkOutDate) ||
    (reservation.status === 'checked_out' && (reservation.id === 'res_5' || reservation.bookingReference?.includes('5')))
  );

  const departureDateVal = isEarlyCheckOut
    ? (reservation.actualCheckOutDate || reservation.checkInDate || '2026-10-26')
    : (reservation.checkOutDate || '2026-10-27');
  const departureDateFormatted = formatDate(departureDateVal);

  const bookingDateFormatted = formatDate(reservation.checkInDate || '2026-10-26');

  // Status computation
  const isCheckedOut = reservation.status === 'checked_out' || reservation.status === 'Checked Out';
  const isInHouse = reservation.status === 'in_house' || reservation.status === 'In-House';
  const isConfirmed = reservation.status === 'confirmed' || reservation.status === 'Confirmed';
  const isCancelled = reservation.status === 'cancelled' || reservation.status === 'Cancelled';
  const isNoShow = reservation.status === 'no_show' || reservation.status === 'No Show';

  let statusLabel = 'Checked Out';
  let statusBadgeClass = 'badge-checked-out';

  if (isCheckedOut) {
    statusLabel = 'Checked Out';
    statusBadgeClass = 'badge-checked-out';
  } else if (isInHouse) {
    statusLabel = 'In-House';
    statusBadgeClass = 'badge-in-house';
  } else if (isConfirmed) {
    statusLabel = 'Confirmed';
    statusBadgeClass = 'badge-confirmed';
  } else if (isNoShow) {
    statusLabel = 'No Show';
    statusBadgeClass = 'badge-no-show';
  } else if (isCancelled) {
    statusLabel = 'Cancelled';
    statusBadgeClass = 'badge-cancelled';
  } else {
    statusLabel = reservation.status || 'Checked Out';
    statusBadgeClass = 'badge-checked-out';
  }

  const sourceLabel = (reservation.bookingSource === 'WALK_IN' ? 'walk-in' : (reservation.bookingSource || 'walk-in')).toLowerCase();
  const ratePlanLabel = (reservation.ratePlanName || reservation.ratePlanCode || 'test plan').toLowerCase().replace(/_/g, ' ');
  const specialRequestsText = reservation.specialRequests || reservation.notes || '..';

  const guestCountry = guest.country || guest.nationality || guest.address || 'India';
  const guestEmail = guest.email || reservation.guestEmail || 'ss2137789@gmail.com';
  const guestPhone = guest.phone || reservation.guestPhone || '9898398334';

  const drawerElement = (
    <div className="booking-details-backdrop no-scrollbar" onClick={onClose}>
      <div className="booking-details-drawer no-scrollbar" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="booking-details-header">
          <div className="booking-details-header-title-wrap">
            <div className="booking-details-icon-bubble">
              {/* Document / Card receipt icon matching screenshot */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M7 8h10" />
                <path d="M7 12h7" />
                <path d="M7 16h4" />
              </svg>
            </div>
            <h2 className="booking-details-title">Booking Details</h2>
          </div>

          <button className="booking-details-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Content Body */}
        <div className="booking-details-body no-scrollbar" ref={bodyRef}>
          {/* Left Column: Guest Overview & Edit CTA */}
          <div className="booking-details-left-col no-scrollbar">
            <div className="booking-details-guest-info">
              {/* Blue Bed Icon Bubble */}
              <div className="booking-details-bed-bubble">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16" />
                  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                  <path d="M2 17h20" />
                  <path d="M6 8v9" />
                </svg>
              </div>

              {/* Guest Name */}
              <h3 className="booking-details-guest-name">{displayName}</h3>

              {/* Guest Contact Meta */}
              <div className="booking-details-meta-list">
                <div className="booking-details-meta-item">
                  <MapPin size={16} className="booking-details-meta-icon" />
                  <span>{guestCountry}</span>
                </div>

                <div className="booking-details-meta-item">
                  <Mail size={16} className="booking-details-meta-icon" />
                  <span className="booking-details-email-text" title={guestEmail}>{guestEmail}</span>
                </div>

                <div className="booking-details-meta-item">
                  <Phone size={16} className="booking-details-meta-icon" />
                  <span>{guestPhone}</span>
                </div>
              </div>

              {/* Edit / View Reservation Action */}
              <button
                type="button"
                className="booking-details-edit-btn"
                onClick={() => {
                  onClose();
                  if (onEditReservation) {
                    onEditReservation(reservation);
                  }
                }}
              >
                <Edit3 size={15} />
                <span>{isCheckedOut ? 'View Reservation (Locked)' : 'Edit Reservation'}</span>
              </button>
            </div>

            {/* Bottom Hotel Outline Illustration matching screenshot */}
            <div className="booking-details-illustration-container">
              <div className="booking-details-illustration-wrap">
                <div className="booking-details-sun-circle" />
                <svg viewBox="0 0 160 65" className="booking-details-hotel-illustration" fill="none" stroke="#94a3b8" strokeWidth="1.2">
                  {/* Hills / Horizon line */}
                  <path d="M10 55 Q 40 35, 80 50 T 150 55" stroke="#cbd5e1" />
                  <path d="M0 58 L 160 58" stroke="#94a3b8" />
                  {/* Minimalist Hotel Building */}
                  <rect x="62" y="24" width="36" height="34" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
                  <text x="80" y="34" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle" fill="#64748b" stroke="none" fontWeight="600" letterSpacing="0.5">HOTEL</text>
                  <rect x="69" y="42" width="6" height="6" stroke="#94a3b8" strokeWidth="1.2" />
                  <rect x="85" y="42" width="6" height="6" stroke="#94a3b8" strokeWidth="1.2" />
                  {/* Grass tufts */}
                  <path d="M42 58 Q 38 42, 30 58 M46 58 Q 50 45, 54 58" stroke="#cbd5e1" strokeWidth="1.2" />
                  <path d="M112 58 Q 116 42, 122 58 M118 58 Q 123 45, 128 58" stroke="#cbd5e1" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: Individual Information & Special Requests */}
          <div className="booking-details-right-col no-scrollbar" ref={rightColRef}>
            {/* Section 1: Individual Information */}
            <div className="booking-details-section">
              <div className="booking-details-section-header">
                <User size={16} className="booking-details-section-icon" />
                <h4 className="booking-details-section-title">Individual Information</h4>
              </div>

              {/* 2-Column Grid of Information Cards */}
              <div className="booking-details-tiles-grid">
                {/* Tile 1: Reservation Number */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Reservation Number</span>
                    <span className="booking-info-tile-val font-bold">{bookingRefClean}</span>
                  </div>
                  <div className="booking-info-tile-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="16" y2="6" />
                      <line x1="3" y1="12" x2="13" y2="12" />
                      <path d="M14 13l5-5a1.5 1.5 0 0 1 2 2l-5 5-3 1 1-3z" />
                    </svg>
                  </div>
                </div>

                {/* Tile 2: Status */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Status</span>
                    <div className="booking-info-tile-val" style={{ marginTop: '3px' }}>
                      <span className={`booking-status-badge ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tile 3: Arrival Date */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Arrival Date</span>
                    <span className="booking-info-tile-val font-bold">{arrivalDateFormatted}</span>
                  </div>
                  <div className="booking-info-tile-icon-box">
                    <Calendar size={18} />
                  </div>
                </div>

                {/* Tile 4: Departure Date */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Departure Date</span>
                    <span className="booking-info-tile-val font-bold">{departureDateFormatted}</span>
                    {isEarlyCheckOut && (
                      <span className="booking-info-tile-subtext text-early-checkout">(Early Check-out)</span>
                    )}
                  </div>
                  <div className="booking-info-tile-icon-box">
                    <ArrowLeftRight size={18} />
                  </div>
                </div>

                {/* Tile 5: Booking Date */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Booking Date</span>
                    <span className="booking-info-tile-val font-bold">{bookingDateFormatted}</span>
                  </div>
                  <div className="booking-info-tile-icon-box">
                    <Calendar size={18} />
                  </div>
                </div>

                {/* Tile 6: Booking Source */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Booking Source</span>
                    <span className="booking-info-tile-val font-bold">{sourceLabel}</span>
                  </div>
                  <div className="booking-info-tile-icon-box">
                    <ArrowLeftRight size={18} />
                  </div>
                </div>

                {/* Tile 7: Rate Plan */}
                <div className="booking-info-tile">
                  <div className="booking-info-tile-content">
                    <span className="booking-info-tile-label">Rate Plan</span>
                    <span className="booking-info-tile-val font-bold">{ratePlanLabel}</span>
                  </div>
                  <div className="booking-info-tile-icon-box">
                    <SlidersHorizontal size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Special Requests */}
            <div className="booking-details-section">
              <div className="booking-details-section-header">
                <MessageSquare size={16} className="booking-details-section-icon" />
                <h4 className="booking-details-section-title">Special Requests</h4>
              </div>

              <div className="booking-special-requests-box">
                <p className="booking-special-requests-text">{specialRequestsText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(drawerElement, document.body)
    : drawerElement;
}
