import React, { useState } from 'react';
import {
  Settings,
  Building,
  Utensils,
  Layers,
  Save,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

export default function PropertySettingsView({
  property,
  roomTypes,
  rooms,
  mealPlans,
  onSaveProperty
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'meals' | 'rooms'

  // Profile Form State
  const [propState, setPropState] = useState({ ...property });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onSaveProperty(propState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div style={{
        background: '#ffffff',
        padding: '1.25rem 1.75rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Property Configuration & Master Data
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Manage GST registration, operational check-in/out timings, room categories, and meal plans
          </p>
        </div>

        {savedSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.84rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Navigation Subtabs */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem', background: '#f8fafc' }}>
          {[
            { id: 'profile', label: 'Property & GST Details', icon: Building },
            { id: 'meals', label: `Meal Plans (${mealPlans.length})`, icon: Utensils },
            { id: 'rooms', label: `Room Inventory (${rooms.length} Rooms)`, icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '1.75rem' }}>
          {/* TAB 1: PROPERTY & GST PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ maxWidth: '720px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Property Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.name || ''}
                    onChange={(e) => setPropState({ ...propState, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Legal Registered Entity Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.legalName || ''}
                    onChange={(e) => setPropState({ ...propState, legalName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN (Indian Goods & Services Tax Number)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.gstin || ''}
                    onChange={(e) => setPropState({ ...propState, gstin: e.target.value })}
                    style={{ fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Accommodation SAC Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.sacCode || '996311'}
                    onChange={(e) => setPropState({ ...propState, sacCode: e.target.value })}
                    style={{ fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Street Address & Landmark</label>
                <input
                  type="text"
                  className="form-input"
                  value={propState.addressLine || ''}
                  onChange={(e) => setPropState({ ...propState, addressLine: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.city || ''}
                    onChange={(e) => setPropState({ ...propState, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.state || ''}
                    onChange={(e) => setPropState({ ...propState, state: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal / PIN Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={propState.postalCode || ''}
                    onChange={(e) => setPropState({ ...propState, postalCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Default Check-In Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={propState.checkInTime || '14:00'}
                    onChange={(e) => setPropState({ ...propState, checkInTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Check-Out Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={propState.checkOutTime || '11:00'}
                    onChange={(e) => setPropState({ ...propState, checkOutTime: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                <Save size={15} />
                <span>Save Property Settings</span>
              </button>
            </form>
          )}

          {/* TAB 2: MEAL PLANS */}
          {activeTab === 'meals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Plan Code</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Plan Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Inclusions</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Pricing Model</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Adult / Child Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mealPlans.map((mp) => (
                    <tr key={mp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#2563eb' }}>{mp.code}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{mp.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                        {mp.inclusions?.length > 0 ? mp.inclusions.join(', ') : 'Room Tariff Only'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700 }}>
                          {mp.pricingModel}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        {mp.adultPrice ? `₹${mp.adultPrice} / ₹${mp.childPrice}` : 'Included'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ROOMS & INVENTORY */}
          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {rooms.map((rm) => {
                  const rt = roomTypes.find(t => t.id === rm.roomTypeId);
                  return (
                    <div key={rm.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        Room {rm.roomNumber}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                        {rt?.name || 'Standard'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Floor {rm.floor} • Status: {rm.status.toUpperCase()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
