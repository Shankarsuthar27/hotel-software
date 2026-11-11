import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import './reports.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Parses DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD or YYYY/MM/DD into { day, month (0-11), year }
 */
function parseDateString(str) {
  if (!str || typeof str !== 'string') {
    const now = new Date(2026, 9, 28);
    return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  }
  const clean = str.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/').map((p) => parseInt(p, 10));
    if (parts[0] > 1000) {
      // YYYY/MM/DD
      return {
        year: parts[0] || 2026,
        month: !isNaN(parts[1]) ? Math.max(0, Math.min(11, parts[1] - 1)) : 9,
        day: parts[2] || 28
      };
    }
    // DD/MM/YYYY
    return {
      day: parts[0] || 28,
      month: !isNaN(parts[1]) ? Math.max(0, Math.min(11, parts[1] - 1)) : 9,
      year: parts[2] || 2026
    };
  }
  if (clean.includes('-')) {
    const parts = clean.split('-').map((p) => parseInt(p, 10));
    if (parts[0] > 1000) {
      // YYYY-MM-DD
      return {
        year: parts[0] || 2026,
        month: !isNaN(parts[1]) ? Math.max(0, Math.min(11, parts[1] - 1)) : 9,
        day: parts[2] || 28
      };
    }
    // DD-MM-YYYY
    return {
      day: parts[0] || 28,
      month: !isNaN(parts[1]) ? Math.max(0, Math.min(11, parts[1] - 1)) : 9,
      year: parts[2] || 2026
    };
  }
  return { day: 28, month: 9, year: 2026 };
}

/**
 * Formats day, month (0-11), year into DD/MM/YYYY
 */
function formatDateToDisplay(day, month, year) {
  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  return `${dd}/${mm}/${year}`;
}

