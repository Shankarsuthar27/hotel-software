import React, { useState, useRef, useEffect, useMemo } from 'react';
import './reservations-toolbar.css';

/**
 * ReservationsToolbar Component
 * Rebuilt exactly according to the authoritative OTAL PMS specification and screenshots:
 * - filter_list reset button
 * - Status combobox dropdown (All Active, All Statuses, Confirmed, In-house, Checked Out, Cancelled, No-Show, Unmapped) with custom scrollbar & checkmarks
 * - Date range picker [ 📅 From 📅 - To 📅 ] with interactive custom Calendar Popup matching image
 * - Search bar with placeholder "Search Name, Email, Phone"
 * - Booking Source dropdown with 'sell' icon
 * - VIP toggle with amber star
 * - Single Lady toggle with pink female icon
 * - Report download button
 * - Segmented controls: groups, group, list, grid_view
 */
export default function ReservationsToolbar({
  statusFilter = 'all_active',
  onStatusFilterChange,
  searchQuery = '',
  onSearchChange,
  fromDate = '',
  onFromDateChange,
  toDate = '',
  onToDateChange,
  sourceFilter = 'all',
  onSourceChange,
  filterVip = false,
  onToggleVip,
  filterSingleLady = false,
  onToggleSingleLady,
  viewMode = 'grid',
  onViewModeChange,
  bookingType = 'ALL',
  onBookingTypeChange,
  onResetFilters,
  onExportReport
}) {
  // Dropdown states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calendar View Date: defaults to October 2026 or fromDate's month
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    if (fromDate) {
      const d = new Date(fromDate + 'T00:00:00');
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2026, 9, 1); // October 2026
  });

  const statusDropdownRef = useRef(null);
  const sourceRef = useRef(null);
  const calendarRef = useRef(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setIsSourceOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsStatusOpen(false);
        setIsSourceOpen(false);
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Status Filter Options matching OTAL PMS dropdown specification
  const statusOptions = [
    { value: 'all_active', label: 'All Active' },
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_house', label: 'In-house' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No-Show' },
    { value: 'unmapped', label: 'Unmapped' }
  ];

  const currentStatusLabel =
    statusOptions.find((opt) => opt.value === statusFilter)?.label || 'All Active';

  // Booking Sources
  const bookingSources = [
    { value: 'all', label: 'Booking Source (All)' },
    { value: 'WALK_IN', label: 'Walk-in' },
    { value: 'BOOKING_COM', label: 'Booking.com' },
    { value: 'AGODA', label: 'Agoda' },
    { value: 'DIRECT', label: 'Direct Website' },
    { value: 'MAKEMYTRIP', label: 'MakeMyTrip' }
  ];

  const currentSourceLabel =
    sourceFilter === 'all'
      ? 'Booking Source'
      : (bookingSources.find((s) => s.value === sourceFilter)?.label || sourceFilter);

  // Calendar Helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Today string for highlighting October 27, 2026
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
  };

  const handlePrevMonth = () => {
    setCalendarViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCalendarViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Build calendar matrix (Sunday to Saturday)
  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Trailing days from previous month (e.g. Sep 27, 28, 29, 30 for Oct 2026)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      days.push({
        dayNum,
        dateStr: `${y}-${m}-${dStr}`,
        isCurrentMonth: false
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const y = year;
      const m = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        dayNum: d,
        dateStr: `${y}-${m}-${dStr}`,
        isCurrentMonth: true
      });
    }

    return days;
  }, [calendarViewDate]);

  // Click on a day in calendar
  const handleDayClick = (clickedDateStr) => {
    if (!fromDate || (fromDate && toDate)) {
      // Start new selection range with From date
      if (onFromDateChange) onFromDateChange(clickedDateStr);
      if (onToDateChange) onToDateChange('');
    } else if (fromDate && !toDate) {
      if (clickedDateStr < fromDate) {
        // If clicked earlier date, reset From date to clicked
        if (onFromDateChange) onFromDateChange(clickedDateStr);
      } else {
        // Set To date and finish range
        if (onToDateChange) onToDateChange(clickedDateStr);
        // Automatically close calendar after selecting range
        setTimeout(() => {
          setIsCalendarOpen(false);
        }, 220);
      }
    }
  };

  return (
    <div className="w-full flex flex-wrap items-center gap-2 px-2 py-2 otal-res-toolbar">
      {/* 1. Subtle Filter Reset Button */}
      <button
        type="button"
        className="otal-filter-icon-btn"
        title="Reset All Filters"
        onClick={onResetFilters}
      >
        <span className="material-symbols-outlined select-none text-slate-400">
          filter_list
        </span>
      </button>

      {/* 2. Status Dropdown (All Active, All Statuses, Confirmed, In-house, etc.) */}
      <div className="relative otal-status-dropdown-wrap" ref={statusDropdownRef}>
        <button
          type="button"
          className={`otal-status-btn ${isStatusOpen ? 'open' : ''}`}
          onClick={() => setIsStatusOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={isStatusOpen}
        >
          <span className="truncate">{currentStatusLabel}</span>
          <span
            className={`material-symbols-outlined otal-status-arrow ${
              isStatusOpen ? 'open' : ''
            }`}
          >
            {isStatusOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          </span>
        </button>

        {isStatusOpen && (
          <div className="otal-status-dropdown-menu" role="menu">
            {statusOptions.map((opt) => {
              const isSelected = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`otal-status-menu-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (onStatusFilterChange) onStatusFilterChange(opt.value);
                    setIsStatusOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined check-icon">check</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Date Range Picker [ 📅 From 📅 - To 📅 ] with Interactive Calendar Popup */}
      <div className="relative otal-date-range-container" ref={calendarRef}>
        <div
          className={`otal-date-range-box ${isCalendarOpen ? 'active' : ''}`}
          onClick={() => setIsCalendarOpen((prev) => !prev)}
          role="button"
          tabIndex={0}
        >
          {/* Calendar icon 1 */}
          <span className="material-symbols-outlined select-none text-slate-400">
            calendar_month
          </span>

          {/* From Label / Value */}
          <span className={`otal-date-text ${fromDate ? 'has-date' : 'placeholder'}`}>
            {fromDate ? formatDisplayDate(fromDate) : 'From'}
          </span>

          {/* Calendar icon 2 */}
          <span className="material-symbols-outlined select-none text-slate-400">
            calendar_month
          </span>

          {/* Separator - To */}
          <span className="otal-date-sep">
            - To
          </span>

          {/* Calendar icon 3 */}
          <span className="material-symbols-outlined select-none text-slate-400">
            calendar_month
          </span>

          {/* Optional To Date Label */}
          {toDate && (
            <span className="otal-date-text has-date ml-0.5">
              {formatDisplayDate(toDate)}
            </span>
          )}

          {/* Quick Clear button if dates selected */}
          {(fromDate || toDate) && (
            <button
              type="button"
              className="otal-date-clear-icon"
              title="Clear Dates"
              onClick={(e) => {
                e.stopPropagation();
                if (onFromDateChange) onFromDateChange('');
                if (onToDateChange) onToDateChange('');
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                close
              </span>
            </button>
          )}
        </div>

        {/* Custom Calendar Popup Modal matching Image 4 */}
        {isCalendarOpen && (
          <div className="otal-calendar-popup">
            {/* Calendar Header with Navigation */}
            <div className="otal-calendar-header">
              <button
                type="button"
                className="otal-cal-nav-btn"
                onClick={handlePrevMonth}
                title="Previous month"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="otal-cal-title">
                {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
              </div>

              <button
                type="button"
                className="otal-cal-nav-btn"
                onClick={handleNextMonth}
                title="Next month"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Weekday Names Header */}
            <div className="otal-cal-weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="otal-cal-weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="otal-cal-grid">
              {calendarDays.map((cell, idx) => {
                const isToday = cell.dateStr === todayStr;
                const isFrom = cell.dateStr === fromDate;
                const isTo = cell.dateStr === toDate;
                const inRange =
                  fromDate && toDate && cell.dateStr > fromDate && cell.dateStr < toDate;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`otal-cal-day ${
                      cell.isCurrentMonth ? 'current-month' : 'other-month'
                    } ${isToday ? 'today' : ''} ${isFrom ? 'selected-from' : ''} ${
                      isTo ? 'selected-to' : ''
                    } ${inRange ? 'in-range' : ''}`}
                    onClick={() => handleDayClick(cell.dateStr)}
                  >
                    {cell.dayNum}
                  </button>
                );
              })}
            </div>

            {/* Calendar Footer Shortcuts */}
            <div className="otal-cal-footer">
              <div className="otal-cal-helper-text">
                {!fromDate
                  ? 'Select Check-in'
                  : !toDate
                  ? 'Select Check-out'
                  : `${fromDate} → ${toDate}`}
              </div>
              <div className="flex items-center gap-1.5">
                {(fromDate || toDate) && (
                  <button
                    type="button"
                    className="otal-cal-footer-btn clear"
                    onClick={() => {
                      if (onFromDateChange) onFromDateChange('');
                      if (onToDateChange) onToDateChange('');
                    }}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  className="otal-cal-footer-btn today"
                  onClick={() => {
                    if (onFromDateChange) onFromDateChange(todayStr);
                    if (onToDateChange) onToDateChange('');
                  }}
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Search Bar */}
      <div className="otal-search-box">
        <span className="material-symbols-outlined otal-search-icon">
          search
        </span>
        <input
          className="otal-search-input"
          placeholder="Search Name, Email, Phone"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      {/* 5. Booking Source Combobox */}
      <div className="relative otal-combobox-wrap" ref={sourceRef}>
        <button
          className={`otal-combobox-btn ${isSourceOpen ? 'open' : ''}`}
          role="combobox"
          aria-expanded={isSourceOpen}
          type="button"
          onClick={() => setIsSourceOpen((prev) => !prev)}
        >
          <div className="flex items-center flex-1 min-w-0">
            <span className="material-symbols-outlined select-none mr-2 text-gray-500" style={{ fontSize: '16px' }}>
              sell
            </span>
            <span className="capitalize truncate text-gray-600">
              {currentSourceLabel}
            </span>
          </div>
          <span
            className="material-symbols-outlined select-none ml-2 text-gray-400"
            style={{
              fontSize: '20px',
              transform: isSourceOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }}
          >
            keyboard_arrow_down
          </span>
        </button>

        {isSourceOpen && (
          <div className="otal-combobox-dropdown" role="menu">
            {bookingSources.map((source) => (
              <button
                key={source.value}
                type="button"
                className={`otal-combobox-item ${sourceFilter === source.value ? 'active' : ''}`}
                onClick={() => {
                  if (onSourceChange) onSourceChange(source.value);
                  setIsSourceOpen(false);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  {sourceFilter === source.value ? 'check' : 'sell'}
                </span>
                <span>{source.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 6. VIP Filter Button */}
      <button
        type="button"
        className={`otal-vip-btn ${filterVip ? 'active' : ''}`}
        onClick={onToggleVip}
      >
        <span className="material-symbols-outlined select-none text-[#D97706]" style={{ fontSize: '20px' }}>
          star
        </span>
        <span className="small-title-4 ml-1">VIP</span>
      </button>

      {/* 7. Single Lady Filter Button */}
      <button
        type="button"
        className={`otal-single-lady-btn ${filterSingleLady ? 'active' : ''}`}
        onClick={onToggleSingleLady}
      >
        <span className="material-symbols-outlined select-none text-[#C026D3]" style={{ fontSize: '20px' }}>
          female
        </span>
        <span className="small-title-4 ml-1">Single Lady</span>
      </button>

      {/* 8. Right Cluster: Report Button + View Mode Controls */}
      <div className="ml-auto flex items-center gap-2 shrink-0 otal-right-cluster">
        {/* Report Button */}
        <button
          type="button"
          className="otal-report-btn"
          id="download-reservation-report-btn"
          onClick={onExportReport}
          title="Download Reservation Report (Excel)"
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>
            download
          </span>
          <span className="small-title-4">Report</span>
        </button>

        {/* Segmented View Mode Toggle Group */}
        <div className="otal-view-toggle-group">
          {/* All Bookings */}
          <button
            type="button"
            className={`otal-toggle-tab-btn ${bookingType === 'ALL' ? 'active' : ''}`}
            title="All Bookings"
            onClick={() => onBookingTypeChange && onBookingTypeChange('ALL')}
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              groups
            </span>
          </button>

          {/* Group Bookings */}
          <button
            type="button"
            className={`otal-toggle-tab-btn ${bookingType === 'GROUP' ? 'active' : ''}`}
            title="Group Bookings Only"
            onClick={() => onBookingTypeChange && onBookingTypeChange('GROUP')}
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              group
            </span>
          </button>

          {/* List View */}
          <button
            type="button"
            className={`otal-toggle-action-btn has-border-right ${viewMode === 'list' ? 'active' : ''}`}
            title="List View"
            onClick={() => onViewModeChange && onViewModeChange('list')}
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              list
            </span>
          </button>

          {/* Grid View */}
          <button
            type="button"
            className={`otal-toggle-action-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="Grid View"
            onClick={() => onViewModeChange && onViewModeChange('grid')}
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              grid_view
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
