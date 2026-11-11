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
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check
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
  const defaultRoomTypeId =
    initialData?.room?.roomTypeId ||
    roomTypes.find((rt) => rt.name.toLowerCase().includes('delux'))?.id ||
    roomTypes[0]?.id ||
    'rt_deluxe';

  const [configuredRooms, setConfiguredRooms] = useState([
    {
      id: 1,
      roomTypeId: defaultRoomTypeId,
      ratePlanCode: '',
      ratePlanName: '',
      roomId: initialData?.room?.id || 'unassigned',
      roomsCount: 1,
      adults: 1,
      children: 2,
      rate: ''
    }
  ]);

  const [activeDropdown, setActiveDropdown] = useState(null); // `${rm.id}-roomType` | `${rm.id}-ratePlan` | `${rm.id}-roomNo`

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.room-config-dropdown-container')) {
        setActiveDropdown(null);
      }
    }
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const getRoomTypeRatesFromPlan = (rp, roomTypeId) => {
    if (!rp || !rp.roomTypeRates || typeof rp.roomTypeRates !== 'object') return null;
    if (rp.roomTypeRates[roomTypeId]) return rp.roomTypeRates[roomTypeId];
    if (roomTypeId === 'rt_standard' && rp.roomTypeRates.rt_normal) return rp.roomTypeRates.rt_normal;
    if (roomTypeId === 'rt_normal' && rp.roomTypeRates.rt_standard) return rp.roomTypeRates.rt_standard;
    const currentRt = roomTypes.find((t) => t.id === roomTypeId);
    if (currentRt) {
      const rtNameLower = currentRt.name.trim().toLowerCase();
      for (const [key, val] of Object.entries(rp.roomTypeRates)) {
        const matchedRt = roomTypes.find((t) => t.id === key);
        if (matchedRt && matchedRt.name.trim().toLowerCase() === rtNameLower) {
          return val;
        }
      }
    }
    return null;
  };

  const isRoomTypeActiveInRatePlan = (rp, roomTypeId) => {
    if (!rp) return false;
    if (rp.status && rp.status !== 'ACTIVE') return false;
    const rates = getRoomTypeRatesFromPlan(rp, roomTypeId);
    return rates?.active === true;
  };

  const handleSelectRoomType = (rmId, rt) => {
    setConfiguredRooms((prev) =>
      prev.map((r) => {
        if (r.id !== rmId) return r;

        let updatedRatePlanCode = r.ratePlanCode;
        let updatedRatePlanName = r.ratePlanName;
        let updatedRate = '';

        if (r.ratePlanCode) {
          const rp = ratePlans.find((p) => p.code === r.ratePlanCode || p.id === r.ratePlanCode);
          if (rp && isRoomTypeActiveInRatePlan(rp, rt.id)) {
            const rtRates = getRoomTypeRatesFromPlan(rp, rt.id);
            updatedRate = rtRates?.basePrice || rp.basePrice || rt.basePrice || '';
          } else {
            // Not active for this new room type: clear rate plan
            updatedRatePlanCode = '';
            updatedRatePlanName = '';
            updatedRate = '';
          }
        }

        return {
          ...r,
          roomTypeId: rt.id,
          roomId: 'unassigned',
          ratePlanCode: updatedRatePlanCode,
          ratePlanName: updatedRatePlanName,
          adults: rt.baseAdults || 1,
          children: rt.baseChildren ?? 0,
          rate: updatedRate
        };
      })
    );
    setActiveDropdown(null);
  };

  const handleSelectRatePlan = (rmId, rp) => {
    setConfiguredRooms((prev) =>
      prev.map((r) => {
        if (r.id !== rmId) return r;
        const rtRates = getRoomTypeRatesFromPlan(rp, r.roomTypeId);
        const autoRate = rtRates?.basePrice || rp.basePrice || '';

        return {
          ...r,
          ratePlanCode: rp.code,
          ratePlanName: rp.name,
          rate: autoRate && autoRate > 0 ? autoRate : r.rate
        };
      })
    );
    setActiveDropdown(null);
  };

  const handleSelectRoomNo = (rmId, roomIdVal) => {
    setConfiguredRooms((prev) =>
      prev.map((r) => (r.id === rmId ? { ...r, roomId: roomIdVal } : r))
    );
    setActiveDropdown(null);
  };

  const handleSelectAdults = (rmId, count) => {
    setConfiguredRooms((prev) =>
      prev.map((r) => (r.id === rmId ? { ...r, adults: count } : r))
    );
    setActiveDropdown(null);
  };

  const handleSelectChildren = (rmId, count) => {
    setConfiguredRooms((prev) =>
      prev.map((r) => (r.id === rmId ? { ...r, children: count } : r))
    );
    setActiveDropdown(null);
  };

  const handleAddRoomRow = () => {
    const defaultRt = roomTypes.find((rt) => rt.id === defaultRoomTypeId);
    setConfiguredRooms((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        roomTypeId: defaultRoomTypeId,
        ratePlanCode: '',
        ratePlanName: '',
        roomId: 'unassigned',
        roomsCount: 1,
        adults: defaultRt?.baseAdults || 1,
        children: defaultRt?.baseChildren ?? 0,
        rate: ''
      }
    ]);
  };

  const handleRemoveRoomRow = (id) => {
    setConfiguredRooms((prev) => {
      if (prev.length <= 1) {
        const defaultRt = roomTypes.find((rt) => rt.id === defaultRoomTypeId);
        return [
          {
            id: 1,
            roomTypeId: defaultRoomTypeId,
            ratePlanCode: '',
            ratePlanName: '',
            roomId: 'unassigned',
            roomsCount: 1,
            adults: defaultRt?.baseAdults || 1,
            children: defaultRt?.baseChildren ?? 0,
            rate: ''
          }
        ];
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const handleUpdateRoomRow = (id, fieldOrPatch, maybeValue) => {
    setConfiguredRooms((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (typeof fieldOrPatch === 'object') {
          return { ...r, ...fieldOrPatch };
        }
        return { ...r, [fieldOrPatch]: maybeValue };
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
      alert('Please enter guest Phone Number');
      return;
    }
    if (!email.trim()) {
      alert('Please enter guest Email Address');
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
      roomId: primaryRoom.roomId === 'unassigned' ? '' : primaryRoom.roomId,
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

          {/* Card 2: Room Configuration (Matching User Screenshots) */}
          <div className="add-res-card" style={{ overflow: 'visible' }}>
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

            <div style={{ overflow: 'visible', width: '100%' }}>
              <table className="room-config-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>
                      Room Type <span className="required-star">*</span>
                    </th>
                    <th style={{ width: '20%' }}>
                      Rate Plan <span className="required-star">*</span>
                    </th>
                    <th style={{ width: '9%', textAlign: 'center' }}>
                      Rooms
                    </th>
                    <th style={{ width: '18%' }}>
                      Room No
                    </th>
                    <th style={{ width: '16%', textAlign: 'center' }}>
                      Guests (A / C)
                    </th>
                    <th style={{ width: '11%' }}>
                      Rate (₹)
                    </th>
                    <th style={{ width: '4%', textAlign: 'center' }} />
                  </tr>
                </thead>
                <tbody>
                  {configuredRooms.map((rm) => {
                    const currentRoomType = roomTypes.find((rt) => rt.id === rm.roomTypeId);
                    const matchingRooms = rooms.filter(
                      (r) =>
                        r.roomTypeId === rm.roomTypeId ||
                        (rm.roomTypeId === 'rt_standard' && r.roomTypeId === 'rt_normal') ||
                        (rm.roomTypeId === 'rt_normal' && r.roomTypeId === 'rt_standard')
                    );
                    const selectedRoom = rooms.find((r) => r.id === rm.roomId);
                    const selectedRatePlan = ratePlans.find((rp) => rp.code === rm.ratePlanCode || rp.id === rm.ratePlanCode);
                    const availableRatePlans = ratePlans.filter((rp) => isRoomTypeActiveInRatePlan(rp, rm.roomTypeId));

                    // Occupancy options based on room type
                    const maxAdultsCount = currentRoomType?.maxAdults || 4;
                    const maxChildrenCount = currentRoomType?.maxChildren ?? 2;
                    const adultOptions = Array.from({ length: maxAdultsCount }, (_, i) => i + 1);
                    const childOptions = Array.from({ length: maxChildrenCount + 1 }, (_, i) => i);

                    return (
                      <tr key={rm.id}>
                        {/* 1. Room Type */}
                        <td>
                          <div className="room-config-dropdown-container" style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="room-config-select-btn"
                              onClick={() => setActiveDropdown(activeDropdown === `${rm.id}-roomType` ? null : `${rm.id}-roomType`)}
                            >
                              <span>{currentRoomType?.name || 'Delux Room'}</span>
                              {activeDropdown === `${rm.id}-roomType` ? (
                                <ChevronUp size={15} color="#475569" />
                              ) : (
                                <ChevronDown size={15} color="#475569" />
                              )}
                            </button>

                            {activeDropdown === `${rm.id}-roomType` && (
                              <div className="room-config-popover" style={{ top: 'calc(100% + 4px)', left: 0 }}>
                                {roomTypes.map((rt) => (
                                  <div
                                    key={rt.id}
                                    className="room-config-popover-item"
                                    onClick={() => handleSelectRoomType(rm.id, rt)}
                                  >
                                    <span style={{ fontWeight: rt.id === rm.roomTypeId ? 600 : 400 }}>{rt.name}</span>
                                    {rt.id === rm.roomTypeId && <Check size={14} color="#2563EB" />}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 2. Rate Plan (Filtered by Room Type Activation) */}
                        <td>
                          <div className="room-config-dropdown-container" style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="room-config-select-btn"
                              onClick={() => setActiveDropdown(activeDropdown === `${rm.id}-ratePlan` ? null : `${rm.id}-ratePlan`)}
                            >
                              <span style={{ color: rm.ratePlanName || selectedRatePlan?.name ? '#0F172A' : '#64748B' }}>
                                {rm.ratePlanName || selectedRatePlan?.name || 'Select Type'}
                              </span>
                              {activeDropdown === `${rm.id}-ratePlan` ? (
                                <ChevronUp size={15} color="#475569" />
                              ) : (
                                <ChevronDown size={15} color="#475569" />
                              )}
                            </button>

                            {activeDropdown === `${rm.id}-ratePlan` && (
                              <div className="room-config-popover" style={{ top: 'calc(100% + 4px)', left: 0, minWidth: '150px' }}>
                                {availableRatePlans.length > 0 ? (
                                  availableRatePlans.map((rp) => {
                                    const isSelected = rm.ratePlanCode === rp.code || rm.ratePlanName === rp.name;
                                    return (
                                      <div
                                        key={rp.id || rp.code}
                                        className="room-config-popover-item"
                                        onClick={() => handleSelectRatePlan(rm.id, rp)}
                                      >
                                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>
                                          {rp.name}
                                        </span>
                                        {isSelected && <Check size={14} color="#2563EB" />}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="room-config-popover-item" style={{ color: '#94a3b8', cursor: 'default' }}>
                                    <span>No active rate plans</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Rooms (Aligned Center) */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            className="room-config-rooms-input"
                            value={rm.roomsCount || 1}
                            onChange={(e) => handleUpdateRoomRow(rm.id, 'roomsCount', Number(e.target.value) || 1)}
                          />
                        </td>

                        {/* 4. Room No (Matching Image 2 - Opens Upward with Checkmark) */}
                        <td>
                          <div className="room-config-dropdown-container" style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="room-config-select-btn"
                              onClick={() => setActiveDropdown(activeDropdown === `${rm.id}-roomNo` ? null : `${rm.id}-roomNo`)}
                            >
                              <span>
                                {selectedRoom
                                  ? selectedRoom.roomNumber
                                  : rm.roomId && rm.roomId !== 'unassigned'
                                  ? rm.roomId
                                  : 'Unassigned'}
                              </span>
                              {activeDropdown === `${rm.id}-roomNo` ? (
                                <ChevronUp size={15} color="#475569" />
                              ) : (
                                <ChevronDown size={15} color="#475569" />
                              )}
                            </button>

                            {activeDropdown === `${rm.id}-roomNo` && (
                              <div className="room-config-popover" style={{ bottom: 'calc(100% + 4px)', left: 0, minWidth: '150px' }}>
                                {/* Unassigned Option */}
                                <div
                                  className="room-config-popover-item"
                                  onClick={() => handleSelectRoomNo(rm.id, 'unassigned')}
                                >
                                  <span style={{ fontWeight: (!rm.roomId || rm.roomId === 'unassigned') ? 600 : 400 }}>
                                    Unassigned
                                  </span>
                                  {(!rm.roomId || rm.roomId === 'unassigned') && (
                                    <Check size={14} color="#2563EB" />
                                  )}
                                </div>

                                {/* Available Rooms of Selected Room Type */}
                                {matchingRooms.map((r) => {
                                  const isSelected = rm.roomId === r.id;
                                  return (
                                    <div
                                      key={r.id}
                                      className="room-config-popover-item"
                                      onClick={() => handleSelectRoomNo(rm.id, r.id)}
                                    >
                                      <span style={{ fontWeight: isSelected ? 600 : 400 }}>{r.roomNumber}</span>
                                      {isSelected && <Check size={14} color="#2563EB" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. Guests (A / C) (Aligned Center & Custom Popover matching Image 2) */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '8px', margin: '0 auto' }}>
                            {/* Adults */}
                            <div className="room-config-dropdown-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                              <button
                                type="button"
                                className="room-config-mini-btn"
                                onClick={() => setActiveDropdown(activeDropdown === `${rm.id}-adults` ? null : `${rm.id}-adults`)}
                              >
                                <span>{rm.adults}</span>
                                {activeDropdown === `${rm.id}-adults` ? (
                                  <ChevronUp size={13} color="#64748B" />
                                ) : (
                                  <ChevronDown size={13} color="#64748B" />
                                )}
                              </button>
                              <span className="room-config-sublabel">Adults</span>

                              {activeDropdown === `${rm.id}-adults` && (
                                <div
                                  className="room-config-popover room-config-mini-popover"
                                  style={{ top: '46px', left: '50%', transform: 'translateX(-50%)' }}
                                >
                                  {adultOptions.map((num) => {
                                    const isSelected = rm.adults === num;
                                    return (
                                      <div
                                        key={num}
                                        className="room-config-popover-item room-config-mini-popover-item"
                                        onClick={() => handleSelectAdults(rm.id, num)}
                                      >
                                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{num}</span>
                                        {isSelected && <Check size={13} color="#2563EB" />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Children */}
                            <div className="room-config-dropdown-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                              <button
                                type="button"
                                className="room-config-mini-btn"
                                onClick={() => setActiveDropdown(activeDropdown === `${rm.id}-children` ? null : `${rm.id}-children`)}
                              >
                                <span>{rm.children}</span>
                                {activeDropdown === `${rm.id}-children` ? (
                                  <ChevronUp size={13} color="#64748B" />
                                ) : (
                                  <ChevronDown size={13} color="#64748B" />
                                )}
                              </button>
                              <span className="room-config-sublabel">Children</span>

                              {activeDropdown === `${rm.id}-children` && (
                                <div
                                  className="room-config-popover room-config-mini-popover"
                                  style={{ top: '46px', left: '50%', transform: 'translateX(-50%)' }}
                                >
                                  {childOptions.map((num) => {
                                    const isSelected = rm.children === num;
                                    return (
                                      <div
                                        key={num}
                                        className="room-config-popover-item room-config-mini-popover-item"
                                        onClick={() => handleSelectChildren(rm.id, num)}
                                      >
                                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{num}</span>
                                        {isSelected && <Check size={13} color="#2563EB" />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 6. Rate (₹) */}
                        <td>
                          <input
                            type="number"
                            className="room-config-rate-input"
                            placeholder="Enter amount"
                            value={rm.rate}
                            onChange={(e) => handleUpdateRoomRow(rm.id, 'rate', e.target.value)}
                          />
                        </td>

                        {/* 7. Action (Red Trash Bin) */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="room-config-trash-btn"
                            onClick={() => handleRemoveRoomRow(rm.id)}
                            title="Remove Room"
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Guest Information (Matching User Screenshot) */}
          <div className="guest-info-card">
            <h2 className="guest-info-title">Guest Information</h2>
            <p className="guest-info-subtitle">
              Please provide the primary guest's contact and identification details for this reservation.
            </p>

            <div className="guest-info-room-badge">
              Room 1
            </div>

            {/* Row 1: Title, First Name, Last Name */}
            <div className="guest-info-row-1">
              <div className="add-res-field-group">
                <label className="guest-field-label">Title</label>
                <div className="guest-select-wrapper">
                  <select
                    className="guest-select"
                    value={guestTitle}
                    onChange={(e) => setGuestTitle(e.target.value)}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                  <ChevronDown size={14} className="guest-select-arrow" />
                </div>
              </div>

              <div className="add-res-field-group">
                <label className="guest-field-label">
                  First Name <span className="guest-required">*</span>
                </label>
                <input
                  type="text"
                  className="guest-input"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="add-res-field-group">
                <label className="guest-field-label">Last Name</label>
                <input
                  type="text"
                  className="guest-input"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Phone Number, Email Address */}
            <div className="guest-info-row-2">
              <div className="add-res-field-group">
                <label className="guest-field-label">
                  Phone Number <span className="guest-required">*</span>
                </label>
                <div className="guest-phone-group">
                  <div className="guest-phone-prefix">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </select>
                    <ChevronDown
                      size={12}
                      color="#64748B"
                      style={{ position: 'absolute', right: '6px', pointerEvents: 'none' }}
                    />
                  </div>
                  <input
                    type="tel"
                    className="guest-phone-input"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="add-res-field-group">
                <label className="guest-field-label">
                  Email Address <span className="guest-required">*</span>
                </label>
                <input
                  type="email"
                  className="guest-input"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
