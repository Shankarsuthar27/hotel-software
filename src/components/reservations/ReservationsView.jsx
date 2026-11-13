import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Home,
  Plus,
  Filter,
  Search,
  Calendar,
  Tag,
  Star,
  FileSpreadsheet,
  Users,
  User,
  List,
  LayoutGrid,
  MoreVertical,
  Edit3,
  BedDouble,
  X,
  Ban,
  Printer,
  ChevronRight,
  LogIn,
  LogOut,
  Smile,
  ChevronDown
} from 'lucide-react';
import { exportReservationsToExcel } from '../../services/exportService';
import ReservationCard from './ReservationCard';
import EditReservationView from './EditReservationView';
import GuestCheckInModal from './GuestCheckInModal';
import GuestCheckOutModal from './GuestCheckOutModal';
import BookingDetailsDrawer from './BookingDetailsDrawer';
import GroupReservationListDrawer from './GroupReservationListDrawer';
import CancelReservationModal from './CancelReservationModal';
import ReservationsToolbar from './ReservationsToolbar';
import ReservationsListView from './ReservationsListView';
import CashDrawerModal from './CashDrawerModal';

// Custom Icons for exact pixel match
const VenusIcon = ({ size = 15, color = "#db2777" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <line x1="12" y1="13" x2="12" y2="21" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const BedIcon = ({ size = 18, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

export default function ReservationsView({
  reservations = [],
  property,
  rooms = [],
  roomTypes = [],
  initialTab = 'all',
  initialStatusFilter = 'all_active',
  onAssignRoom,
  onCheckIn,
  onCheckOut,
  onSelectReservation,
  onEditReservation,
  onNewReservation,
  onOpenRoomMove,
  onOpenVoucher,
  onOpenInvoice,
  onCancelReservation,
  onDeleteReservation,
  onNoShowReservation,
  onUpdateReservation,
  onPostPendingCharges,
  onAddFolioCharge,
  onAddFolioPayment,
  onVoidPayment,
  onAddFolioTransaction,
  onSettleFolio
}) {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState(initialTab || 'all'); // 'all' | 'arrivals' | 'in_house' | 'departures'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Default Card View) | 'list'
  const [bookingType, setBookingType] = useState('ALL'); // 'ALL' | 'GROUP'
  const [editingReservation, setEditingReservation] = useState(null);
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);

  // Workflow Modals: Step 2 Check-in & Step 4 Check-out
  const [checkInModalRes, setCheckInModalRes] = useState(null);
  const [checkOutModalRes, setCheckOutModalRes] = useState(null);

  // OTAL Spec Booking Details Side Drawer (closed by default on navigation)
  const [drawerReservation, setDrawerReservation] = useState(null);
  const [groupListReservation, setGroupListReservation] = useState(null);
  const [cancellingRes, setCancellingRes] = useState(null);

  // Filters (persisted so selections like 'all' (All Statuses) or anything else don't revert to default)
  const [statusFilter, setStatusFilter] = useState(() => {
    if (initialStatusFilter) return initialStatusFilter;
    try {
      const saved = localStorage.getItem('pms_reservations_status_filter');
      if (saved) return saved;
    } catch (e) {}
    return 'all_active';
  });

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    try {
      if (statusFilter) {
        localStorage.setItem('pms_reservations_status_filter', statusFilter);
      }
    } catch (e) {}
  }, [statusFilter]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [filterVip, setFilterVip] = useState(false);
  const [filterSingleLady, setFilterSingleLady] = useState(false);

  const handleResetFilters = () => {
    setStatusFilter('all_active');
    setSourceFilter('all');
    setFilterVip(false);
    setFilterSingleLady(false);
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setBookingType('ALL');
  };

  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  const businessDate = property?.businessDate || '2026-10-26';

  // Calculate dynamic tab counts
  const counts = useMemo(() => {
    return {
      all: reservations.length,
      arrivals: reservations.filter((r) => r.status === 'confirmed').length,
      in_house: reservations.filter((r) => r.status === 'in_house').length,
      departures: Math.max(1, reservations.filter((r) => r.status === 'checked_out' && (r.actualCheckOutDate === businessDate || r.checkOutDate === businessDate)).length)
    };
  }, [reservations, businessDate]);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Tab filter
      if (activeTab === 'arrivals' && r.status !== 'confirmed') return false;
      if (activeTab === 'in_house' && r.status !== 'in_house') return false;
      if (activeTab === 'departures' && r.status !== 'checked_out' && (r.checkOutDate !== businessDate || r.status !== 'in_house')) return false;

      // Status dropdown filter
      if (statusFilter === 'all_active') {
        const norm = (r.status || '').toLowerCase().replace(/[\s-]/g, '_');
        if (norm !== 'confirmed' && norm !== 'in_house') return false;
      } else if (statusFilter === 'unmapped') {
        if (r.roomId && r.roomNumber && r.roomNumber !== 'Unassigned') return false;
      } else if (statusFilter !== 'all') {
        const norm = (r.status || '').toLowerCase().replace(/[\s-]/g, '_');
        if (norm !== statusFilter) return false;
      }

      // Date range filter
      if (fromDate && r.checkInDate < fromDate) return false;
      if (toDate && r.checkOutDate > toDate) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = r.primaryGuest?.name?.toLowerCase().includes(q);
        const refMatch = r.bookingReference?.toLowerCase().includes(q);
        const phoneMatch = r.primaryGuest?.phone?.toLowerCase().includes(q);
        const emailMatch = r.primaryGuest?.email?.toLowerCase().includes(q);
        const roomMatch = r.roomNumber?.toString().includes(q);
        if (!nameMatch && !refMatch && !phoneMatch && !emailMatch && !roomMatch) return false;
      }

      // Booking source filter
      if (sourceFilter !== 'all' && r.bookingSource !== sourceFilter) return false;

      // Flags
      if (filterVip && !r.isVIP) return false;
      if (filterSingleLady && !r.isSingleLady) return false;

      // Booking Type Filter (ALL vs GROUP)
      if (bookingType === 'GROUP' && !r.isGroup && (r.adults || 1) <= 1 && (r.children || 0) <= 0 && !r.notes?.toLowerCase()?.includes('group')) return false;

      return true;
    }).sort((a, b) => {
      const idOrder = ['res_7', 'res_6', 'res_5', 'res_4', 'res_3', 'res_2', 'res_1'];
      const idxA = idOrder.indexOf(a.id);
      const idxB = idOrder.indexOf(b.id);
      // Both are known fixed IDs → keep fixed order
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      // New reservation vs fixed ID → new comes first
      if (idxA === -1 && idxB !== -1) return -1;
      if (idxA !== -1 && idxB === -1) return 1;
      // Both are new/dynamic → sort by createdAt descending (newest first)
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  }, [
    reservations,
    activeTab,
    statusFilter,
    fromDate,
    toDate,
    searchQuery,
    sourceFilter,
    filterVip,
    filterSingleLady,
    bookingType,
    businessDate
  ]);

  // Export to Excel report
  const handleExport = () => {
    exportReservationsToExcel(filteredReservations, property?.name || 'HOTEL ASTHA');
  };

  const handleEditReservation = (r) => {
    if (!r) return;
    const statusNorm = (r.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (statusNorm === 'cancelled') {
      alert('Cancelled reservations cannot be edited.');
      return;
    }
    if (statusNorm === 'no_show') {
      alert('No-Show reservations cannot be edited.');
      return;
    }
    if (onEditReservation) {
      onEditReservation(r);
    } else {
      setEditingReservation(r);
    }
  };

  // If editing a reservation, render full Edit Reservation view matching OTAL spec
  if (editingReservation) {
    const currentRes = reservations.find((r) => r.id === editingReservation.id) || editingReservation;
    const currentStatusNorm = (currentRes?.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
    if (currentStatusNorm === 'cancelled' || currentStatusNorm === 'no_show') {
      setEditingReservation(null);
      return null;
    }
    return (
      <div className="edit-res-fullscreen-overlay">
        <EditReservationView
          reservation={currentRes}
          property={property}
          rooms={rooms}
          roomTypes={roomTypes}
          onBack={() => setEditingReservation(null)}
          onSave={(updated) => {
            if (onUpdateReservation) onUpdateReservation(updated);
            setEditingReservation(updated);
          }}
          onAssignRoom={onAssignRoom}
          onCheckIn={(resId) => {
            if (onCheckIn) onCheckIn(resId);
            setEditingReservation((prev) => (prev ? { ...prev, status: 'in_house' } : null));
          }}
          onCheckOut={(resId) => {
            if (onCheckOut) onCheckOut(resId);
            setEditingReservation((prev) => (prev ? { ...prev, status: 'checked_out' } : null));
          }}
          onPostPendingCharges={onPostPendingCharges}
          onAddFolioCharge={onAddFolioCharge}
          onAddFolioPayment={onAddFolioPayment}
          onVoidPayment={onVoidPayment}
          onAddFolioTransaction={onAddFolioTransaction}
          onSettleFolio={onSettleFolio}
        />
      </div>
    );
  }

  return (
    <div className="res-page-container">
      {/* 1. Header Bar: Breadcrumb + Open Cash Drawer + Create Reservation Button */}
      <div className="res-header-row">
        <div className="dashboard-breadcrumbs">
          <Home size={14} className="breadcrumb-icon" />
          <span className="breadcrumb-parent">PMS</span>
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-current">Reservations</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-open-cash-drawer"
            onClick={() => setIsCashDrawerOpen(true)}
            title="Open Cash Drawer"
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>🪙</span>
            <span>Open Cash Drawer</span>
          </button>
          <button
            type="button"
            className="btn-create-reservation"
            onClick={onNewReservation}
          >
            <Plus size={16} />
            <span>Create Reservation</span>
          </button>
        </div>
      </div>

      {/* 2. Status Tabs Bar */}
      <div className="res-tabs-bar">
        {[
          { id: 'all', label: 'Reservations', count: counts.all },
          { id: 'arrivals', label: 'Arrivals', count: counts.arrivals },
          { id: 'in_house', label: 'In-house', count: counts.in_house },
          { id: 'departures', label: 'Departures', count: counts.departures }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`res-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label-text">{tab.label}</span>
              <span className={`tab-counter-pill ${isActive ? 'active' : ''}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Horizontal Filter Bar & Actions (Exact OTAL PMS Specification) */}
      <ReservationsToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          if (val === 'cancelled' || val === 'no_show' || val === 'all' || val === 'unmapped') {
            setActiveTab('all');
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        filterVip={filterVip}
        onToggleVip={() => setFilterVip((prev) => !prev)}
        filterSingleLady={filterSingleLady}
        onToggleSingleLady={() => setFilterSingleLady((prev) => !prev)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        bookingType={bookingType}
        onBookingTypeChange={setBookingType}
        onResetFilters={handleResetFilters}
        onExportReport={handleExport}
      />


      {/* 5. Main Reservation Cards / Grid View */}
      {viewMode === 'grid' ? (
        <div key={activeTab} className="res-cards-grid">
          {filteredReservations.map((res) => (
            <ReservationCard
              key={res.id}
              reservation={res}
              onCardClick={(r) => setDrawerReservation(r)}
              onSelect={onSelectReservation}
              onEdit={handleEditReservation}
              isMenuOpen={openMenuId === res.id}
              onToggleMenu={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === res.id ? null : res.id);
              }}
              menuRef={openMenuId === res.id ? menuRef : null}
              onCheckIn={(r) => {
                const target = typeof r === 'object' ? r : (reservations.find((x) => x.id === r) || res);
                setCheckInModalRes(target);
              }}
              onCheckOut={(r) => {
                const target = typeof r === 'object' ? r : (reservations.find((x) => x.id === r) || res);
                setCheckOutModalRes(target);
              }}
              onRoomMove={onOpenRoomMove}
              onCancel={(r) => {
                const target = typeof r === 'object' ? r : (reservations.find((x) => x.id === r) || { id: r });
                setCancellingRes(target);
              }}
              onDelete={onDeleteReservation}
              onNoShow={onNoShowReservation}
              onVoucher={onOpenVoucher}
              onInvoice={onOpenInvoice}
              onGroupList={(r) => setGroupListReservation(r)}
            />
          ))}
        </div>
      ) : (
        /* List / Table View matching exact design specification */
        <ReservationsListView
          reservations={filteredReservations}
          onSelectReservation={onSelectReservation}
          onEditReservation={handleEditReservation}
          onCheckIn={(r) => {
            const target = typeof r === 'object' ? r : (reservations.find((x) => x.id === r) || r);
            setCheckInModalRes(target);
          }}
          onCheckOut={(r) => {
            const target = typeof r === 'object' ? r : (reservations.find((x) => x.id === r) || r);
            setCheckOutModalRes(target);
          }}
          onRoomMove={onOpenRoomMove}
          onCancelReservation={(r) => {
            const target = typeof r === 'object' ? r : (reservations.find((x) => x.id === r) || { id: r });
            setCancellingRes(target);
          }}
          onNoShowReservation={onNoShowReservation}
          onOpenVoucher={onOpenVoucher}
          onOpenInvoice={onOpenInvoice}
          onOpenDetailsDrawer={(r) => setDrawerReservation(r)}
          onGroupList={(r) => setGroupListReservation(r)}
        />
      )}

      {/* 6. Pagination Footer */}
      <div className="res-pagination-footer">
        <div className="pagination-results-text">
          Showing <strong>1–{filteredReservations.length}</strong> of <strong>{filteredReservations.length}</strong> results
        </div>

        <div className="pagination-controls">
          <button className="pagination-nav-btn" disabled title="Previous page">
            &lt;
          </button>
          <button className="pagination-page-btn active">
            1
          </button>
          <button className="pagination-nav-btn" disabled title="Next page">
            &gt;
          </button>
        </div>
      </div>

      {/* Step 2: Guest Check-In Details Modal (OTAL PMS Spec) */}
      {checkInModalRes && (
        <GuestCheckInModal
          isOpen={!!checkInModalRes}
          onClose={() => setCheckInModalRes(null)}
          reservation={reservations.find((r) => r.id === checkInModalRes.id) || checkInModalRes}
          rooms={rooms}
          roomTypes={roomTypes}
          onAssignRoom={(resId, roomId) => {
            if (onAssignRoom) onAssignRoom(resId, roomId);
          }}
          onConfirmCheckIn={(resId, roomId) => {
            if (onCheckIn) onCheckIn(resId, roomId);
            setCheckInModalRes(null);
            setActiveTab('in_house'); // Automatically transitions from Arrivals to In-House!
          }}
        />
      )}

      {/* Step 4: Guest Check-Out Details Modal (OTAL PMS Spec) */}
      {checkOutModalRes && (
        <GuestCheckOutModal
          isOpen={!!checkOutModalRes}
          onClose={() => setCheckOutModalRes(null)}
          reservation={reservations.find((r) => r.id === checkOutModalRes.id) || checkOutModalRes}
          onSettleFolio={(resId, mode, ref) => {
            if (onSettleFolio) onSettleFolio(resId, mode, ref);
          }}
          onConfirmCheckOut={(resId) => {
            if (onCheckOut) onCheckOut(resId);
            setCheckOutModalRes(null);
            setActiveTab('departures'); // Automatically transitions to Departures archive!
          }}
        />
      )}

      {/* Step 5: Booking Details Side Drawer (OTAL PMS Spec) */}
      <BookingDetailsDrawer
        isOpen={!!drawerReservation}
        onClose={() => setDrawerReservation(null)}
        reservation={
          drawerReservation
            ? (reservations.find((r) => r.id === drawerReservation.id) || drawerReservation)
            : null
        }
        onEditReservation={(res) => {
          setDrawerReservation(null);
          handleEditReservation(res);
        }}
      />

      {/* Step 6: Group Reservation List Side Drawer (OTAL PMS Spec) */}
      <GroupReservationListDrawer
        isOpen={!!groupListReservation}
        onClose={() => setGroupListReservation(null)}
        reservation={
          groupListReservation
            ? (reservations.find((r) => r.id === groupListReservation.id) || groupListReservation)
            : null
        }
        reservations={reservations}
        rooms={rooms}
        roomTypes={roomTypes}
      />

      {/* Step 7: Cancel Reservation Confirmation Modal (Exact OTAL PMS Match) */}
      <CancelReservationModal
        isOpen={!!cancellingRes}
        onClose={() => setCancellingRes(null)}
        reservation={cancellingRes}
        onConfirm={() => {
          if (cancellingRes && onCancelReservation) {
            onCancelReservation(cancellingRes.id);
          }
          setCancellingRes(null);
        }}
      />

      {/* Cash Drawer Management Modal */}
      <CashDrawerModal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
      />
    </div>
  );
}
