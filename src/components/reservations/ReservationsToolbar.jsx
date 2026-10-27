import React, { useState, useRef, useEffect } from 'react';
import './reservations-toolbar.css';

/**
 * ReservationsToolbar Component
 * Rebuilt exactly according to OTAL PMS Specification
 * Measured element: div.w-full (810.4px × 96px)
 * Accessible name: filter_listcalendar_monthcalendar_month-calendar_monthsearchsellBooking Sourcekeyboard_arrow_downstarVIPfemaleSingle LadydownloadReportgroupsgrouplistgrid_view
 */
export default function ReservationsToolbar({
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
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const sourceRef = useRef(null);
  const fromDateInputRef = useRef(null);
  const toDateInputRef = useRef(null);

  // Close source dropdown on click outside or escape
  useEffect(() => {
    if (!isSourceOpen) return;
    const handleClickOutside = (e) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setIsSourceOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSourceOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSourceOpen]);

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

  return (
    <div className="w-full flex flex-wrap items-center gap-2 px-2 py-2 otal-res-toolbar">
      {/* 1. Blue-Bordered Filter Button */}
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 shrink-0 border-blue-500 border-2 otal-filter-icon-btn"
        title="Reset All Filters"
        onClick={onResetFilters}
      >
        <span className="material-symbols-outlined select-none text-blue-500" style={{ fontSize: '15px' }}>
          filter_list
        </span>
      </button>

      {/* 2. Date Range Picker (From - To) */}
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-0.5 h-9 shrink-0 otal-date-range-box">
        <span className="material-symbols-outlined select-none text-slate-400 shrink-0" style={{ fontSize: '16px' }}>
          calendar_month
        </span>

        {/* From Date Box */}
        <div
          className="w-full cursor-pointer"
          type="button"
          aria-haspopup="dialog"
          aria-expanded="false"
          data-state="closed"
          onClick={() => {
            if (fromDateInputRef.current) {
              if (typeof fromDateInputRef.current.showPicker === 'function') {
                fromDateInputRef.current.showPicker();
              } else {
                fromDateInputRef.current.focus();
              }
            }
          }}
        >
          <div className="w-full relative">
            <div className="flex items-center justify-between" />
            <div className="relative flex">
              <input
                ref={fromDateInputRef}
                className="flex max-[1370px]:rounded-md rounded-lg bg-white max-[1370px]:h-9 small-title-4 outline-none border focus:border-[#3B82F6]/20 focus:bg-white transition-all placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 cursor-pointer select-none max-[1370px]:h-7! h-8 w-28 border-none shadow-none small-title-2 p-0 focus:ring-0 otal-date-input"
                placeholder="From"
                value={fromDate}
                type={fromDate ? 'date' : 'text'}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                onChange={(e) => onFromDateChange && onFromDateChange(e.target.value)}
              />
              <div className="flex absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none otal-date-icon-right">
                <span className="material-symbols-outlined select-none text-gray-500" style={{ fontSize: '18px' }}>
                  calendar_month
                </span>
              </div>
            </div>
            <div className="grid absolute transition-all duration-200 ease-in-out grid-rows-[0fr] opacity-0 pointer-events-none w-full">
              <div className="overflow-hidden small-title-2" />
            </div>
          </div>
        </div>

        <span className="text-slate-400 small-title-2 otal-date-sep">-</span>

        {/* To Date Box */}
        <div
          className="w-full cursor-pointer"
          type="button"
          aria-haspopup="dialog"
          aria-expanded="false"
          data-state="closed"
          onClick={() => {
            if (toDateInputRef.current) {
              if (typeof toDateInputRef.current.showPicker === 'function') {
                toDateInputRef.current.showPicker();
              } else {
                toDateInputRef.current.focus();
              }
            }
          }}
        >
          <div className="w-full relative">
            <div className="flex items-center justify-between" />
            <div className="relative flex">
              <input
                ref={toDateInputRef}
                className="flex max-[1370px]:rounded-md rounded-lg bg-white max-[1370px]:h-9 small-title-4 outline-none border focus:border-[#3B82F6]/20 focus:bg-white transition-all placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 cursor-pointer select-none max-[1370px]:h-7! h-8 w-28 border-none shadow-none small-title-2 p-0 focus:ring-0 otal-date-input"
                placeholder="To"
                value={toDate}
                type={toDate ? 'date' : 'text'}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                onChange={(e) => onToDateChange && onToDateChange(e.target.value)}
              />
              <div className="flex absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none otal-date-icon-right">
                <span className="material-symbols-outlined select-none text-gray-500" style={{ fontSize: '18px' }}>
                  calendar_month
                </span>
              </div>
            </div>
            <div className="grid absolute transition-all duration-200 ease-in-out grid-rows-[0fr] opacity-0 pointer-events-none w-full">
              <div className="overflow-hidden small-title-2" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="group flex items-center rounded-lg border border-slate-200 bg-white/80 hover:bg-white focus-within:border-2 focus-within:border-[#3B82F6] focus-within:ring-blue-500/20 h-9 transition-all duration-300 ease-in-out max-w-full w-56 otal-search-box">
        <span
          className="material-symbols-outlined select-none ml-3 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-[#3B82F6] otal-search-icon"
          style={{ fontSize: '20px' }}
        >
          search
        </span>
        <div className="flex-1">
          <div className="w-full relative">
            <div className="flex items-center justify-between" />
            <div className="relative flex">
              <input
                className="flex max-[1370px]:rounded-md rounded-lg max-[1370px]:h-9 small-title-4 outline-none focus:border-[#3B82F6]/20 focus:bg-white transition-all placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 max-[1371px]:h-8! h-full w-full border-0 bg-transparent px-3 focus-visible:ring-0 focus-visible:ring-offset-0 otal-search-input"
                placeholder="Search Name, Email, Phone"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </div>
            <div className="grid absolute transition-all duration-200 ease-in-out grid-rows-[0fr] opacity-0 pointer-events-none w-full">
              <div className="overflow-hidden small-title-2" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Booking Source Combobox */}
      <div className="flex flex-col relative h-9 w-52 shrink-0 otal-combobox-wrap" ref={sourceRef}>
        <button
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent-foreground px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out rounded-lg shadow-none border bg-white hover:bg-slate-50 focus:border-[#3B82F6]/50 focus:bg-white focus:ring-4 focus:ring-[#3B82F6]/5 ring-offset-0 text-gray-500 max-[1370px]:h-9 h-9 w-52 shrink-0 otal-combobox-btn ${
            isSourceOpen ? 'open' : ''
          }`}
          role="combobox"
          aria-expanded={isSourceOpen}
          type="button"
          id="radix-_r_11d_"
          aria-haspopup="menu"
          data-state={isSourceOpen ? 'open' : 'closed'}
          onClick={() => setIsSourceOpen((prev) => !prev)}
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="mr-2 shrink-0 flex items-center justify-center text-gray-500">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '16px' }}>
                sell
              </span>
            </div>
            <span className="capitalize transition-colors duration-200 truncate text-gray-500">
              {currentSourceLabel}
            </span>
          </div>
          <div className="ml-auto flex items-center">
            <span
              className="material-symbols-outlined select-none shrink-0 ml-2 transition-transform duration-300 ease-out text-gray-400 opacity-70"
              style={{
                fontSize: '20px',
                transform: isSourceOpen ? 'rotate(180deg)' : 'none'
              }}
            >
              keyboard_arrow_down
            </span>
          </div>
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

        <div className="grid transition-all duration-200 ease-in-out grid-rows-[0fr] opacity-0">
          <div className="overflow-hidden" />
        </div>
      </div>

      {/* 5. VIP Filter Button */}
      <button
        type="button"
        className={`cursor-pointer justify-center gap-2 whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex items-center shrink-0 transition-all duration-300 ease-in-out text-gray-600 border-gray-200 w-24 otal-vip-btn ${
          filterVip ? 'active' : ''
        }`}
        onClick={onToggleVip}
      >
        <span className="material-symbols-outlined select-none shrink-0 text-[#D97706]" style={{ fontSize: '24px' }}>
          star
        </span>
        <span className="small-title-4 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap w-auto opacity-100 ml-1.5">
          VIP
        </span>
      </button>

      {/* 6. Single Lady Filter Button */}
      <button
        type="button"
        className={`cursor-pointer justify-center gap-2 whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex items-center shrink-0 transition-all duration-300 ease-in-out text-gray-600 border-gray-200 w-36 otal-single-lady-btn ${
          filterSingleLady ? 'active' : ''
        }`}
        onClick={onToggleSingleLady}
      >
        <span className="material-symbols-outlined select-none shrink-0 text-[#C026D3]" style={{ fontSize: '24px' }}>
          female
        </span>
        <span className="small-title-4 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap w-auto opacity-100 ml-1.5">
          Single Lady
        </span>
      </button>

      {/* 7. Right Cluster: Report Button + View Mode Segmented Controls */}
      <div className="ml-auto flex items-center gap-2 shrink-0 otal-right-cluster">
        {/* Report Button */}
        <button
          type="button"
          className="cursor-pointer justify-center whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 flex items-center gap-1.5 shrink-0 text-slate-600 border-slate-200 h-9 otal-report-btn"
          id="download-reservation-report-btn"
          data-state="closed"
          onClick={onExportReport}
          title="Download Reservation Report (Excel)"
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '16px' }}>
            download
          </span>
          <span className="small-title-4 whitespace-nowrap">Report</span>
        </button>

        {/* Segmented View Mode Toggle Group */}
        <div className="inline-flex items-center border border-slate-200 rounded-sm bg-white overflow-hidden h-9 otal-view-toggle-group">
          <div dir="ltr" data-orientation="horizontal" className="shrink-0">
            <div
              role="tablist"
              aria-orientation="horizontal"
              className="text-muted-foreground flex h-9 items-center justify-start rounded-none p-0 bg-transparent"
              tabIndex={0}
              data-orientation="horizontal"
              style={{ outline: 'none' }}
            >
              {/* ALL BOOKINGS TAB */}
              <span className="inline-flex" data-state="closed">
                <button
                  type="button"
                  role="tab"
                  aria-selected={bookingType === 'ALL'}
                  aria-controls="radix-_r_11g_-content-ALL"
                  data-state={bookingType === 'ALL' ? 'active' : 'inactive'}
                  id="radix-_r_11g_-trigger-ALL"
                  className={`whitespace-nowrap small-title-4 font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group inline-flex cursor-pointer items-center justify-center w-15 h-9 p-0 transition-all duration-200 ease-in-out bg-transparent data-[state=active]:bg-blue-50/80 data-[state=active]:text-blue-600 text-slate-500 hover:text-slate-800 rounded-none border-0 border-r border-slate-200 shadow-none data-[state=active]:shadow-none otal-toggle-tab-btn ${
                    bookingType === 'ALL' ? 'active' : ''
                  }`}
                  tabIndex={-1}
                  data-orientation="horizontal"
                  title="All Bookings"
                  onClick={() => onBookingTypeChange && onBookingTypeChange('ALL')}
                >
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                    groups
                  </span>
                </button>
              </span>

              {/* GROUP BOOKINGS TAB */}
              <span className="inline-flex" data-state="closed">
                <button
                  type="button"
                  role="tab"
                  aria-selected={bookingType === 'GROUP'}
                  aria-controls="radix-_r_11g_-content-GROUP"
                  data-state={bookingType === 'GROUP' ? 'active' : 'inactive'}
                  id="radix-_r_11g_-trigger-GROUP"
                  className={`whitespace-nowrap small-title-4 font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group inline-flex cursor-pointer items-center justify-center w-15 h-9 p-0 transition-all duration-200 ease-in-out bg-transparent data-[state=active]:bg-blue-50/80 data-[state=active]:text-blue-600 text-slate-500 hover:text-slate-800 rounded-none border-0 border-r border-slate-200 shadow-none data-[state=active]:shadow-none otal-toggle-tab-btn ${
                    bookingType === 'GROUP' ? 'active' : ''
                  }`}
                  tabIndex={-1}
                  data-orientation="horizontal"
                  title="Group Bookings Only"
                  onClick={() => onBookingTypeChange && onBookingTypeChange('GROUP')}
                >
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                    group
                  </span>
                </button>
              </span>
            </div>
          </div>

          {/* LIST VIEW BUTTON */}
          <button
            type="button"
            className={`gap-2 whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed inline-flex cursor-pointer items-center justify-center rounded-none w-15 h-9 p-0 transition-all duration-200 ease-in-out border-0 border-r border-slate-200 bg-transparent text-slate-500 hover:text-slate-800 hover:bg-white otal-toggle-action-btn has-border-right ${
              viewMode === 'list' ? 'active' : ''
            }`}
            data-state={viewMode === 'list' ? 'active' : 'closed'}
            title="List View"
            onClick={() => onViewModeChange && onViewModeChange('list')}
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              list
            </span>
          </button>

          {/* GRID VIEW BUTTON */}
          <button
            type="button"
            className={`gap-2 whitespace-nowrap small-title-4 font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground inline-flex cursor-pointer items-center justify-center rounded-none w-15 h-9 p-0 transition-all duration-200 ease-in-out otal-toggle-action-btn ${
              viewMode === 'grid' ? 'active' : ''
            }`}
            data-state={viewMode === 'grid' ? 'active' : 'closed'}
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
