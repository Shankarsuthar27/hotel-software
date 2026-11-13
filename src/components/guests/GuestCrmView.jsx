import React, { useState, useMemo } from 'react';
import { Home, Search, ArrowLeft, Archive, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { initialGuests } from '../../data/initialPmsData.js';
import './guests.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats date into exact OTAL format: "Day DD, Mon YYYY" (e.g. "Mon 02, Nov 2026")
 */
function formatStayDate(dateStr) {
  if (!dateStr || dateStr === '—') return '—';
  if (typeof dateStr === 'string' && dateStr.includes(',')) return dateStr;

  const clean = String(dateStr).split(' ')[0].split('T')[0];
  const parts = clean.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const [y, m, d] = parts;
    const dt = new Date(y, m - 1, d);
    if (!isNaN(dt.getTime())) {
      const dayName = DAYS[dt.getDay()];
      const dd = String(d).padStart(2, '0');
      const mon = MONTHS[m - 1];
      return `${dayName} ${dd}, ${mon} ${y}`;
    }
  }

  const dt = new Date(dateStr);
  if (!isNaN(dt.getTime())) {
    const dayName = DAYS[dt.getDay()];
    const dd = String(dt.getDate()).padStart(2, '0');
    const mon = MONTHS[dt.getMonth()];
    const y = dt.getFullYear();
    return `${dayName} ${dd}, ${mon} ${y}`;
  }

  return String(dateStr);
}

/**
 * Maps status code to label and pill CSS class
 */
function getStatusDisplay(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'in_house' || s === 'checked_in') {
    return { label: 'In-House', className: 'in-house' };
  }
  if (s === 'checked_out') {
    return { label: 'Checked Out', className: 'checked-out' };
  }
  if (s === 'cancelled' || s === 'canceled') {
    return { label: 'Cancelled', className: 'cancelled' };
  }
  if (s === 'no_show' || s === 'noshow') {
    return { label: 'No Show', className: 'no-show' };
  }
  if (s === 'confirmed') {
    return { label: 'Confirmed', className: 'confirmed' };
  }
  return { label: status || '—', className: 'confirmed' };
}

