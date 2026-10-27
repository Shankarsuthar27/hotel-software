import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Check,
  X,
  Users,
  Lock,
  Building
} from 'lucide-react';

export default function TeamPermissionsView({
  teamMembers,
  property,
  onInviteMember,
  onUpdatePermissions
}) {
  const [selectedUser, setSelectedUser] = useState(teamMembers[0]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite modal form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Front Desk Agent');

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    onInviteMember({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole
    });

    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handlePermissionToggle = (category, subfield) => {
    if (!selectedUser) return;
    const current = selectedUser.permissions || {};
    let updated;

    if (subfield) {
      updated = {
        ...current,
        [category]: {
          ...current[category],
          [subfield]: !current[category]?.[subfield]
        }
      };
    } else {
      updated = {
        ...current,
        [category]: !current[category]
      };
    }

    onUpdatePermissions(selectedUser.id, updated);
    setSelectedUser({ ...selectedUser, permissions: updated });
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
            Team Management & Granular RBAC Permissions
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Role-Based Access Control matrix governing operational dispatch, Night Audit execution, and PII masking
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
          <UserPlus size={15} />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Main Grid: Staff List & Permission Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Left: Staff Members List */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
            Active Staff ({teamMembers.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {teamMembers.map((member) => {
              const isSelected = selectedUser?.id === member.id;
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedUser(member)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{member.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {member.role}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: '2px' }}>
                        {member.email}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Granular RBAC Permission Matrix for Selected Staff */}
        {selectedUser && (
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Permission Matrix: {selectedUser.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Assigned Property: <strong>{property?.name}</strong> • Role: <strong>{selectedUser.role}</strong>
                </p>
              </div>

              <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: '#ecfdf5',
                color: '#059669',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {selectedUser.status}
              </span>
            </div>

            {/* Matrix Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category 1: Reservations */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Front Desk & Reservations Management
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {['view', 'create', 'edit', 'cancel'].map((sub) => {
                    const enabled = !!selectedUser.permissions?.reservations?.[sub];
                    return (
                      <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handlePermissionToggle('reservations', sub)}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{sub} Bookings</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Night Audit & Day Close */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Night Audit & Financial Operations
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={!!selectedUser.permissions?.nightAudit?.view}
                      onChange={() => handlePermissionToggle('nightAudit', 'view')}
                    />
                    <span>View Night Audits</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={!!selectedUser.permissions?.nightAudit?.execute}
                      onChange={() => handlePermissionToggle('nightAudit', 'execute')}
                    />
                    <span style={{ color: '#dc2626' }}>Execute Day-Close</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={!!selectedUser.permissions?.ledger?.settle}
                      onChange={() => handlePermissionToggle('ledger', 'settle')}
                    />
                    <span>Settle Folio Balances</span>
                  </label>
                </div>
              </div>

              {/* Category 3: Rates & Inventory Restrictions */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Rates, Inventory & Channel Derivations
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {['view', 'edit', 'bulkUpdate', 'stopSell'].map((sub) => {
                    const enabled = !!selectedUser.permissions?.ratesAndInventory?.[sub];
                    return (
                      <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handlePermissionToggle('ratesAndInventory', sub)}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{sub.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Category 4: Security & Sensitive PII */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Data Privacy & PII Access
                </h4>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={!!selectedUser.permissions?.piiAccess}
                      onChange={() => handlePermissionToggle('piiAccess')}
                    />
                    <span>Allow Unmasked Guest PII (Phone, Email, Identity Documents)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staff Invitation Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Invite Team Member</h3>
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)} style={{ padding: '0.25rem 0.5rem' }}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Anjali Sharma"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="anjali@royaleavenue.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Role</label>
                  <select
                    className="form-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="Front Desk Agent">Front Desk Agent</option>
                    <option value="Front Desk Lead">Front Desk Lead</option>
                    <option value="Night Auditor">Night Auditor & Accountant</option>
                    <option value="Housekeeping Supervisor">Housekeeping Supervisor</option>
                    <option value="General Manager">General Manager</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
