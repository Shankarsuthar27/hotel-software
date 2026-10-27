import React from 'react';
import { Plus, RefreshCw, Calendar, Search, Bell, CheckCircle } from 'lucide-react';

export default function TopNav({
  property,
  activeTab,
  onNewReservation,
  onRefresh,
  searchQuery,
  setSearchQuery
}) {
  const getTabLabel = (tab) => {
    switch (tab) {
      case 'calendar': return 'Calendar Tape Chart';
      case 'reservations': return 'Reservations Management';
      case 'housekeeping': return 'Housekeeping Room View';
      case 'rates': return 'Rates, Inventory & Channel Manager';
      case 'nightaudit': return 'Night Audit & Financial Close';
      case 'reports': return 'Financial & Manager Reports';
      case 'guests': return 'Guest Directory & CRM';
      case 'permissions': return 'Staff & Granular RBAC Permissions';
      case 'properties': return 'Property Configuration & Meal Plans';
      default: return 'Overview';
    }
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <div className="breadcrumbs">
          <span>PMS</span>
          <span>/</span>
          <span className="current">{getTabLabel(activeTab)}</span>
        </div>

        {/* Operational Business Date Pill */}
        <div className="business-date-badge" title="Hotel System Operational Date">
          <Calendar size={14} color="#2563eb" />
          <span>Business Date: <strong>{property?.businessDate || '2026-10-24'}</strong></span>
        </div>

        {/* Cloud Firestore Live Status */}
        <div
          className="cloud-live-badge"
          title="Google Cloud Firestore Live Multi-terminal Sync"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#166534'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.25)'
            }}
          />
          <span>Cloud: <strong>Live Sync</strong></span>
        </div>
      </div>

      <div className="top-nav-right">
        {/* Quick Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search guest, #RES, phone..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', height: '36px', width: '220px', fontSize: '0.82rem' }}
          />
        </div>

        {/* Refresh Sync */}
        <button
          className="btn-secondary"
          onClick={onRefresh}
          title="Refresh & Sync PMS State"
          style={{ height: '36px', padding: '0 0.75rem' }}
        >
          <RefreshCw size={14} />
        </button>

        {/* Primary CTA: Walk-In / New Booking */}
        <button
          className="btn-primary"
          onClick={onNewReservation}
          style={{ height: '36px' }}
        >
          <Plus size={16} />
          <span>Create Reservation</span>
        </button>
      </div>
    </header>
  );
}
