import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Ban, X, Calendar, Moon, ChevronDown } from 'lucide-react';
import './block-room-drawer.css';

export interface BlockRoomData {
  checkIn: string; // 'YYYY-MM-DD'
  checkOut: string; // 'YYYY-MM-DD'
  roomType: string;
  roomNumber: string;
  reason: string;
}

export interface BlockRoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (data: BlockRoomData) => void;
  onClear?: () => void;
  roomType?: string;
  roomNumber?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialReason?: string;
  availableRooms?: Array<{ id: string; roomNumber: string; roomTypeId?: string; roomTypeName?: string }>;
  availableRoomTypes?: Array<{ id: string; name: string }>;
  onRelease?: () => void;
  isBlocked?: boolean;
}

// Format ISO date (YYYY-MM-DD) to DD/MM/YYYY for display
const formatDateToDisplay = (isoStr: string): string => {
  if (!isoStr) return '02/11/2026';
  const parts = String(isoStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
};

// Calculate number of nights between check-in and check-out (same day = 1 night)
const calculateNights = (inDate: string, outDate: string): number => {
  if (!inDate || !outDate) return 1;
  const d1 = new Date(inDate + (inDate.includes('T') ? '' : 'T00:00:00'));
  const d2 = new Date(outDate + (outDate.includes('T') ? '' : 'T00:00:00'));
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

interface MiniDatePickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

const MiniDatePicker: React.FC<MiniDatePickerProps> = ({
  label,
  value,
  onChange,
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dateObj = useMemo(() => {
    if (!value) return new Date(2026, 10, 2);
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(2026, 10, 2) : d;
  }, [value]);

  const [viewYear, setViewYear] = useState(() => dateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => dateObj.getMonth());

  useEffect(() => {
    if (dateObj && !isNaN(dateObj.getTime())) {
      setViewYear(dateObj.getFullYear());
      setViewMonth(dateObj.getMonth());
    }
  }, [value, dateObj]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const displayFormatted = useMemo(() => {
    return formatDateToDisplay(value);
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
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

  return (
    <div className="block-room-field-wrap" ref={containerRef}>
      <label className="block-room-label">
        {label} {required && <span className="block-room-required-star">*</span>}
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
        className={`block-room-input-box ${isOpen ? 'open' : ''}`}
      >
        <span className="block-room-input-text">{displayFormatted}</span>
        <Calendar className="block-room-input-icon" size={16} />
      </div>

      {isOpen && (
        <div className="block-room-cal-popover">
          <div className="block-room-cal-header">
            <button
              type="button"
              onClick={prevMonth}
              className="block-room-cal-nav"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="block-room-cal-title">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="block-room-cal-nav"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="block-room-cal-weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="block-room-cal-weekday">
                {d}
              </span>
            ))}
          </div>
          <div className="block-room-cal-grid">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="block-room-cal-cell empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const sel = isSelected(day);
              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`block-room-cal-cell ${sel ? 'selected' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const BlockRoomDrawer: React.FC<BlockRoomDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  roomType = 'Delux Room',
  roomNumber = '101',
  initialCheckIn = '2026-11-02',
  initialCheckOut = '2026-11-02',
  initialReason = '',
  availableRooms = [],
  availableRoomTypes = [],
  onRelease,
  isBlocked = false,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [selectedRoomType, setSelectedRoomType] = useState<string>(roomType);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(roomNumber);
  const [reason, setReason] = useState<string>(initialReason || '');

  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const reasonRef = useRef<HTMLDivElement>(null);

  // Lock background scrolling and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open', 'modal-open');
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (bodyRef.current) bodyRef.current.scrollTop = 0;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.classList.remove('drawer-open', 'modal-open');
        document.body.style.overflow = prevBodyOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Sync state with props
  useEffect(() => {
    if (isOpen) {
      setCheckIn(initialCheckIn || '2026-11-02');
      setCheckOut(initialCheckOut || '2026-11-02');
      setSelectedRoomType(roomType || 'Delux Room');
      setSelectedRoomNumber(roomNumber || '101');
      setReason(initialReason || '');
      setIsReasonOpen(false);
    }
  }, [isOpen, roomType, roomNumber, initialCheckIn, initialCheckOut, initialReason]);

  // Outside click for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (reasonRef.current && !reasonRef.current.contains(target)) {
        setIsReasonOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredRooms = useMemo(() => {
    if (!availableRooms || availableRooms.length === 0) {
      return [
        { id: 'rm_101', roomNumber: '101' },
        { id: 'rm_102', roomNumber: '102' },
        { id: 'rm_201', roomNumber: '201' },
        { id: 'rm_202', roomNumber: '202' },
      ];
    }
    const matched = availableRooms.filter(r => {
      if (!selectedRoomType) return true;
      const rTypeName = r.roomTypeName || '';
      return rTypeName.toLowerCase().includes(selectedRoomType.toLowerCase());
    });
    return matched.length > 0 ? matched : availableRooms;
  }, [availableRooms, selectedRoomType]);

  if (!isOpen) return null;

  const nights = calculateNights(checkIn, checkOut);

  const handleClear = () => {
    setReason('');
    setCheckIn('2026-11-02');
    setCheckOut('2026-11-02');
    setIsReasonOpen(false);
    setIsRoomTypeOpen(false);
    setIsRoomSelectOpen(false);
    if (onClear) onClear();
  };

  const handleApply = () => {
    const finalReason = reason || 'Maintenance';
    if (onApply) {
      onApply({
        checkIn,
        checkOut,
        roomType: selectedRoomType,
        roomNumber: selectedRoomNumber,
        reason: finalReason,
      });
    }
    onClose();
  };

  const reasonsList = [
    'Maintenance',
    'Deep Cleaning',
    'Renovation',
    'Out of Order',
    'Out of Service',
    'Hold',
    'Photographer',
    'Staff',
    'Other',
  ];

  const drawerElement = (
    <div className="block-room-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="block-room-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="block-room-heading"
      >
        {/* 1. Drawer Header */}
        <div className="block-room-header">
          <div className="block-room-header-left">
            <div className="block-room-icon-badge">
              <Ban size={20} strokeWidth={2.2} />
            </div>
            <h2 id="block-room-heading" className="block-room-title">
              Block Room
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="block-room-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Form Body */}
        <div className="block-room-body" ref={bodyRef}>
          {/* Row 1: Check-in / Out & Nights Row */}
          <div className="block-room-dates-row">
            <MiniDatePicker
              label="Check-in"
              value={checkIn}
              onChange={(val) => {
                setCheckIn(val);
                if (val > checkOut) {
                  setCheckOut(val);
                }
              }}
            />

            <div className="block-room-nights-pill">
              <Moon size={13} color="#ffffff" fill="#ffffff" />
              <span>
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>

            <MiniDatePicker
              label="Check-out"
              value={checkOut}
              onChange={(val) => {
                setCheckOut(val);
              }}
            />
          </div>

          {/* Row 2: Room Type (Unchangeable) */}
          <div className="block-room-field-wrap">
            <label className="block-room-label">Room Type</label>
            <div
              className="block-room-input-box readonly"
              style={{ cursor: 'default' }}
              title="Room Type is fixed for this room"
            >
              <span className="block-room-input-text">{selectedRoomType || 'Delux Room'}</span>
              <ChevronDown
                size={16}
                className="block-room-input-icon"
                style={{ opacity: 0.55 }}
              />
            </div>
          </div>

          {/* Row 3: Room (Unchangeable) */}
          <div className="block-room-field-wrap">
            <label className="block-room-label">Room</label>
            <div
              className="block-room-input-box readonly"
              style={{ cursor: 'default' }}
              title="Room is fixed for this room"
            >
              <span className="block-room-input-text">
                {selectedRoomType || 'Delux Room'} {selectedRoomNumber || '101'}
              </span>
              <ChevronDown
                size={16}
                className="block-room-input-icon"
                style={{ opacity: 0.55 }}
              />
            </div>
          </div>

          {/* Row 4: Reason * */}
          <div className="block-room-field-wrap" ref={reasonRef}>
            <label className="block-room-label">
              Reason <span className="block-room-required-star">*</span>
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setIsReasonOpen(!isReasonOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsReasonOpen(!isReasonOpen);
                }
              }}
              className={`block-room-input-box ${isReasonOpen ? 'open' : ''}`}
            >
              <span className={`block-room-input-text ${!reason ? 'placeholder' : ''}`}>
                {reason || 'Select Reason'}
              </span>
              <ChevronDown
                size={16}
                className="block-room-input-icon"
                style={{
                  transform: isReasonOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </div>

            {isReasonOpen && (
              <div className="block-room-dropdown-menu">
                {reasonsList.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setReason(opt);
                      setIsReasonOpen(false);
                    }}
                    className={`block-room-dropdown-item ${
                      reason === opt ? 'selected' : ''
                    }`}
                  >
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer Strip */}
        <div className="block-room-footer">
          {isBlocked && onRelease && (
            <button
              type="button"
              onClick={() => {
                onRelease();
                onClose();
              }}
              className="block-room-btn-release"
            >
              Release to Available
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="block-room-btn-clear"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="block-room-btn-apply"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(drawerElement, document.body)
    : drawerElement;
};

export default BlockRoomDrawer;
