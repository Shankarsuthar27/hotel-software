import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Unlock,
  Building,
  Edit2
} from 'lucide-react';
import BulkUpdateModal from './BulkUpdateModal';

export default function RatesMatrixView({
  roomTypes,
  property,
  stopouts = {},
  otaChannels = [],
  onToggleStopout,
  onBulkUpdate,
  onFullSyncChannel,
  ratePlans = []
}) {
  const [activeSubTab, setActiveSubTab] = useState('rates'); // 'rates' | 'stopouts' | 'min_nights' | 'channels'
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [baseDate, setBaseDate] = useState(new Date(property?.businessDate || '2026-10-24'));

  const daysToShow = 14;

  const dateList = useMemo(() => {
    const list = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      list.push({
        date: d,
        isoStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isWeekend
      });
    }
    return list;
  }, [baseDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Controls Toolbar */}
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
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          {[
            { id: 'rates', label: 'All Rates Matrix' },
            { id: 'stopouts', label: 'Interactive Stopouts (Stop-Sell)' },
            { id: 'min_nights', label: 'Min Stay Controls' },
            { id: 'channels', label: `OTAs & Channels (${otaChannels.length})` }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bulk Update Trigger */}
        <button className="btn-primary" onClick={() => setIsBulkOpen(true)}>
          <Sliders size={15} />
          <span>Bulk Update</span>
        </button>
      </div>

      {/* VIEW 1: RATES & STOPOUTS GRID */}
      {activeSubTab !== 'channels' && (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.8rem' }}>
              <thead>
                <tr className="sticky-header-row">
                  <th className="sticky-room-col" style={{ padding: '0.85rem 1rem', textAlign: 'left', background: '#f8fafc', width: '220px', minWidth: '220px' }}>
                    <div style={{ fontWeight: 700, color: '#334155' }}>ROOM TIER / RATES</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Indian Rupee (INR ₹)</div>
                  </th>

                  {dateList.map((col) => (
                    <th
                      key={col.isoStr}
                      style={{
                        textAlign: 'center',
                        padding: '0.5rem 0.4rem',
                        background: col.isWeekend ? '#f8fafc' : '#ffffff',
                        borderBottom: '2px solid var(--border-light)',
                        borderRight: '1px solid var(--border-subtle)',
                        minWidth: '70px'
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        {col.dayName}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                        {col.dayNum}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {roomTypes.map((rt) => {
                  return (
                    <tr key={rt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {/* Sticky Tier Label */}
                      <td className="sticky-room-col" style={{ padding: '0.75rem 1rem', borderRight: '2px solid var(--border-light)' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{rt.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          Base: ₹{rt.basePrice?.toLocaleString()} • Extra: ₹{rt.extraAdultPrice}
                        </div>
                      </td>

                      {/* Date Cells */}
                      {dateList.map((col) => {
                        const stopoutKey = `${rt.id}_${col.isoStr}`;
                        const isStopped = !!stopouts[stopoutKey];

                        if (activeSubTab === 'stopouts') {
                          return (
                            <td
                              key={col.isoStr}
                              onClick={() => onToggleStopout(rt.id, col.isoStr)}
                              style={{
                                textAlign: 'center',
                                padding: '0.5rem',
                                borderRight: '1px solid var(--border-subtle)',
                                borderBottom: '1px solid var(--border-subtle)',
                                background: isStopped ? '#fef2f2' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title={isStopped ? 'Stop-Sell active. Click to open.' : 'Open sell. Click to stop sell.'}
                            >
                              {isStopped ? (
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.45rem',
                                  borderRadius: '4px',
                                  background: '#dc2626',
                                  color: '#ffffff',
                                  fontWeight: 800
                                }}>
                                  🚫 STOP
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.45rem',
                                  borderRadius: '4px',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  fontWeight: 700
                                }}>
                                  OPEN
                                </span>
                              )}
                            </td>
                          );
                        }

                        if (activeSubTab === 'min_nights') {
                          return (
                            <td
                              key={col.isoStr}
                              style={{
                                textAlign: 'center',
                                padding: '0.5rem',
                                borderRight: '1px solid var(--border-subtle)',
                                borderBottom: '1px solid var(--border-subtle)',
                                background: col.isWeekend ? '#fafaf9' : '#ffffff'
                              }}
                            >
                              <span style={{ fontWeight: 700, color: col.isWeekend ? '#2563eb' : '#64748b' }}>
                                {col.isWeekend ? '2N' : '1N'}
                              </span>
                            </td>
                          );
                        }

                        // Default: All Rates Matrix
                        return (
                          <td
                            key={col.isoStr}
                            style={{
                              textAlign: 'center',
                              padding: '0.65rem 0.4rem',
                              borderRight: '1px solid var(--border-subtle)',
                              borderBottom: '1px solid var(--border-subtle)',
                              background: col.isWeekend ? '#eff6ff' : '#ffffff'
                            }}
                          >
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>
                              ₹{rt.basePrice?.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
                              +₹{rt.extraAdultPrice}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: OTAs & CHANNELS MANAGER */}
      {activeSubTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>OTA Channel</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Connection State</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Mapped Inventory</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Derived Pricing Rule</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Last Sync Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {otaChannels.map((channel) => (
                  <tr key={channel.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{channel.icon}</span>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{channel.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Code: {channel.channelCode}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0'
                      }}>
                        {channel.connectionStatus}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 600 }}>{channel.mappedRoomsCount} Room Types</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{channel.activeBookings} Active Reservations</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#2563eb' }}>
                        {channel.rateModel === 'MARKUP_PERCENT' && `+${channel.rateModifier}% Markup over Base`}
                        {channel.rateModel === 'DECREASE_PERCENT' && `-${channel.rateModifier}% Derived Discount Formula`}
                        {channel.rateModel === 'MARKUP_FIXED' && `+₹${channel.rateModifier} Fixed Add-on`}
                        {channel.rateModel === 'EXACT_BASE' && '1:1 Direct Base Rate'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Auto-calculated during ARI push
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                      {channel.lastSync}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn-primary"
                        onClick={() => onFullSyncChannel(channel.id)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <RefreshCw size={13} />
                        <span>Full Sync</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        roomTypes={roomTypes}
        ratePlans={ratePlans}
        onBulkUpdate={onBulkUpdate}
      />
    </div>
  );
}
