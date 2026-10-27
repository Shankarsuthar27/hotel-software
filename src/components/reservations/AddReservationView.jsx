import React, { useState, useMemo, useRef, useEffect } from 'react';
import './add-reservation.css';
import {
  Home,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Moon,
  Star,
  ShieldAlert,
  Tag,
  CheckCircle2,
  DollarSign,
  Maximize2,
  Minimize2,
  ArrowLeft
} from 'lucide-react';
import { calculateRoomTax } from '../../services/taxEngine';
import ReservationConfirmationModal from './ReservationConfirmationModal';

// Venus / Female Icon matching OTAL
const VenusIcon = ({ size = 15, color = '#c026d3' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <line x1="12" y1="13" x2="12" y2="21" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

// Custom Pixel-Matched Calendar Icon from screenshot
const CalendarIconCustom = ({ size = 16, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5" />
    <rect x="7" y="13" width="2" height="2" rx="0.5" fill={color} stroke="none" />
    <rect x="11" y="13" width="2" height="2" rx="0.5" fill={color} stroke="none" />
    <rect x="15" y="13" width="2" height="2" rx="0.5" fill={color} stroke="none" />
    <rect x="7" y="17" width="2" height="2" rx="0.5" fill={color} stroke="none" />
    <rect x="11" y="17" width="2" height="2" rx="0.5" fill={color} stroke="none" />
    <rect x="15" y="17" width="2" height="2" rx="0.5" fill={color} stroke="none" />
  </svg>
);

// Custom Pixel-Matched Clock Icon from screenshot
const ClockIconCustom = ({ size = 16, color = '#1e293b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>
);

// Custom Down Chevron
const ChevronDownCustom = ({ size = 13, color = '#334155', isOpen = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Custom Date Picker matching screenshot DD/MM/YYYY
function CustomDatePicker({ value, onChange, label = 'Check-in', required = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse YYYY-MM-DD
  const dateObj = useMemo(() => {
    if (!value) return new Date();
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [viewYear, setViewYear] = useState(() => dateObj.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(() => dateObj.getMonth() ?? 9); // 0-indexed

  useEffect(() => {
    if (dateObj && !isNaN(dateObj.getTime())) {
      setViewYear(dateObj.getFullYear());
      setViewMonth(dateObj.getMonth());
    }
  }, [value]);

  // Format as DD/MM/YYYY
  const displayFormatted = useMemo(() => {
    if (!value) return '';
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return (
        parseInt(parts[0], 10) === viewYear &&
        parseInt(parts[1], 10) === viewMonth + 1 &&
        parseInt(parts[2], 10) === day
      );
    }
    return false;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  return (
    <div className="custom-datetime-control" ref={containerRef}>
      <label className="custom-cal-label">
        {label} {required && <span className="custom-cal-star">*</span>}
      </label>
      <div
        className={`custom-date-box ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-date-text">{displayFormatted || 'Select Date'}</span>
        <CalendarIconCustom />
      </div>

      {isOpen && (
        <div className="calendar-popover">
          <div className="calendar-popover-header">
            <button type="button" className="calendar-nav-btn" onClick={prevMonth}>
              ‹
            </button>
            <span className="calendar-month-title">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button type="button" className="calendar-nav-btn" onClick={nextMonth}>
              ›
            </button>
          </div>

          <div className="calendar-weekdays">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="calendar-days-grid">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-cell empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <div
                  key={`day-${day}`}
                  className={`calendar-day-cell ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Time Picker matching screenshot
function CustomTimePicker({ value, onChange, label = 'Time', required = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const times = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // Click outside listener
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div className="custom-datetime-control" ref={containerRef}>
      <label className="custom-cal-label">
        {label} {required && <span className="custom-cal-star">*</span>}
      </label>
      <div
        className={`custom-time-box ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="custom-time-left">
          <ClockIconCustom />
          <span className="custom-time-text">{value || '14:00'}</span>
        </div>
        <ChevronDownCustom isOpen={isOpen} />
      </div>

      {isOpen && (
        <div className="time-dropdown-menu">
          {times.map((t) => (
            <div
              key={t}
              className={`time-dropdown-item ${t === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(t);
                setIsOpen(false);
              }}
            >
              <span>{t}</span>
              {t === value && <CheckCircle2 size={14} color="#2563eb" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddReservationView({
  property = {},
  rooms = [],
  roomTypes = [],
  ratePlans = [],
  initialData = null,
  onBack,
  onNavigate,
  onSubmit
}) {
  const businessDate = initialData?.date || property?.businessDate || '2026-10-26';

  // Calculate default next day
  const defaultNextDay = useMemo(() => {
    const d = new Date(businessDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [businessDate]);

  // Stay Details State
  const [checkInDate, setCheckInDate] = useState(businessDate);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState(defaultNextDay);
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [reservationType, setReservationType] = useState('CONFIRMED');
  const [marketSegment, setMarketSegment] = useState('corporate');
  const [bookingSource, setBookingSource] = useState('walk-in');
  const [sendConfirmationMail, setSendConfirmationMail] = useState(true);
  const [createdReservation, setCreatedReservation] = useState(null);

  const handleCheckInChange = (newDate) => {
    setCheckInDate(newDate);
    const start = new Date(newDate);
    const end = new Date(checkOutDate);
    if (end <= start) {
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (newDate) => {
    const start = new Date(checkInDate);
    const end = new Date(newDate);
    if (end <= start) {
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
    } else {
      setCheckOutDate(newDate);
    }
  };

  // 4 Toggle Flags
  const [isVIP, setIsVIP] = useState(false);
  const [isSingleLady, setIsSingleLady] = useState(false);
  const [noPosting, setNoPosting] = useState(false);
  const [isComplimentary, setIsComplimentary] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Browser fullscreen state
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsBrowserFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsBrowserFullscreen(false)).catch(() => {});
    }
  };

  // Room Configuration: Multi-room support
  const defaultRoomTypeId = initialData?.room?.roomTypeId || roomTypes[0]?.id || 'rt_deluxe';
  const defaultRate = roomTypes.find((rt) => rt.id === defaultRoomTypeId)?.basePrice || 2500;

  const [configuredRooms, setConfiguredRooms] = useState([
    {
      id: 1,
      roomTypeId: defaultRoomTypeId,
      ratePlanCode: 'BAR_EP',
      roomId: initialData?.room?.id || rooms[0]?.id || 'rm_102',
      adults: 1,
      children: 0,
      rate: defaultRate
    }
  ]);

  const handleAddRoomRow = () => {
    const newId = configuredRooms.length + 1;
    setConfiguredRooms([
      ...configuredRooms,
      {
        id: newId,
        roomTypeId: defaultRoomTypeId,
        ratePlanCode: 'BAR_EP',
        roomId: rooms[0]?.id || 'rm_102',
        adults: 1,
        children: 0,
        rate: defaultRate
      }
    ]);
  };

  const handleRemoveRoomRow = (id) => {
    if (configuredRooms.length <= 1) return;
    setConfiguredRooms(configuredRooms.filter((r) => r.id !== id));
  };

  const handleUpdateRoomRow = (id, field, value) => {
    setConfiguredRooms(
      configuredRooms.map((r) => {
        if (r.id !== id) return r;
        if (field === 'roomTypeId') {
          const rt = roomTypes.find((t) => t.id === value);
          const newRate = rt ? rt.basePrice : r.rate;
          const matchingRoom = rooms.find((rm) => rm.roomTypeId === value);
          return {
            ...r,
            roomTypeId: value,
            rate: newRate,
            roomId: matchingRoom?.id || r.roomId
          };
        }
        return { ...r, [field]: value };
      })
    );
  };

  // Guest Details State
  const [guestTitle, setGuestTitle] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');

  // Billing & Advance Payment State
  const [taxExempt, setTaxExempt] = useState(false);
  const [billTo, setBillTo] = useState('Guest');
  const [collectAdvance, setCollectAdvance] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentReference, setPaymentReference] = useState('');

  // Calculations: Nights
  const nights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  // Formatted display dates
  const formatDisplayDate = (dStr) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const checkInFormatted = formatDisplayDate(checkInDate);
  const checkOutFormatted = formatDisplayDate(checkOutDate);

  // Financial calculations
  const totalRoomCharges = useMemo(() => {
    return configuredRooms.reduce((sum, r) => sum + (Number(r.rate) || 0) * nights, 0);
  }, [configuredRooms, nights]);

  const totalTaxes = useMemo(() => {
    if (taxExempt || isComplimentary) return 0;
    return configuredRooms.reduce((sum, r) => {
      const calc = calculateRoomTax(Number(r.rate) || 0, nights, {
        isComplimentary,
        isTaxExempt: taxExempt
      });
      return sum + calc.totalTax;
    }, 0);
  }, [configuredRooms, nights, taxExempt, isComplimentary]);

  const grandTotal = isComplimentary ? 0 : totalRoomCharges + totalTaxes;
  const advanceVal = collectAdvance ? Number(advanceAmount) || 0 : 0;
  const balanceDue = Math.max(0, grandTotal - advanceVal);

  // Handle Form Submit
  const handleConfirmBooking = async (e) => {
    e?.preventDefault();
    if (!firstName.trim()) {
      alert('Please enter guest First Name');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter guest Mobile Number');
      return;
    }

    const primaryRoom = configuredRooms[0] || {};
    const fullGuestName = `${guestTitle} ${firstName.trim()} ${lastName.trim()}`.trim();

    const bookingPayload = {
      guestName: fullGuestName,
      guestPhone: `${countryCode} ${phone.trim()}`,
      guestEmail: email.trim(),
      nationality,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      nights,
      roomId: primaryRoom.roomId,
      roomTypeId: primaryRoom.roomTypeId,
      ratePlanCode: primaryRoom.ratePlanCode || 'BAR_EP',
      baseRatePerNight: Number(primaryRoom.rate) || 2500,
      adults: Number(primaryRoom.adults) || 1,
      children: Number(primaryRoom.children) || 0,
      status: reservationType.toLowerCase(),
      bookingSource: bookingSource.toUpperCase().replace('-', '_'),
      marketSegment: marketSegment || 'corporate',
      isVIP,
      isSingleLady,
      noPosting,
      isComplimentary,
      isTaxExempt: taxExempt,
      notes: specialRequests,
      sendConfirmationMail,
      advanceAmount: advanceVal,
      paymentMethod: paymentMode,
      paymentReference: paymentReference || 'Direct',
      primaryGuest: {
        name: fullGuestName,
        title: guestTitle,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        countryCode,
        email: email.trim(),
        nationality,
        idType,
        idNumber: idNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        zip: zip.trim()
      }
    };

    if (onSubmit) {
      const res = await onSubmit(bookingPayload);
      if (res) {
        setCreatedReservation(res);
      }
    }
  };

  return (
    <div className="add-res-page">
      {/* 1. Breadcrumbs */}
      <div className="add-res-breadcrumb">
        <Home size={14} />
        <span className="crumb-link" onClick={() => onNavigate ? onNavigate('dashboard') : onBack ? onBack() : null}>
          PMS
        </span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb-link" onClick={() => onNavigate ? onNavigate('reservations') : onBack ? onBack() : null}>
          Reservations
        </span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb-active">Add Reservation</span>

        <button
          className="edit-res-back-btn"
          style={{ marginLeft: '1rem', height: '28px', padding: '0 0.6rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          onClick={() => onNavigate ? onNavigate('reservations') : onBack ? onBack() : null}
          title="Back to Reservations"
        >
          <ArrowLeft size={14} />
          <span>Back to Reservations</span>
        </button>

        <button
          className="edit-res-fs-btn"
          style={{ marginLeft: 'auto' }}
          onClick={toggleBrowserFullscreen}
          title={isBrowserFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isBrowserFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="add-res-layout">
        {/* Left Form Column */}
        <div className="add-res-form-column">
          {/* Card 1: Stay Details */}
          <div className="add-res-card">
            <div className="add-res-card-header">
              <div>
                <h2 className="add-res-card-title">Stay Details</h2>
                <p className="add-res-card-subtitle">Basic details for your reservation stay.</p>
              </div>
            </div>

            {/* Check-in / Night / Check-out Row */}
            <div className="add-res-dates-row">
              <CustomDatePicker
                label="Check-in"
                required={true}
                value={checkInDate}
                onChange={handleCheckInChange}
              />

              <CustomTimePicker
                label="Time"
                required={true}
                value={checkInTime}
                onChange={(t) => setCheckInTime(t)}
              />

              <div className="add-res-night-pill-center">
                <Moon size={14} />
                <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>

              <CustomDatePicker
                label="Check-out"
                required={true}
                value={checkOutDate}
                onChange={handleCheckOutChange}
              />

              <CustomTimePicker
                label="Time"
                required={true}
                value={checkOutTime}
                onChange={(t) => setCheckOutTime(t)}
              />
            </div>

            {/* Reservation Type & Market Segment */}
            <div className="add-res-grid-2">
              <div className="add-res-field-group">
                <label className="add-res-field-label">
                  Reservation Type <span className="add-res-required">*</span>
                </label>
                <select
                  className="add-res-select"
                  value={reservationType}
                  onChange={(e) => setReservationType(e.target.value)}
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="TENTATIVE">TENTATIVE</option>
                  <option value="WAITLIST">WAITLIST</option>
                </select>
              </div>

              <div className="add-res-field-group">
                <label className="add-res-field-label">
                  Market Segment <span className="add-res-required">*</span>
                </label>
                <select
                  className="add-res-select"
                  value={marketSegment}
                  onChange={(e) => setMarketSegment(e.target.value)}
                >
                  <option value="corporate">corporate</option>
                  <option value="fit">fit</option>
                  <option value="group">group</option>
                  <option value="marriage/social">marriage/social</option>
                  <option value="mice">mice</option>
                  <option value="ota">ota</option>
                </select>
              </div>
            </div>

            {/* Booking Source */}
            <div className="add-res-field-group" style={{ marginBottom: '1.25rem' }}>
              <label className="add-res-field-label">
                Booking Source <span className="add-res-required">*</span>
              </label>
              <select
                className="add-res-select"
                value={bookingSource}
                onChange={(e) => setBookingSource(e.target.value)}
              >
                <option value="walk-in">walk-in</option>
                <option value="Direct Phone">Direct Phone</option>
                <option value="Website">Website</option>
                <option value="Booking.com">Booking.com</option>
                <option value="MakeMyTrip">MakeMyTrip</option>
                <option value="Agoda">Agoda</option>
                <option value="Airbnb">Airbnb</option>
              </select>
            </div>

            {/* 4 Colored Toggle Badges */}
            <div className="add-res-toggles-row">
              {/* VIP */}
              <div
                className={`toggle-pill-card vip ${isVIP ? 'active' : ''}`}
                onClick={() => setIsVIP(!isVIP)}
              >
                <div className="toggle-pill-left">
                  <Star size={16} color="#d97706" />
                  <span>Is VIP</span>
                </div>
                <div className={`toggle-switch-track ${isVIP ? 'on-amber' : ''}`}>
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              {/* Single Lady */}
              <div
                className={`toggle-pill-card lady ${isSingleLady ? 'active' : ''}`}
                onClick={() => setIsSingleLady(!isSingleLady)}
              >
                <div className="toggle-pill-left">
                  <VenusIcon size={16} color="#c026d3" />
                  <span>Single Lady</span>
                </div>
                <div className={`toggle-switch-track ${isSingleLady ? 'on-pink' : ''}`}>
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              {/* No Posting */}
              <div
                className={`toggle-pill-card nopost ${noPosting ? 'active' : ''}`}
                onClick={() => setNoPosting(!noPosting)}
              >
                <div className="toggle-pill-left">
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '16px' }}>
                    block
                  </span>
                  <span>No Posting</span>
                </div>
                <div className={`toggle-switch-track ${noPosting ? 'on-rose' : ''}`}>
                  <div className="toggle-switch-thumb" />
                </div>
              </div>

              {/* Complimentary */}
              <div
                className={`toggle-pill-card comp ${isComplimentary ? 'active' : ''}`}
                onClick={() => setIsComplimentary(!isComplimentary)}
              >
                <div className="toggle-pill-left">
                  <Tag size={16} color="#16a34a" />
                  <span>Complimentary</span>
                </div>
                <div className={`toggle-switch-track ${isComplimentary ? 'on-emerald' : ''}`}>
                  <div className="toggle-switch-thumb" />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="add-res-field-group">
              <label className="add-res-field-label">Special Requests</label>
              <textarea
                className="add-res-textarea"
                placeholder="e.g. Extra bed, late check in..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Room Configuration */}
          <div className="add-res-card">
            <div className="add-res-card-header">
              <div>
                <h2 className="add-res-card-title">Room Configuration</h2>
                <p className="add-res-card-subtitle">Configure room details, guest occupancy, and applicable rates.</p>
              </div>
              <button
                type="button"
                className="btn-add-room-outline"
                onClick={handleAddRoomRow}
              >
                <Plus size={15} />
                <span>Add More Room</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="add-res-room-table">
                <thead>
                  <tr>
                    <th>Room Type *</th>
                    <th>Rate Plan *</th>
                    <th>Room No *</th>
                    <th style={{ width: '80px' }}>Adult</th>
                    <th style={{ width: '80px' }}>Child</th>
                    <th style={{ width: '130px' }}>Rate (₹)</th>
                    {configuredRooms.length > 1 && <th style={{ width: '50px' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {configuredRooms.map((rm) => (
                    <tr key={rm.id}>
                      <td>
                        <select
                          className="add-res-select"
                          value={rm.roomTypeId}
                          onChange={(e) => handleUpdateRoomRow(rm.id, 'roomTypeId', e.target.value)}
                        >
                          {roomTypes.map((rt) => (
                            <option key={rt.id} value={rt.id}>
                              {rt.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="add-res-select"
                          value={rm.ratePlanCode}
                          onChange={(e) => handleUpdateRoomRow(rm.id, 'ratePlanCode', e.target.value)}
                        >
                          <option value="test plan">test plan</option>
                          <option value="BAR_EP">Best Available Rate (Room Only)</option>
                          <option value="BAR_CP">Continental Plan (Breakfast)</option>
                          <option value="CORP_DISC">Corporate Discount Plan</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="add-res-select"
                          value={rm.roomId}
                          onChange={(e) => handleUpdateRoomRow(rm.id, 'roomId', e.target.value)}
                        >
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              Room {room.roomNumber} ({room.status})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="add-res-input"
                          min="1"
                          max="4"
                          value={rm.adults}
                          onChange={(e) => handleUpdateRoomRow(rm.id, 'adults', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="add-res-input"
                          min="0"
                          max="3"
                          value={rm.children}
                          onChange={(e) => handleUpdateRoomRow(rm.id, 'children', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="add-res-input"
                          value={rm.rate}
                          onChange={(e) => handleUpdateRoomRow(rm.id, 'rate', e.target.value)}
                        />
                      </td>
                      {configuredRooms.length > 1 && (
                        <td>
                          <button
                            type="button"
                            className="btn-remove-room-row"
                            onClick={() => handleRemoveRoomRow(rm.id)}
                            title="Remove Room"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Guest Information */}
          <div className="add-res-card">
            <div className="add-res-card-header">
              <div>
                <h2 className="add-res-card-title">Guest Information</h2>
                <p className="add-res-card-subtitle">Primary guest details for check-in and billing ledger.</p>
              </div>
            </div>

            {/* Row 1: Title, First Name, Last Name */}
            <div className="add-res-grid-4">
              <div className="add-res-field-group">
                <label className="add-res-field-label">
                  Title <span className="add-res-required">*</span>
                </label>
                <select
                  className="add-res-select"
                  value={guestTitle}
                  onChange={(e) => setGuestTitle(e.target.value)}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>

              <div className="add-res-field-group" style={{ gridColumn: 'span 2' }}>
                <label className="add-res-field-label">
                  First Name <span className="add-res-required">*</span>
                </label>
                <input
                  type="text"
                  className="add-res-input"
                  placeholder="e.g. Rahul"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="add-res-field-group">
                <label className="add-res-field-label">
                  Last Name <span className="add-res-required">*</span>
                </label>
                <input
                  type="text"
                  className="add-res-input"
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Mobile, Email, Nationality */}
            <div className="add-res-grid-3">
              <div className="add-res-field-group">
                <label className="add-res-field-label">
                  Mobile <span className="add-res-required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select
                    className="add-res-select"
                    style={{ width: '85px', flexShrink: 0 }}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+971">+971</option>
                  </select>
                  <input
                    type="tel"
                    className="add-res-input"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="add-res-field-group">
                <label className="add-res-field-label">Email</label>
                <input
                  type="email"
                  className="add-res-input"
                  placeholder="guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="add-res-field-group">
                <label className="add-res-field-label">Nationality</label>
                <input
                  type="text"
                  className="add-res-input"
                  placeholder="Indian"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: ID Type, ID Number, Address */}
            <div className="add-res-grid-3">
              <div className="add-res-field-group">
                <label className="add-res-field-label">ID Type</label>
                <select
                  className="add-res-select"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div className="add-res-field-group">
                <label className="add-res-field-label">ID Number</label>
                <input
                  type="text"
                  className="add-res-input"
                  placeholder="e.g. 1234 5678 9012"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>

              <div className="add-res-field-group">
                <label className="add-res-field-label">Address</label>
                <input
                  type="text"
                  className="add-res-input"
                  placeholder="Street / City address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Billing Summary */}
        <div className="add-res-billing-card">
          <div className="add-res-billing-header">
            <h3 className="add-res-billing-title">Billing Summary</h3>
            <button
              type="button"
              className="btn-billing-top-confirm"
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </button>
          </div>

          {/* Dates Bar */}
          <div className="add-res-billing-dates">
            <div className="billing-date-block">
              <span className="billing-date-label">Check-in</span>
              <span className="billing-date-val">{checkInFormatted}</span>
            </div>

            <div className="billing-night-pill">
              <Moon size={13} />
              <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>

            <div className="billing-date-block" style={{ textAlign: 'right' }}>
              <span className="billing-date-label">Check-out</span>
              <span className="billing-date-val">{checkOutFormatted}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="billing-line-row">
            <span>Room Charges</span>
            <span style={{ fontWeight: 600 }}>₹{totalRoomCharges.toFixed(2)}</span>
          </div>

          <div className="billing-line-row">
            <span>Taxes</span>
            <span style={{ fontWeight: 600 }}>₹{totalTaxes.toFixed(2)}</span>
          </div>

          <label className="billing-tax-exempt-row">
            <input
              type="checkbox"
              checked={taxExempt}
              onChange={(e) => setTaxExempt(e.target.checked)}
            />
            <span>Tax Exempt</span>
          </label>

          <label className="billing-tax-exempt-row" style={{ marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={sendConfirmationMail}
              onChange={(e) => setSendConfirmationMail(e.target.checked)}
            />
            <span>Send Confirmation Mail</span>
          </label>

          <div className="billing-divider" />

          <div className="billing-line-row bold">
            <span>Grand Total</span>
            <span style={{ fontSize: '1.05rem', color: '#0f172a' }}>₹{grandTotal.toFixed(2)}</span>
          </div>

          <div className="billing-line-row bold" style={{ color: balanceDue > 0 ? '#ef4444' : '#059669' }}>
            <span>Balance Due</span>
            <span style={{ fontSize: '1.05rem' }}>₹{balanceDue.toFixed(2)}</span>
          </div>

          <div className="add-res-field-group" style={{ marginTop: '0.85rem' }}>
            <label className="add-res-field-label">Bill To</label>
            <select
              className="add-res-select"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
            >
              <option value="Guest">Guest</option>
              <option value="Company">Company</option>
            </select>
          </div>

          {/* Advance Payment Card */}
          <div className="add-res-advance-box">
            <div className="add-res-advance-header">
              <div>
                <h4 className="advance-box-title">Collect Advance Payment</h4>
                <p className="advance-box-sub">Record a payment at reservation creation</p>
              </div>
              <div
                className={`toggle-switch-track ${collectAdvance ? 'on' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setCollectAdvance(!collectAdvance)}
              >
                <div className="toggle-switch-thumb" />
              </div>
            </div>

            {collectAdvance && (
              <div className="advance-fields-dropdown">
                <div className="add-res-field-group">
                  <label className="add-res-field-label">Advance Amount (₹)</label>
                  <input
                    type="number"
                    className="add-res-input"
                    placeholder="e.g. 2500"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                  />
                </div>

                <div className="add-res-field-group">
                  <label className="add-res-field-label">Payment Method</label>
                  <select
                    className="add-res-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">NEFT / Bank Transfer</option>
                  </select>
                </div>

                <div className="add-res-field-group">
                  <label className="add-res-field-label">Reference / Note</label>
                  <input
                    type="text"
                    className="add-res-input"
                    placeholder="e.g. UPI Ref / Receipt No"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Total Amount & Big Confirm Button */}
          <div className="billing-total-row">
            <span className="billing-total-label">Total Amount</span>
            <span className="billing-total-amount">INR {grandTotal.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="btn-confirm-booking-full"
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        </div>
      </div>

      {/* Reservation Confirmation Pop-up with Reservation Number & Summary Card (Step 1.7) */}
      {createdReservation && (
        <ReservationConfirmationModal
          isOpen={!!createdReservation}
          onClose={() => {
            setCreatedReservation(null);
            if (onNavigate) {
              onNavigate('reservations');
            } else if (onBack) {
              onBack();
            }
          }}
          reservation={createdReservation}
          onGoToArrivals={() => {
            setCreatedReservation(null);
            if (onNavigate) {
              onNavigate('reservations?tab=arrivals');
            } else if (onBack) {
              onBack();
            }
          }}
          onPrintVoucher={() => {
            // Can open print voucher
          }}
        />
      )}
    </div>
  );
}
