import React, { useState } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function NewAnnouncementModal({ isOpen, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Normal'); // 'Normal' | 'Important' | 'Urgent'
  const [shift, setShift] = useState('All Shifts'); // 'All Shifts' | 'Morning' | 'Evening' | 'Night'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmit({
      id: 'note_' + Date.now(),
      message: message.trim(),
      priority,
      shift,
      author: 'Astha India',
      authorRole: 'Owner',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setMessage('');
    setPriority('Normal');
    setShift('All Shifts');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>New Staff Announcement</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Broadcast updates to front desk & housekeeping teams</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Announcement Message *
            </label>
            <textarea
              rows={4}
              required
              className="form-input"
              placeholder="e.g. Room 102 VIP guest arriving at 4 PM, ensure welcome drink is ready..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Priority Level
              </label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Normal">Normal (Info)</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent / Attention</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Target Shift
              </label>
              <select
                className="form-input"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="All Shifts">All Shifts</option>
                <option value="Morning">Morning Shift</option>
                <option value="Evening">Evening Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
