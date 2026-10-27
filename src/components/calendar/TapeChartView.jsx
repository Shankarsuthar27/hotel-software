import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  Maximize2,
  Minimize2,
  Wrench,
  Info,
  ShieldAlert
} from 'lucide-react';

export default function TapeChartView({
  property,
  roomTypes,
  rooms,
  reservations,
  maintenanceBlocks = [],
  onSelectReservation,
  onSlotClick,
  onSlotMaintenanceClick
}) {
  const [baseDate, setBaseDate] = useState(new Date(property?.businessDate || '2026-10-24'));
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [density, setDensity] = useState('cozy'); // 'cozy' | 'wide'

  const daysToShow = 14;

  // Generate date array
  const dateList = useMemo(() => {
    const list = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const isToday = isoStr === property?.businessDate;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      // Compute occupancy percentage for this date across all rooms
      const activeCount = reservations.filter(r => {
        if (r.status === 'cancelled' || r.status === 'no_show') return false;
        return isoStr >= r.checkInDate && isoStr < r.checkOutDate;
      }).length;

      const occPercent = rooms.length > 0 ? Math.round((activeCount / rooms.length) * 100) : 0;

      list.push({
        date: d,
        isoStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday,
        isWeekend,
        activeCount,
        occPercent
      });
    }
    return list;
  }, [baseDate, property?.businessDate, reservations, rooms]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (selectedRoomType !== 'all' && r.roomTypeId !== selectedRoomType) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [rooms, selectedRoomType, statusFilter]);

  // Group rooms by Room Type
  const groupedRooms = useMemo(() => {
    const map = {};
    roomTypes.forEach((rt) => {
      map[rt.id] = { type: rt, rooms: [] };
    });
    filteredRooms.forEach((r) => {
      if (map[r.roomTypeId]) {
        map[r.roomTypeId].rooms.push(r);
      }
    });
    return Object.values(map).filter((g) => g.rooms.length > 0);
  }, [roomTypes, filteredRooms]);

  // Date Navigation
  const handlePrev = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - 7);
    setBaseDate(d);
  };

  const handleNext = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    setBaseDate(d);
  };

  const handleToday = () => {
    setBaseDate(new Date(property?.businessDate || '2026-10-24'));
  };

  const cellWidth = density === 'cozy' ? 52 : 84;

  return (
    <div className={`tape-chart-container ${density}`}>
      {/* Tape Chart Header & Controls */}
      <div className="tape-chart-toolbar">
        {/* Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button className="btn-secondary" onClick={handlePrev} style={{ padding: '0.35rem 0.55rem' }} title="Previous 7 Days">
              <ChevronLeft size={16} />
            </button>
            <button className="btn-secondary" onClick={handleToday} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              Today
            </button>
            <button className="btn-secondary" onClick={handleNext} style={{ padding: '0.35rem 0.55rem' }} title="Next 7 Days">
              <ChevronRight size={16} />
            </button>
          </div>

          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginLeft: '0.5rem' }}>
            {dateList[0]?.month} {dateList[0]?.dayNum} – {dateList[dateList.length - 1]?.month} {dateList[dateList.length - 1]?.dayNum}, 2026
          </span>
        </div>

        {/* Filters & Density Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Room Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={14} color="#64748b" />
            <select
              className="form-select"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="all">All Room Types</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>{rt.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', width: 'auto' }}
          >
            <option value="all">All Hygiene Statuses</option>
            <option value="clean">Clean Rooms Only</option>
            <option value="dirty">Dirty Rooms (Turnaround)</option>
            <option value="inspected">Inspected (VIP Ready)</option>
            <option value="maintenance">Maintenance Blocked</option>
          </select>

          {/* Density Toggles */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => setDensity('cozy')}
              style={{
                border: 'none',
                background: density === 'cozy' ? '#ffffff' : 'transparent',
                color: density === 'cozy' ? '#2563eb' : '#64748b',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: density === 'cozy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Compact View"
            >
              <Minimize2 size={13} />
              <span>Cozy</span>
            </button>
            <button
              onClick={() => setDensity('wide')}
              style={{
                border: 'none',
                background: density === 'wide' ? '#ffffff' : 'transparent',
                color: density === 'wide' ? '#2563eb' : '#64748b',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: density === 'wide' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Expanded View with Guest Details"
            >
              <Maximize2 size={13} />
              <span>Wide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Scroll Table */}
      <div className="tape-chart-scroll">
        <table className="tape-chart-table">
          <thead>
            {/* Date Header Row */}
            <tr className="sticky-header-row">
              <th className="sticky-room-col" style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>ROOM / DATES</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
                  {filteredRooms.length} of {rooms.length} Rooms
                </div>
              </th>

              {dateList.map((col) => (
                <th
                  key={col.isoStr}
                  style={{
                    textAlign: 'center',
                    padding: '0.5rem 0.2rem',
                    background: col.isToday ? '#eff6ff' : col.isWeekend ? '#f8fafc' : '#ffffff',
                    borderBottom: col.isToday ? '2px solid #2563eb' : undefined
                  }}
                >
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: col.isToday ? '#2563eb' : '#64748b', fontWeight: 700 }}>
                    {col.dayName}
                  </div>
                  <div style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: col.isToday ? '#2563eb' : '#0f172a',
                    margin: '1px 0'
                  }}>
                    {col.dayNum}
                  </div>
                  {/* Occupancy pill */}
                  <div style={{
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    padding: '1px 4px',
                    borderRadius: '4px',
                    background: col.occPercent > 75 ? 'rgba(239, 68, 68, 0.1)' : col.occPercent > 40 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: col.occPercent > 75 ? '#dc2626' : col.occPercent > 40 ? '#2563eb' : '#059669',
                    display: 'inline-block'
                  }}>
                    {col.occPercent}%
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groupedRooms.map((group) => {
              const rt = group.type;
              return (
                <React.Fragment key={rt.id}>
                  {/* Group Header Row */}
                  <tr>
                    <td
                      colSpan={daysToShow + 1}
                      style={{
                        padding: '0.45rem 1rem',
                        background: '#f1f5f9',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: '#1e293b',
                        borderLeft: `4px solid ${rt.color || '#2563eb'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{rt.name} ({rt.code})</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                          Base Rate: ₹{rt.basePrice?.toLocaleString()} • Max {rt.maxAdults} Adults
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Physical Room Rows */}
                  {group.rooms.map((room) => {
                    const statusColor = room.status === 'clean' ? '#10b981' : room.status === 'dirty' ? '#ef4444' : room.status === 'inspected' ? '#2563eb' : '#f59e0b';
                    
                    return (
                      <tr key={room.id}>
                        {/* Sticky Room Label */}
                        <td className="sticky-room-col" style={{ padding: '0.55rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                                Room {room.roomNumber}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                Floor {room.floor}
                              </div>
                            </div>
                            {/* Status Indicator Dot */}
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                background: `${statusColor}18`,
                                color: statusColor,
                                border: `1px solid ${statusColor}40`
                              }}
                              title={`Hygiene Status: ${room.status}`}
                            >
                              {room.status}
                            </span>
                          </div>
                        </td>

                        {/* Date Slots */}
                        {dateList.map((col) => {
                          // Check if reservation starts on this date in this room
                          const startingRes = reservations.find(r => 
                            r.roomId === room.id &&
                            r.checkInDate === col.isoStr &&
                            r.status !== 'cancelled' &&
                            r.status !== 'no_show'
                          );

                          // Check if any reservation covers this date
                          const coveringRes = reservations.find(r => {
                            if (r.roomId !== room.id || r.status === 'cancelled' || r.status === 'no_show') return false;
                            return col.isoStr >= r.checkInDate && col.isoStr < r.checkOutDate;
                          });

                          // Check if maintenance block starts on this date in this room
                          const startingMb = maintenanceBlocks.find(b => 
                            b.roomId === room.id && b.startDate === col.isoStr
                          );

                          // Check if maintenance block covers this date
                          const coveringMb = maintenanceBlocks.find(b => 
                            b.roomId === room.id && col.isoStr >= b.startDate && col.isoStr <= b.endDate
                          );

                          return (
                            <td
                              key={col.isoStr}
                              className={`timeline-slot ${col.isWeekend ? 'weekend' : ''}`}
                              onClick={() => {
                                if (coveringRes) {
                                  onSelectReservation(coveringRes);
                                } else if (coveringMb) {
                                  onSlotMaintenanceClick && onSlotMaintenanceClick(coveringMb);
                                } else {
                                  onSlotClick(room, col.isoStr);
                                }
                              }}
                              title={
                                coveringRes
                                  ? `${coveringRes.primaryGuest?.name || 'Guest'} (${coveringRes.status.toUpperCase()}) - ₹${coveringRes.totalAmount?.toLocaleString()}`
                                  : coveringMb
                                  ? `Maintenance: ${coveringMb.reason}`
                                  : `Click to book or block Room ${room.roomNumber} on ${col.isoStr}`
                              }
                            >
                              {/* Spanning Booking Block */}
                              {startingRes && (
                                <div
                                  className={`booking-block status-${startingRes.status}`}
                                  style={{
                                    left: '2px',
                                    width: `calc(${startingRes.nights * cellWidth}px - 4px)`
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectReservation(startingRes);
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                                    <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.74rem' }}>
                                      {startingRes.primaryGuest?.name}
                                    </span>
                                    {startingRes.isVIP && (
                                      <span style={{ fontSize: '0.6rem', background: '#fbbf24', color: '#78350f', padding: '1px 3px', borderRadius: '2px', fontWeight: 800 }}>
                                        VIP
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.64rem', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                    {startingRes.nights}N • ₹{startingRes.totalAmount?.toLocaleString()} • {startingRes.bookingSource}
                                  </div>
                                </div>
                              )}

                              {/* Spanning Maintenance Block */}
                              {startingMb && !coveringRes && (
                                <div
                                  className="booking-block status-maintenance"
                                  style={{
                                    left: '2px',
                                    width: `calc(4 * ${cellWidth}px - 4px)`
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSlotMaintenanceClick && onSlotMaintenanceClick(startingMb);
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700 }}>
                                    <Wrench size={12} />
                                    <span>{startingMb.reason}</span>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tape Chart Footer Legend */}
      <div style={{
        padding: '0.65rem 1.25rem',
        borderTop: '1px solid var(--border-light)',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ fontWeight: 700 }}>Color Legend:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563eb' }} /> Confirmed Arrival
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} /> In-House (Checked-In)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#94a3b8' }} /> Checked-Out
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} /> Out of Order (Maintenance)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Info size={14} color="#2563eb" />
          <span>Click any open cell to create a walk-in booking or schedule a maintenance block</span>
        </div>
      </div>
    </div>
  );
}
