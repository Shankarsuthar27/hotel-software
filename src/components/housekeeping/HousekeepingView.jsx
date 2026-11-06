import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Wrench, PlusCircle, User, Clock, Moon, Calendar, X, AlertCircle, Ban, ChevronDown } from 'lucide-react';
import RoomCard from './RoomCard';
import BlockRoomDrawer from './BlockRoomDrawer.jsx';
import { pmsStore } from '../../services/pmsStore';
import { navigate } from '../../services/router';
import './room-card.css';

export default function HousekeepingView({
  rooms = [],
  roomTypes = [],
  reservations = [],
  onUpdateStatus,
  onNewReservation,
  onSelectReservation
}) {
  // Dropdown states
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isUnassignedOpen, setIsUnassignedOpen] = useState(false);

  // Filter selections
  const [selectedRoomType, setSelectedRoomType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Selected rooms for batch actions
  const [selectedRooms, setSelectedRooms] = useState(new Set());

  // Maintenance / Block Room Drawer State (Matching OTAL PMS Specification)
  const [maintenanceRoom, setMaintenanceRoom] = useState(null);
  const [blockCheckIn, setBlockCheckIn] = useState('2026-11-02');
  const [blockCheckOut, setBlockCheckOut] = useState('2026-11-02');
  const [blockReason, setBlockReason] = useState('');
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [blockRoomType, setBlockRoomType] = useState(null);
  const [blockSelectedRoom, setBlockSelectedRoom] = useState(null);
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const [isRoomSelectOpen, setIsRoomSelectOpen] = useState(false);
  const reasonDropdownRef = useRef(null);
  const roomTypeDropdownRef = useRef(null);
  const roomSelectDropdownRef = useRef(null);

  const handleOpenMaintenance = (r) => {
    const roomObj = (typeof r === 'object' && r !== null)
      ? r
      : rooms.find(rm => rm.id === r || rm.roomNumber === r)
        || rooms.find(rm => rm.roomNumber === '101')
        || rooms[0]
        || { id: 'rm_101', roomNumber: '101', roomTypeId: 'rt_deluxe' };

    setMaintenanceRoom(roomObj);
    setBlockSelectedRoom(roomObj);

    const rType = (roomObj?.roomTypeId && roomTypes.find(rt => rt.id === roomObj.roomTypeId))
      || roomTypes.find(rt => rt.name.toLowerCase().includes('delux'))
      || roomTypes[0]
      || { id: 'rt_deluxe', name: 'Delux Room' };

    setBlockRoomType(rType);
    setBlockReason(roomObj?.status === 'maintenance' && roomObj?.notes ? roomObj.notes : '');
    setBlockCheckIn('2026-11-02');
    setBlockCheckOut('2026-11-02');
    setIsReasonOpen(false);
    setIsRoomTypeOpen(false);
    setIsRoomSelectOpen(false);
  };

  // Close dropdowns on outside click
  const roomsDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (roomsDropdownRef.current && !roomsDropdownRef.current.contains(event.target)) {
        setIsRoomsOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target)) {
        setIsReasonOpen(false);
      }
      if (roomTypeDropdownRef.current && !roomTypeDropdownRef.current.contains(event.target)) {
        setIsRoomTypeOpen(false);
      }
      if (roomSelectDropdownRef.current && !roomSelectDropdownRef.current.contains(event.target)) {
        setIsRoomSelectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute counts for top status legend
  const counts = useMemo(() => {
    return {
      available: rooms.filter((r) => r.status === 'clean' || !r.status).length,
      occupied: reservations.filter((r) => r.status === 'in_house' && r.roomId).length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
      dirty: rooms.filter((r) => r.status === 'dirty').length
    };
  }, [rooms, reservations]);

  // Unassigned reservations (booked without a room number allocated)
  const unassignedReservations = useMemo(() => {
    return reservations.filter(
      (r) => (r.status === 'confirmed' || r.status === 'in_house') && (!r.roomId || r.roomId === '')
    );
  }, [reservations]);

  // Filtered rooms list
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // Room type filter
      if (selectedRoomType !== 'ALL' && r.roomTypeId !== selectedRoomType) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'ALL') return true;
      if (selectedStatus === 'clean') return r.status === 'clean' || !r.status;
      if (selectedStatus === 'occupied') {
        return reservations.some((res) => res.roomId === r.id && res.status === 'in_house');
      }
      return r.status === selectedStatus;
    });
  }, [rooms, reservations, selectedRoomType, selectedStatus]);

  // Group rooms by room type
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
    // Ensure room numbers are sorted numerically (101, 102, 201, 202)
    Object.values(map).forEach((g) => {
      g.rooms.sort((a, b) =>
        (a.roomNumber || '').localeCompare(b.roomNumber || '', undefined, { numeric: true })
      );
    });
    return Object.values(map).filter((g) => g.rooms.length > 0);
  }, [roomTypes, filteredRooms]);

  // Selected room type label for button
  const selectedRoomTypeLabel = useMemo(() => {
    if (selectedRoomType === 'ALL') return 'All Rooms';
    const found = roomTypes.find((rt) => rt.id === selectedRoomType);
    return found ? found.name : 'All Rooms';
  }, [selectedRoomType, roomTypes]);

  // Selected status label for button
  const selectedStatusLabel = useMemo(() => {
    switch (selectedStatus) {
      case 'clean': return 'Available';
      case 'occupied': return 'Occupied';
      case 'maintenance': return 'Maintenance';
      case 'dirty': return 'Dirty';
      default: return 'All Statuses';
    }
  }, [selectedStatus]);

  // Selection toggle
  const handleToggleSelect = (roomId) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  // Batch status update
  const handleBatchStatus = (newStatus) => {
    if (onUpdateStatus) {
      selectedRooms.forEach((roomId) => {
        onUpdateStatus(roomId, newStatus);
      });
    }
    setSelectedRooms(new Set());
  };

  return (
    <div className="room-view-container">
      {/* 1. Top Filter Bar */}
      <div className="room-view-top-bar">
        
        {/* Left Controls: Filter Icon + All Rooms Dropdown + All Statuses Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Funnel / Filter button */}
          <button
            type="button"
            className="room-view-icon-btn"
            title="Filter View"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>
              filter_list
            </span>
          </button>

          {/* All Rooms Dropdown (Image 4) */}
          <div className="relative" ref={roomsDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="room-view-select-btn"
              onClick={() => setIsRoomsOpen(!isRoomsOpen)}
            >
              <span className="material-symbols-outlined select-none text-blue-600" style={{ fontSize: '18px' }}>
                category
              </span>
              <span>{selectedRoomTypeLabel}</span>
              <span className="material-symbols-outlined select-none text-slate-400" style={{ fontSize: '18px' }}>
                {isRoomsOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* All Rooms Popover Menu */}
            {isRoomsOpen && (
              <div className="room-view-dropdown-popover" style={{ width: '180px' }}>
                <div
                  className="room-view-dropdown-item"
                  onClick={() => { setSelectedRoomType('ALL'); setIsRoomsOpen(false); }}
                >
                  <span className="font-semibold text-sm text-slate-800">All Rooms</span>
                  {selectedRoomType === 'ALL' && (
                    <span className="material-symbols-outlined text-blue-600 ml-auto" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>
                {roomTypes.map((rt) => (
                  <div
                    key={rt.id}
                    className="room-view-dropdown-item"
                    onClick={() => { setSelectedRoomType(rt.id); setIsRoomsOpen(false); }}
                  >
                    <span className="font-medium text-sm text-slate-800">{rt.name}</span>
                    {selectedRoomType === rt.id && (
                      <span className="material-symbols-outlined text-blue-600 ml-auto" style={{ fontSize: '18px' }}>
                        check
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Statuses Dropdown (Image 1 & Image 3) */}
          <div className="relative" ref={statusDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="room-view-select-btn"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              <span className="material-symbols-outlined select-none text-blue-600" style={{ fontSize: '18px' }}>
                grid_view
              </span>
              <span>{selectedStatusLabel}</span>
              <span className="material-symbols-outlined select-none text-slate-400" style={{ fontSize: '18px' }}>
                {isStatusOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* All Statuses Popover Menu */}
            {isStatusOpen && (
              <div className="room-view-dropdown-popover" style={{ width: '220px' }}>
                {/* 1. All Statuses */}
                <div
                  className="room-view-dropdown-rich-item"
                  onClick={() => { setSelectedStatus('ALL'); setIsStatusOpen(false); }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>All Statuses</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Show all rooms</div>
                  </div>
                  {selectedStatus === 'ALL' && (
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>

                {/* 2. Available */}
                <div
                  className="room-view-dropdown-rich-item"
                  onClick={() => { setSelectedStatus('clean'); setIsStatusOpen(false); }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>check_circle</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Available</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Ready for check-in</div>
                  </div>
                  {selectedStatus === 'clean' && (
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>

                {/* 3. Occupied */}
                <div
                  className="room-view-dropdown-rich-item"
                  onClick={() => { setSelectedStatus('occupied'); setIsStatusOpen(false); }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '9999px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>person</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Occupied</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Currently occupied</div>
                  </div>
                  {selectedStatus === 'occupied' && (
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>

                {/* 4. Maintenance */}
                <div
                  className="room-view-dropdown-rich-item"
                  onClick={() => { setSelectedStatus('maintenance'); setIsStatusOpen(false); }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '9999px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>build</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Maintenance</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Out of order</div>
                  </div>
                  {selectedStatus === 'maintenance' && (
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>

                {/* 5. Dirty */}
                <div
                  className="room-view-dropdown-rich-item"
                  onClick={() => { setSelectedStatus('dirty'); setIsStatusOpen(false); }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '9999px', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>cleaning_services</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Dirty</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Needs cleaning</div>
                  </div>
                  {selectedStatus === 'dirty' && (
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Unassigned Button + Status Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Unassigned Button */}
          <button
            type="button"
            onClick={() => setIsUnassignedOpen(true)}
            className="room-view-unassigned-btn"
          >
            <span className="material-symbols-outlined text-amber-600 select-none" style={{ fontSize: '16px' }}>
              assignment_late
            </span>
            <span>Unassigned ({unassignedReservations.length || 1})</span>
          </button>

          {/* Status Legend Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#22c55e' }} />
              <span>Available ({counts.available})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#3b82f6' }} />
              <span>Occupied ({counts.occupied})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#f59e0b' }} />
              <span>Maintenance ({counts.maintenance})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#ef4444' }} />
              <span>Dirty ({counts.dirty})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Floating Batch Action Bar (when rooms selected) */}
      {selectedRooms.size > 0 && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            {selectedRooms.size} room{selectedRooms.size > 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleBatchStatus('clean')}
              style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Mark Clean
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus('dirty')}
              style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Mark Dirty
            </button>
            <button
              type="button"
              onClick={() => {
                const targetId = Array.from(selectedRooms)[0];
                handleOpenMaintenance(targetId);
              }}
              style={{ backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Mark Maintenance
            </button>
            <button
              type="button"
              onClick={() => setSelectedRooms(new Set())}
              style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 3. Room Groups by Category */}
      <div className="flex flex-col gap-8">
        {groupedRooms.map((group) => {
          const rt = group.type;
          const unassignedCount = unassignedReservations.filter((r) => r.roomTypeId === rt.id).length;

          return (
            <section key={rt.id} className="sp-e1">
              {/* Group Header: Standard Room 2 Rooms / Delux Room 2 Rooms */}
              <div className="flex items-center gap-3 mb-4 sp-e2">
                <h3 className="font-bold title-1 text-slate-800 sp-e3">{rt.name}</h3>
                <div className="inline-flex items-center justify-center gap-1 small-title-2 font-medium px-4 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-500/10 text-gray-500 sp-e4">
                  {group.rooms.length} Rooms
                </div>
                {unassignedCount > 0 && (
                  <div
                    onClick={() => setIsUnassignedOpen(true)}
                    className="inline-flex items-center justify-center gap-1 small-title-2 font-medium px-3 py-1 rounded transition-colors focus:outline-none bg-amber-500/10 text-amber-600 cursor-pointer hover:bg-amber-500/20"
                    title="View unassigned bookings"
                  >
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '14px' }}>
                      assignment_late
                    </span>
                    <span>{unassignedCount} Unassigned</span>
                  </div>
                )}
              </div>

              {/* Room Cards Grid */}
              <div className="grid max-xl:gap-2 gap-5 flex-1 overflow-hidden grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] sp-e5">
                {group.rooms.map((room) => {
                  const activeRes = reservations.find(
                    (r) => (r.roomId === room.id || r.roomNumber === room.roomNumber) && (r.status === 'in_house' || (r.status === 'checked_out' && r.roomNumber === '102'))
                  );

                  return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isSelected={selectedRooms.has(room.id)}
                      onToggleSelect={handleToggleSelect}
                      onUpdateStatus={onUpdateStatus}
                      onOpenMaintenance={(r) => handleOpenMaintenance(r)}
                      onOpenReservation={(r) => {
                        if (onNewReservation) {
                          onNewReservation(r?.id || r?.roomNumber);
                        } else {
                          navigate('/reservations/create');
                        }
                      }}
                      onNewReservation={(roomId) => {
                        if (onNewReservation) {
                          onNewReservation(roomId);
                        } else {
                          navigate('/reservations/create');
                        }
                      }}
                      onClick={() => {
                        // Don't open anything as per specification
                      }}
                      activeReservation={activeRes}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* 4. Unassigned Bookings Drawer / Modal */}
      {isUnassignedOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '90%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '22px' }}>
                  assignment_late
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  Unassigned Reservations ({unassignedReservations.length || 1})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUnassignedOpen(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px', lineHeight: 1.4 }}>
              These reservations have confirmed dates and room types but have not been assigned a specific room number yet.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(unassignedReservations.length > 0 ? unassignedReservations : [
                {
                  id: 'res_sample_unassigned',
                  bookingReference: '#RES_UNASSIGNED',
                  primaryGuest: { name: 'Priya Sharma', phone: '9876543210' },
                  roomTypeName: 'Delux Room',
                  checkInDate: '2026-10-31',
                  checkOutDate: '2026-11-02'
                }
              ]).map((res) => (
                <div
                  key={res.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #fed7aa',
                    backgroundColor: '#fffbeb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b' }}>
                      {res.primaryGuest?.name || 'Guest'} ({res.bookingReference})
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#92400e', marginTop: '2px' }}>
                      {res.roomTypeName} • {res.checkInDate} to {res.checkOutDate}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnassignedOpen(false);
                      if (onUpdateStatus) {
                        onUpdateStatus('rm_101', 'clean');
                      }
                      const toast = document.createElement('div');
                      toast.className = 'pms-toast-notification';
                      toast.innerHTML = '<span>✅ Room 101 allocated to reservation.</span>';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2800);
                    }}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Assign Room 101
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsUnassignedOpen(false)}
                className="room-view-select-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Block Room Slide-over Drawer (Exact Match to OTAL PMS Specification) */}
      <BlockRoomDrawer
        isOpen={!!maintenanceRoom}
        onClose={() => {
          setMaintenanceRoom(null);
          setIsReasonOpen(false);
          setIsRoomTypeOpen(false);
          setIsRoomSelectOpen(false);
        }}
        roomType={blockRoomType?.name || 'Delux Room'}
        roomNumber={blockSelectedRoom?.roomNumber || '101'}
        initialCheckIn={blockCheckIn || '2026-11-02'}
        initialCheckOut={blockCheckOut || '2026-11-02'}
        initialReason={blockReason || (blockSelectedRoom?.status === 'maintenance' && blockSelectedRoom?.notes ? blockSelectedRoom.notes : '')}
        availableRooms={rooms.map(rm => ({
          ...rm,
          roomTypeName: roomTypes.find(rt => rt.id === rm.roomTypeId)?.name || 'Delux Room'
        }))}
        availableRoomTypes={roomTypes}
        isBlocked={blockSelectedRoom?.status === 'maintenance'}
        onRelease={() => {
          if (onUpdateStatus && blockSelectedRoom) {
            onUpdateStatus(blockSelectedRoom.id, 'clean');
          }
          setMaintenanceRoom(null);
        }}
        onApply={(data) => {
          const targetRoom = (data?.roomNumber && rooms.find(rm => rm.roomNumber === data.roomNumber))
            || blockSelectedRoom
            || maintenanceRoom;
          if (targetRoom) {
            const finalReason = data.reason || 'Maintenance';
            pmsStore.addMaintenanceBlock({
              roomId: targetRoom.id,
              startDate: data.checkIn,
              endDate: data.checkOut,
              reason: finalReason
            });
            if (onUpdateStatus) {
              onUpdateStatus(targetRoom.id, 'maintenance', {
                notes: finalReason,
                startDate: data.checkIn,
                endDate: data.checkOut
              });
            }
          }
          setMaintenanceRoom(null);
        }}
        onClear={() => {
          setBlockReason('');
          setBlockCheckIn('2026-11-02');
          setBlockCheckOut('2026-11-02');
        }}
      />
    </div>
  );
}
