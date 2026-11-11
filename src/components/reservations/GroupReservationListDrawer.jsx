import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Users, X, Crown } from 'lucide-react';
import './group-reservation-list.css';

export default function GroupReservationListDrawer({
  isOpen,
  onClose,
  reservation,
  reservations = [],
  rooms = [],
  roomTypes = []
}) {
  const drawerRef = useRef(null);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open', 'modal-open');
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.classList.remove('drawer-open', 'modal-open');
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !reservation) return null;

  // Resolve member list:
  // If reservation has explicit groupMembers, use them.
  // Else if reservation has groupId or groupCode, match peer reservations.
  // Else if reservation has assigned rooms, map them.
  // Otherwise, default to this reservation as the group leader.
  const getGroupMembers = () => {
    if (reservation.groupMembers && Array.isArray(reservation.groupMembers) && reservation.groupMembers.length > 0) {
      return reservation.groupMembers;
    }
    if (reservation.groupId && reservations && reservations.length > 0) {
      const peers = reservations.filter((r) => r.groupId === reservation.groupId);
      if (peers.length > 0) return peers;
    }
    if (reservation.groupCode && reservations && reservations.length > 0) {
      const peers = reservations.filter((r) => r.groupCode === reservation.groupCode);
      if (peers.length > 0) return peers;
    }
    if (reservation.assignedRooms && Array.isArray(reservation.assignedRooms) && reservation.assignedRooms.length > 1) {
      return reservation.assignedRooms.map((arm, idx) => ({
        ...reservation,
        id: `${reservation.id}_room_${idx}`,
        roomNumber: typeof arm === 'object' ? (arm.roomNumber || '-') : arm,
        isLeader: idx === 0
      }));
    }
    return [{ ...reservation, isLeader: true }];
  };

  const members = getGroupMembers();

  const getMemberName = (m) => {
    if (m.name) return m.name;
    const g = m.primaryGuest || {};
    const composed = `${g.title || ''} ${g.firstName || ''} ${g.lastName || ''}`.trim();
    if (composed) return composed;
    if (g.name) return g.name;
    if (m.guestName) return m.guestName;
    return 'Mr Krishna Kumar';
  };

  const getRoomTypeName = (m) => {
    if (m.roomTypeName) return m.roomTypeName;
    if (m.roomType) return m.roomType;
    if (m.roomTypeId) {
      const rt = roomTypes.find((t) => t.id === m.roomTypeId);
      if (rt && rt.name) return rt.name;
    }
    if (m.roomId) {
      const currRoom = rooms.find((r) => r.id === m.roomId);
      if (currRoom) {
        const matchedRt = roomTypes.find((t) => t.id === currRoom.roomTypeId);
        if (matchedRt && matchedRt.name) return matchedRt.name;
      }
    }
    return 'Delux Room';
  };

  const getRoomNumber = (m) => {
    if (m.roomNumber && m.roomNumber !== '-') return m.roomNumber;
    if (m.roomId) {
      const found = rooms.find((r) => r.id === m.roomId);
      if (found && found.roomNumber) return found.roomNumber;
      return m.roomId.replace(/^rm_/, '');
    }
    return '-';
  };

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (s === 'checked_out') {
      return { label: 'Checked Out', bg: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7' };
    }
    if (s === 'in_house') {
      return { label: 'In-House', bg: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' };
    }
    if (s === 'confirmed') {
      return { label: 'Confirmed', bg: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' };
    }
    if (s === 'cancelled') {
      return { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2' };
    }
    if (s === 'no_show') {
      return { label: 'No Show', bg: '#FFFBEB', color: '#D97706', border: '1px solid #FEF3C7' };
    }
    return { label: 'Checked Out', bg: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7' };
  };

  const drawerContent = (
    <div className="group-res-backdrop" onClick={onClose}>
      <div
        className="group-res-drawer"
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="group-res-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="group-res-icon-box">
              <Users size={20} color="#2563EB" strokeWidth={2} />
            </div>
            <h3 className="group-res-title">Group Reservation List</h3>
          </div>
          <button
            type="button"
            className="group-res-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* Body */}
        <div className="group-res-body">
          <div className="group-res-grid">
            {members.map((member, idx) => {
              const name = getMemberName(member);
              const roomType = getRoomTypeName(member);
              const roomNum = getRoomNumber(member);
              const statusBadge = getStatusBadge(member.status);
              const isLeader = member.isLeader || idx === 0;

              return (
                <div key={member.id || idx} className="group-res-card">
                  {/* Name + Crown */}
                  <div className="group-res-card-header">
                    <span className="group-res-guest-name">{name}</span>
                    {isLeader && (
                      <Crown
                        size={16}
                        color="#F59E0B"
                        fill="#F59E0B"
                        className="group-res-crown-icon"
                      />
                    )}
                  </div>

                  {/* Room Type */}
                  <div className="group-res-field">
                    <div className="group-res-field-label">Room Type</div>
                    <div className="group-res-field-val">{roomType}</div>
                  </div>

                  {/* Room Number */}
                  <div className="group-res-field">
                    <div className="group-res-field-label">Room Number</div>
                    <div className="group-res-field-val">{roomNum}</div>
                  </div>

                  {/* Divider */}
                  <hr className="group-res-divider" />

                  {/* Status Badge */}
                  <div
                    className="group-res-status-badge"
                    style={{
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      border: statusBadge.border
                    }}
                  >
                    {statusBadge.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="group-res-footer">
          <button
            type="button"
            className="group-res-btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(drawerContent, document.body)
    : drawerContent;
}

