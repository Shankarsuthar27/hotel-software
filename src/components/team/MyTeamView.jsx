import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  ChevronDown,
  MoreVertical,
  Trash2,
  Mail,
  Copy,
  Pencil,
  ExternalLink,
  Home,
  CheckCircle2,
  AlertCircle,
  Archive,
  Lock
} from 'lucide-react';
import AddTeamMemberModal from './AddTeamMemberModal';
import EditTeamMemberModal from './EditTeamMemberModal';
import InviteEmailModal from './InviteEmailModal';
import './my-team.css';

export default function MyTeamView({
  teamMembers = [],
  propertiesList = ['HOTEL ASTHA'],
  currentProperty = 'HOTEL ASTHA',
  onInviteMembers,
  onUpdateMember,
  onManagePermissions,
  onRemoveInvitation,
  onRemoveMember,
  onOpenCashDrawer,
  showToast,
  onNavigateToAccept
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(currentProperty);
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [previewEmailMember, setPreviewEmailMember] = useState(null);

  // Action Menu dropdown state: memberId or null
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter team members:
  // Exclude the account owner (who is the master admin/inviter)
  // Match selected property and search query
  const eligibleMembers = teamMembers.filter((m) => m.role !== 'Owner');

  const filteredMembers = eligibleMembers.filter((m) => {
    // Property filter
    const matchesProp =
      !m.properties ||
      m.properties.length === 0 ||
      m.properties.includes(selectedProperty) ||
      selectedProperty === 'ALL';

    // Search filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q);

    return matchesProp && matchesSearch;
  });

  const totalResults = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleSendInvitations = ({ emails, assignments }) => {
    if (onInviteMembers) {
      onInviteMembers({ emails, assignments });
    }
    if (showToast) {
      showToast('Success: Invitations sent successfully');
    }
  };

  const handleRemoveInvite = (member) => {
    setOpenActionMenuId(null);
    if (onRemoveInvitation) {
      onRemoveInvitation(member.id);
    }
    if (showToast) {
      showToast(`🗑️ Invitation to ${member.email} removed.`);
    }
  };

  const handleRemoveActiveMember = (member) => {
    setOpenActionMenuId(null);
    if (onRemoveMember) {
      onRemoveMember(member.id);
    }
    if (showToast) {
      showToast(`🗑️ Member ${member.name} removed from property.`);
    }
  };

  return (
    <div className="my-team-container" onClick={() => setOpenActionMenuId(null)}>
      {/* 1. Top Header Bar matching OTAL PMS */}
      <header className="my-team-top-header">
        <div className="my-team-breadcrumbs">
          <span className="my-team-crumb-home">
            <Home size={14} />
          </span>
          <span className="my-team-crumb-link">PMS</span>
          <span className="my-team-crumb-sep">&gt;</span>
          <span className="my-team-crumb-active">My Team</span>
        </div>

        {/* Open Cash Drawer Amber Pill Button (Matches Image 1) */}
        <button
          type="button"
          className="my-team-cash-drawer-pill"
          onClick={onOpenCashDrawer}
          title="Open Register Cash Drawer"
        >
          <Archive size={14} strokeWidth={2.2} />
          <span>Open Cash Drawer</span>
        </button>
      </header>

      {/* 2. Controls Bar: Property Dropdown & Search & Invite CTA */}
      <div className="my-team-controls-bar">
        <div />

        <div className="my-team-controls-right">
          {/* Property Selector Dropdown */}
          <div className="my-team-property-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="my-team-property-selector-btn"
              onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
            >
              <Building2 size={15} color="#64748B" />
              <span>{selectedProperty}</span>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {isPropertyDropdownOpen && (
              <div className="my-team-property-menu">
                {propertiesList.map((propName) => (
                  <div
                    key={propName}
                    className={`my-team-property-option ${selectedProperty === propName ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedProperty(propName);
                      setIsPropertyDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    <Building2 size={14} />
                    <span>{propName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search by name or email... */}
          <div className="my-team-search-wrap">
            <Search size={14} color="#94A3B8" className="my-team-search-icon" />
            <input
              type="text"
              className="my-team-search-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Primary Blue Invite CTA Button (visible when members exist) */}
          {eligibleMembers.length > 0 && (
            <button
              type="button"
              className="my-team-btn-invite"
              onClick={handleOpenAddModal}
            >
              <UserPlus size={15} />
              <span>+ Invite Members</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Content: Empty State vs Data Table */}
      <div className="my-team-content-area">
        {eligibleMembers.length === 0 ? (
          /* EMPTY STATE - Pixel Perfect Match to Screenshot */
          <div className="my-team-empty-state">
            <div className="my-team-empty-icon-box">
              <Users size={28} color="#64748B" />
            </div>

            <h2 className="my-team-empty-title">No Team Members Yet</h2>
            <p className="my-team-empty-sub">
              Get started by inviting your first team member to collaborate on your property.
            </p>

            <button
              type="button"
              className="my-team-empty-btn-cta"
              onClick={handleOpenAddModal}
            >
              <UserPlus size={16} />
              <span>+ Invite Members</span>
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          /* Search Empty State */
          <div className="my-team-no-search-results">
            <p>No team members match your filter criteria.</p>
            <button
              type="button"
              className="my-team-link-reset"
              onClick={() => setSearchQuery('')}
            >
              Reset Search
            </button>
          </div>
        ) : (
          /* TEAM MEMBERS TABLE */
          <div className="my-team-table-card">
            <div className="my-team-table-wrapper">
              <table className="my-team-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Member</th>
                    <th style={{ width: '20%' }}>Role</th>
                    <th style={{ width: '20%' }}>Properties</th>
                    <th style={{ width: '14%' }}>Invited At</th>
                    <th style={{ width: '12%' }}>Status</th>
                    <th style={{ width: '6%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((member) => {
                    const initials =
                      member.initials ||
                      (member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase());

                    const isInvited = member.status === 'INVITED';
                    const isActive = member.status === 'ACTIVE';

                    return (
                      <tr key={member.id} className="my-team-row">
                        {/* 1. Member Column */}
                        <td>
                          <div className="my-team-member-cell">
                            <div className="my-team-avatar-circle">
                              {initials}
                            </div>
                            <div className="my-team-member-info">
                              <span className="my-team-member-name">{member.name || 'Invited Staff'}</span>
                              <span className="my-team-member-email">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role Badge */}
                        <td>
                          <span className="my-team-role-pill">
                            {member.role || 'Hotel Manager / GM'}
                          </span>
                        </td>

                        {/* 3. Properties Badge */}
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {member.properties && member.properties.length > 0 ? (
                              member.properties.map((prop) => (
                                <span key={prop} className="my-team-property-pill">
                                  {prop}
                                </span>
                              ))
                            ) : (
                              <span className="my-team-property-pill">{currentProperty}</span>
                            )}
                          </div>
                        </td>

                        {/* 4. Invited At */}
                        <td>
                          <span className="my-team-date-text">
                            {member.invitedAt || '11 Nov 2026'}
                          </span>
                        </td>

                        {/* 5. Status Badge */}
                        <td>
                          {isInvited && (
                            <span className="my-team-status-pill invited">
                              Invited
                            </span>
                          )}
                          {isActive && (
                            <span className="my-team-status-pill active">
                              Active
                            </span>
                          )}
                        </td>

                        {/* 6. Action Menu */}
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <button
                            type="button"
                            className="my-team-action-dots-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(openActionMenuId === member.id ? null : member.id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Action Popover Menu */}
                          {openActionMenuId === member.id && (
                            <div
                              className="my-team-action-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isInvited && (
                                <>
                                  <button
                                    type="button"
                                    className="my-team-action-item"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setPreviewEmailMember(member);
                                    }}
                                  >
                                    <Mail size={14} color="#2563EB" />
                                    <span>Preview Invite Email</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="my-team-action-item"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      if (onNavigateToAccept && member.invitationToken) {
                                        onNavigateToAccept(member.invitationToken);
                                      }
                                    }}
                                  >
                                    <ExternalLink size={14} color="#059669" />
                                    <span>Open Accept Flow</span>
                                  </button>
                                  <div className="my-team-menu-divider" />
                                  <button
                                    type="button"
                                    className="my-team-action-item danger"
                                    onClick={() => handleRemoveInvite(member)}
                                  >
                                    <Trash2 size={14} />
                                    <span>Remove Invitation</span>
                                  </button>
                                </>
                              )}

                              {isActive && (
                                <>
                                  <button
                                    type="button"
                                    className="my-team-action-item"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setEditingMember(member);
                                    }}
                                  >
                                    <Pencil size={14} color="#334155" />
                                    <span>Edit Member</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="my-team-action-item"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      if (onManagePermissions) {
                                        onManagePermissions(member.id);
                                      }
                                    }}
                                  >
                                    <Lock size={14} color="#334155" />
                                    <span>Manage Permissions</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="my-team-action-item danger"
                                    onClick={() => handleRemoveActiveMember(member)}
                                  >
                                    <Trash2 size={14} color="#EF4444" />
                                    <span>Remove Member</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="my-team-pagination-footer">
              <span className="my-team-pagination-text">
                Showing {totalResults > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalResults)} of {totalResults} results
              </span>

              <div className="my-team-pagination-controls">
                <button
                  type="button"
                  className="my-team-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </button>
                <button type="button" className="my-team-page-btn active">
                  {currentPage}
                </button>
                <button
                  type="button"
                  className="my-team-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        propertiesList={propertiesList}
        currentProperty={currentProperty}
        onSendInvitations={handleSendInvitations}
      />

      {/* Edit Team Member Modal (Matches Image 2) */}
      <EditTeamMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        propertiesList={propertiesList}
        onUpdateMember={onUpdateMember}
        showToast={showToast}
      />

      {/* Invitation Email Preview Modal */}
      <InviteEmailModal
        isOpen={!!previewEmailMember}
        onClose={() => setPreviewEmailMember(null)}
        member={previewEmailMember}
        organizationName={currentProperty}
        inviterName="Astha India"
        onNavigateToAccept={(tok) => {
          setPreviewEmailMember(null);
          if (onNavigateToAccept) onNavigateToAccept(tok);
        }}
      />
    </div>
  );
}

