import React, { useState } from 'react';
import {
  Moon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import NightAuditDetailModal from './NightAuditDetailModal';

export default function NightAuditView({
  property,
  reservations,
  rooms,
  nightAudits,
  onExecuteAudit
}) {
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const businessDate = property?.businessDate || '2026-10-24';

  // Pre-audit checklist validations
  const pendingArrivals = reservations.filter(
    (r) => r.checkInDate === businessDate && r.status === 'confirmed'
  );

  const pendingDepartures = reservations.filter(
    (r) => r.checkOutDate === businessDate && r.status === 'in_house'
  );

  const inHouseCount = reservations.filter((r) => r.status === 'in_house').length;

  const unsettledFolios = reservations.filter(
    (r) => r.status === 'in_house' && r.balanceDue > 0
  );

  const isChecklistClear = pendingDepartures.length === 0;

  const handleRunAudit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const record = onExecuteAudit();
      setIsProcessing(false);
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
      setSelectedAudit(record);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '1.75rem 2rem',
        borderRadius: 'var(--radius-lg)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(37, 99, 235, 0.3)', borderRadius: 'var(--radius-md)' }}>
              <Moon size={22} color="#60a5fa" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Night Audit & Financial Day Close
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', maxWidth: '640px' }}>
            Automated midnight ledger balancing, room tariff posting with Indian GST slab computation, and operational date advancement.
          </p>
        </div>

        {/* Current Business Date Pill */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
            Active Business Date
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
            {businessDate}
          </div>
        </div>
      </div>

      {/* Pre-Audit Operational Checklist */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Pre-Audit Operational Checklist</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            (Verify before advancing business date)
          </span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Item 1: Pending Check-ins */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${pendingArrivals.length > 0 ? '#fde68a' : '#a7f3d0'}`,
            background: pendingArrivals.length > 0 ? '#fffbeb' : '#ecfdf5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: pendingArrivals.length > 0 ? '#92400e' : '#065f46' }}>
                Pending Arrivals
              </span>
              {pendingArrivals.length === 0 ? <CheckCircle2 size={16} color="#059669" /> : <AlertTriangle size={16} color="#d97706" />}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: pendingArrivals.length > 0 ? '#b45309' : '#059669' }}>
              {pendingArrivals.length} Rooms
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {pendingArrivals.length === 0 ? 'All scheduled check-ins accounted for' : 'Pending arrivals can still be checked in or no-showed'}
            </div>
          </div>

          {/* Item 2: Pending Departures */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${pendingDepartures.length > 0 ? '#fecaca' : '#a7f3d0'}`,
            background: pendingDepartures.length > 0 ? '#fef2f2' : '#ecfdf5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: pendingDepartures.length > 0 ? '#991b1b' : '#065f46' }}>
                Departures Due Today
              </span>
              {pendingDepartures.length === 0 ? <CheckCircle2 size={16} color="#059669" /> : <AlertTriangle size={16} color="#dc2626" />}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: pendingDepartures.length > 0 ? '#dc2626' : '#059669' }}>
              {pendingDepartures.length} Rooms
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {pendingDepartures.length === 0 ? 'All scheduled checkouts completed' : 'Check out departing guests or extend stays'}
            </div>
          </div>

          {/* Item 3: Active In-House Rooms */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bfdbfe',
            background: '#eff6ff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e40af' }}>
                Active In-House Folios
              </span>
              <CheckCircle2 size={16} color="#2563eb" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>
              {inHouseCount} Rooms
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Will receive automated daily tariff & GST debit posting
            </div>
          </div>
        </div>

        {/* Execution CTA Banner */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              Ready to Advance Hotel Business Date?
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Posting tariffs for <strong>{inHouseCount}</strong> in-house folios and closing financial day <strong>{businessDate}</strong>.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={handleRunAudit}
            disabled={isProcessing}
            style={{
              padding: '0.75rem 1.75rem',
              fontSize: '0.9rem',
              background: '#0f172a',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.4)'
            }}
          >
            <Moon size={16} />
            <span>{isProcessing ? 'Processing Night Audit...' : 'Execute Night Audit & Close Day'}</span>
          </button>
        </div>
      </div>

      {/* Historical Completed Audits */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
            Historical Completed Night Audits
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing {nightAudits.length} Audits Recorded
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Audit Date</th>
              <th style={{ padding: '0.85rem 1rem' }}>Auditor</th>
              <th style={{ padding: '0.85rem 1rem' }}>Room Tariffs Posted</th>
              <th style={{ padding: '0.85rem 1rem' }}>Occupancy Rate</th>
              <th style={{ padding: '0.85rem 1rem' }}>ADR (₹)</th>
              <th style={{ padding: '0.85rem 1rem' }}>Total Revenue (₹)</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nightAudits.map((audit) => (
              <tr key={audit.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                  {audit.auditDate}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                  {audit.performedBy}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ padding: '0.15rem 0.5rem', background: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.74rem' }}>
                    {audit.chargesPostedCount || audit.occupiedRooms} Folios Posted
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                  {rooms.length > 0 ? `${Math.round((audit.occupiedRooms / rooms.length) * 100)}%` : '75%'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  ₹{audit.adr?.toLocaleString()}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{audit.totalRevenue?.toLocaleString()}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedAudit(audit)}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    <FileText size={13} />
                    <span>View Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Detail Drilldown Modal */}
      <NightAuditDetailModal
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
        auditRecord={selectedAudit}
        property={property}
      />
    </div>
  );
}
