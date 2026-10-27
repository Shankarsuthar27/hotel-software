import React from 'react';
import { X, Moon, DollarSign, Users, CheckCircle2, FileText } from 'lucide-react';

export default function NightAuditDetailModal({ isOpen, onClose, auditRecord, property }) {
  if (!isOpen || !auditRecord) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: 'var(--radius-md)' }}>
              <Moon size={20} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                Night Audit Day-Close Summary — {auditRecord.auditDate}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Executed by {auditRecord.performedBy} • Status: {auditRecord.status}
              </p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Room Revenue</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{auditRecord.totalRevenue?.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Taxes: ₹{auditRecord.totalTax?.toLocaleString()}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Occupied Rooms</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563eb' }}>{auditRecord.occupiedRooms} Rooms</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Vacant: {auditRecord.vacantRooms}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>ADR (Avg Daily Rate)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{auditRecord.adr?.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>RevPAR: ₹{auditRecord.revPar?.toLocaleString()}</div>
            </div>

            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600, textTransform: 'uppercase' }}>Audit Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669' }}>BALANCED</div>
              <div style={{ fontSize: '0.72rem', color: '#059669' }}>Tariffs Posted: {auditRecord.chargesPostedCount}</div>
            </div>
          </div>

          {/* Room Charges Log Table */}
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: '#334155' }}>
            Posted Daily Folio Room Tariffs
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>Room #</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Guest Name</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Folio #</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Room Charge</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>GST Tax</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {(auditRecord.roomChargesLog || []).map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>Room {log.room}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>{log.guest}</td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#2563eb', fontWeight: 600 }}>{log.folio}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>₹{log.rate?.toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#64748b' }}>₹{log.tax?.toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800 }}>₹{log.net?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
