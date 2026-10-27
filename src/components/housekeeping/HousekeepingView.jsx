import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  User,
  ShieldCheck,
  Filter,
  Check
} from 'lucide-react';

export default function HousekeepingView({
  rooms,
  roomTypes,
  reservations,
  onUpdateStatus
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'dirty' | 'clean' | 'inspected' | 'maintenance'

  const counts = {
    all: rooms.length,
    dirty: rooms.filter((r) => r.status === 'dirty').length,
    clean: rooms.filter((r) => r.status === 'clean').length,
    inspected: rooms.filter((r) => r.status === 'inspected').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      return true;
    });
  }, [rooms, filterStatus]);

  // Group by room types
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Toolbar */}
      <div style={{
        background: '#ffffff',
        padding: '1.15rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Housekeeping & Room Hygiene Operations
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Real-time room hygiene state tracker linked directly to front-desk check-out triggers
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          {[
            { id: 'all', label: 'All Rooms', count: counts.all, color: '#475569' },
            { id: 'dirty', label: 'Dirty / Turnaround', count: counts.dirty, color: '#dc2626' },
            { id: 'clean', label: 'Clean & Available', count: counts.clean, color: '#059669' },
            { id: 'inspected', label: 'Inspected (VIP)', count: counts.inspected, color: '#2563eb' },
            { id: 'maintenance', label: 'Maintenance', count: counts.maintenance, color: '#d97706' }
          ].map((item) => {
            const isActive = filterStatus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterStatus(item.id)}
                style={{
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? item.color : '#64748b',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{item.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: isActive ? `${item.color}15` : 'rgba(0,0,0,0.06)',
                  color: isActive ? item.color : '#64748b',
                  fontWeight: 700
                }}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Grids by Tier */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {groupedRooms.map((group) => {
          const rt = group.type;
          return (
            <div key={rt.id}>
              {/* Category Subheader */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '4px', height: '18px', background: rt.color || '#2563eb', borderRadius: '2px' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                    {rt.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    ({group.rooms.length} Rooms)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Base: ₹{rt.basePrice?.toLocaleString()} • Max {rt.maxAdults} Adults
                </div>
              </div>

              {/* Room Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {group.rooms.map((room) => {
                  // Find current in-house guest if occupied
                  const activeRes = reservations.find(
                    (r) => r.roomId === room.id && r.status === 'in_house'
                  );

                  return (
                    <div key={room.id} className={`room-card ${room.status}`}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                            Room {room.roomNumber}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            Floor {room.floor} • {rt.code}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: room.status === 'clean' ? '#ecfdf5' : room.status === 'dirty' ? '#fef2f2' : room.status === 'inspected' ? '#eff6ff' : '#fffbeb',
                          color: room.status === 'clean' ? '#059669' : room.status === 'dirty' ? '#dc2626' : room.status === 'inspected' ? '#2563eb' : '#d97706',
                          border: `1px solid ${room.status === 'clean' ? '#a7f3d0' : room.status === 'dirty' ? '#fecaca' : room.status === 'inspected' ? '#bfdbfe' : '#fde68a'}`
                        }}>
                          {room.status}
                        </span>
                      </div>

                      {/* Occupancy Info */}
                      {activeRes ? (
                        <div style={{ padding: '0.6rem 0.75rem', background: '#eff6ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
                            <User size={13} />
                            <span>{activeRes.primaryGuest?.name}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '2px' }}>
                            Occupied until {activeRes.checkOutDate} ({activeRes.bookingSource})
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {room.notes || 'Vacant • Ready for allocation'}
                          </span>
                        </div>
                      )}

                      {/* Action Triggers */}
                      <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                        {room.status === 'dirty' && (
                          <button
                            className="btn-primary"
                            onClick={() => onUpdateStatus(room.id, 'clean')}
                            style={{ flex: 1, background: '#059669', fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                          >
                            <Check size={14} />
                            <span>Mark Clean</span>
                          </button>
                        )}

                        {room.status === 'clean' && (
                          <button
                            className="btn-primary"
                            onClick={() => onUpdateStatus(room.id, 'inspected')}
                            style={{ flex: 1, background: '#2563eb', fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                          >
                            <ShieldCheck size={14} />
                            <span>Inspect (VIP)</span>
                          </button>
                        )}

                        {room.status === 'inspected' && (
                          <button
                            className="btn-secondary"
                            onClick={() => onUpdateStatus(room.id, 'dirty')}
                            style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                          >
                            <span>Mark Dirty</span>
                          </button>
                        )}

                        {room.status !== 'maintenance' ? (
                          <button
                            className="btn-secondary"
                            onClick={() => onUpdateStatus(room.id, 'maintenance')}
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.55rem' }}
                            title="Flag for Maintenance"
                          >
                            <Wrench size={13} color="#d97706" />
                          </button>
                        ) : (
                          <button
                            className="btn-primary"
                            onClick={() => onUpdateStatus(room.id, 'clean')}
                            style={{ flex: 1, background: '#d97706', fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'center' }}
                          >
                            <CheckCircle2 size={14} />
                            <span>Release Maintenance</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