export default function GuestCrmView({
  reservations = [],
  onShowToast
}) {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Build the complete guests list by combining initial registered guest profiles
  // and dynamically mapping their stay history from PMS reservations
  const allGuests = useMemo(() => {
    // Map each reservation to a standardized stay history object
    const mapReservationToStay = (r) => {
      const bookingIdClean = r.bookingReference
        ? r.bookingReference.replace('#', '')
        : (r.id ? r.id.toUpperCase() : 'RES_1');
      const bookingIdFormatted = '#' + bookingIdClean;

      const inDate = formatStayDate(r.checkInDate || '2026-11-12');
      const outDate = formatStayDate(r.checkOutDate || '2026-11-13');
      const stayDatesDisplay = `${inDate} → ${outDate}`;
      const nightsCount = Number(r.nights) || 1;
      const nightsDisplay = `${nightsCount} ${nightsCount === 1 ? 'Night' : 'Nights'}`;

      const { label: statusLabel, className: statusClass } = getStatusDisplay(r.status);

      return {
        id: r.id,
        bookingId: bookingIdFormatted,
        bookingIdClean,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        stayDatesDisplay,
        nights: nightsCount,
        nightsDisplay,
        status: r.status,
        statusLabel,
        statusClass,
        rawRes: r
      };
    };

    // Legacy mock reservation IDs that should not spawn dynamic guest rows
    const legacySeedIds = new Set(['res_1', 'res_2', 'res_3', 'res_4', 'res_5', 'res_6', 'res_7']);

    // 1. Process base registered profiles matching initialGuests
    const registered = (initialGuests || []).map((base) => {
      let stays = [];

      // Find matching reservations specified in reservationIds
      if (Array.isArray(base.reservationIds) && base.reservationIds.length > 0) {
        base.reservationIds.forEach((targetId) => {
          const found = reservations.find(
            (r) => r.id === targetId || r.bookingReference === targetId || r.bookingReference === `#${targetId}`
          );
          if (found) {
            stays.push(mapReservationToStay(found));
          }
        });
      }

      // Also attach any other live reservation matching this guest's email, phone, or name
      reservations.forEach((r) => {
        if (stays.some((s) => s.id === r.id)) return;
        if (legacySeedIds.has(r.id) && !base.reservationIds?.includes(r.id)) return;

        const rEmail = (r.primaryGuest?.email || '').toLowerCase().trim();
        const rPhone = (r.primaryGuest?.phone || '').replace(/\D/g, '');
        const rName = (r.primaryGuest?.name || '').toLowerCase().trim();

        const bEmail = (base.email || '').toLowerCase().trim();
        const bPhone = (base.phone || '').replace(/\D/g, '');
        const bName = (base.name || '').toLowerCase().trim();

        const matchEmail = rEmail && bEmail && rEmail === bEmail;
        const matchPhone = rPhone && bPhone && (rPhone.endsWith(bPhone.slice(-10)) || bPhone.endsWith(rPhone.slice(-10)));
        const matchName = rName && bName && rName === bName;

        if (matchEmail || matchPhone || matchName) {
          stays.push(mapReservationToStay(r));
        }
      });

      // Active stay is the primary stay displayed in the table (stays[0])
      const activeStay = stays.length > 0 ? stays[0] : null;

      // Allow live updates to guest contact info from their latest reservation if modified
      const currentGuestData = activeStay?.rawRes?.primaryGuest;
      const displayName = currentGuestData?.name || base.name;
      const displayEmail = currentGuestData?.email || base.email;
      const displayPhone = currentGuestData?.phone || base.phone;

      return {
        ...base,
        name: displayName,
        email: displayEmail,
        phone: displayPhone,
        birthDateDisplay: formatStayDate(base.birthDate),
        addedOnDisplay: formatStayDate(base.addedOn),
        stays,
        activeStay
      };
    });

    // 2. Discover newly created guests from new user-created PMS reservations
    const handledResIds = new Set(
      registered.flatMap((g) => g.stays.map((s) => s.id))
    );

    const otherReservations = reservations.filter(
      (r) => !handledResIds.has(r.id) && !legacySeedIds.has(r.id)
    );
    const dynamicMap = {};

    otherReservations.forEach((r) => {
      const g = r.primaryGuest;
      if (!g || !g.name) return;
      const key = (g.email || g.phone || g.name).toLowerCase().trim();
      if (!dynamicMap[key]) {
        dynamicMap[key] = {
          id: `gst_dyn_${r.id}`,
          name: g.name,
          email: g.email || '—',
          phone: g.phone || '—',
          gender: g.gender || 'Adult',
          guestType: g.guestType || 'Adult',
          nationality: g.nationality || g.country || '—',
          birthDate: g.birthDate || null,
          birthDateDisplay: formatStayDate(g.birthDate),
          addedOn: r.createdAt || '2026-11-12',
          addedOnDisplay: formatStayDate(r.createdAt || '2026-11-12'),
          isVIP: Boolean(r.isVIP || g.isVIP),
          stays: []
        };
      }
      dynamicMap[key].stays.push(mapReservationToStay(r));
    });

    Object.values(dynamicMap).forEach((dyn) => {
      dyn.activeStay = dyn.stays.length > 0 ? dyn.stays[0] : null;
      registered.push(dyn);
    });

    return registered;
  }, [reservations]);

  // Search filter
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return allGuests;
    const q = searchQuery.toLowerCase().trim();
    return allGuests.filter(
      (g) =>
        (g.name && g.name.toLowerCase().includes(q)) ||
        (g.email && g.email.toLowerCase().includes(q)) ||
        (g.phone && g.phone.toLowerCase().includes(q))
    );
  }, [allGuests, searchQuery]);

  // Pagination calculation
  const totalResults = filteredGuests.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const currentGuests = filteredGuests.slice(startIndex, endIndex);

  // Cash Drawer handler
  const handleOpenCashDrawer = () => {
    if (onShowToast) {
      onShowToast('💵 Cash drawer opened successfully.');
    }
  };

  return (
    <div className="guests-page-container">
      {/* 1. Top Header Bar matching OTAL PMS */}
      <header className="guests-top-header">
        <div className="guests-breadcrumbs">
          <span className="crumb-home-icon">
            <Home size={14} />
          </span>
          <span className="crumb-link" onClick={() => setSelectedGuest(null)}>
            PMS
          </span>
          <span className="crumb-sep">&gt;</span>
          <span
            className={selectedGuest ? 'crumb-link' : 'crumb-current'}
            onClick={() => setSelectedGuest(null)}
          >
            Guests
          </span>
          {selectedGuest && (
            <>
              <span className="crumb-sep">&gt;</span>
              <span className="crumb-current">Guest Details</span>
            </>
          )}
        </div>

        {/* Open Cash Drawer Action Button */}
        <button
          type="button"
          className="open-cash-drawer-btn"
          onClick={handleOpenCashDrawer}
          title="Open Register Cash Drawer"
        >
          <Archive size={14} strokeWidth={2.2} />
          <span>Open Cash Drawer</span>
        </button>
      </header>

      {/* 2. Main Content Body */}
      {!selectedGuest ? (
        /* =====================================================================
           VIEW A: Guests List Table (Matching media_1794028040709_f689d485.png)
           ===================================================================== */
        <div className="guests-list-content">
          {/* Search Row */}
          <div className="guests-search-row">
            <div className="guests-search-wrapper">
              <Search size={15} className="guests-search-icon" />
              <input
                type="text"
                className="guests-search-input"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="guests-table-wrapper">
            <table className="guests-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Guest Name</th>
                  <th style={{ width: '24%' }}>Email / Phone</th>
                  <th style={{ width: '13%' }}>Booking ID</th>
                  <th style={{ width: '25%' }}>Check-in &mdash; Check-out</th>
                  <th style={{ width: '8%' }}>Nights</th>
                  <th style={{ width: '12%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentGuests.map((guest) => {
                  const stay = guest.activeStay;

                  return (
                    <tr
                      key={guest.id}
                      onClick={() => setSelectedGuest(guest)}
                      title="Click to view full guest details and stay history"
                    >
                      {/* Column 1: Guest Name (+ optional VIP badge) */}
                      <td>
                        <div className="guest-name-cell">
                          <span className="guest-name-text">{guest.name}</span>
                          {guest.isVIP && (
                            <span className="guest-vip-pill">
                              <Star size={11} color="#d97706" strokeWidth={1.8} />
                              <span>VIP</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Email / Phone */}
                      <td>
                        <div className="guest-email-text">{guest.email || '—'}</div>
                        <div className="guest-phone-text">{guest.phone || '—'}</div>
                      </td>

                      {/* Column 3: Booking ID */}
                      <td>
                        {stay ? (
                          <span className="guest-booking-id">{stay.bookingId}</span>
                        ) : (
                          <span className="guest-dash">&mdash;</span>
                        )}
                      </td>

                      {/* Column 4: Check-in → Check-out */}
                      <td>
                        {stay ? (
                          <span className="guest-dates-text">{stay.stayDatesDisplay}</span>
                        ) : (
                          <span className="guest-dash">&mdash;</span>
                        )}
                      </td>

                      {/* Column 5: Nights */}
                      <td>
                        {stay ? (
                          <span className="guest-nights-text">{stay.nights}</span>
                        ) : (
                          <span className="guest-dash">&mdash;</span>
                        )}
                      </td>

                      {/* Column 6: Status */}
                      <td>
                        {stay ? (
                          <span className={`guest-status-badge ${stay.statusClass}`}>
                            {stay.statusLabel}
                          </span>
                        ) : (
                          <span className="guest-dash">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {currentGuests.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
                      No guests found matching &quot;{searchQuery}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="guests-pagination-row">
            <div className="guests-count-info">
              Showing <strong>{totalResults > 0 ? startIndex + 1 : 0}&ndash;{endIndex}</strong> of <strong>{totalResults}</strong> results
            </div>

            <div className="guests-pagination-controls">
              <button
                type="button"
                className="pagination-arrow-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              <button type="button" className="pagination-page-btn">
                {currentPage}
              </button>

              <button
                type="button"
                className="pagination-arrow-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =====================================================================
           VIEW B: Guest Details Subview (Matching media_1794028053677_683ad890.png)
           ===================================================================== */
        <div className="guest-details-content">
          {/* Back Navigation Button */}
          <button
            type="button"
            className="guest-back-btn"
            onClick={() => setSelectedGuest(null)}
            title="Back to Guests Directory"
            aria-label="Back to Guests"
          >
            <ArrowLeft size={18} />
          </button>

          {/* CARD 1: Guest Information */}
          <div className="guest-info-card">
            <div className="guest-card-header">
              <h2 className="guest-card-title">Guest Information</h2>
              <p className="guest-card-subtitle">Detailed contact and profile details.</p>
            </div>

            <div className="guest-name-cell" style={{ margin: '20px 0 16px 0' }}>
              <span className="guest-primary-name" style={{ margin: 0 }}>
                {selectedGuest.name}
              </span>
              {selectedGuest.isVIP && (
                <span className="guest-vip-pill">
                  <Star size={11} color="#d97706" strokeWidth={1.8} />
                  <span>VIP</span>
                </span>
              )}
            </div>

            <div className="guest-details-list">
              <div className="guest-detail-row">
                <span className="guest-detail-label">Email Address</span>
                <span className="guest-detail-value">{selectedGuest.email || '—'}</span>
              </div>

              <div className="guest-detail-row">
                <span className="guest-detail-label">Phone Number</span>
                <span className="guest-detail-value">{selectedGuest.phone || '—'}</span>
              </div>

              <div className="guest-detail-row">
                <span className="guest-detail-label">Gender</span>
                <span className="guest-detail-value">{selectedGuest.gender || 'Male'}</span>
              </div>

              <div className="guest-detail-row">
                <span className="guest-detail-label">Guest Type</span>
                <span className="guest-detail-value">{selectedGuest.guestType || 'Adult'}</span>
              </div>

              <div className="guest-detail-row">
                <span className="guest-detail-label">Nationality</span>
                <span className="guest-detail-value">{selectedGuest.nationality || '—'}</span>
              </div>

              <div className="guest-detail-row">
                <span className="guest-detail-label">Date of Birth</span>
                <span className="guest-detail-value">{selectedGuest.birthDateDisplay || '—'}</span>
              </div>

              <div className="guest-detail-row">
                <span className="guest-detail-label">Added on</span>
                <span className="guest-detail-value">{selectedGuest.addedOnDisplay || '—'}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Stay History */}
          <div className="guest-stay-card">
            <div className="guest-card-header">
              <h2 className="guest-card-title">Stay History</h2>
              <p className="guest-card-subtitle">All past and current reservation stays.</p>
            </div>

            {selectedGuest.stays && selectedGuest.stays.length > 0 ? (
              <table className="stay-history-table">
                <thead>
                  <tr>
                    <th style={{ width: '60%' }}>Stay Dates &amp; Duration</th>
                    <th style={{ width: '22%' }}>Booking ID</th>
                    <th style={{ width: '18%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGuest.stays.map((stay) => (
                    <tr key={stay.id}>
                      {/* Stay Dates & Duration */}
                      <td>
                        <div className="stay-dates-text">{stay.stayDatesDisplay}</div>
                        <div className="stay-duration-text">{stay.nightsDisplay}</div>
                      </td>

                      {/* Booking ID */}
                      <td>
                        <span className="stay-booking-id">{stay.bookingIdClean}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`guest-status-badge ${stay.statusClass}`}>
                          {stay.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="stay-history-empty">
                All past and current reservation stays will appear here once bookings are created.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
