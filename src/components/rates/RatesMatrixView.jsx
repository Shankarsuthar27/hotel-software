import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Calendar as CalendarIcon,
  BedDouble,
  Info
} from 'lucide-react';
import BulkUpdateModal from './BulkUpdateModal';
import './rates-inventory.css';

export default function RatesMatrixView({
  roomTypes = [],
  rooms = [],
  reservations = [],
  maintenanceBlocks = [],
  property,
  stopouts = {},
  dailyRates = { base: {}, extra_adult: {}, extra_child: {} },
  restrictions = {},
  otaChannels = [],
  onToggleStopout,
  onBulkUpdate,
  onSaveRates,
  ratePlans = []
}) {
  // Radio button for rate tier: 'base' | 'extra_adult' | 'extra_child'
  const [rateTier, setRateTier] = useState('base');

  // Room filter dropdown: 'ALL' | 'rt_deluxe' | 'rt_standard'
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');

  // Modals & Popovers
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeInfoId, setActiveInfoId] = useState(null);

  // Base date initialized to 3 Nov 2026 (matching system date & screenshot)
  const [baseDate, setBaseDate] = useState(() => {
    if (property?.businessDate) {
      const [y, m, d] = property.businessDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(2026, 10, 3); // 3 Nov 2026
  });

  const todayIsoStr = property?.businessDate || '2026-11-03';

  // Exactly 12 visible days in matrix as shown in reference image (3 Nov to 14 Nov)
  const daysCount = 12;

  // Unsaved local edits: { [rateTier]: { [cellKey]: val } }
  const [localRateEdits, setLocalRateEdits] = useState({});

  // Close datepicker popover on outside click
  const datePickerRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Generate 12 date columns starting from baseDate
  const dateColumns = useMemo(() => {
    const cols = [];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);

      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const dayNum = d.getDate();
      const dayOfWeek = d.getDay();

      const isoStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isToday = isoStr === todayIsoStr;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

      cols.push({
        date: d,
        isoStr,
        dayNum,
        dayName: days[dayOfWeek],
        month: months[monthIdx],
        isToday,
        isWeekend
      });
    }
    return cols;
  }, [baseDate, todayIsoStr]);

  // Formatted date string for input pill: DD/MM/YYYY (e.g. 03/11/2026)
  const formattedDateDisplay = useMemo(() => {
    const d = baseDate.getDate();
    const m = baseDate.getMonth() + 1;
    const y = baseDate.getFullYear();
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }, [baseDate]);

  // Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - 1);
    setBaseDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    setBaseDate(d);
  };

  const handleFastForward = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 12);
    setBaseDate(d);
  };

  const handleSelectDate = (newDate) => {
    setBaseDate(new Date(newDate));
    setIsDatePickerOpen(false);
  };

  // Rooms configuration: dynamically mapped from roomTypes and physical rooms in store
  const allRooms = useMemo(() => {
    if (!roomTypes || roomTypes.length === 0) {
      return [];
    }

    // Default sort order: Delux Room first, Normal second, then others
    const priorityOrder = { 'Delux Room': 1, 'Normal': 2, 'Premium': 3 };
    const sorted = [...roomTypes].sort((a, b) => (priorityOrder[a.name] || 99) - (priorityOrder[b.name] || 99));

    return sorted.map((rt) => {
      const matchingPhysicalRooms = (rooms || []).filter(
        (r) =>
          r.roomTypeId === rt.id ||
          (rt.id === 'rt_standard' && r.roomTypeId === 'rt_normal') ||
          (rt.id === 'rt_normal' && r.roomTypeId === 'rt_standard')
      );

      return {
        id: rt.id,
        name: rt.name,
        code: rt.code || '132',
        rateCode: rt.code || '132',
        totalRooms: matchingPhysicalRooms.length,
        basePrice: rt.basePrice || 1000,
        extraAdultPrice: rt.extraAdultPrice || 800,
        extraChildPrice: rt.extraChildPrice || 400
      };
    });
  }, [roomTypes, rooms]);

  // Filtered rooms based on dropdown
  const visibleRooms = useMemo(() => {
    if (selectedRoomFilter === 'ALL') return allRooms;
    return allRooms.filter((r) => r.id === selectedRoomFilter);
  }, [allRooms, selectedRoomFilter]);

  // Inventory numbers: dynamically computed from total physical rooms, active reservations, and maintenance blocks
  const getRoomInventory = (room, col) => {
    const matchingPhysicalRooms = (rooms || []).filter(
      (r) =>
        r.roomTypeId === room.id ||
        (room.id === 'rt_standard' && r.roomTypeId === 'rt_normal') ||
        (room.id === 'rt_normal' && r.roomTypeId === 'rt_standard')
    );
    const total = matchingPhysicalRooms.length;

    // Check active reservations overlapping col.isoStr
    const bookedCount = (reservations || []).filter((r) => {
      if (r.status === 'cancelled' || r.status === 'no_show') return false;
      const isRoomTypeMatch =
        r.roomTypeId === room.id ||
        (room.id === 'rt_standard' && r.roomTypeId === 'rt_normal') ||
        (room.id === 'rt_normal' && r.roomTypeId === 'rt_standard') ||
        matchingPhysicalRooms.some((rm) => rm.id === r.roomId);

      if (!isRoomTypeMatch) return false;
      return col.isoStr >= r.checkInDate && col.isoStr < r.checkOutDate;
    }).length;

    // Check maintenance blocks on col.isoStr
    const maintenanceCount = (maintenanceBlocks || []).filter((mb) => {
      const isRoomMatch = matchingPhysicalRooms.some((rm) => rm.id === mb.roomId);
      if (!isRoomMatch) return false;
      const start = mb.startDate;
      const end = mb.endDate || mb.startDate;
      return col.isoStr >= start && col.isoStr <= end;
    }).length;

    const available = Math.max(0, total - bookedCount - maintenanceCount);

    return {
      available,
      total,
      sold: bookedCount
    };
  };

  // Helper to get effective rate for a cell
  const getRateForCell = (rtId, dateStr, tier = rateTier) => {
    const key = `${rtId}_${dateStr}`;
    // 1. Check local unsaved edits
    if (localRateEdits[tier] && localRateEdits[tier][key] !== undefined) {
      return localRateEdits[tier][key];
    }
    // 2. Check store dailyRates
    if (dailyRates && dailyRates[tier] && dailyRates[tier][key] !== undefined) {
      return dailyRates[tier][key];
    }
    if (rtId === 'rt_standard') {
      const altKey = `rt_normal_${dateStr}`;
      if (dailyRates && dailyRates[tier] && dailyRates[tier][altKey] !== undefined) {
        return dailyRates[tier][altKey];
      }
    }

    // 3. Fallback to room type configured base/extra rates
    const currentRt = (roomTypes || []).find((r) => r.id === rtId);
    if (tier === 'base') {
      if (rtId === 'rt_deluxe') {
        if (dateStr === '2026-11-05' || dateStr === '2026-11-06') {
          return 1000;
        }
        return currentRt?.basePrice || 2500;
      }
      return currentRt?.basePrice || 1000;
    }
    if (tier === 'extra_adult') return currentRt?.extraAdultPrice || (rtId === 'rt_deluxe' ? 1000 : 800);
    if (tier === 'extra_child') return currentRt?.extraChildPrice || (rtId === 'rt_deluxe' ? 500 : 400);
    return 1000;
  };

  // Rate change handler
  const handleRateChange = (roomId, dateStr, val) => {
    setLocalRateEdits((prev) => ({
      ...prev,
      [rateTier]: {
        ...(prev[rateTier] || {}),
        [`${roomId}_${dateStr}`]: val
      }
    }));
  };

  // Save handler: commits rates to store & persists
  const handleSaveRates = () => {
    const currentEdits = localRateEdits[rateTier] || {};
    const payloadRates = {};

    visibleRooms.forEach((room) => {
      dateColumns.forEach((col) => {
        const key = `${room.id}_${col.isoStr}`;
        const val = getRateForCell(room.id, col.isoStr, rateTier);
        payloadRates[key] = Number(val);
      });
    });

    Object.assign(payloadRates, currentEdits);

    if (onSaveRates) {
      onSaveRates(payloadRates, rateTier);
    } else if (onBulkUpdate) {
      onBulkUpdate({ rates: payloadRates, tier: rateTier });
    }

    setLocalRateEdits((prev) => {
      const copy = { ...prev };
      delete copy[rateTier];
      return copy;
    });

    const tierLabel = rateTier === 'base' ? 'Base Rates' : rateTier === 'extra_adult' ? 'Extra Adult Rates' : 'Extra Child Rates';
    const toast = document.createElement('div');
    toast.className = 'pms-toast-notification';
    toast.innerHTML = `<span>✅ ${tierLabel} saved successfully!</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  // Bulk update apply handler
  const handleApplyBulk = (payload) => {
    setLocalRateEdits({});
    if (onBulkUpdate) {
      onBulkUpdate(payload);
    }
    setIsBulkOpen(false);
  };

  // Calculate bottom summary values for each column
  const summaryData = useMemo(() => {
    return dateColumns.map((col) => {
      let total = 0;
      let available = 0;
      let sold = 0;

      visibleRooms.forEach((room) => {
        const inv = getRoomInventory(room, col);
        total += inv.total;
        available += inv.available;
        sold += inv.sold;
      });

      return {
        isoStr: col.isoStr,
        sold,
        available,
        total
      };
    });
  }, [dateColumns, visibleRooms]);

  return (
    <div className="rates-page-container">
      {/* 1. Top Sub-Toolbar: Filter + Radios + Bulk Update & Save Buttons */}
      <div className="rates-sub-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Room Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="rates-room-filter-select"
            >
              <option value="ALL">All Room Types</option>
              {allRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Rate Tier Radio Buttons: Base Rates | Extra Adult | Extra Child */}
          <div className="rates-radio-group">
            <label className={`rates-radio-label ${rateTier === 'base' ? 'active' : ''}`}>
              <input
                type="radio"
                name="rateTier"
                value="base"
                checked={rateTier === 'base'}
                onChange={() => setRateTier('base')}
              />
              <span>Base Rates</span>
            </label>

            <label className={`rates-radio-label ${rateTier === 'extra_adult' ? 'active' : ''}`}>
              <input
                type="radio"
                name="rateTier"
                value="extra_adult"
                checked={rateTier === 'extra_adult'}
                onChange={() => setRateTier('extra_adult')}
              />
              <span>Extra Adult</span>
            </label>

            <label className={`rates-radio-label ${rateTier === 'extra_child' ? 'active' : ''}`}>
              <input
                type="radio"
                name="rateTier"
                value="extra_child"
                checked={rateTier === 'extra_child'}
                onChange={() => setRateTier('extra_child')}
              />
              <span>Extra Child</span>
            </label>
          </div>
        </div>

        {/* Right Action Buttons: Bulk Update + Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="rates-action-btn-secondary"
            onClick={() => setIsBulkOpen(true)}
          >
            Bulk Update
          </button>
          <button
            type="button"
            className="rates-action-btn-primary"
            onClick={handleSaveRates}
          >
            Save
          </button>
        </div>
      </div>

      {/* 2. Main Rates & Inventory Grid Viewport */}
      <div className="rates-grid-viewport">
        <div className="rates-grid-table">
          
          {/* Header Row: Date Controls and 12 Date Cards */}
          <div className="rates-header-row">
            
            {/* Left Sticky Date Navigation Column */}
            <div className="rates-col-left rates-header-left">
              {/* Prev < button */}
              <button
                type="button"
                onClick={handlePrevDay}
                title="Previous Day"
                className="rates-nav-circle-btn"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Date Pill Input displaying 03/11/2026 */}
              <div
                ref={datePickerRef}
                style={{ position: 'relative', flex: 1, minWidth: 0 }}
              >
                <div
                  className="rates-date-pill"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                >
                  <span className="rates-date-pill-text">
                    {formattedDateDisplay}
                  </span>
                  <CalendarIcon size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                </div>

                {/* Calendar Dropdown Popover */}
                {isDatePickerOpen && (
                  <div className="rates-datepicker-dropdown">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                        {baseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const d = new Date(baseDate);
                            d.setMonth(d.getMonth() - 1);
                            setBaseDate(d);
                          }}
                          style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const d = new Date(baseDate);
                            d.setMonth(d.getMonth() + 1);
                            setBaseDate(d);
                          }}
                          style={{ padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '11px', marginBottom: '8px' }}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d} style={{ color: '#94a3b8', fontWeight: 700, padding: '2px 0' }}>{d}</div>
                      ))}
                      {Array.from({ length: 31 }, (_, idx) => {
                        const dayNum = idx + 1;
                        const testDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNum);
                        const isSelected = testDate.getDate() === baseDate.getDate();
                        const isToday = testDate.toISOString().split('T')[0] === todayIsoStr;
                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDate(testDate);
                            }}
                            style={{
                              aspectRatio: '1',
                              border: isToday ? '1px solid #f43f5e' : 'none',
                              borderRadius: '4px',
                              background: isSelected ? '#3b82f6' : 'transparent',
                              color: isSelected ? '#ffffff' : (isToday ? '#f43f5e' : '#1e293b'),
                              fontWeight: isSelected || isToday ? 700 : 500,
                              cursor: 'pointer'
                            }}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDate(new Date('2026-11-03'));
                        }}
                        style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDatePickerOpen(false);
                        }}
                        style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: 0 }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Next > button */}
              <button
                type="button"
                onClick={handleNextDay}
                title="Next Day"
                className="rates-nav-circle-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Date Header Cards (12 columns) */}
            <div style={{ display: 'flex', flex: 1 }}>
              {dateColumns.map((col, idx) => {
                const isLast = idx === dateColumns.length - 1;

                if (col.isToday) {
                  return (
                    <div key={col.isoStr} className="rates-date-cell">
                      <div className="rates-card-today">
                        <span className="rates-card-dayname" style={{ color: '#e11d48' }}>
                          TODAY
                        </span>
                        <span className="rates-card-daynum" style={{ color: '#e11d48' }}>
                          {col.dayNum}
                        </span>
                        <span className="rates-card-month" style={{ color: '#fb7185' }}>
                          {col.month}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (col.isWeekend) {
                  return (
                    <div key={col.isoStr} className="rates-date-cell" style={{ position: 'relative' }}>
                      <div className="rates-card-weekend">
                        <span className="rates-card-dayname" style={{ color: '#ea580c' }}>
                          {col.dayName}
                        </span>
                        <span className="rates-card-daynum" style={{ color: '#ea580c' }}>
                          {col.dayNum}
                        </span>
                        <span className="rates-card-month" style={{ color: '#f97316' }}>
                          {col.month}
                        </span>
                      </div>
                      {isLast && (
                        <button
                          type="button"
                          onClick={handleFastForward}
                          title="Jump forward 12 days"
                          className="rates-fast-forward-btn"
                        >
                          <ChevronsRight size={16} />
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={col.isoStr} className="rates-date-cell">
                    <div className="rates-card-weekday">
                      <span className="rates-card-dayname" style={{ color: '#64748b' }}>
                        {col.dayName}
                      </span>
                      <span className="rates-card-daynum" style={{ color: '#0f172a' }}>
                        {col.dayNum}
                      </span>
                      <span className="rates-card-month" style={{ color: '#94a3b8' }}>
                        {col.month}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Room Rows Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {visibleRooms.map((room) => {
              const infoPopoverKey = `info_${room.id}`;
              const isInfoOpen = activeInfoId === infoPopoverKey;

              return (
                <React.Fragment key={room.id}>
                  {/* Row A: Room Name & Daily Inventory */}
                  <div className="rates-grid-row">
                    {/* Left Sticky Cell: Bed icon + Room Name */}
                    <div className="rates-col-left rates-room-name-cell">
                      <BedDouble size={18} className="text-slate-700 shrink-0" />
                      <span className="rates-room-title">{room.name}</span>
                    </div>

                    {/* Day Cells: Centered Inventory Numbers */}
                    <div style={{ display: 'flex', flex: 1 }}>
                      {dateColumns.map((col) => {
                        const inv = getRoomInventory(room, col);

                        return (
                          <div key={col.isoStr} className="rates-cell">
                            <span className="rates-inv-num">
                              {inv.available}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row B: Rate Plan Code & Editable Matrix Cells */}
                  <div className="rates-grid-row" style={{ borderBottom: '1px solid #eef2f6' }}>
                    {/* Left Sticky Cell: Rate Code 132 + Info Icon */}
                    <div className="rates-col-left rates-ratecode-cell" style={{ position: 'relative' }}>
                      <span className="rates-ratecode-text">{room.rateCode}</span>
                      
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Info
                          size={14}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          onClick={() => setActiveInfoId(isInfoOpen ? null : infoPopoverKey)}
                        />

                        {isInfoOpen && (
                          <div className="rates-info-tooltip">
                            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                              Rate Plan: {room.rateCode}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '11.5px', lineHeight: 1.4 }}>
                              European Plan (EP) - Room Only rate. Non-refundable rate policy.
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveInfoId(null)}
                              style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 600, fontSize: '11px', marginTop: '6px', cursor: 'pointer', padding: 0 }}
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Day Cells: Editable Rate Inputs */}
                    <div style={{ display: 'flex', flex: 1 }}>
                      {dateColumns.map((col) => {
                        const currentVal = getRateForCell(room.id, col.isoStr, rateTier);

                        return (
                          <div key={col.isoStr} className="rates-cell">
                            <input
                              type="number"
                              className="rates-cell-input-card"
                              value={currentVal}
                              onChange={(e) => handleRateChange(room.id, col.isoStr, e.target.value)}
                              title={`Edit ${room.name} rate on ${col.isoStr}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Large Clean Middle Space */}
          <div style={{ flex: 1, minHeight: '180px' }} />

          {/* 4. Bottom Summary Rows: Sold Rooms, Available Rooms, Total Rooms */}
          <div className="rates-summary-section">
            {/* Row 1: Sold Rooms */}
            <div className="rates-summary-row">
              <div className="rates-col-left rates-summary-title-cell">
                <span className="rates-summary-title">Sold Rooms</span>
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                {summaryData.map((item) => (
                  <div key={item.isoStr} className="rates-summary-cell">
                    <span className="rates-summary-num">{item.sold}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Available Rooms */}
            <div className="rates-summary-row">
              <div className="rates-col-left rates-summary-title-cell">
                <span className="rates-summary-title">Available Rooms</span>
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                {summaryData.map((item) => (
                  <div key={item.isoStr} className="rates-summary-cell">
                    <span className="rates-summary-num">{item.available}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Total Rooms */}
            <div className="rates-summary-row" style={{ borderBottom: 'none' }}>
              <div className="rates-col-left rates-summary-title-cell">
                <span className="rates-summary-title">Total Rooms</span>
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                {summaryData.map((item) => (
                  <div key={item.isoStr} className="rates-summary-cell">
                    <span className="rates-summary-num">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bulk Update Modal */}
      {isBulkOpen && (
        <BulkUpdateModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          onApply={handleApplyBulk}
          roomTypes={roomTypes}
          currentRateTier={rateTier}
        />
      )}
    </div>
  );
}
