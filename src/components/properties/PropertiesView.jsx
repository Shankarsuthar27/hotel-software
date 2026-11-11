import React, { useState } from 'react';
import { Home, Archive, Building2, BedDouble, Tag, Briefcase, PieChart, Percent, Utensils, Plus } from 'lucide-react';
import MealPlansView from './MealPlansView';
import RoomsManagementView from './RoomsManagementView';
import RatePlansView from './RatePlansView';
import AllPropertiesView from './AllPropertiesView';
import PropertySettingsView from '../settings/PropertySettingsView';
import './properties.css';

export default function PropertiesView({
  subtab = 'all',
  property,
  propertiesList = ['HOTEL ASTHA', 'HOTEL ASTHA RESORT'],
  mealPlans = [],
  roomTypes = [],
  rooms = [],
  ratePlans = [],
  taxes = [],
  services = [],
  onOpenCashDrawer,
  onSaveProperty,
  onCreateMealPlan,
  onUpdateMealPlan,
  onDeleteMealPlan,
  onAddRoomType,
  onUpdateRoomType,
  onDeleteRoomType,
  onAddRooms,
  onUpdateRoom,
  onDeleteRoom,
  onCreateRatePlan,
  onUpdateRatePlan,
  onDeleteRatePlan,
  showToast
}) {
  const [roomsActiveTab, setRoomsActiveTab] = useState('room-types');
  const [triggerAddRoomType, setTriggerAddRoomType] = useState(0);
  const [triggerAddRoom, setTriggerAddRoom] = useState(0);
  const [triggerAddMealPlan, setTriggerAddMealPlan] = useState(0);
  const [triggerAddRatePlan, setTriggerAddRatePlan] = useState(0);

  // Always reset modal triggers when switching sections or tabs
  React.useEffect(() => {
    setTriggerAddRoomType(0);
    setTriggerAddRoom(0);
    setTriggerAddMealPlan(0);
    setTriggerAddRatePlan(0);
  }, [subtab, roomsActiveTab]);

  const getSubtabTitle = () => {
    switch (subtab) {
      case 'meal-plans':
        return 'Meal Plans';
      case 'rooms':
        return 'Rooms';
      case 'rate-plans':
        return 'Rate Plans';
      case 'business-account':
        return 'Business Account';
      case 'market-segment':
        return 'Market Segment';
      case 'tax-services':
        return 'Tax & Services';
      case 'all':
      default:
        return 'All Properties';
    }
  };

  if (subtab === 'all') {
    return (
      <AllPropertiesView
        property={property}
        onSaveProperty={onSaveProperty}
        onOpenCashDrawer={onOpenCashDrawer}
        showToast={showToast}
      />
    );
  }

  return (
    <div
      className="properties-page-container"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* 1. Top Header Bar (Matching Images 1, 3, 4) */}
      <header className="properties-top-header">
        <div className="properties-breadcrumbs">
          <span className="properties-crumb-home">
            <Home size={14} />
          </span>
          <span className="properties-crumb-link">PMS</span>
          <span className="properties-crumb-sep">&gt;</span>
          <span className="properties-crumb-link">Properties</span>
          {subtab !== 'all' && (
            <>
              <span className="properties-crumb-sep">&gt;</span>
              <span className="properties-crumb-active">{getSubtabTitle()}</span>
            </>
          )}
          {subtab === 'all' && (
            <>
              <span className="properties-crumb-sep">&gt;</span>
              <span className="properties-crumb-active">All Properties</span>
            </>
          )}
        </div>

        {/* Top-Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Amber Open Cash Drawer Pill Button */}
          <button
            type="button"
            className="properties-cash-drawer-pill"
            onClick={onOpenCashDrawer}
            title="Open Register Cash Drawer"
          >
            <Archive size={14} strokeWidth={2.2} />
            <span>Open Cash Drawer</span>
          </button>

          {/* Contextual Action Button for Meal Plans */}
          {subtab === 'meal-plans' && (
            <button
              type="button"
              className="properties-btn-primary"
              onClick={() => setTriggerAddMealPlan((prev) => prev + 1)}
            >
              <Plus size={16} />
              <span>Create Meal Plan</span>
            </button>
          )}

          {/* Contextual Action Button for Rate Plans (Matching Image 1) */}
          {subtab === 'rate-plans' && (
            <button
              type="button"
              className="properties-btn-primary"
              onClick={() => setTriggerAddRatePlan((prev) => prev + 1)}
            >
              <Plus size={16} />
              <span>Create Rate Plan</span>
            </button>
          )}

          {/* Contextual Action Button for Rooms Section (Matching Image 1: "+ Create Room Type" with single + icon) */}
          {subtab === 'rooms' && (
            roomsActiveTab === 'room-types' ? (
              <button
                type="button"
                className="properties-btn-primary"
                onClick={() => setTriggerAddRoomType((prev) => prev + 1)}
              >
                <Plus size={16} />
                <span>Create Room Type</span>
              </button>
            ) : (
              <button
                type="button"
                className="properties-btn-primary"
                onClick={() => setTriggerAddRoom((prev) => prev + 1)}
              >
                <Plus size={16} />
                <span>Add Room</span>
              </button>
            )
          )}
        </div>
      </header>

      {/* 2. Subtab Content */}
      {subtab === 'meal-plans' && (
        <MealPlansView
          mealPlans={mealPlans}
          triggerAddMealPlan={triggerAddMealPlan}
          onCreateMealPlan={onCreateMealPlan}
          onUpdateMealPlan={onUpdateMealPlan}
          onDeleteMealPlan={onDeleteMealPlan}
          showToast={showToast}
        />
      )}

      {subtab === 'rooms' && (
        <RoomsManagementView
          roomTypes={roomTypes}
          rooms={rooms}
          activeTab={roomsActiveTab}
          onTabChange={setRoomsActiveTab}
          triggerAddRoomType={triggerAddRoomType}
          triggerAddRoom={triggerAddRoom}
          onAddRoomType={onAddRoomType}
          onUpdateRoomType={onUpdateRoomType}
          onDeleteRoomType={onDeleteRoomType}
          onAddRooms={onAddRooms}
          onUpdateRoom={onUpdateRoom}
          onDeleteRoom={onDeleteRoom}
          showToast={showToast}
        />
      )}

      {subtab === 'all' && (
        <div className="properties-content-area">
          <PropertySettingsView
            property={property}
            roomTypes={roomTypes}
            rooms={rooms}
            mealPlans={mealPlans}
            onSaveProperty={onSaveProperty}
            showToast={showToast}
          />
        </div>
      )}

      {subtab === 'rate-plans' && (
        <RatePlansView
          ratePlans={ratePlans}
          mealPlans={mealPlans}
          roomTypes={roomTypes}
          triggerAddRatePlan={triggerAddRatePlan}
          onCreateRatePlan={onCreateRatePlan}
          onUpdateRatePlan={onUpdateRatePlan}
          onDeleteRatePlan={onDeleteRatePlan}
          showToast={showToast}
        />
      )}

      {subtab === 'business-account' && (
        <div className="properties-content-area">
          <div className="properties-table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Briefcase size={20} color="#2563EB" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Business & Corporate Accounts
              </h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '13.5px' }}>
              Configure corporate billing accounts, contracted rates, and direct billing credit limits.
            </p>
          </div>
        </div>
      )}

      {subtab === 'market-segment' && (
        <div className="properties-content-area">
          <div className="properties-table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <PieChart size={20} color="#2563EB" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Market Segments
              </h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '13.5px' }}>
              OTA Direct, Corporate Transient, FIT Leisure, Walk-in, and Government segments.
            </p>
          </div>
        </div>
      )}

      {subtab === 'tax-services' && (
        <div className="properties-content-area">
          <div className="properties-table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Percent size={20} color="#2563EB" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Taxes & Extra Services
              </h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '13.5px' }}>
              Configure GST / VAT slabs, SAC codes, and addon service billings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

