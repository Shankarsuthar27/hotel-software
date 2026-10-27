import React, { useState } from 'react';
import './edit-reservation.css';
import {
  ArrowLeft,
  Home,
  Plus,
  Crown,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  Smile,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  MoreVertical,
  PlusCircle,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Star,
  Upload,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { pmsStore } from '../../services/pmsStore';
import GuestCheckInModal from './GuestCheckInModal';
import GuestCheckOutModal from './GuestCheckOutModal';
import VoidPaymentModal from '../folios/VoidPaymentModal';
import AddPaymentModal from '../folios/AddPaymentModal';
import AddChargeModal from '../folios/AddChargeModal';

/**
 * EditReservationView Component
 * Rebuilt exactly according to OTAL PMS Front-Desk Lifecycle specifications
 */
export default function EditReservationView({
  reservation = {},
  property = {},
  rooms = [],
  roomTypes = [],
  onBack,
  onNavigate,
  onSave,
  onAssignRoom,
  onCheckIn,
  onCheckOut,
  onPostPendingCharges,
  onAddFolioCharge,
  onAddFolioPayment,
  onVoidPayment,
  onAddFolioTransaction,
  onSettleFolio
}) {
  const [activeTab, setActiveTab] = useState('guest'); // 'guest' | 'booking' | 'folio' | 'charges' | 'audit'

  // Sub-sidebar accordion state
  const [isRoomAccordionOpen, setIsRoomAccordionOpen] = useState(true);

  // Editable Form State: Guest Details
  const [guestForm, setGuestForm] = useState({
    title: reservation.primaryGuest?.title || 'Mr.',
    firstName: reservation.primaryGuest?.firstName || 'shankar',
    lastName: reservation.primaryGuest?.lastName || 'suthar',
    mobile: reservation.primaryGuest?.phone || '9664471637',
    countryCode: reservation.primaryGuest?.countryCode || '+91',
    email: reservation.primaryGuest?.email || 'ss2137789@gmail.com',
    birthDate: reservation.primaryGuest?.birthDate || '2002-09-27',
    nationality: reservation.primaryGuest?.nationality || '',
    gender: reservation.primaryGuest?.gender || 'Male',
    guestType: reservation.primaryGuest?.guestType || 'Adult',
    isPrimary: reservation.primaryGuest?.isPrimary !== undefined ? reservation.primaryGuest.isPrimary : true,
    isVIP: reservation.isVIP || false,
    address: reservation.primaryGuest?.address || 'jalore',
    zip: reservation.primaryGuest?.zip || '343001',
    country: reservation.primaryGuest?.country || 'Algeria',
    state: reservation.primaryGuest?.state || 'Ain Defla',
    city: reservation.primaryGuest?.city || '',
    idNumber: reservation.primaryGuest?.idNumber || '990969609690',
    idType: reservation.primaryGuest?.idType || 'Aadhaar Card',
    issuingCountry: reservation.primaryGuest?.issuingCountry || 'India',
    issuingCity: reservation.primaryGuest?.issuingCity || 'jalore',
    expiryDate: reservation.primaryGuest?.expiryDate || '2026-10-28'
  });

  // Editable Form State: Booking Details
  const [bookingForm, setBookingForm] = useState({
    billTo: reservation.billTo || 'Guest',
    company: reservation.company || '',
    guestGstin: reservation.primaryGuest?.gstin || '',
    marketSegment: reservation.marketSegment?.toLowerCase() || 'corporate',
    bookingSource: reservation.bookingSource === 'WALK_IN' ? 'walk-in' : (reservation.bookingSource?.toLowerCase() || 'walk-in'),
    specialRequests: reservation.specialRequests || '',
    applyToAllRooms: false
  });

  // Workflow & Folio Modal States
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [voidModalTx, setVoidModalTx] = useState(null);
  const [folioVersion, setFolioVersion] = useState(0);

  // Live reservation and folio from pmsStore
  const currentRes = (typeof pmsStore?.getReservation === 'function'
    ? pmsStore.getReservation(reservation?.id)
    : pmsStore?.getState?.()?.reservations?.find(r => r.id === reservation?.id)) || reservation || {};
  const currentFolio = (pmsStore?.getState?.()?.folios && pmsStore.getState().folios[currentRes.folioId]) || {
    folioNumber: `FOL_${currentRes.id ? currentRes.id.replace('res_', '') : '1'}`,
    status: (currentRes.balanceDue || 0) <= 0 ? 'SETTLED' : 'OPEN',
    totalDebits: currentRes.totalAmount || 0,
    totalCredits: currentRes.paidAmount || 0,
    balanceDue: currentRes.balanceDue !== undefined ? currentRes.balanceDue : ((currentRes.totalAmount || 0) - (currentRes.paidAmount || 0)),
    transactions: []
  };

  const folioTransactions = currentFolio.transactions || [];

  // Form State for Add Charge (Step 3.2: 6 categories + receipt # + amount + desc)
  const [newCharge, setNewCharge] = useState({
    category: 'Room (Room Rent / Accommodation)',
    receiptNumber: '',
    amount: '',
    description: ''
  });

  // Form State for Add Payment (Step 3.3: Folio + Type + Payment Method + Amount)
  const [newPayment, setNewPayment] = useState({
    folioId: currentFolio.folioNumber || currentRes.folioId || 'FOL_1',
    type: 'Settlement',
    paymentMethod: 'UPI',
    amount: currentFolio.balanceDue > 0 ? String(currentFolio.balanceDue) : '',
    reference: '',
    description: ''
  });

  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsBrowserFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsBrowserFullscreen(false)).catch(() => {});
    }
  };

  // Status & Calculations
  const isInHouse = currentRes.status === 'in_house';
  const isConfirmed = currentRes.status === 'confirmed';
  const isCheckedOut = currentRes.status === 'checked_out' || currentRes.status === 'Checked Out' || currentRes.status === 'checked-out';

  const totalCharges = Number(currentFolio.totalDebits !== undefined ? currentFolio.totalDebits : (currentRes.totalAmount || 0)).toFixed(2);
  const totalPaid = Number(currentFolio.totalCredits !== undefined ? currentFolio.totalCredits : (currentRes.paidAmount || 0)).toFixed(2);
  const outstanding = Number(
    currentFolio.balanceDue !== undefined ? currentFolio.balanceDue : (currentRes.balanceDue !== undefined ? currentRes.balanceDue : 0)
  ).toFixed(2);

  // Format date helper: "24/10/2026"
  const formatSlashedDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const arrivalText = formatSlashedDate(currentRes.checkInDate || '2026-10-24');
  const departureText = formatSlashedDate(currentRes.checkOutDate || '2026-10-26');
  const nightsCount = currentRes.nights || 1;
  const roomNum = currentRes.roomNumber || (currentRes.assignedRoomId ? currentRes.assignedRoomId.replace('rm_', '') : 'Unassigned');
  const roomName = currentRes.roomTypeName || 'Delux Room';

  // Sample Room Charges matching screenshot 4
  const roomChargesList = [
    {
      stay: arrivalText,
      room: roomNum,
      ratePlan: currentRes.ratePlan || 'test plan',
      pax: `${currentRes.adults || 1}/${currentRes.children || 0}`,
      charge: Number(currentRes.ratePerNight || 2500).toFixed(2),
      tax: Number((currentRes.ratePerNight || 2500) * 0.05).toFixed(2),
      netAmount: Number((currentRes.ratePerNight || 2500) * 1.05).toFixed(2)
    }
  ];

  // Live Audit Trail matching PMS operations
  const storeAudits = (pmsStore.getState().auditTrail || [])
    .filter(a =>
      a.reservationId === currentRes.id ||
      a.bookingReference === currentRes.bookingReference ||
      (a.details && (a.details.includes(currentRes.id) || a.details.includes(currentRes.bookingReference || '')))
    )
    .map(a => {
      let icon = 'description';
      let color = '#2563eb';
      if (a.action === 'CHECK_IN') {
        icon = 'person_check';
        color = '#9333ea';
      } else if (a.action === 'CHECK_OUT') {
        icon = 'logout';
        color = '#10b981';
      } else if (a.action === 'VOID_PAYMENT') {
        icon = 'block';
        color = '#ef4444';
      } else if (a.action === 'PAYMENT_ADDED') {
        icon = 'payments';
        color = '#059669';
      } else if (a.action === 'CHARGE_ADDED' || a.action === 'POST_PENDING_CHARGES') {
        icon = 'receipt_long';
        color = '#d97706';
      } else if (a.action === 'RESERVATION_CREATED') {
        icon = 'add_circle';
        color = '#16a34a';
      }

      const d = new Date(a.timestamp);
      const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '12:00:00 PM';

      return {
        id: a.id,
        color,
        icon,
        title: a.details?.split(':')[0] || a.action?.replace('_', ' ') || 'Audit Event',
        time: timeStr,
        author: a.userName || 'Astha India',
        renderBody: () => (
          <>
            <div>{a.details}</div>
            <div className="edit-res-affected-badge">
              Status: {currentRes.status} | Room: {roomNum}
            </div>
          </>
        )
      };
    });

  const auditTimeline = [
    ...storeAudits,
    {
      id: 'aud_initial',
      color: '#16a34a',
      icon: 'add_circle',
      title: 'Reservation Created',
      time: '12:07:35 PM',
      author: 'Astha India',
      renderBody: () => (
        <>
          <div>Booking Reference: {currentRes.bookingReference || '#RES_1'}</div>
          <div>Guest Name: {guestForm.firstName} {guestForm.lastName}</div>
          <div>Stay Dates: {currentRes.checkInDate} — {currentRes.checkOutDate}</div>
          <div>Nights: {nightsCount}</div>
          <div>Rooms: 1</div>
          <div>Total Amount: {totalCharges} INR</div>
          <div>Booking Source: {bookingForm.bookingSource}</div>
          <div className="edit-res-affected-badge">
            Affected dates: {currentRes.checkInDate}
          </div>
        </>
      )
    }
  ];

  const handleSaveAll = () => {
    if (isCheckedOut) {
      alert('This reservation is checked out. Customer, booking, and payment details cannot be changed.');
      return;
    }
    if (onSave) {
      onSave({
        ...currentRes,
        primaryGuest: {
          ...currentRes.primaryGuest,
          ...guestForm,
          name: `${guestForm.title} ${guestForm.firstName} ${guestForm.lastName}`.trim()
        },
        ...bookingForm
      });
    }
    alert('Reservation changes saved successfully!');
  };

  // Step 3.1: Post Pending Charges
  const handlePostPendingCharges = () => {
    if (isCheckedOut) {
      alert('Cannot post charges to a checked out reservation.');
      return;
    }
    pmsStore.postPendingCharges(currentRes.id);
    if (onPostPendingCharges) onPostPendingCharges(currentRes.id);
    setFolioVersion(v => v + 1);
    alert('Success: Pending nightly charges posted onto guest folio.');
  };

  // Step 3.2: Add Charge
  const handleAddChargeSubmit = (e) => {
    e.preventDefault();
    if (isCheckedOut) {
      alert('Cannot add charges to a checked out reservation.');
      return;
    }
    if (!newCharge.amount) return;
    pmsStore.addFolioCharge(currentRes.id, {
      category: newCharge.category,
      receiptNumber: newCharge.receiptNumber,
      amount: newCharge.amount,
      description: newCharge.description
    });
    if (onAddFolioCharge) onAddFolioCharge(currentRes.id, newCharge);
    setShowAddChargeModal(false);
    setNewCharge({
      category: 'Room (Room Rent / Accommodation)',
      receiptNumber: '',
      amount: '',
      description: ''
    });
    setFolioVersion(v => v + 1);
  };

  // Step 3.3: Add Payment
  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    if (isCheckedOut) {
      alert('Cannot add payments to a checked out reservation.');
      return;
    }
    if (!newPayment.amount) return;
    pmsStore.addFolioPayment(currentRes.id, {
      folioId: newPayment.folioId,
      type: newPayment.type,
      paymentMethod: newPayment.paymentMethod,
      amount: newPayment.amount,
      description: newPayment.description,
      reference: newPayment.reference
    });
    if (onAddFolioPayment) onAddFolioPayment(currentRes.id, newPayment);
    setShowAddPaymentModal(false);
    setNewPayment({
      folioId: currentFolio.folioNumber || 'FOL_1',
      type: 'Settlement',
      paymentMethod: 'UPI',
      amount: '',
      reference: '',
      description: ''
    });
    setFolioVersion(v => v + 1);
  };

  // Step 3.4: Void Payment
  const handleConfirmVoidPayment = (txId, voidReason) => {
    if (isCheckedOut) {
      alert('Cannot void payment on a checked out reservation.');
      return;
    }
    pmsStore.voidPayment(currentRes.id, txId, voidReason);
    if (onVoidPayment) onVoidPayment(currentRes.id, txId, voidReason);
    setVoidModalTx(null);
    setFolioVersion(v => v + 1);
  };

  return (
    <div className="edit-res-page">
      {/* 1. Breadcrumbs */}
      <div className="edit-res-breadcrumb">
        <Home size={14} />
        <span className="crumb-link" onClick={() => onNavigate ? onNavigate('dashboard') : onBack ? onBack() : null}>PMS</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb-link crumb-active" onClick={() => onNavigate ? onNavigate('reservations') : onBack ? onBack() : null}>Reservations</span>
        <span className="crumb-sep">&gt;</span>
        <span>Edit Reservation</span>
      </div>

      {/* 2. Top Header Summary Card */}
      <div className="edit-res-header-card">
        <div className="edit-res-header-left">
          <button className="edit-res-back-btn" onClick={onBack} title="Back to Reservations">
            <ArrowLeft size={18} />
          </button>

          <div className="edit-res-bed-icon">
            <span className="material-symbols-outlined select-none" style={{ fontSize: '24px' }}>
              hotel
            </span>
          </div>

          <div className="edit-res-guest-title-col">
            <div className="edit-res-name-badge-row">
              <span className="edit-res-guest-name">
                {guestForm.title} {guestForm.firstName} {guestForm.lastName}
              </span>
              <span className={`edit-res-status-pill ${isInHouse ? 'in-house' : isConfirmed ? 'confirmed' : 'checked-out'}`}>
                {isInHouse ? 'In House' : isConfirmed ? 'Confirmed' : isCheckedOut ? 'Checked Out' : reservation.status}
              </span>
            </div>

            <div className="edit-res-meta-subline">
              <span className="edit-res-pax-item">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>man</span>
                <span>{reservation.adults || 1}</span>
              </span>
              <span className="edit-res-pax-item">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>child_care</span>
                <span>{reservation.children || 2}</span>
              </span>
              <span>Res. No. {reservation.bookingReference ? reservation.bookingReference.replace('#', '') : 'RES_1'}</span>
            </div>
          </div>
        </div>

        {/* Right side stats & checkout action */}
        <div className="edit-res-header-right">
          <div className="edit-res-date-metric">
            <span className="metric-label">Arrival</span>
            <span className="metric-val">{arrivalText}</span>
          </div>

          <div className="edit-res-date-metric">
            <span className="metric-label">Departure</span>
            <span className="metric-val">{departureText}</span>
          </div>

          <div className="edit-res-date-metric">
            <span className="metric-label">Nights</span>
            <span className="metric-val">{nightsCount}</span>
          </div>

          <div className="edit-res-stat-box charges">
            <span className="box-label">Charges</span>
            <span className="box-amount">{totalCharges}</span>
          </div>

          <div className="edit-res-stat-box paid">
            <span className="box-label">Paid</span>
            <span className="box-amount">{totalPaid}</span>
          </div>

          <div className="edit-res-stat-box outstanding">
            <span className="box-label">Outstanding</span>
            <span className="box-amount">{outstanding}</span>
          </div>

          {isInHouse ? (
            <button
              className="edit-res-checkout-btn"
              onClick={() => setShowCheckOutModal(true)}
            >
              Check Out
            </button>
          ) : isConfirmed ? (
            <button
              className="edit-res-checkin-btn"
              onClick={() => setShowCheckInModal(true)}
            >
              Check In
            </button>
          ) : null}

          {/* Fullscreen Button */}
          <button
            className="edit-res-fs-btn"
            onClick={toggleBrowserFullscreen}
            title={isBrowserFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isBrowserFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Checked Out Locked Notice Banner */}
      {isCheckedOut && (
        <div className="edit-res-locked-banner">
          <div className="edit-res-locked-badge">
            <ShieldCheck size={14} />
            <span>Checked Out & Locked</span>
          </div>
          <span>
            This reservation is checked out and finalized. Customer personal details, booking parameters, folio charges, and payment records are preserved in read-only mode and cannot be modified.
          </span>
        </div>
      )}

      {/* 3. Horizontal Navigation Tabs */}
      <div className="edit-res-tabs-bar">
        {[
          { id: 'guest', label: 'Guest Details' },
          { id: 'booking', label: 'Booking Details' },
          { id: 'folio', label: 'Folio Operations' },
          { id: 'charges', label: 'Room Charges' },
          { id: 'audit', label: 'Audit Trail' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`edit-res-tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Body 2-Column Split: Sub-sidebar + Content Area */}
      <div className="edit-res-body-layout">
        {/* Left Sub-Sidebar (Changes per tab) */}
        <div className="edit-res-sub-sidebar">
          {activeTab === 'guest' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Guest</span>
                <div className="edit-res-sidebar-actions">
                  {!isCheckedOut && (
                    <button className="edit-res-add-btn-mini" title="Add Guest">
                      <Plus size={14} />
                    </button>
                  )}
                  <label className="edit-res-toggle-label">
                    <input type="checkbox" defaultChecked />
                    <span>Guest List</span>
                  </label>
                </div>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div
                  className="edit-res-room-header-row"
                  onClick={() => setIsRoomAccordionOpen(!isRoomAccordionOpen)}
                >
                  <div className="edit-res-room-header-left">
                    <Crown size={14} />
                    <span>{roomName} — {roomNum}</span>
                  </div>
                  {isRoomAccordionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {isRoomAccordionOpen && (
                  <div className="edit-res-sidebar-item active">
                    <span>{guestForm.title} {guestForm.firstName} {guestForm.lastName}</span>
                    <ChevronRight size={13} color="#2563eb" />
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'booking' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room</span>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-room-header-row">
                  <div className="edit-res-room-header-left">
                    <Crown size={14} />
                    <span>{roomName} — {roomNum}</span>
                  </div>
                  <ChevronUp size={14} />
                </div>

                <div className="edit-res-sidebar-item active">
                  <span>{guestForm.title} {guestForm.firstName} {guestForm.lastName}</span>
                  <ChevronRight size={13} color="#2563eb" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'folio' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room / Folio</span>
                {!isCheckedOut && (
                  <button className="edit-res-add-btn-mini" title="New Folio">
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-room-header-row">
                  <div className="edit-res-room-header-left">
                    <Crown size={14} />
                    <span>{roomName} — {roomNum}</span>
                  </div>
                  <ChevronUp size={14} />
                </div>

                <div className="edit-res-sidebar-item active">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>FOL_1</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {guestForm.firstName} {guestForm.lastName}
                    </span>
                  </div>
                  <ChevronRight size={13} color="#2563eb" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'charges' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room</span>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-sidebar-item">
                  <span>Group Info</span>
                  <ChevronRight size={13} color="#94a3b8" />
                </div>
                <div className="edit-res-sidebar-item active">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Crown size={13} />
                    <span>{roomNum} - {roomName}</span>
                  </div>
                  <ChevronRight size={13} color="#2563eb" />
                </div>
              </div>

              <div className="edit-res-sidebar-totals-box">
                <div className="edit-res-sidebar-total-line" style={{ color: '#ef4444' }}>
                  <span>Charges</span>
                  <span>5,000.00</span>
                </div>
                <div className="edit-res-sidebar-total-line" style={{ color: '#0f172a' }}>
                  <span>Total</span>
                  <span>{totalCharges}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'audit' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room</span>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-sidebar-item active">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} />
                    <span>All Activity</span>
                  </div>
                  <span className="edit-res-sidebar-counter">4</span>
                </div>
                <div className="edit-res-sidebar-item">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{roomName} — {roomNum}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {guestForm.firstName} {guestForm.lastName}
                    </span>
                  </div>
                  <span className="edit-res-sidebar-counter">2</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Main Content Area */}
        <div key={activeTab} className="edit-res-main-content edit-tab-fade-enter">
          {/* TAB 1: GUEST DETAILS */}
          {activeTab === 'guest' && (
            <>
              {/* Section 1: General Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">General Information</h3>

                <div className="edit-res-form-grid-4">
                  <div className="edit-res-field">
                    <label>Title <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={guestForm.title}
                      disabled={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, title: e.target.value })}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>First Name <span className="required-star">*</span></label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.firstName}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.lastName}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Mobile</label>
                    <div className={`edit-res-phone-input-wrap ${isCheckedOut ? 'disabled' : ''}`}>
                      <div className="edit-res-country-code">
                        <span>{guestForm.countryCode}</span>
                        <ChevronDown size={12} />
                      </div>
                      <input
                        type="tel"
                        className="edit-res-phone-input"
                        value={guestForm.mobile}
                        disabled={isCheckedOut}
                        readOnly={isCheckedOut}
                        onChange={(e) => setGuestForm({ ...guestForm, mobile: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-res-form-grid-3">
                  <div className="edit-res-field">
                    <label>Email</label>
                    <input
                      type="email"
                      className="edit-res-input"
                      value={guestForm.email}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Birth Date</label>
                    <input
                      type="date"
                      className="edit-res-input"
                      value={guestForm.birthDate}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, birthDate: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Nationality</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      placeholder="Nationality"
                      value={guestForm.nationality}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <div className="edit-res-form-grid-4" style={{ alignItems: 'flex-end' }}>
                  <div className="edit-res-field">
                    <label>Gender</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.gender}
                      disabled={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>Guest Type</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.guestType}
                      disabled={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, guestType: e.target.value })}
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>

                  <div
                    className={`edit-res-switch-pill ${guestForm.isPrimary ? 'primary-active' : ''} ${isCheckedOut ? 'disabled' : ''}`}
                    onClick={() => !isCheckedOut && setGuestForm({ ...guestForm, isPrimary: !guestForm.isPrimary })}
                    style={isCheckedOut ? { cursor: 'not-allowed', opacity: 0.75 } : {}}
                  >
                    <span>Is Primary</span>
                    <input type="checkbox" checked={guestForm.isPrimary} readOnly disabled={isCheckedOut} />
                    <User size={14} />
                  </div>

                  <div
                    className={`edit-res-switch-pill vip-pill ${isCheckedOut ? 'disabled' : ''}`}
                    onClick={() => !isCheckedOut && setGuestForm({ ...guestForm, isVIP: !guestForm.isVIP })}
                    style={isCheckedOut ? { cursor: 'not-allowed', opacity: 0.75 } : {}}
                  >
                    <span>Is VIP</span>
                    <input type="checkbox" checked={guestForm.isVIP} readOnly disabled={isCheckedOut} />
                    <Star size={14} />
                  </div>
                </div>
              </div>

              {/* Section 2: Address Details */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Address Details</h3>

                <div style={{ marginBottom: '1rem' }}>
                  <div className="edit-res-field">
                    <label>Address</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.address}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="edit-res-form-grid-4">
                  <div className="edit-res-field">
                    <label>Zip</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.zip}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, zip: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Country</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.country}
                      disabled={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, country: e.target.value })}
                    >
                      <option value="Algeria">Algeria</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>State</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.state}
                      disabled={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, state: e.target.value })}
                    >
                      <option value="Ain Defla">Ain Defla</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>City</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.city}
                      disabled={isCheckedOut}
                      onChange={(e) => setGuestForm({ ...guestForm, city: e.target.value })}
                    >
                      <option value="">Select City</option>
                      <option value="Jalore">Jalore</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Jodhpur">Jodhpur</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Identity Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Identity Information</h3>
                <p className="edit-res-section-subtitle">Official identification and travel documents</p>

                <div className="edit-res-identity-layout">
                  {/* Left upload box */}
                  <label
                    className={`edit-res-upload-box ${isCheckedOut ? 'disabled' : ''}`}
                    style={isCheckedOut ? { cursor: 'not-allowed', opacity: 0.65 } : {}}
                  >
                    <Upload size={20} />
                    <span>{isCheckedOut ? 'ID Upload Locked' : '+ Upload ID'}</span>
                    <input type="file" style={{ display: 'none' }} disabled={isCheckedOut} />
                  </label>

                  {/* Right fields */}
                  <div>
                    <div className="edit-res-form-grid-2">
                      <div className="edit-res-field">
                        <label>ID Number</label>
                        <input
                          type="text"
                          className="edit-res-input"
                          value={guestForm.idNumber}
                          disabled={isCheckedOut}
                          readOnly={isCheckedOut}
                          onChange={(e) => setGuestForm({ ...guestForm, idNumber: e.target.value })}
                        />
                      </div>

                      <div className="edit-res-field">
                        <label>ID Type</label>
                        <select
                          className="edit-res-select"
                          value={guestForm.idType}
                          disabled={isCheckedOut}
                          onChange={(e) => setGuestForm({ ...guestForm, idType: e.target.value })}
                        >
                          <option value="Aadhaar Card">Aadhaar Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Voter ID">Voter ID</option>
                        </select>
                      </div>
                    </div>

                    <div className="edit-res-form-grid-2">
                      <div className="edit-res-field">
                        <label>Issuing Country</label>
                        <input
                          type="text"
                          className="edit-res-input"
                          value={guestForm.issuingCountry}
                          disabled={isCheckedOut}
                          readOnly={isCheckedOut}
                          onChange={(e) => setGuestForm({ ...guestForm, issuingCountry: e.target.value })}
                        />
                      </div>

                      <div className="edit-res-field">
                        <label>Issuing City</label>
                        <input
                          type="text"
                          className="edit-res-input"
                          value={guestForm.issuingCity}
                          disabled={isCheckedOut}
                          readOnly={isCheckedOut}
                          onChange={(e) => setGuestForm({ ...guestForm, issuingCity: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="edit-res-form-grid-2">
                      <div className="edit-res-field">
                        <label>Expiry Date</label>
                        <input
                          type="date"
                          className="edit-res-input"
                          value={guestForm.expiryDate}
                          disabled={isCheckedOut}
                          readOnly={isCheckedOut}
                          onChange={(e) => setGuestForm({ ...guestForm, expiryDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="edit-res-cform-btn"
                  onClick={() => alert('C Form (Police Verification Inquiry) exported.')}
                >
                  <FileText size={15} />
                  <span>C Form (Police Inquiry)</span>
                </button>
              </div>

              {/* Bottom Save Action */}
              <div className="edit-res-bottom-save-bar">
                {isCheckedOut ? (
                  <button
                    className="edit-res-save-btn disabled"
                    disabled
                    style={{ background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
                    title="Reservation is checked out and locked"
                  >
                    Locked (Checked Out)
                  </button>
                ) : (
                  <button className="edit-res-save-btn" onClick={handleSaveAll}>
                    Save
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB 2: BOOKING DETAILS */}
          {activeTab === 'booking' && (
            <>
              {/* Card 1: Billing Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Billing Information</h3>
                <p className="edit-res-section-subtitle">Details about payment and invoicing for this booking.</p>

                <div className="edit-res-form-grid-2">
                  <div className="edit-res-field">
                    <label>Bill To <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.billTo}
                      disabled={isCheckedOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, billTo: e.target.value })}
                    >
                      <option value="Guest">Guest</option>
                      <option value="Company">Company</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>Select Company</label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.company}
                      disabled={isCheckedOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, company: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="tcs">Tata Consultancy Services</option>
                      <option value="infosys">Infosys Limited</option>
                    </select>
                  </div>
                </div>

                <div className="edit-res-form-grid-2">
                  <div className="edit-res-field">
                    <label>Guest GSTIN</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      placeholder="Enter Guest GSTIN"
                      value={bookingForm.guestGstin}
                      disabled={isCheckedOut}
                      readOnly={isCheckedOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestGstin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Source Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Source Information</h3>
                <p className="edit-res-section-subtitle">Information about the booking source and marketing details.</p>

                <div className="edit-res-form-grid-2">
                  <div className="edit-res-field">
                    <label>Market Segments <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.marketSegment}
                      disabled={isCheckedOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, marketSegment: e.target.value })}
                    >
                      <option value="corporate">corporate</option>
                      <option value="fit">FIT</option>
                      <option value="leisure">Leisure</option>
                      <option value="group">Group</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>Booking Source <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.bookingSource}
                      disabled={isCheckedOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, bookingSource: e.target.value })}
                    >
                      <option value="walk-in">walk-in</option>
                      <option value="ota">OTA</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Special Requests */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Special Requests</h3>
                <p className="edit-res-section-subtitle">Special requests and guest preferences for this reservation.</p>

                <div className="edit-res-field">
                  <textarea
                    rows={4}
                    className="edit-res-textarea"
                    placeholder="Enter special requests (e.g. extra bed, late check-in)..."
                    value={bookingForm.specialRequests}
                    maxLength={100}
                    disabled={isCheckedOut}
                    readOnly={isCheckedOut}
                    onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    <span>Reservation-level request</span>
                    <span>{bookingForm.specialRequests.length}/100</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="edit-res-bottom-save-bar">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: isCheckedOut ? '#94a3b8' : '#334155', cursor: isCheckedOut ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bookingForm.applyToAllRooms}
                    disabled={isCheckedOut}
                    onChange={(e) => setBookingForm({ ...bookingForm, applyToAllRooms: e.target.checked })}
                  />
                  <span>Apply to all rooms</span>
                </label>

                {isCheckedOut ? (
                  <button
                    className="edit-res-save-btn disabled"
                    disabled
                    style={{ background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
                    title="Reservation is checked out and locked"
                  >
                    Locked (Checked Out)
                  </button>
                ) : (
                  <button className="edit-res-save-btn" onClick={handleSaveAll}>
                    Save Changes
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB 3: FOLIO OPERATIONS */}
          {activeTab === 'folio' && (
            <div className="edit-res-section-card">
              <div className="edit-res-folio-top-bar">
                <div className="edit-res-folio-stats">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Charges</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb' }}>₹{totalCharges}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Paid</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#059669' }}>₹{totalPaid}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Outstanding</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#dc2626' }}>₹{outstanding}</span>
                  </div>
                </div>

                <div className="edit-res-folio-actions">
                  {isCheckedOut ? (
                    <div className="edit-res-folio-locked-badge">
                      <ShieldCheck size={16} />
                      <span>Folio Closed & Finalized (Read-Only)</span>
                    </div>
                  ) : (
                    <>
                      {/* Step 3.1: Post Pending Charges */}
                      <button
                        className="btn-folio-outline"
                        onClick={handlePostPendingCharges}
                        title="Push room tariff and applicable taxes onto guest folio"
                      >
                        <Clock size={14} />
                        <span>Post Pending Charges</span>
                      </button>

                      {/* Step 3.2: Add Charge */}
                      <button className="btn-folio-add-charge" onClick={() => setShowAddChargeModal(true)}>
                        <Plus size={14} />
                        <span>Add Charge</span>
                      </button>

                      {/* Step 3.3: Add Payment */}
                      <button className="btn-folio-outline" onClick={() => setShowAddPaymentModal(true)}>
                        <CreditCard size={14} />
                        <span>Add Payment</span>
                      </button>

                      {/* Settle Folio Quick Action */}
                      <button
                        className="btn-folio-outline"
                        onClick={() => {
                          if (Number(outstanding) <= 0) {
                            alert('Folio is already fully settled.');
                            return;
                          }
                          pmsStore.addFolioPayment(currentRes.id, {
                            type: 'Settlement',
                            paymentMethod: 'CASH',
                            amount: outstanding,
                            description: 'Full Balance Settlement'
                          });
                          setFolioVersion(v => v + 1);
                          alert('Folio balance settled in full.');
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Settle Folio</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="edit-res-table-wrap">
                <table className="edit-res-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category / Particulars</th>
                      <th>Description</th>
                      <th>Receipt / Ref</th>
                      <th>Direction</th>
                      <th>Amount</th>
                      <th>Tax</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folioTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          No transactions posted on this folio yet. Use "Post Pending Charges" or "Add Charge" above.
                        </td>
                      </tr>
                    ) : (
                      folioTransactions.map((tx) => (
                        <tr key={tx.id} style={{ background: tx.isVoided ? '#fef2f2' : undefined }}>
                          <td>{tx.date}</td>
                          <td style={{ fontWeight: 600 }}>
                            {tx.category || tx.particulars}
                            {tx.isVoided && (
                              <span className="badge-voided">VOIDED</span>
                            )}
                          </td>
                          <td>
                            <div>{tx.description}</div>
                            {tx.isVoided && tx.voidReason && (
                              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontStyle: 'italic', marginTop: '2px' }}>
                                Void Reason: "{tx.voidReason}"
                              </div>
                            )}
                          </td>
                          <td style={{ color: '#64748b' }}>{tx.receiptNumber || tx.reference || '-'}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: tx.isVoided ? '#f1f5f9' : (tx.direction === 'Credit' ? '#ecfdf5' : '#f8fafc'),
                              color: tx.isVoided ? '#94a3b8' : (tx.direction === 'Credit' ? '#059669' : '#334155')
                            }}>
                              {tx.direction}
                            </span>
                          </td>
                          <td style={{
                            fontWeight: 700,
                            color: tx.isVoided ? '#94a3b8' : (tx.direction === 'Credit' ? '#059669' : '#0f172a'),
                            textDecoration: tx.isVoided ? 'line-through' : 'none'
                          }}>
                            ₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {tx.tax ? `₹${Number(tx.tax).toFixed(2)}` : '-'}
                          </td>
                          <td>
                            {/* Step 3.4: Void Payment button */}
                            {isCheckedOut ? (
                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Finalized</span>
                            ) : tx.direction === 'Credit' && !tx.isVoided ? (
                              <button
                                className="btn-void-tx"
                                onClick={() => setVoidModalTx(tx)}
                                title="Void this payment transaction"
                              >
                                <Ban size={12} />
                                <span>Void Payment</span>
                              </button>
                            ) : tx.isVoided ? (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>Voided</span>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ROOM CHARGES */}
          {activeTab === 'charges' && (
            <div className="edit-res-section-card">
              {!isCheckedOut && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
                  <button
                    className="btn-folio-outline"
                    style={{ color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff' }}
                    onClick={() => alert('Room tariff updated based on rate plan: ₹' + (currentRes.ratePerNight || 2500))}
                  >
                    Update Details
                  </button>
                </div>
              )}

              <div className="edit-res-table-wrap">
                <table className="edit-res-table">
                  <thead>
                    <tr>
                      <th>Stay</th>
                      <th>Room</th>
                      <th>Rate Plan</th>
                      <th>Pax (A/C)</th>
                      <th>Charge</th>
                      <th>Tax</th>
                      <th>Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomChargesList.map((rc, idx) => (
                      <tr key={idx}>
                        <td>{rc.stay}</td>
                        <td style={{ fontWeight: 600 }}>{rc.room}</td>
                        <td>{rc.ratePlan}</td>
                        <td>{rc.pax}</td>
                        <td>₹{rc.charge}</td>
                        <td>₹{rc.tax}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{rc.netAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="edit-res-section-card">
              <div className="edit-res-timeline-container">
                <div className="edit-res-timeline-date-badge">
                  Front-Desk Activity Log
                </div>

                {auditTimeline.map((item) => (
                  <div key={item.id} className="edit-res-timeline-card">
                    <div className="edit-res-timeline-node-circle" style={{ borderColor: item.color, color: item.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {item.icon}
                      </span>
                    </div>

                    <div className="edit-res-timeline-header">
                      <div>
                        <div className="edit-res-timeline-title">{item.title}</div>
                        <div className="edit-res-timeline-time">{item.time}</div>
                      </div>
                      <div className="edit-res-timeline-author-badge">
                        <User size={12} />
                        <span>{item.author}</span>
                      </div>
                    </div>

                    <div className="edit-res-timeline-body">
                      {item.renderBody()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Charges Modal (Exact OTAL PMS Specification & Design) */}
      <AddChargeModal
        isOpen={showAddChargeModal}
        reservation={currentRes}
        folio={currentFolio}
        onClose={() => setShowAddChargeModal(false)}
        onConfirmCharge={(chargeData) => {
          pmsStore.addFolioCharge(currentRes.id, {
            category: chargeData.category,
            receiptNumber: chargeData.receiptNumber,
            amount: chargeData.amount,
            description: chargeData.description
          });
          if (onAddFolioCharge) onAddFolioCharge(currentRes.id, chargeData);
          setFolioVersion((v) => v + 1);
        }}
      />


      {/* Add Payment Modal (Exact OTAL PMS Specification & Design) */}
      <AddPaymentModal
        isOpen={showAddPaymentModal}
        reservation={currentRes}
        folio={currentFolio}
        onClose={() => setShowAddPaymentModal(false)}
        onConfirmPayment={(paymentData) => {
          pmsStore.addFolioPayment(currentRes.id, {
            folioId: paymentData.folioId,
            type: paymentData.type,
            paymentMethod: paymentData.paymentMethod,
            amount: paymentData.amount,
            description: paymentData.description,
            reference: paymentData.receiptNumber || paymentData.reference
          });
          if (onAddFolioPayment) onAddFolioPayment(currentRes.id, paymentData);
          setFolioVersion((v) => v + 1);
        }}
      />


      {/* Guest Check-In Details Modal (Step 2) */}
      <GuestCheckInModal
        isOpen={showCheckInModal}
        reservation={currentRes}
        rooms={rooms}
        onClose={() => setShowCheckInModal(false)}
        onAssignRoom={(resId, assignedRoomId) => {
          pmsStore.assignRoom(resId, assignedRoomId);
          setFolioVersion(v => v + 1);
          if (onAssignRoom) onAssignRoom(resId, assignedRoomId);
        }}
        onConfirmCheckIn={(resId, assignedRoomId) => {
          pmsStore.checkInReservation(resId, assignedRoomId);
          setShowCheckInModal(false);
          setFolioVersion(v => v + 1);
          if (onCheckIn) onCheckIn(resId);
        }}
      />

      {/* Guest Check-Out Details Modal (Step 4) */}
      <GuestCheckOutModal
        isOpen={showCheckOutModal}
        reservation={currentRes}
        onClose={() => setShowCheckOutModal(false)}
        onQuickSettle={(resId, method) => {
          pmsStore.addFolioPayment(resId, {
            type: 'Settlement',
            paymentMethod: method,
            amount: currentRes.balanceDue
          });
          setFolioVersion(v => v + 1);
        }}
        onConfirmCheckOut={(resId) => {
          pmsStore.checkOutReservation(resId);
          setShowCheckOutModal(false);
          setFolioVersion(v => v + 1);
          if (onCheckOut) onCheckOut(resId);
        }}
      />

      {/* Void Payment Modal (Step 3.4) */}
      <VoidPaymentModal
        isOpen={!!voidModalTx}
        transaction={voidModalTx}
        onClose={() => setVoidModalTx(null)}
        onConfirmVoid={handleConfirmVoidPayment}
      />
    </div>
  );
}