export default function ReportDatePicker({
  label,
  value,
  onChange,
  onOpenChange,
  placement = 'auto',
  align = 'auto',
  minYear = 2020,
  maxYear = 2035
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState({
    vertical: placement === 'auto' ? 'bottom' : placement,
    horizontal: align === 'auto' ? 'left' : align
  });
  const containerRef = useRef(null);

  // Parse currently selected date
  const parsedSelected = useMemo(() => parseDateString(value), [value]);

  // View state for navigating calendar months
  const [viewYear, setViewYear] = useState(parsedSelected.year);
  const [viewMonth, setViewMonth] = useState(parsedSelected.month);

  // Sync view state when value changes externally
  useEffect(() => {
    setViewYear(parsedSelected.year);
    setViewMonth(parsedSelected.month);
  }, [parsedSelected.year, parsedSelected.month]);

  // Notify parent component of open state (for z-index elevation)
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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

  // Close on Escape key
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
    const formatted = formatDateToDisplay(day, month, year);
    onChange(formatted);
    setIsOpen(false);
    setShowMonthMenu(false);
    setShowYearMenu(false);
  };

  const calculatePlacement = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1200;

    const popoverHeight = 330;
    const popoverWidth = 285;

    let v = placement;
    if (placement === 'auto') {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If not enough room below (< 330px) and there's more space above than below
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        v = 'top';
      } else {
        v = 'bottom';
      }
    }

    let h = align;
    if (align === 'auto') {
      if (rect.left + popoverWidth > viewportWidth - 20 && rect.right >= popoverWidth) {
        h = 'right';
      } else {
        h = 'left';
      }
    }

    setComputedPlacement({ vertical: v, horizontal: h });
  };

  useEffect(() => {
    if (!isOpen) return;
    calculatePlacement();
    const handleScrollOrResize = () => calculatePlacement();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, placement, align]);

  const toggleOpen = () => {
    if (!isOpen) {
      calculatePlacement();
      const parsed = parseDateString(value);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setShowMonthMenu(false);
    setShowYearMenu(false);
  };

  // Calendar matrix calculations
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

  // Next month leading days to complete grid (35 or 42 cells)
  const totalCells = prevDays.length + currentDays.length > 35 ? 42 : 35;
  const nextDays = [];
  const remainingCells = totalCells - (prevDays.length + currentDays.length);
  for (let i = 1; i <= remainingCells; i++) {
    nextDays.push(i);
  }

  // Year options list
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }
    return years;
  }, [minYear, maxYear]);

  return (
    <div
      className={`report-field-item ${isOpen ? 'active-picker-open' : ''}`}
      ref={containerRef}
      style={{ position: 'relative' }}
    >
      {label && <label className="report-field-label">{label}</label>}

      <div
        className="report-input-wrapper"
        onClick={toggleOpen}
        style={{ cursor: 'pointer' }}
      >
        <input
          type="text"
          className="report-text-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOpen) {
              toggleOpen();
            }
          }}
          placeholder="DD/MM/YYYY"
          style={{ cursor: 'pointer' }}
        />
        <Calendar
          size={15}
          className="report-input-icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Floating Datepicker Popover with dynamic auto-placement */}
      {isOpen && (
        <div
          className={`report-cal-popover ${computedPlacement.vertical === 'top' ? 'popover-top' : ''} ${computedPlacement.horizontal === 'right' ? 'popover-align-right' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="report-cal-header">
            {/* Prev Month Button */}
            <button
              type="button"
              className="report-cal-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={15} strokeWidth={2.2} />
            </button>

            {/* Month & Year Selectors */}
            <div className="report-cal-selectors-wrap">
              {/* Month Dropdown Pill */}
              <div
                className="report-cal-pill-wrapper"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMonthMenu((prev) => !prev);
                  setShowYearMenu(false);
                }}
              >
                <span className="report-cal-pill-label">
                  {MONTH_NAMES[viewMonth]}
                </span>
                <ChevronDown size={12} className="report-cal-pill-chevron" />

                {/* Custom Month Selector Menu */}
                {showMonthMenu && (
                  <div
                    className="report-cal-dropdown-menu month-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <div
                        key={m}
                        className={`report-cal-dropdown-item ${viewMonth === idx ? 'active' : ''}`}
                        onClick={() => {
                          setViewMonth(idx);
                          setShowMonthMenu(false);
                        }}
                      >
                        {m.substring(0, 3)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown Pill */}
              <div
                className="report-cal-pill-wrapper"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYearMenu((prev) => !prev);
                  setShowMonthMenu(false);
                }}
              >
                <span className="report-cal-pill-label">{viewYear}</span>
                <ChevronDown size={12} className="report-cal-pill-chevron" />

                {/* Custom Year Selector Menu */}
                {showYearMenu && (
                  <div
                    className="report-cal-dropdown-menu year-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {yearOptions.map((y) => (
                      <div
                        key={y}
                        className={`report-cal-dropdown-item ${viewYear === y ? 'active' : ''}`}
                        onClick={() => {
                          setViewYear(y);
                          setShowYearMenu(false);
                        }}
                      >
                        {y}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next Month Button */}
            <button
              type="button"
              className="report-cal-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Weekday Names Header */}
          <div className="report-cal-weekdays">
            {WEEKDAY_NAMES.map((d) => (
              <span key={d} className="report-cal-weekday">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="report-cal-days-grid">
            {/* Previous month days */}
            {prevDays.map((d) => {
              const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
              const prevYearVal = viewMonth === 0 ? viewYear - 1 : viewYear;
              return (
                <button
                  key={`prev-${d}`}
                  type="button"
                  className="report-cal-day-cell muted"
                  onClick={() => handleSelectDay(d, prevMonthIndex, prevYearVal)}
                >
                  {d}
                </button>
              );
            })}

            {/* Current month days */}
            {currentDays.map((d) => {
              const isSelected =
                parsedSelected.day === d &&
                parsedSelected.month === viewMonth &&
                parsedSelected.year === viewYear;

              return (
                <button
                  key={`cur-${d}`}
                  type="button"
                  className={`report-cal-day-cell current ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectDay(d, viewMonth, viewYear)}
                >
                  {d}
                </button>
              );
            })}

            {/* Next month days */}
            {nextDays.map((d) => {
              const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
              const nextYearVal = viewMonth === 11 ? viewYear + 1 : viewYear;
              return (
                <button
                  key={`next-${d}`}
                  type="button"
                  className="report-cal-day-cell muted"
                  onClick={() => handleSelectDay(d, nextMonthIndex, nextYearVal)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
