import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import TapeChartView from './components/calendar/TapeChartView';
import ReservationsView from './components/reservations/ReservationsView';
import HousekeepingView from './components/housekeeping/HousekeepingView';
import RatesMatrixView from './components/rates/RatesMatrixView';
import NightAuditView from './components/nightaudit/NightAuditView';
import ReportsView from './components/reports/ReportsView';
import GuestCrmView from './components/guests/GuestCrmView';
import TeamPermissionsView from './components/permissions/TeamPermissionsView';
import PropertySettingsView from './components/settings/PropertySettingsView';

import CreateReservationModal from './components/reservations/CreateReservationModal';
import FolioModal from './components/folios/FolioModal';
import GroupRoomMoveModal from './components/reservations/GroupRoomMoveModal';
import BookingVoucherModal from './components/reservations/BookingVoucherModal';
import GstInvoiceModal from './components/folios/GstInvoiceModal';
import MaintenanceBlockModal from './components/calendar/MaintenanceBlockModal';
import DashboardView from './components/dashboard/DashboardView';
import EditReservationView from './components/reservations/EditReservationView';
import AddReservationView from './components/reservations/AddReservationView';

import { pmsStore } from './services/pmsStore';
import { useRouter, navigate, ROUTES } from './services/router';
import { createReservationViaApi } from './services/reservationApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const router = useRouter();
  const [state, setState] = useState(pmsStore.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Derive active view and editing state directly from URL router
  const isCreatingReservation = router.type === 'RESERVATIONS_CREATE';

  const editingReservation = useMemo(() => {
    if (router.type === 'RESERVATIONS_EDIT' && router.params.id) {
      const targetId = router.params.id;
      return (
        state.reservations.find(
          (r) =>
            r.id === targetId ||
            r.bookingReference === targetId ||
            r.bookingReference === `#${targetId}`
        ) || { id: targetId }
      );
    }
    return null;
  }, [router.type, router.params.id, state.reservations]);

  const activeTab = router.tab || 'dashboard';

  // Modals State
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [slotPrefillData, setSlotPrefillData] = useState(null);

  // Compute prefill data from router query params (e.g. ?roomId=rm_101&date=2026-10-24) or state
  const effectivePrefillData = useMemo(() => {
    if (slotPrefillData) return slotPrefillData;
    if (router.queryParams?.roomId || router.queryParams?.roomNumber || router.queryParams?.date) {
      const room = state.rooms.find(
        (r) =>
          r.id === router.queryParams.roomId ||
          r.roomNumber === (router.queryParams.roomNumber || router.queryParams.roomId)
      );
      return {
        room: room || null,
        roomId: router.queryParams.roomId,
        date: router.queryParams.date || router.queryParams.checkIn
      };
    }
    return null;
  }, [slotPrefillData, router.queryParams, state.rooms]);

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isFolioOpen, setIsFolioOpen] = useState(false);

  const [selectedResForMove, setSelectedResForMove] = useState(null);
  const [isRoomMoveOpen, setIsRoomMoveOpen] = useState(false);

  const [selectedResForVoucher, setSelectedResForVoucher] = useState(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  const [selectedResForInvoice, setSelectedResForInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceInitialData, setMaintenanceInitialData] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  useEffect(() => {
    const unsubscribe = pmsStore.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Update browser document title based on endpoint URL
  useEffect(() => {
    if (isCreatingReservation) {
      document.title = 'Add Reservation | Hotel Astha PMS';
    } else if (editingReservation) {
      document.title = `Edit Reservation ${editingReservation.bookingReference || ''} | Hotel Astha PMS`;
    } else {
      const titles = {
        dashboard: 'Dashboard | Hotel Astha PMS',
        reservations: 'Reservations Management | Hotel Astha PMS',
        calendar: 'Calendar Tape Chart | Hotel Astha PMS',
        rates: 'Rates & Inventory | Hotel Astha PMS',
        housekeeping: 'Housekeeping & Rooms | Hotel Astha PMS',
        nightaudit: 'Night Audit | Hotel Astha PMS',
        reports: 'Reports | Hotel Astha PMS',
        guests: 'Guests CRM | Hotel Astha PMS',
        permissions: 'Team Permissions | Hotel Astha PMS',
        properties: 'Property Settings | Hotel Astha PMS'
      };
      document.title = titles[activeTab] || 'Hotel Astha PMS';
    }
  }, [isCreatingReservation, editingReservation, activeTab]);

  // --- Handlers ---

  const handleCheckIn = (resId) => {
    pmsStore.checkInReservation(resId);
    const res = state.reservations.find((r) => r.id === resId);
    showToast(`✅ Guest ${res ? res.primaryGuest?.name : ''} checked in to Room ${res ? res.roomNumber : ''}`);
    if (selectedReservation && selectedReservation.id === resId) {
      setSelectedReservation({ ...selectedReservation, status: 'in_house' });
    }
  };

  const handleCheckOut = (resId) => {
    pmsStore.checkOutReservation(resId);
    const res = state.reservations.find((r) => r.id === resId);
    showToast(`👋 Guest ${res ? res.primaryGuest?.name : ''} checked out. Room ${res ? res.roomNumber : ''} auto-flagged DIRTY.`);
    if (selectedReservation && selectedReservation.id === resId) {
      setSelectedReservation({ ...selectedReservation, status: 'checked_out' });
    }
  };

  const handleCreateReservation = async (bookingData) => {
    // 1. Call REST API /reservations/create & persist to local store
    const newRes = await createReservationViaApi(bookingData);
    showToast(`🎉 Reservation ${newRes.bookingReference || '#RES_CONFIRMED'} confirmed for ${newRes.primaryGuest?.name || 'Guest'}!`);
    
    // 2. Open voucher modal
    setSelectedResForVoucher(newRes);
    setIsVoucherOpen(true);
    setSlotPrefillData(null);

    // 3. Smoothly update browser URL endpoint back to /reservations
    navigate('/reservations');
  };

  const handleUpdateRoomStatus = (roomId, newStatus) => {
    pmsStore.updateRoomStatus(roomId, newStatus);
    const room = state.rooms.find((r) => r.id === roomId);
    showToast(`🧹 Room ${room ? room.roomNumber : ''} hygiene status updated to ${newStatus.toUpperCase()}`);
  };

  const handleAddFolioTransaction = (resId, tx) => {
    pmsStore.addFolioTransaction(resId, tx);
    showToast(`💳 Folio updated with ${tx.type}: ₹${Math.abs(tx.amount)}`);
    const updated = pmsStore.getState().reservations.find((r) => r.id === resId);
    if (updated) setSelectedReservation(updated);
  };

  const handleSettleFolio = (resId, mode, ref) => {
    pmsStore.settleFolio(resId, mode, ref);
    showToast(`✅ Folio balance settled in full via ${mode}`);
    const updated = pmsStore.getState().reservations.find((r) => r.id === resId);
    if (updated) setSelectedReservation(updated);
  };

  const handleMoveRoom = (resId, targetRoomId) => {
    const success = pmsStore.groupRoomMove(resId, targetRoomId);
    if (success) {
      const room = state.rooms.find((r) => r.id === targetRoomId);
      showToast(`🔄 Room moved to Room ${room?.roomNumber}`);
      const updated = pmsStore.getState().reservations.find((r) => r.id === resId);
      if (updated) setSelectedReservation(updated);
    }
  };

  const handleCancelReservation = (resId) => {
    pmsStore.cancelReservation(resId);
    showToast(`🚫 Reservation cancelled successfully.`);
  };

  const handleNoShowReservation = (resId) => {
    pmsStore.markNoShow(resId);
    showToast(`⚠️ Reservation marked as No-Show.`);
  };

  const handleSlotClick = (room, dateStr) => {
    setSlotPrefillData({ room, date: dateStr });
    navigate(`/reservations/create?roomId=${room.id}&date=${dateStr}`);
  };

  const handleSlotMaintenanceClick = (block) => {
    setMaintenanceInitialData(block);
    setIsMaintenanceOpen(true);
  };

  const handleAddMaintenanceBlock = (blockData) => {
    pmsStore.addMaintenanceBlock(blockData);
    showToast(`🔧 Maintenance block scheduled for Room ${blockData.roomId}`);
  };

  const handleDeleteMaintenanceBlock = (blockId) => {
    pmsStore.removeMaintenanceBlock(blockId);
    showToast(`✅ Room released from maintenance block.`);
  };

  const handleExecuteNightAudit = () => {
    const record = pmsStore.executeNightAudit();
    showToast(`🌙 Night Audit completed! Business date advanced to ${pmsStore.getState().property.businessDate}`);
    return record;
  };

  const counts = {
    reservations: state.reservations.length,
    dirtyRooms: state.rooms.filter((r) => r.status === 'dirty').length,
    pendingDepartures: state.reservations.filter((r) => r.status === 'in_house' && r.checkOutDate === state.property.businessDate).length
  };

  return (
    <div className="app-container">
      {/* Toast Notification with Spring Animation */}
      {toastMessage && (
        <div className="pms-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Full-Screen Edit Reservation View - Edge-to-Edge with NO Sidebar */}
      {editingReservation ? (
        <div className="edit-res-fullscreen-overlay">
          <EditReservationView
            reservation={state.reservations.find((r) => r.id === editingReservation.id) || editingReservation}
            property={state.property}
            rooms={state.rooms}
            roomTypes={state.roomTypes}
            onBack={() => navigate('/reservations')}
            onNavigate={(tab) => navigate(tab === 'dashboard' ? '/dashboard' : '/' + tab)}
            onSave={(updated) => {
              pmsStore.updateReservation(updated.id, updated);
              showToast(`✅ Reservation ${updated.bookingReference} updated successfully.`);
            }}
            onAssignRoom={(resId, roomId) => {
              pmsStore.assignRoom(resId, roomId);
              showToast('Success: Room assigned successfully');
            }}
            onCheckIn={(resId, roomId) => {
              pmsStore.checkInReservation(resId, roomId);
              showToast('Success: Check-in successful');
            }}
            onCheckOut={(resId) => {
              const res = pmsStore.checkOutReservation(resId);
              if (res.success) {
                showToast(`Success: Check-out successful. Room auto-flagged DIRTY.`);
              } else {
                showToast(`❌ ${res.message}`);
              }
            }}
            onPostPendingCharges={(resId) => {
              pmsStore.postPendingCharges(resId);
              showToast('Success: Pending nightly tariff & taxes posted to folio.');
            }}
            onAddFolioCharge={(resId, chg) => {
              pmsStore.addFolioCharge(resId, chg);
              showToast(`Success: Posted ${chg.category} charge of ₹${chg.amount}`);
            }}
            onAddFolioPayment={(resId, pay) => {
              pmsStore.addFolioPayment(resId, pay);
              showToast(`Success: Posted ${pay.type || 'Payment'} of ₹${pay.amount} via ${pay.paymentMethod}`);
            }}
            onVoidPayment={(resId, txId, reason) => {
              pmsStore.voidPayment(resId, txId, reason);
              showToast(`Success: Payment voided. Balance restored to outstanding.`);
            }}
            onAddFolioTransaction={handleAddFolioTransaction}
            onSettleFolio={handleSettleFolio}
          />
        </div>
      ) : isCreatingReservation ? (
        /* Full-Screen Add Reservation View matching OTAL PMS */
        <div className="add-res-fullscreen-overlay">
          <AddReservationView
            property={state.property}
            rooms={state.rooms}
            roomTypes={state.roomTypes}
            ratePlans={state.ratePlans}
            initialData={effectivePrefillData}
            onBack={() => {
              setSlotPrefillData(null);
              navigate('/reservations');
            }}
            onNavigate={(tab) => {
              setSlotPrefillData(null);
              navigate(tab === 'dashboard' ? '/dashboard' : '/' + tab);
            }}
            onSubmit={(bookingData) => {
              handleCreateReservation(bookingData);
            }}
          />
        </div>
      ) : (
        <>
          {/* Global Sidebar with Collapse Support */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              navigate(tab === 'dashboard' ? '/dashboard' : '/' + tab);
            }}
            counts={counts}
            property={state.property}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />

          {/* Main Content Area */}
          <div className="main-wrapper">
            {/* Top Navbar for secondary screens */}
            {activeTab !== 'dashboard' && activeTab !== 'reservations' && (
              <TopNav
                property={state.property}
                activeTab={activeTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewReservation={() => {
                  setSlotPrefillData(null);
                  navigate('/reservations/create');
                }}
                onRefresh={() => {
                  showToast('🔄 Synchronized state with PMS Cloud & Storage');
                }}
              />
            )}

        {/* Dynamic Viewport with Page Transitions */}
        <main className={`content-viewport ${activeTab === 'reservations' || activeTab === 'dashboard' ? 'no-pad-viewport' : ''}`}>
          <div key={activeTab} className="pms-page-view">
            {activeTab === 'dashboard' && (
            <DashboardView
              property={state.property}
              rooms={state.rooms}
              reservations={state.reservations}
              announcements={state.announcements || []}
              onNavigateTab={(tab, options) => {
                navigate('/' + tab);
              }}
              onAddAnnouncement={(note) => {
                pmsStore.addAnnouncement(note);
                showToast('📢 New staff note posted.');
              }}
              onDeleteAnnouncement={(noteId) => {
                pmsStore.deleteAnnouncement(noteId);
                showToast('🗑️ Announcement removed.');
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <TapeChartView
              property={state.property}
              roomTypes={state.roomTypes}
              rooms={state.rooms}
              reservations={state.reservations}
              maintenanceBlocks={state.maintenanceBlocks}
              onSelectReservation={(res) => {
                setSelectedReservation(res);
                setIsFolioOpen(true);
              }}
              onSlotClick={handleSlotClick}
              onSlotMaintenanceClick={handleSlotMaintenanceClick}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsView
              reservations={state.reservations}
              property={state.property}
              rooms={state.rooms}
              roomTypes={state.roomTypes}
              initialTab={router.queryParams?.tab || 'all'}
              onAssignRoom={(resId, roomId) => {
                pmsStore.assignRoom(resId, roomId);
                showToast('Success: Room assigned successfully');
              }}
              onCheckIn={(resId, roomId) => {
                pmsStore.checkInReservation(resId, roomId);
                showToast('Success: Check-in successful');
              }}
              onCheckOut={(resId) => {
                const res = pmsStore.checkOutReservation(resId);
                if (res.success) {
                  showToast('Success: Check-out successful. Room auto-flagged DIRTY.');
                } else {
                  showToast(`❌ ${res.message}`);
                }
              }}
              onSelectReservation={(res) => {
                setSelectedReservation(res);
                setIsFolioOpen(true);
              }}
              onNewReservation={() => {
                setSlotPrefillData(null);
                navigate('/reservations/create');
              }}
              onOpenRoomMove={(res) => {
                setSelectedResForMove(res);
                setIsRoomMoveOpen(true);
              }}
              onOpenVoucher={(res) => {
                setSelectedResForVoucher(res);
                setIsVoucherOpen(true);
              }}
              onOpenInvoice={(res) => {
                setSelectedResForInvoice(res);
                setIsInvoiceOpen(true);
              }}
              onCancelReservation={handleCancelReservation}
              onNoShowReservation={handleNoShowReservation}
              onEditReservation={(res) => {
                navigate(`/reservations/${res.id}/edit`);
              }}
              onUpdateReservation={(updated) => {
                pmsStore.updateReservation(updated.id, updated);
                showToast(`✅ Reservation ${updated.bookingReference} updated successfully.`);
              }}
              onPostPendingCharges={(resId) => {
                pmsStore.postPendingCharges(resId);
                showToast('Success: Nightly room charges posted onto folio');
              }}
              onAddFolioCharge={(resId, charge) => {
                pmsStore.addFolioCharge(resId, charge);
                showToast('Success: Folio charge posted');
              }}
              onAddFolioPayment={(resId, payment) => {
                pmsStore.addFolioPayment(resId, payment);
                showToast('Success: Payment recorded');
              }}
              onVoidPayment={(resId, txId, reason) => {
                pmsStore.voidPayment(resId, txId, reason);
                showToast('Success: Payment voided');
              }}
              onAddFolioTransaction={handleAddFolioTransaction}
              onSettleFolio={handleSettleFolio}
            />
          )}

          {activeTab === 'housekeeping' && (
            <HousekeepingView
              rooms={state.rooms}
              roomTypes={state.roomTypes}
              reservations={state.reservations}
              onUpdateStatus={handleUpdateRoomStatus}
            />
          )}

          {activeTab === 'rates' && (
            <RatesMatrixView
              roomTypes={state.roomTypes}
              property={state.property}
              stopouts={state.stopouts}
              otaChannels={state.otaChannels}
              ratePlans={state.ratePlans}
              onToggleStopout={(rtId, d) => {
                pmsStore.toggleStopout(rtId, d);
              }}
              onBulkUpdate={(payload) => {
                pmsStore.bulkUpdateRates(payload);
                showToast(`✅ Bulk rates and restrictions applied successfully.`);
              }}
              onFullSyncChannel={(channelId) => {
                pmsStore.triggerOtaFullSync(channelId);
                showToast(`🌐 Pushed full ARI inventory and derived rates to OTA channel!`);
              }}
            />
          )}

          {activeTab === 'nightaudit' && (
            <NightAuditView
              property={state.property}
              reservations={state.reservations}
              rooms={state.rooms}
              nightAudits={state.nightAudits}
              onExecuteAudit={handleExecuteNightAudit}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              property={state.property}
              rooms={state.rooms}
              reservations={state.reservations}
              nightAudits={state.nightAudits}
              folios={state.folios}
            />
          )}

          {activeTab === 'guests' && (
            <GuestCrmView
              reservations={state.reservations}
            />
          )}

          {activeTab === 'permissions' && (
            <TeamPermissionsView
              teamMembers={state.teamMembers}
              property={state.property}
              onInviteMember={(data) => {
                pmsStore.inviteTeamMember(data);
                showToast(`✉️ Invitation sent to ${data.email} as ${data.role}`);
              }}
              onUpdatePermissions={(userId, perms) => {
                pmsStore.updatePermissions(userId, perms);
                showToast(`🛡️ Permissions updated.`);
              }}
            />
          )}

          {activeTab === 'properties' && (
            <PropertySettingsView
              property={state.property}
              roomTypes={state.roomTypes}
              rooms={state.rooms}
              mealPlans={state.mealPlans}
              onSaveProperty={(patch) => {
                pmsStore.property = { ...pmsStore.property, ...patch };
                pmsStore.save();
                showToast(`🏢 Property settings updated.`);
              }}
            />
          )}
          </div>
        </main>
      </div>
        </>
      )}

      {/* --- ALL OPERATIONAL MODALS --- */}

      {/* 1. Walk-In Wizard Modal */}
      <CreateReservationModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        initialData={slotPrefillData}
        roomTypes={state.roomTypes}
        rooms={state.rooms}
        ratePlans={state.ratePlans}
        onSubmit={handleCreateReservation}
      />

      {/* 2. Deep-Dive Folio & Reservation Details Modal */}
      <FolioModal
        isOpen={isFolioOpen}
        onClose={() => setIsFolioOpen(false)}
        reservation={selectedReservation}
        folios={state.folios}
        auditTrail={state.auditTrail}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onAddTransaction={handleAddFolioTransaction}
        onSettleFolio={handleSettleFolio}
        onOpenRoomMove={(res) => {
          setSelectedResForMove(res);
          setIsRoomMoveOpen(true);
        }}
        onOpenVoucher={(res) => {
          setSelectedResForVoucher(res);
          setIsVoucherOpen(true);
        }}
        onOpenInvoice={(res, fol) => {
          setSelectedResForInvoice(res);
          setIsInvoiceOpen(true);
        }}
      />

      {/* 3. Group Room Move Modal */}
      <GroupRoomMoveModal
        isOpen={isRoomMoveOpen}
        onClose={() => setIsRoomMoveOpen(false)}
        reservation={selectedResForMove}
        rooms={state.rooms}
        onMoveRoom={handleMoveRoom}
      />

      {/* 4. Branded Booking Voucher Modal */}
      <BookingVoucherModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        reservation={selectedResForVoucher}
        property={state.property}
      />

      {/* 5. Legal Indian GST Tax Invoice Modal */}
      <GstInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        reservation={selectedResForInvoice}
        folio={selectedResForInvoice ? state.folios[selectedResForInvoice.folioId] : null}
        property={state.property}
      />

      {/* 6. Maintenance Block Modal */}
      <MaintenanceBlockModal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        initialData={maintenanceInitialData}
        rooms={state.rooms}
        onSubmit={handleAddMaintenanceBlock}
        onDelete={handleDeleteMaintenanceBlock}
      />
    </div>
  );
}
