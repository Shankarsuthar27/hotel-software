import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Check,
  User,
  X,
  FileText
} from 'lucide-react';

// Format date to "Nov 12, 2026"
function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Nov 12, 2026';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${MONTHS[monthIdx]} ${day}, ${year}`;
      }
    }
  }

  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${MONTHS[monthIdx]} ${day}, ${year}`;
      } else {
        const day = parseInt(parts[0], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        return `${MONTHS[monthIdx]} ${day}, ${year}`;
      }
    }
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
  } catch (e) {}

  return String(dateStr);
}

export default function ReservationConfirmationModal({
  isOpen,
  onClose,
  reservation,
  onViewBookingDetails
}) {
  if (!isOpen || !reservation) return null;

  // Extract Guest Name
  const guestFullName =
    reservation.primaryGuest?.name ||
    [reservation.primaryGuest?.title, reservation.primaryGuest?.firstName, reservation.primaryGuest?.lastName]
      .filter(Boolean)
      .join(' ') ||
    reservation.guestName ||
    'Mr Shankar Suthar';

  // Confirmation Number (stripped of '#', e.g. RES_10)
  const rawRef = reservation.bookingReference || reservation.id || 'RES_10';
  const cleanConfirmationNumber = String(rawRef).replace('#', '').toUpperCase();

  // Dates & Times
  const checkInDateFormatted = formatDisplayDate(reservation.checkInDate);
  const checkOutDateFormatted = formatDisplayDate(reservation.checkOutDate);
  const checkInTimeFormatted = reservation.checkInTime || '11:59';
  const checkOutTimeFormatted = reservation.checkOutTime || '11:00';

  // Guests & Rooms
  const adults = reservation.adults !== undefined ? reservation.adults : 1;
  const children = reservation.children !== undefined ? reservation.children : 2;
  const roomsCount = reservation.roomsCount || 1;

  // Remove scrollbar from page and lock scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('has-res-modal-open');

    const overlays = document.querySelectorAll('.add-res-fullscreen-overlay, .edit-res-fullscreen-overlay');
    const originalOverlays = [];
    overlays.forEach((el, i) => {
      originalOverlays[i] = el.style.overflow;
      el.style.overflow = 'hidden';
      el.classList.add('has-modal-open');
    });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.classList.remove('has-res-modal-open');
      overlays.forEach((el, i) => {
        el.style.overflow = originalOverlays[i] || '';
        el.classList.remove('has-modal-open');
      });
    };
  }, [isOpen]);

  const handleAction = () => {
    if (onViewBookingDetails) {
      onViewBookingDetails(reservation);
    } else if (onClose) {
      onClose();
    }
  };

  const modalElement = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100000,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={handleAction}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          padding: '32px 32px 28px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={handleAction}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            borderRadius: '6px'
          }}
        >
          <X size={20} strokeWidth={2.2} />
        </button>

        {/* Celebratory Icon with Festive Confetti */}
        <div
          style={{
            position: 'relative',
            width: '100px',
            height: '76px',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Confetti dot: Orange (top-left) */}
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '6.5px',
              height: '6.5px',
              borderRadius: '50%',
              backgroundColor: '#FB923C'
            }}
          />
          {/* Confetti dot: Light mint (top) */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: '26px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#34D399'
            }}
          />
          {/* Confetti dot: Coral red (top-right) */}
          <span
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              width: '6.5px',
              height: '6.5px',
              borderRadius: '50%',
              backgroundColor: '#F87171'
            }}
          />
          {/* Confetti 4-point star / sparkle (right) */}
          <svg
            style={{
              position: 'absolute',
              top: '20px',
              right: '6px'
            }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="#86EFAC"
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          {/* Confetti dot: Bright green (bottom-right) */}
          <span
            style={{
              position: 'absolute',
              bottom: '6px',
              right: '24px',
              width: '5.5px',
              height: '5.5px',
              borderRadius: '50%',
              backgroundColor: '#22C55E'
            }}
          />
          {/* Confetti dot: Sky cyan (bottom-left) */}
          <span
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '20px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#38BDF8'
            }}
          />

          {/* Central Green Check Badge */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
            }}
          >
            <Check size={28} color="#FFFFFF" strokeWidth={3} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: '22px',
            fontWeight: 800,
            color: '#0F172A',
            textAlign: 'center',
            letterSpacing: '-0.015em'
          }}
        >
          Booking Confirmed!
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '13.5px',
            color: '#64748B',
            textAlign: 'center',
            fontWeight: 400
          }}
        >
          Your reservation has been successfully processed.
        </p>

        {/* 4-Quadrant Information Card */}
        <div
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#FFFFFF',
            marginBottom: '22px',
            overflow: 'hidden'
          }}
        >
          {/* Quadrant 1 (Top-Left): Guest Name */}
          <div
            style={{
              padding: '16px 18px',
              borderRight: '1px solid #F1F5F9',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={18} color="#10B981" strokeWidth={2.2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px', fontWeight: 500 }}>
                Guest Name
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {guestFullName}
              </span>
            </div>
          </div>

          {/* Quadrant 2 (Top-Right): Confirmation Number */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: 500 }}>
              Confirmation Number
            </span>
            <span
              style={{
                fontSize: '14.5px',
                fontWeight: 800,
                color: '#16A34A',
                letterSpacing: '0.02em'
              }}
            >
              {cleanConfirmationNumber}
            </span>
          </div>

          {/* Quadrant 3 (Bottom-Left): Stay Duration */}
          <div
            style={{
              padding: '16px 18px',
              borderRight: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: 500 }}>
              Stay Duration
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}
            >
              {/* Check-in */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>
                  Check-in
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {checkInDateFormatted}
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  {checkInTimeFormatted}
                </span>
              </div>

              {/* Check-out */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>
                  Check-out
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {checkOutDateFormatted}
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  {checkOutTimeFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Quadrant 4 (Bottom-Right): Guests & Room */}
          <div
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={18} color="#10B981" strokeWidth={2.2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px', fontWeight: 500 }}>
                Guests & Room
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {adults} Adults, {children} Children
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                {roomsCount} Room{roomsCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* View Booking Details Action Button */}
        <button
          type="button"
          onClick={handleAction}
          style={{
            width: '100%',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
        >
          <FileText size={18} color="#FFFFFF" strokeWidth={2.2} />
          <span>View Booking Details</span>
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalElement, document.body)
    : modalElement;
}
