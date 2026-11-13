import React, { useState, useEffect, useRef } from 'react';
import {
  MoreVertical,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AddRoomTypeModal from './AddRoomTypeModal';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';

export default function RoomsManagementView({
  roomTypes = [],
  rooms = [],
  activeTab = 'room-types',
  onTabChange,
  triggerAddRoomType = 0,
  triggerAddRoom = 0,
  onAddRoomType,
  onUpdateRoomType,
  onDeleteRoomType,
  onAddRooms,
  onUpdateRoom,
  onDeleteRoom,
  showToast
}) {
  // Modals state - explicitly always false unless user initiates an action
  const [isAddRoomTypeOpen, setIsAddRoomTypeOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // 3-dots action dropdown state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Keep track of trigger changes to strictly prevent auto-opening on mount or tab change
  const lastTriggerRoomTypeRef = useRef(triggerAddRoomType);
  const lastTriggerRoomRef = useRef(triggerAddRoom);

  useEffect(() => {
    if (triggerAddRoomType > 0 && triggerAddRoomType !== lastTriggerRoomTypeRef.current) {
      setEditingRoomType(null);
      setIsAddRoomTypeOpen(true);
    }
    lastTriggerRoomTypeRef.current = triggerAddRoomType;
  }, [triggerAddRoomType]);

  useEffect(() => {
    if (triggerAddRoom > 0 && triggerAddRoom !== lastTriggerRoomRef.current) {
      setEditingRoom(null);
      setIsAddRoomOpen(true);
    }
    lastTriggerRoomRef.current = triggerAddRoom;
  }, [triggerAddRoom]);

  // Ensure modals are closed whenever switching tabs
  const handleTabSwitch = (tab) => {
    setIsAddRoomTypeOpen(false);
    setIsAddRoomOpen(false);
    setEditingRoomType(null);
    setEditingRoom(null);
    setActiveMenuId(null);
    if (onTabChange) onTabChange(tab);
  };

  // Click outside listener for action menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  // Auto close popover on window/container scroll or resize
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClose = () => setActiveMenuId(null);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenuId]);

  const handleToggleMenu = (e, id, listLength, idx) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 92;
    const menuWidth = 142;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight + 20 || (listLength > 1 && idx === listLength - 1 && spaceBelow < 180);

    setMenuPos({
      top: openUpwards ? Math.max(10, rect.top - menuHeight - 4) : rect.bottom + 4,
      left: Math.max(10, rect.right - menuWidth)
    });
    setActiveMenuId(id);
  };

  const getRoomTypeName = (roomTypeId) => {
    const rt = roomTypes.find((t) => t.id === roomTypeId);
    return rt ? rt.name : 'Standard';
  };

  const getRoomStatusPill = (status) => {
    if (status === 'dirty') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            fontSize: '12px',
            fontWeight: 600,
            padding: '3px 14px',
            borderRadius: '9999px'
          }}
        >
          Dirty
        </span>
      );
    }
    if (status === 'maintenance') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            fontSize: '12px',
            fontWeight: 600,
            padding: '3px 14px',
            borderRadius: '9999px'
          }}
        >
          Maintenance
        </span>
      );
    }
    return (
      <span className="properties-status-pill">
        Active
      </span>
    );
  };

  // Sort room types (matching Image 1: Delux Room, Normal, etc.)
  const sortedRoomTypes = [...roomTypes].sort((a, b) => {
    const orderMap = { 'Delux Room': 1, Normal: 2, Premium: 3 };
    const orderA = orderMap[a.name] || 99;
    const orderB = orderMap[b.name] || 99;
    return orderA - orderB;
  });

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        minHeight: 'calc(100vh - 54px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Subtabs Bar (Matching Image 1: flush with top, padding: 0 24px) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '0 24px'
        }}
      >
        <button
          type="button"
          onClick={() => handleTabSwitch('room-types')}
          style={{
            padding: '14px 2px 12px 2px',
            fontSize: '14px',
            fontWeight: activeTab === 'room-types' ? 600 : 500,
            color: activeTab === 'room-types' ? '#2563EB' : '#64748B',
            border: 'none',
            borderBottom:
              activeTab === 'room-types' ? '2px solid #2563EB' : '2px solid transparent',
            marginBottom: '-1px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Room Types
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('rooms')}
          style={{
            padding: '14px 2px 12px 2px',
            fontSize: '14px',
            fontWeight: activeTab === 'rooms' ? 600 : 500,
            color: activeTab === 'rooms' ? '#2563EB' : '#64748B',
            border: 'none',
            borderBottom:
              activeTab === 'rooms' ? '2px solid #2563EB' : '2px solid transparent',
            marginBottom: '-1px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Rooms
        </button>
      </div>

      {/* =========================================
          TAB 1: ROOM TYPES (MATCHING IMAGE 1)
          ========================================= */}
      {activeTab === 'room-types' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table
              className="properties-table"
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ width: '22%', padding: '14px 16px 14px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Name
                  </th>
                  <th style={{ width: '16%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Base Adult Occupancy
                  </th>
                  <th style={{ width: '16%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Max Adults Occupancy
                  </th>
                  <th style={{ width: '16%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Base Child Occupancy
                  </th>
                  <th style={{ width: '16%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Max Children Occupancy
                  </th>
                  <th style={{ width: '8%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Status
                  </th>
                  <th style={{ width: '6%', padding: '14px 24px 14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRoomTypes.map((rt, idx) => (
                  <tr key={rt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* Name */}
                    <td style={{ padding: '16px 16px 16px 24px' }}>
                      <strong style={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                        {rt.name}
                      </strong>
                    </td>

                    {/* Base Adult Occupancy */}
                    <td style={{ padding: '16px 16px' }}>
                      <span style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: 500 }}>
                        {rt.baseAdults ?? 0}
                      </span>
                    </td>

                    {/* Max Adults Occupancy */}
                    <td style={{ padding: '16px 16px' }}>
                      <span style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: 500 }}>
                        {rt.maxAdults ?? 0}
                      </span>
                    </td>

                    {/* Base Child Occupancy */}
                    <td style={{ padding: '16px 16px' }}>
                      <span style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: 500 }}>
                        {rt.baseChildren ?? 0}
                      </span>
                    </td>

                    {/* Max Children Occupancy */}
                    <td style={{ padding: '16px 16px' }}>
                      <span style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: 500 }}>
                        {rt.maxChildren ?? 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <span className="properties-status-pill">
                        {rt.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="properties-action-cell"
                      style={{
                        position: 'relative',
                        textAlign: 'center',
                        padding: '16px 24px 16px 16px'
                      }}
                    >
                      <button
                        type="button"
                        className="properties-action-btn"
                        onClick={(e) => handleToggleMenu(e, rt.id, sortedRoomTypes.length, idx)}
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === rt.id && (
                        <div
                          className="properties-action-menu fixed-popover"
                          ref={menuRef}
                          style={{
                            position: 'fixed',
                            top: `${menuPos.top}px`,
                            left: `${menuPos.left}px`,
                            zIndex: 9999
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="properties-action-item"
                            onClick={() => {
                              setEditingRoomType(rt);
                              setIsAddRoomTypeOpen(true);
                              setActiveMenuId(null);
                            }}
                          >
                            <SquarePen size={15} color="#334155" />
                            <span>Edit</span>
                          </button>
                          <div className="properties-action-divider" />
                          <button
                            type="button"
                            className="properties-action-item delete"
                            onClick={() => {
                              if (onDeleteRoomType) {
                                onDeleteRoomType(rt.id);
                              }
                              setActiveMenuId(null);
                              if (showToast) {
                                showToast(`Deleted room type "${rt.name}"`);
                              }
                            }}
                          >
                            <Trash2 size={15} color="#EF4444" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div className="properties-pagination-text">
              Showing{' '}
              <strong>
                {sortedRoomTypes.length > 0 ? `1–${sortedRoomTypes.length}` : '0–0'}
              </strong>{' '}
              of <strong>{sortedRoomTypes.length}</strong> results
            </div>

            <div className="properties-pagination-controls">
              <button
                type="button"
                className="properties-page-btn"
                disabled
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="properties-page-btn active"
                title="Page 1"
              >
                1
              </button>
              <button
                type="button"
                className="properties-page-btn"
                disabled
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: ROOMS (MATCHING IMAGE 3)
          ========================================= */}
      {activeTab === 'rooms' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table
              className="properties-table"
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ width: '28%', padding: '14px 16px 14px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Room Number
                  </th>
                  <th style={{ width: '38%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Room Type
                  </th>
                  <th style={{ width: '26%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Status
                  </th>
                  <th style={{ width: '8%', padding: '14px 24px 14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((rm, idx) => (
                  <tr
                    key={rm.id || rm.roomNumber}
                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                    onClick={() => setEditingRoom(rm)}
                    title={`Click to edit room ${rm.roomNumber}`}
                  >
                    {/* Room Number */}
                    <td style={{ padding: '16px 16px 16px 24px' }}>
                      <strong style={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                        {rm.roomNumber}
                      </strong>
                    </td>

                    {/* Room Type */}
                    <td style={{ padding: '16px 16px' }}>
                      <span style={{ color: '#1E293B', fontSize: '13.5px', fontWeight: 500 }}>
                        {getRoomTypeName(rm.roomTypeId)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      {getRoomStatusPill(rm.status)}
                    </td>

                    {/* Actions */}
                    <td
                      className="properties-action-cell"
                      style={{
                        position: 'relative',
                        textAlign: 'center',
                        padding: '16px 24px 16px 16px'
                      }}
                    >
                      <button
                        type="button"
                        className="properties-action-btn"
                        onClick={(e) => handleToggleMenu(e, rm.id, rooms.length, idx)}
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === rm.id && (
                        <div
                          className="properties-action-menu fixed-popover"
                          ref={menuRef}
                          style={{
                            position: 'fixed',
                            top: `${menuPos.top}px`,
                            left: `${menuPos.left}px`,
                            zIndex: 9999
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="properties-action-item"
                            onClick={() => {
                              setEditingRoom(rm);
                              setActiveMenuId(null);
                            }}
                          >
                            <SquarePen size={15} color="#334155" />
                            <span>Edit</span>
                          </button>
                          <div className="properties-action-divider" />
                          <button
                            type="button"
                            className="properties-action-item delete"
                            onClick={() => {
                              if (onDeleteRoom) {
                                onDeleteRoom(rm.id);
                              }
                              setActiveMenuId(null);
                              if (showToast) {
                                showToast(`Deleted room ${rm.roomNumber}`);
                              }
                            }}
                          >
                            <Trash2 size={15} color="#EF4444" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div className="properties-pagination-text">
              Showing{' '}
              <strong>
                {rooms.length > 0 ? `1–${rooms.length}` : '0–0'}
              </strong>{' '}
              of <strong>{rooms.length}</strong> results
            </div>

            <div className="properties-pagination-controls">
              <button
                type="button"
                className="properties-page-btn"
                disabled
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="properties-page-btn active"
                title="Page 1"
              >
                1
              </button>
              <button
                type="button"
                className="properties-page-btn"
                disabled
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Room Type Drawer Modal */}
      <AddRoomTypeModal
        isOpen={isAddRoomTypeOpen}
        onClose={() => {
          setIsAddRoomTypeOpen(false);
          setEditingRoomType(null);
        }}
        onCreateRoomType={onAddRoomType}
        onUpdateRoomType={onUpdateRoomType}
        roomTypeToEdit={editingRoomType}
        showToast={showToast}
      />

      {/* Add Room Drawer Modal (Matching Images 4 & 5) */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        roomTypes={roomTypes}
        onAddRooms={onAddRooms}
        showToast={showToast}
      />

      {/* Edit Room Modal */}
      <EditRoomModal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        room={editingRoom}
        roomTypes={roomTypes}
        onUpdateRoom={onUpdateRoom}
        showToast={showToast}
      />
    </div>
  );
}
