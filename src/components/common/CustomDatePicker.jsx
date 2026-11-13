import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import './custom-picker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Parses YYYY-MM-DD, DD/MM/YYYY, or Date object into { day, month (0-11), year }
 */
function parseDateValue(val) {
  if (!val) {
    const today = new Date();
    return { day: today.getDate(), month: today.getMonth(), year: today.getFullYear(), isEmpty: true };
  }

  if (typeof val === 'string') {
    const clean = val.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-').map(Number);
      if (parts[0] > 1000) {
        // YYYY-MM-DD
        return {
          year: parts[0],
          month: Math.max(0, Math.min(11, parts[1] - 1)),
          day: parts[2] || 1,
          isEmpty: false
        };
      }
    }
    if (clean.includes('/')) {
      const parts = clean.split('/').map(Number);
      if (parts[0] > 1000) {
        // YYYY/MM/DD
        return {
          year: parts[0],
          month: Math.max(0, Math.min(11, parts[1] - 1)),
          day: parts[2] || 1,
          isEmpty: false
        };
      }
      // DD/MM/YYYY
      return {
        day: parts[0] || 1,
        month: Math.max(0, Math.min(11, parts[1] - 1)),
        year: parts[2] || new Date().getFullYear(),
        isEmpty: false
      };
    }
  }

  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), isEmpty: false };
  }

  const today = new Date();
  return { day: today.getDate(), month: today.getMonth(), year: today.getFullYear(), isEmpty: true };
}

/**
 * Formats day, month (0-11), year to ISO string "YYYY-MM-DD"
 */
function toIsoDate(day, month, year) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minYear = 1920,
  maxYear = 2035,
  placement = 'auto'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState('bottom');

  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const activeYearRef = useRef(null);

  // Parse currently selected date
  const parsed = useMemo(() => parseDateValue(value), [value]);

  // Calendar View month & year
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  // Sync view when value changes externally
  useEffect(() => {
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }, [parsed.year, parsed.month]);

  // Calculate placement (top or bottom)
  const calculatePlacement = () => {
    if (!containerRef.current) return;
    if (placement !== 'auto') {
      setComputedPlacement(placement);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 800;
    const popoverHeight = 340;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      setComputedPlacement('top');
    } else {
      setComputedPlacement('bottom');
    }
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      calculatePlacement();
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setIsOpen(true);
      setShowMonthMenu(false);
      setShowYearMenu(false);
    } else {
      setIsOpen(false);
      setShowMonthMenu(false);
      setShowYearMenu(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowMonthMenu(false);
        setShowYearMenu(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowMonthMenu(false);
        setShowYearMenu(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active year into view when year menu opens
  useEffect(() => {
    if (showYearMenu && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: 'center' });
    }
  }, [showYearMenu]);

  // Navigation handlers
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setShowMonthMenu(false);
    setShowYearMenu(false);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setShowMonthMenu(false);
    setShowYearMenu(false);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day, month = viewMonth, year = viewYear) => {
    const iso = toIsoDate(day, month, year);
    if (onChange) {
      onChange(iso);
    }
    setIsOpen(false);
    setShowMonthMenu(false);
    setShowYearMenu(false);
  };

  // Generate Year options
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = minYear; y <= maxYear; y++) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Calendar Day Grid calculations
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Previous month trailing days
  const prevDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevDays.push(daysInPrevMonth - i);
  }

  // Current month days
  const currentDays = [];
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentDays.push(i);
  }

  // Next month leading days (complete to 35 or 42 cells)
  const totalCells = prevDays.length + currentDays.length > 35 ? 42 : 35;
  const nextDays = [];
  const remainingCells = totalCells - (prevDays.length + currentDays.length);
  for (let i = 1; i <= remainingCells; i++) {
    nextDays.push(i);
  }

  // Display text in the trigger
  const displayText = !parsed.isEmpty ? toIsoDate(parsed.day, parsed.month, parsed.year) : '';

  return (
    <div className="custom-picker-wrap" ref={containerRef}>
      {/* Input Trigger Button */}
      <div
        className={`custom-picker-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleOpen}
      >
        {displayText ? (
          <span className="custom-picker-value">{displayText}</span>
        ) : (
          <span className="custom-picker-placeholder">{placeholder}</span>
        )}
        <Calendar size={16} color="#64748b" style={{ flexShrink: 0 }} />
      </div>

      {/* Floating Calendar Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`custom-calendar-popover placement-${computedPlacement}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="custom-cal-header">
            {/* Prev Month */}
            <button
              type="button"
              className="custom-cal-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} strokeWidth={2.2} />
            </button>

            {/* Selectors: Month & Year */}
            <div className="custom-cal-selectors">
              {/* Month Dropdown */}
              <div
                className="custom-cal-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMonthMenu((prev) => !prev);
                  setShowYearMenu(false);
                }}
              >
                <span>{MONTH_NAMES[viewMonth]}</span>
                <ChevronDown size={14} color="#64748b" />

                {showMonthMenu && (
                  <div className="custom-cal-pill-menu month-menu" onClick={(e) => e.stopPropagation()}>
                    {MONTH_NAMES.map((name, idx) => (
                      <div
                        key={name}
                        className={`custom-cal-menu-item ${viewMonth === idx ? 'active' : ''}`}
                        onClick={() => {
                          setViewMonth(idx);
                          setShowMonthMenu(false);
                        }}
                      >
                        {name.substring(0, 3)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div
                className="custom-cal-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYearMenu((prev) => !prev);
                  setShowMonthMenu(false);
                }}
              >
                <span>{viewYear}</span>
                <ChevronDown size={14} color="#64748b" />

                {showYearMenu && (
                  <div className="custom-cal-pill-menu year-menu" onClick={(e) => e.stopPropagation()}>
                    {yearOptions.map((y) => {
                      const isSelected = viewYear === y;
                      return (
                        <div
                          key={y}
                          ref={isSelected ? activeYearRef : null}
                          className={`custom-cal-menu-item ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setViewYear(y);
                            setShowYearMenu(false);
                          }}
                        >
                          {y}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Next Month */}
            <button
              type="button"
              className="custom-cal-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="custom-cal-weekdays">
            {WEEKDAY_NAMES.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          {/* Day Numbers Grid */}
          <div className="custom-cal-grid">
            {/* Previous month trailing days */}
            {prevDays.map((d) => (
              <div
                key={`prev-${d}`}
                className="custom-cal-day other-month"
                onClick={() => {
                  const m = viewMonth === 0 ? 11 : viewMonth - 1;
                  const y = viewMonth === 0 ? viewYear - 1 : viewYear;
                  handleSelectDay(d, m, y);
                }}
              >
                {d}
              </div>
            ))}

            {/* Current month days */}
            {currentDays.map((d) => {
              const isSelected =
                !parsed.isEmpty &&
                parsed.year === viewYear &&
                parsed.month === viewMonth &&
                parsed.day === d;

              return (
                <div
                  key={`curr-${d}`}
                  className={`custom-cal-day current-month ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectDay(d, viewMonth, viewYear)}
                >
                  {d}
                </div>
              );
            })}

            {/* Next month leading days */}
            {nextDays.map((d) => (
              <div
                key={`next-${d}`}
                className="custom-cal-day other-month"
                onClick={() => {
                  const m = viewMonth === 11 ? 0 : viewMonth + 1;
                  const y = viewMonth === 11 ? viewYear + 1 : viewYear;
                  handleSelectDay(d, m, y);
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

