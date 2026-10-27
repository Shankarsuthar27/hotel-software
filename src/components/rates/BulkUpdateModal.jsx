import React, { useState } from 'react';
import { TrendingUp, X, CheckCircle2, Calendar } from 'lucide-react';

export default function BulkUpdateModal({
  isOpen,
  onClose,
  roomTypes,
  ratePlans,
  onBulkUpdate
}) {
  if (!isOpen) return null;

  const [selectedRoomTypeIds, setSelectedRoomTypeIds] = useState(roomTypes.map(rt => rt.id));
  const [startDate, setStartDate] = useState('2026-10-24');
  const [endDate, setEndDate] = useState('2026-11-07');
  const [daysOfWeek, setDaysOfWeek] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // Targets
  const [updateRates, setUpdateRates] = useState(true);
  const [baseRate, setBaseRate] = useState('5200');
  const [updateStopSell, setUpdateStopSell] = useState(false);
  const [stopSellValue, setStopSellValue] = useState(false);
  const [minNights, setMinNights] = useState('1');

  const toggleDay = (day) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const toggleRoomType = (id) => {
    if (selectedRoomTypeIds.includes(id)) {
      setSelectedRoomTypeIds(selectedRoomTypeIds.filter(rtId => rtId !== id));
    } else {
      setSelectedRoomTypeIds([...selectedRoomTypeIds, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoomTypeIds.length === 0) {
      alert('Please select at least one Room Type');
      return;
    }

    onBulkUpdate({
      roomTypeIds: selectedRoomTypeIds,
      startDate,
      endDate,
      daysOfWeek,
      baseRate: updateRates ? Number(baseRate) : undefined,
      stopSell: updateStopSell ? stopSellValue : undefined,
      minNights: Number(minNights) || 1
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ padding: '0.45rem', background: '#eff6ff', borderRadius: 'var(--radius-md)' }}>
              <TrendingUp size={18} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Bulk Rates & Restriction Update
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Batch update tariffs, stop-sells, and length-of-stay across multiple room tiers
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Step 1: Room Types Multi-select */}
            <div className="form-group">
              <label className="form-label">Target Room Types</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {roomTypes.map((rt) => {
                  const isChecked = selectedRoomTypeIds.includes(rt.id);
                  return (
                    <label
                      key={rt.id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: `1px solid ${isChecked ? '#2563eb' : '#e2e8f0'}`,
                        background: isChecked ? '#eff6ff' : '#ffffff',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRoomType(rt.id)}
                      />
                      <span>{rt.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Step 3: Days of Week Pills */}
            <div className="form-group">
              <label className="form-label">Days of Week</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const isSelected = daysOfWeek.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0',
                        border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                        background: isSelected ? '#2563eb' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Rate & Restriction Modifiers */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={updateRates}
                    onChange={(e) => setUpdateRates(e.target.checked)}
                  />
                  <span>Override Base Rate (₹)</span>
                </label>
                {updateRates && (
                  <input
                    type="number"
                    className="form-input"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    style={{ width: '140px', fontSize: '0.84rem' }}
                    placeholder="e.g. 5200"
                  />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={updateStopSell}
                    onChange={(e) => setUpdateStopSell(e.target.checked)}
                  />
                  <span>Stop-Sell (Close Inventory)</span>
                </label>
                {updateStopSell && (
                  <select
                    className="form-select"
                    value={stopSellValue ? 'close' : 'open'}
                    onChange={(e) => setStopSellValue(e.target.value === 'close')}
                    style={{ width: '140px', fontSize: '0.84rem' }}
                  >
                    <option value="close">🚫 Stop Sell</option>
                    <option value="open">✅ Open Sell</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={15} />
              <span>Apply Bulk Updates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
