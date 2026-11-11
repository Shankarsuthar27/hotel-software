import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Calendar,
  CalendarCheck2,
  Eye,
  PlusCircle,
  Moon,
  BarChart2,
  LayoutDashboard,
  Tag,
  Receipt,
  Percent,
  Package,
  FileText,
  Archive,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  Lock,
  AlertTriangle,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Database,
  Settings,
  BedDouble,
  UtensilsCrossed,
  Building,
  Building2,
  ArrowLeft,
  Save,
  Home,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Copy,
  SlidersHorizontal
} from 'lucide-react';
import { FULL_PERMISSIONS_TEMPLATE, getRoleDefaultPermissions } from '../../data/rolePresets';
import './permissions-view.css';

/**
 * OtalSwitch Component
 * Exact match to OTAL PMS switch toggle from screenshots:
 * 44px capsule pill, vibrant blue #2563EB when active, soft slate #CBD5E1 when inactive,
 * with smooth 18px white circle knob translating 20px.
 */
const OtalSwitch = ({ checked, onChange, disabled = false, ariaLabel = "Toggle permission" }) => (
  <button
    type="button"
    role="switch"
    aria-checked={!!checked}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled && onChange) onChange(!checked);
    }}
    className={`perm-switch ${checked ? 'active' : ''} ${disabled ? 'disabled cursor-not-allowed opacity-85' : ''}`}
  >
    <div className="perm-switch-knob" />
  </button>
);

/**
 * OtalCheckItem Component
 * Circular blue checkmark [✔] with white tick and title label matching the screenshots.
 */
const OtalCheckItem = ({ checked, onChange, label, disabled = false }) => (
  <label
    className={`perm-sub-check-item ${disabled ? 'cursor-not-allowed opacity-85 pointer-events-none' : ''}`}
    onClick={(e) => {
      e.preventDefault();
      if (!disabled && onChange) onChange(!checked);
    }}
  >
    <div className={`perm-circle-check ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}>
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <span className="perm-sub-check-label">{label}</span>
  </label>
);

export default function TeamPermissionsView({
  teamMembers = [],
  currentUser = {},
  propertiesList = ['HOTEL ASTHA'],
  currentProperty = 'HOTEL ASTHA',
  initialMemberId,
  initialSubtab,
  onSaveGranularPermissions,
  onOpenCashDrawer,
  onBack,
  showToast
}) {
  const [activeSubtab, setActiveSubtab] = useState(initialSubtab || 'my_permissions');

  // My Permissions is strictly unchangeable / read-only
  const isReadOnly = activeSubtab === 'my_permissions';

  // Selected Team Member for 'manage_team' tab
  const nonOwnerMembers = teamMembers.filter((m) => m.role !== 'Owner');
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || '');

  // Dropdown states for Manage Team selector card
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [isCopyUsersDropdownOpen, setIsCopyUsersDropdownOpen] = useState(false);
  const [copyToUsers, setCopyToUsers] = useState([]);

  const memberDropdownRef = useRef(null);
  const propertyDropdownRef = useRef(null);
  const copyUsersDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setIsMemberDropdownOpen(false);
      }
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target)) {
        setIsPropertyDropdownOpen(false);
      }
      if (copyUsersDropdownRef.current && !copyUsersDropdownRef.current.contains(event.target)) {
        setIsCopyUsersDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    }
    if (initialSubtab) {
      setActiveSubtab(initialSubtab);
    }
  }, [initialMemberId, initialSubtab]);

  // Selected Target Property
  const [targetProperty, setTargetProperty] = useState(currentProperty);

  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId);

  // Active permissions object being edited
  const [permissions, setPermissions] = useState(() => {
    return JSON.parse(JSON.stringify(FULL_PERMISSIONS_TEMPLATE));
  });

  // Synchronize when switching tabs or selected team member
  useEffect(() => {
    if (activeSubtab === 'my_permissions') {
      if (currentUser?.permissions) {
        setPermissions(JSON.parse(JSON.stringify(currentUser.permissions)));
      } else {
        setPermissions(JSON.parse(JSON.stringify(FULL_PERMISSIONS_TEMPLATE)));
      }
    } else {
      if (selectedMember?.permissions) {
        setPermissions(JSON.parse(JSON.stringify(selectedMember.permissions)));
      } else if (selectedMember?.role) {
        setPermissions(getRoleDefaultPermissions(selectedMember.role));
      } else {
        setPermissions(JSON.parse(JSON.stringify(FULL_PERMISSIONS_TEMPLATE)));
      }
    }
  }, [activeSubtab, selectedMemberId, selectedMember, currentUser]);

  const handleSelectMember = (member) => {
    setSelectedMemberId(member.id);
    setIsMemberDropdownOpen(false);
    setMemberSearchQuery('');
    if (member.properties && member.properties.length > 0) {
      setTargetProperty(member.properties[0]);
    } else {
      setTargetProperty(currentProperty);
    }
  };

  const filteredSearchMembers = nonOwnerMembers.filter((m) => {
    const q = memberSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  });

  // Master "Allow All" Toggle Handler
  const handleToggleAllowAll = () => {
    if (isReadOnly) return;
    const nextVal = !permissions.allowAll;

    const setObjValues = (obj, val) => {
      const copy = {};
      Object.keys(obj || {}).forEach((key) => {
        if (typeof obj[key] === 'boolean') {
          copy[key] = val;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          copy[key] = setObjValues(obj[key], val);
        } else {
          copy[key] = obj[key];
        }
      });
      return copy;
    };

    const newPerms = setObjValues(permissions, nextVal);
    newPerms.allowAll = nextVal;
    setPermissions(newPerms);
  };

  // Toggle category level switch
  const handleToggle = (path) => {
    if (isReadOnly) return;
    setPermissions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = !current[parts[parts.length - 1]];
      return copy;
    });
  };

  // Advanced Matrix: Row All toggle
  const handleToggleAdvancedRowAll = (rowKey, keys) => {
    if (isReadOnly) return;
    setPermissions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy.advanced) copy.advanced = {};
      if (!copy.advanced[rowKey]) copy.advanced[rowKey] = {};

      const currentAll = !!copy.advanced[rowKey].all;
      const nextAll = !currentAll;

      copy.advanced[rowKey].all = nextAll;
      keys.forEach((k) => {
        copy.advanced[rowKey][k] = nextAll;
      });

      return copy;
    });
  };

  // Advanced Matrix: Individual flag toggle
  const handleToggleAdvancedFlag = (rowKey, flagKey, allKeys) => {
    if (isReadOnly) return;
    setPermissions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy.advanced) copy.advanced = {};
      if (!copy.advanced[rowKey]) copy.advanced[rowKey] = {};

      const nextVal = !copy.advanced[rowKey][flagKey];
      copy.advanced[rowKey][flagKey] = nextVal;

      // Check if all keys are true
      const allTrue = allKeys.every((k) => (k === flagKey ? nextVal : !!copy.advanced[rowKey][k]));
      copy.advanced[rowKey].all = allTrue;

      return copy;
    });
  };

  const handleReset = () => {
    if (isReadOnly || !selectedMemberId) return;
    if (selectedMember?.role) {
      const defaultPerms = getRoleDefaultPermissions(selectedMember.role);
      setPermissions(defaultPerms);
      if (showToast) {
        showToast(`Permissions reset to default ${selectedMember.role} privileges.`);
      }
    } else {
      setPermissions(JSON.parse(JSON.stringify(FULL_PERMISSIONS_TEMPLATE)));
      if (showToast) {
        showToast('Permissions reset to defaults.');
      }
    }
  };

  const handleSave = () => {
    if (isReadOnly) return;
    if (!selectedMemberId) {
      if (showToast) showToast('Please select a team member first.');
      return;
    }
    if (onSaveGranularPermissions) {
      onSaveGranularPermissions(selectedMemberId, permissions, [targetProperty], copyToUsers);
    }
    const memberName = selectedMember?.name || selectedMember?.email || 'Team Member';
    if (showToast) {
      if (copyToUsers.length > 0) {
        showToast(`Success: Permissions saved for ${memberName} and copied to ${copyToUsers.length} other user(s).`);
      } else {
        showToast(`Success: Permissions saved for ${memberName} (${targetProperty}).`);
      }
    }
  };

  return (
    <div className="permissions-page-container">
      {/* 1. Top Header Bar */}
      <header className="permissions-top-header">
        <div className="permissions-breadcrumbs">
          <span className="permissions-crumb-home">
            <Home size={14} />
          </span>
          <span className="permissions-crumb-link">PMS</span>
          <span className="permissions-crumb-sep">&gt;</span>
          <span className="permissions-crumb-active">Permissions</span>
        </div>

        {/* Amber Open Cash Drawer Pill Button */}
        <button
          type="button"
          className="permissions-cash-drawer-pill"
          onClick={onOpenCashDrawer}
          title="Open Register Cash Drawer"
        >
          <Archive size={14} strokeWidth={2.2} />
          <span>Open Cash Drawer</span>
        </button>
      </header>

      {/* 2. Subtabs Navigation Bar */}
      <div className="permissions-subtabs-nav">
        <button
          type="button"
          className={`permissions-subtab-link ${activeSubtab === 'my_permissions' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('my_permissions')}
        >
          My Permissions
        </button>
        <button
          type="button"
          className={`permissions-subtab-link ${activeSubtab === 'manage_team' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('manage_team')}
        >
          Manage Team
        </button>
      </div>

      {/* View-Only Notice Banner when on My Permissions */}
      {isReadOnly && (
        <div className="permissions-readonly-notice">
          <ShieldCheck size={15} color="#2563EB" />
          <span>You are viewing your own assigned permissions (Read-Only). To customize staff privileges, switch to the <strong>Manage Team</strong> tab.</span>
        </div>
      )}

      {/* 3. Manage Team Selector Card (Matches Images 1, 2, 4) */}
      {activeSubtab === 'manage_team' && (
        <div className="permissions-selector-card">
          {/* Row 1: Select Team Member */}
          <div className="permissions-selector-row">
            <div className="permissions-selector-left">
              <div className="permissions-selector-icon-wrap blue">
                <UserCheck size={20} />
              </div>
              <div className="permissions-selector-title-wrap">
                <h4 className="permissions-selector-title">Select Team Member</h4>
                <p className="permissions-selector-sub">Choose a team member to manage</p>
              </div>
            </div>

            <div className="permissions-selector-right" ref={memberDropdownRef}>
              <button
                type="button"
                className={`permissions-selector-btn ${isMemberDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
              >
                <span className={selectedMember ? 'btn-text-selected' : 'btn-text-placeholder'}>
                  {selectedMember ? selectedMember.name || selectedMember.email : 'Select a user...'}
                </span>
                <ChevronsUpDown size={15} color="#94A3B8" />
              </button>

              {isMemberDropdownOpen && (
                <div className="permissions-selector-menu">
                  {/* Search box matching Image 2 */}
                  <div className="permissions-selector-search-box">
                    <input
                      type="text"
                      className="permissions-selector-search-input"
                      placeholder="Search..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {filteredSearchMembers.length === 0 ? (
                    <div className="permissions-selector-empty">No members found</div>
                  ) : (
                    filteredSearchMembers.map((m) => {
                      const isSel = m.id === selectedMemberId;
                      return (
                        <div
                          key={m.id}
                          className={`permissions-selector-option ${isSel ? 'active' : ''}`}
                          onClick={() => handleSelectMember(m)}
                        >
                          <span>{m.name || m.email}</span>
                          {isSel && <Check size={14} color="#2563EB" strokeWidth={2.5} />}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Target Properties */}
          <div className="permissions-selector-row">
            <div className="permissions-selector-left">
              <div className="permissions-selector-icon-wrap green">
                <Building2 size={20} />
              </div>
              <div className="permissions-selector-title-wrap">
                <div className="permissions-selector-title-row">
                  <h4 className="permissions-selector-title">Target Properties</h4>
                  <span className="permissions-selector-badge required">REQUIRED</span>
                </div>
                <p className="permissions-selector-sub">Select properties to apply these permissions to</p>
              </div>
            </div>

            <div className="permissions-selector-right" ref={propertyDropdownRef}>
              {!selectedMember ? (
                <button
                  type="button"
                  className="permissions-selector-btn disabled"
                  disabled
                >
                  <span className="btn-text-placeholder">Select User First</span>
                  <ChevronDown size={15} color="#CBD5E1" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`permissions-selector-btn ${isPropertyDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                  >
                    <span className="btn-text-selected">{targetProperty}</span>
                    <ChevronDown size={15} color="#64748B" />
                  </button>

                  {isPropertyDropdownOpen && (
                    <div className="permissions-selector-menu">
                      {propertiesList.map((p) => {
                        const isSel = p === targetProperty;
                        return (
                          <div
                            key={p}
                            className={`permissions-selector-option ${isSel ? 'active' : ''}`}
                            onClick={() => {
                              setTargetProperty(p);
                              setIsPropertyDropdownOpen(false);
                            }}
                          >
                            <span>{p}</span>
                            {isSel && <Check size={14} color="#2563EB" strokeWidth={2.5} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Row 3: Copy to Other Users */}
          <div className="permissions-selector-row">
            <div className="permissions-selector-left">
              <div className="permissions-selector-icon-wrap purple">
                <Copy size={20} />
              </div>
              <div className="permissions-selector-title-wrap">
                <div className="permissions-selector-title-row">
                  <h4 className="permissions-selector-title">Copy to Other Users</h4>
                  <span className="permissions-selector-badge optional">OPTIONAL</span>
                </div>
                <p className="permissions-selector-sub">Apply the same permissions to other team members</p>
              </div>
            </div>

            <div className="permissions-selector-right" ref={copyUsersDropdownRef}>
              {!selectedMember ? (
                <button
                  type="button"
                  className="permissions-selector-btn disabled"
                  disabled
                >
                  <span className="btn-text-placeholder">Select User First</span>
                  <ChevronDown size={15} color="#CBD5E1" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`permissions-selector-btn ${isCopyUsersDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsCopyUsersDropdownOpen(!isCopyUsersDropdownOpen)}
                  >
                    <span className={copyToUsers.length > 0 ? 'btn-text-selected' : 'btn-text-placeholder'}>
                      {copyToUsers.length === 0
                        ? 'Select Users To Copy To...'
                        : `${copyToUsers.length} user(s) selected`}
                    </span>
                    <ChevronDown size={15} color="#64748B" />
                  </button>

                  {isCopyUsersDropdownOpen && (
                    <div className="permissions-selector-menu">
                      {nonOwnerMembers
                        .filter((m) => m.id !== selectedMemberId)
                        .map((m) => {
                          const isChecked = copyToUsers.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              className={`permissions-selector-option ${isChecked ? 'active' : ''}`}
                              onClick={() => {
                                if (isChecked) {
                                  setCopyToUsers(copyToUsers.filter((id) => id !== m.id));
                                } else {
                                  setCopyToUsers([...copyToUsers, m.id]);
                                }
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  style={{ cursor: 'pointer' }}
                                />
                                <span>{m.name || m.email}</span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>{m.role}</span>
                            </div>
                          );
                        })}
                      {nonOwnerMembers.filter((m) => m.id !== selectedMemberId).length === 0 && (
                        <div className="permissions-selector-empty">No other team members</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Permissions Matrix or Empty State */}
      {activeSubtab === 'manage_team' && !selectedMember ? (
        /* Empty State Matching Image 3 */
        <div className="permissions-empty-state-card">
          <div className="permissions-empty-icon-wrap">
            <UserX size={24} color="#64748B" />
          </div>
          <h3 className="permissions-empty-title">No Team Member Selected</h3>
          <p className="permissions-empty-sub">
            Please select a team member and at least one property from the dropdowns above to manage their permissions.
          </p>
        </div>
      ) : (
        /* Permissions Matrix Cards Container */
        <div className="permissions-cards-stream">
          {/* Header matching Image 4 */}
          {activeSubtab === 'manage_team' && (
            <div className="permissions-matrix-header">
              <h3 className="permissions-matrix-title">Custom Permissions</h3>
              <span className="permissions-matrix-context">
                Showing permissions for: <strong className="permissions-matrix-prop">{targetProperty}</strong>
              </span>
            </div>
          )}
        {/* CARD 1: Grant Complete Access */}
        <div className="permissions-master-card">
          <div className="permissions-master-left">
            <div className="permissions-icon-box blue-theme">
              <ShieldCheck size={22} color="#2563EB" />
            </div>
            <div>
              <h3 className="permissions-master-title">Grant Complete Access</h3>
              <p className="permissions-master-sub">Instantly enable or disable all permissions below</p>
            </div>
          </div>

          <div
            className={`permissions-master-right ${isReadOnly ? 'pointer-events-none' : ''}`}
            title={isReadOnly ? "Permissions are in view-only mode" : ""}
          >
            <span className="permissions-allow-all-label">Allow All</span>
            <OtalSwitch
              checked={permissions.allowAll}
              onChange={handleToggleAllowAll}
              disabled={isReadOnly}
              ariaLabel="Grant Complete Access (Allow All)"
            />
          </div>
        </div>

        {/* CARD 2: Reservations */}
        <div className="permissions-card">
          <div className="permissions-card-header blue-tint">
            <div className="permissions-icon-box blue-theme">
              <CalendarCheck2 size={20} color="#2563EB" />
            </div>
            <div>
              <h4 className="permissions-card-title">Reservations</h4>
              <p className="permissions-card-sub">Manage bookings and calendar access</p>
            </div>
          </div>

          {/* Row 1: View Reservations */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Eye size={18} />
              </div>
              <div>
                <div className="perm-item-title">View Reservations</div>
                <div className="perm-item-sub">Who can see reservations?</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.reservations?.view}
              onChange={() => handleToggle('reservations.view')}
              disabled={isReadOnly}
              ariaLabel="View Reservations"
            />
          </div>

          {/* Row 2: Create Reservation */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <PlusCircle size={18} />
              </div>
              <div>
                <div className="perm-item-title">Create Reservation</div>
                <div className="perm-item-sub">Allow creating new bookings</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.reservations?.create}
              onChange={() => handleToggle('reservations.create')}
              disabled={isReadOnly}
              ariaLabel="Create Reservation"
            />
          </div>

          {/* Sub-action Checkbox Strip under Create Reservation */}
          <div className="perm-sub-actions-strip">
            {[
              { key: 'checkIn', label: 'Check In' },
              { key: 'checkOut', label: 'Check Out' },
              { key: 'assignRoom', label: 'Assign Room' },
              { key: 'roomMove', label: 'Room Move' },
              { key: 'amendStay', label: 'Amend Stay' },
              { key: 'noShow', label: 'No Show' },
              { key: 'cancel', label: 'Cancel Reservation' },
              { key: 'posVoucher', label: 'Res Voucher' },
              { key: 'estimateInvoice', label: 'Estimate Invoice' }
            ].map((act) => (
              <OtalCheckItem
                key={act.key}
                checked={!!permissions.reservations?.actions?.[act.key]}
                onChange={() => handleToggle(`reservations.actions.${act.key}`)}
                label={act.label}
                disabled={isReadOnly}
              />
            ))}
          </div>

          {/* Row 3: Night Audit */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Moon size={18} />
              </div>
              <div>
                <div className="perm-item-title">Night Audit</div>
                <div className="perm-item-sub">Allow performing night audit operations</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.reservations?.nightAudit}
              onChange={() => handleToggle('reservations.nightAudit')}
              disabled={isReadOnly}
              ariaLabel="Night Audit"
            />
          </div>
        </div>

        {/* CARD 3: Dashboard & Analytics */}
        <div className="permissions-card">
          <div className="permissions-card-header yellow-tint">
            <div className="permissions-icon-box yellow-theme">
              <BarChart2 size={20} color="#D97706" />
            </div>
            <div>
              <h4 className="permissions-card-title">Dashboard & Analytics</h4>
              <p className="permissions-card-sub">Access to dashboard summaries and calendar views</p>
            </div>
          </div>

          {/* Row 1: View Dashboard */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <div className="perm-item-title">View Dashboard</div>
                <div className="perm-item-sub">Ability to view the main dashboard and analytics</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.dashboard?.viewDashboard}
              onChange={() => handleToggle('dashboard.viewDashboard')}
              disabled={isReadOnly}
              ariaLabel="View Dashboard"
            />
          </div>

          {/* Row 2: View Calendar */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Calendar size={18} />
              </div>
              <div>
                <div className="perm-item-title">View Calendar</div>
                <div className="perm-item-sub">Ability to view room status on the calendar</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.dashboard?.viewCalendar}
              onChange={() => handleToggle('dashboard.viewCalendar')}
              disabled={isReadOnly}
              ariaLabel="View Calendar"
            />
          </div>
        </div>

        {/* CARD 4: Rates & Inventory Restrictions */}
        <div className="permissions-card">
          <div className="permissions-card-header blue-tint">
            <div className="permissions-icon-box blue-theme">
              <Tag size={20} color="#2563EB" />
            </div>
            <div>
              <h4 className="permissions-card-title">Rates & Inventory Restrictions</h4>
              <p className="permissions-card-sub">Control access to rates, stop sells, CTA, CTD and night restrictions</p>
            </div>
          </div>

          {/* Row 1: View Rates & Inventory */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Eye size={18} />
              </div>
              <div>
                <div className="perm-item-title">View Rates & Inventory</div>
                <div className="perm-item-sub">Who can view rates and restrictions grid?</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.ratesInventory?.view}
              onChange={() => handleToggle('ratesInventory.view')}
              disabled={isReadOnly}
              ariaLabel="View Rates & Inventory"
            />
          </div>

          {/* Sub-action Checkbox Strip under Rates & Inventory */}
          <div className="perm-sub-actions-strip">
            {[
              { key: 'editRates', label: 'Edit Rates' },
              { key: 'stopSell', label: 'Stop Sell' },
              { key: 'cta', label: 'Closed to Arrival (CTA)' },
              { key: 'ctd', label: 'Closed to Departure (CTD)' },
              { key: 'minMaxNights', label: 'Min / Max Nights' }
            ].map((act) => (
              <OtalCheckItem
                key={act.key}
                checked={!!permissions.ratesInventory?.actions?.[act.key]}
                onChange={() => handleToggle(`ratesInventory.actions.${act.key}`)}
                label={act.label}
                disabled={isReadOnly}
              />
            ))}
          </div>
        </div>

        {/* CARD 5: Taxes & Addon Services */}
        <div className="permissions-card">
          <div className="permissions-card-header blue-tint">
            <div className="permissions-icon-box blue-theme">
              <Receipt size={20} color="#2563EB" />
            </div>
            <div>
              <h4 className="permissions-card-title">Taxes & Addon Services</h4>
              <p className="permissions-card-sub">Configure taxes, exemptions, and extra service charges</p>
            </div>
          </div>

          {/* Manage Taxes */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Percent size={18} />
              </div>
              <div>
                <div className="perm-item-title">Manage Taxes</div>
                <div className="perm-item-sub">Allow viewing and configuring hotel taxes, GST slabs, and exemptions</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.taxesAddons?.manageTaxes}
              onChange={() => handleToggle('taxesAddons.manageTaxes')}
              disabled={isReadOnly}
              ariaLabel="Manage Taxes"
            />
          </div>

          <div className="perm-sub-actions-strip">
            {[
              { key: 'createTax', label: 'Create Tax' },
              { key: 'editTax', label: 'Edit Tax' },
              { key: 'deleteTax', label: 'Delete Tax' },
              { key: 'exemptTax', label: 'Exempt Tax' }
            ].map((act) => (
              <OtalCheckItem
                key={act.key}
                checked={!!permissions.taxesAddons?.taxActions?.[act.key]}
                onChange={() => handleToggle(`taxesAddons.taxActions.${act.key}`)}
                label={act.label}
                disabled={isReadOnly}
              />
            ))}
          </div>

          {/* Manage Services */}
          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Package size={18} />
              </div>
              <div>
                <div className="perm-item-title">Manage Services</div>
                <div className="perm-item-sub">Allow viewing and configuring additional guest charges and services</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.taxesAddons?.manageServices}
              onChange={() => handleToggle('taxesAddons.manageServices')}
              disabled={isReadOnly}
              ariaLabel="Manage Services"
            />
          </div>

          <div className="perm-sub-actions-strip">
            {[
              { key: 'createService', label: 'Create Service' },
              { key: 'editService', label: 'Edit Service' },
              { key: 'deleteService', label: 'Delete Service' }
            ].map((act) => (
              <OtalCheckItem
                key={act.key}
                checked={!!permissions.taxesAddons?.serviceActions?.[act.key]}
                onChange={() => handleToggle(`taxesAddons.serviceActions.${act.key}`)}
                label={act.label}
                disabled={isReadOnly}
              />
            ))}
          </div>
        </div>

        {/* CARD 6: Reports */}
        <div className="permissions-card">
          <div className="permissions-card-header blue-tint">
            <div className="permissions-icon-box blue-theme">
              <FileText size={20} color="#2563EB" />
            </div>
            <div>
              <h4 className="permissions-card-title">Reports</h4>
              <p className="permissions-card-sub">Control access and download permissions for operational & financial reports</p>
            </div>
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <FileText size={18} />
              </div>
              <div>
                <div className="perm-item-title">Access Reports</div>
                <div className="perm-item-sub">Ability to view and download business reports</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.reports?.accessReports}
              onChange={() => handleToggle('reports.accessReports')}
              disabled={isReadOnly}
              ariaLabel="Access Reports"
            />
          </div>

          <div className="perm-sub-actions-strip">
            {[
              { key: 'managerReport', label: 'Manager Report' },
              { key: 'folioList', label: 'Folio List' },
              { key: 'nightAudit', label: 'Night Audit' },
              { key: 'reservationReport', label: 'Reservation Report' },
              { key: 'guestDetails', label: 'Guest Details' }
            ].map((act) => (
              <OtalCheckItem
                key={act.key}
                checked={!!permissions.reports?.reportActions?.[act.key]}
                onChange={() => handleToggle(`reports.reportActions.${act.key}`)}
                label={act.label}
                disabled={isReadOnly}
              />
            ))}
          </div>
        </div>

        {/* CARD 7: Cashier & Cash Drawer Management */}
        <div className="permissions-card">
          <div className="permissions-card-header green-tint">
            <div className="permissions-icon-box green-theme">
              <Archive size={20} color="#16A34A" />
            </div>
            <div>
              <h4 className="permissions-card-title">Cashier & Cash Drawer Management</h4>
              <p className="permissions-card-sub">Control shifts, cash drawers, petty cash payouts, safe drops, and supervisor handover</p>
            </div>
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Clock size={18} />
              </div>
              <div>
                <div className="perm-item-title">View Cashier & Shift Logs</div>
                <div className="perm-item-sub">Access cashier dashboard, active register status, and shift logs</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.viewShiftLogs}
              onChange={() => handleToggle('cashier.viewShiftLogs')}
              disabled={isReadOnly}
              ariaLabel="View Cashier & Shift Logs"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Archive size={18} />
              </div>
              <div>
                <div className="perm-item-title">Open Cashier Shift</div>
                <div className="perm-item-sub">Allow staff to clock into a cash drawer and set opening float</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.openShift}
              onChange={() => handleToggle('cashier.openShift')}
              disabled={isReadOnly}
              ariaLabel="Open Cashier Shift"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="perm-item-title">Close Shift & Handover</div>
                <div className="perm-item-sub">Allow staff to perform currency denomination count and close their own shift</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.closeShift}
              onChange={() => handleToggle('cashier.closeShift')}
              disabled={isReadOnly}
              ariaLabel="Close Shift & Handover"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <div className="perm-item-title">Petty Cash In / Out (Pay-In & Pay-Out)</div>
                <div className="perm-item-sub">Allow recording counter petty cash payouts, receipts, and float replenishments</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.pettyCash}
              onChange={() => handleToggle('cashier.pettyCash')}
              disabled={isReadOnly}
              ariaLabel="Petty Cash In / Out"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Lock size={18} />
              </div>
              <div>
                <div className="perm-item-title">Safe Drop (Transfer to Safe)</div>
                <div className="perm-item-sub">Allow dropping excess counter cash to the property safe during the shift</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.safeDrop}
              onChange={() => handleToggle('cashier.safeDrop')}
              disabled={isReadOnly}
              ariaLabel="Safe Drop"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="perm-item-title">Force-Close Shift (Supervisor)</div>
                <div className="perm-item-sub">Authorize supervisors to force-close abandoned shifts to unblock Night Audit</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.forceClose}
              onChange={() => handleToggle('cashier.forceClose')}
              disabled={isReadOnly}
              ariaLabel="Force-Close Shift"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <div className="perm-item-title">Manage Cash Drawers & Registers</div>
                <div className="perm-item-sub">Create and configure physical cash drawer registers and default float amounts</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.cashier?.manageRegisters}
              onChange={() => handleToggle('cashier.manageRegisters')}
              disabled={isReadOnly}
              ariaLabel="Manage Cash Drawers & Registers"
            />
          </div>
        </div>

        {/* CARD 8: Team */}
        <div className="permissions-card">
          <div className="permissions-card-header blue-tint">
            <div className="permissions-icon-box blue-theme">
              <Users size={20} color="#2563EB" />
            </div>
            <div>
              <h4 className="permissions-card-title">Team</h4>
              <p className="permissions-card-sub">Manage staff and permissions</p>
            </div>
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <Users size={18} />
              </div>
              <div>
                <div className="perm-item-title">View Team</div>
                <div className="perm-item-sub">View the list of active team members</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.team?.viewTeam}
              onChange={() => handleToggle('team.viewTeam')}
              disabled={isReadOnly}
              ariaLabel="View Team"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <UserPlus size={18} />
              </div>
              <div>
                <div className="perm-item-title">Member Management</div>
                <div className="perm-item-sub">Ability to invite new members or remove existing ones</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.team?.memberManagement}
              onChange={() => handleToggle('team.memberManagement')}
              disabled={isReadOnly}
              ariaLabel="Member Management"
            />
          </div>

          <div className="perm-item-row">
            <div className="perm-item-left">
              <div className="permissions-icon-box gray-theme">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="perm-item-title">Permission Management</div>
                <div className="perm-item-sub">Ability to grant, edit, or revoke permissions for other members</div>
              </div>
            </div>
            <OtalSwitch
              checked={permissions.team?.permissionManagement}
              onChange={() => handleToggle('team.permissionManagement')}
              disabled={isReadOnly}
              ariaLabel="Permission Management"
            />
          </div>
        </div>

        {/* CARD 9: Granular Bottom Checkbox Matrix */}
        <div className="permissions-advanced-card">
          {/* Row 1: Guest database & PII */}
          <div className="perm-adv-row">
            <div className="perm-adv-label-col">
              <Database size={16} color="#64748B" />
              <span>Control access to guest database and sensitive items (PII)</span>
            </div>
            <div className="perm-adv-checks-col">
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.guestDatabase?.all}
                  onChange={() => handleToggleAdvancedRowAll('guestDatabase', ['view', 'piiInfo'])}
                />
                <span>ALL</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.guestDatabase?.view}
                  onChange={() => handleToggleAdvancedFlag('guestDatabase', 'view', ['view', 'piiInfo'])}
                />
                <span>VIEW</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.guestDatabase?.piiInfo}
                  onChange={() => handleToggleAdvancedFlag('guestDatabase', 'piiInfo', ['view', 'piiInfo'])}
                />
                <span>PII INFO</span>
              </label>
            </div>
          </div>

          {/* Row 2: Settings, Overbooking, Night Audit Scheduling, API Keys */}
          <div className="perm-adv-row">
            <div className="perm-adv-label-col">
              <Settings size={16} color="#64748B" />
              <span>Control access to settings, overbooking, night audit scheduling, and API keys</span>
            </div>
            <div className="perm-adv-checks-col">
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.settings?.all}
                  onChange={() => handleToggleAdvancedRowAll('settings', ['view', 'overbooking', 'scheduleNightAudit', 'generateApiKey'])}
                />
                <span>ALL</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.settings?.view}
                  onChange={() => handleToggleAdvancedFlag('settings', 'view', ['view', 'overbooking', 'scheduleNightAudit', 'generateApiKey'])}
                />
                <span>VIEW</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.settings?.overbooking}
                  onChange={() => handleToggleAdvancedFlag('settings', 'overbooking', ['view', 'overbooking', 'scheduleNightAudit', 'generateApiKey'])}
                />
                <span>OVERBOOKING</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.settings?.scheduleNightAudit}
                  onChange={() => handleToggleAdvancedFlag('settings', 'scheduleNightAudit', ['view', 'overbooking', 'scheduleNightAudit', 'generateApiKey'])}
                />
                <span>SCHEDULE NIGHT AUDIT</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.settings?.generateApiKey}
                  onChange={() => handleToggleAdvancedFlag('settings', 'generateApiKey', ['view', 'overbooking', 'scheduleNightAudit', 'generateApiKey'])}
                />
                <span>GENERATE API KEY</span>
              </label>
            </div>
          </div>

          {/* Row 3: Rooms and room type inventory */}
          <div className="perm-adv-row">
            <div className="perm-adv-label-col">
              <BedDouble size={16} color="#64748B" />
              <span>Manage rooms and room type inventory</span>
            </div>
            <div className="perm-adv-checks-col">
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.roomInventory?.all}
                  onChange={() => handleToggleAdvancedRowAll('roomInventory', ['view', 'create', 'edit', 'delete', 'changeRoomStatus'])}
                />
                <span>ALL</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.roomInventory?.view}
                  onChange={() => handleToggleAdvancedFlag('roomInventory', 'view', ['view', 'create', 'edit', 'delete', 'changeRoomStatus'])}
                />
                <span>VIEW</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.roomInventory?.create}
                  onChange={() => handleToggleAdvancedFlag('roomInventory', 'create', ['view', 'create', 'edit', 'delete', 'changeRoomStatus'])}
                />
                <span>CREATE</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.roomInventory?.edit}
                  onChange={() => handleToggleAdvancedFlag('roomInventory', 'edit', ['view', 'create', 'edit', 'delete', 'changeRoomStatus'])}
                />
                <span>EDIT</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.roomInventory?.delete}
                  onChange={() => handleToggleAdvancedFlag('roomInventory', 'delete', ['view', 'create', 'edit', 'delete', 'changeRoomStatus'])}
                />
                <span>DELETE</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.roomInventory?.changeRoomStatus}
                  onChange={() => handleToggleAdvancedFlag('roomInventory', 'changeRoomStatus', ['view', 'create', 'edit', 'delete', 'changeRoomStatus'])}
                />
                <span>CHANGE ROOM STATUS</span>
              </label>
            </div>
          </div>

          {/* Row 4: Hotel meal options */}
          <div className="perm-adv-row">
            <div className="perm-adv-label-col">
              <UtensilsCrossed size={16} color="#64748B" />
              <span>Configure hotel meal options</span>
            </div>
            <div className="perm-adv-checks-col">
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.mealOptions?.all}
                  onChange={() => handleToggleAdvancedRowAll('mealOptions', ['view', 'create', 'edit', 'delete'])}
                />
                <span>ALL</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.mealOptions?.view}
                  onChange={() => handleToggleAdvancedFlag('mealOptions', 'view', ['view', 'create', 'edit', 'delete'])}
                />
                <span>VIEW</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.mealOptions?.create}
                  onChange={() => handleToggleAdvancedFlag('mealOptions', 'create', ['view', 'create', 'edit', 'delete'])}
                />
                <span>CREATE</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.mealOptions?.edit}
                  onChange={() => handleToggleAdvancedFlag('mealOptions', 'edit', ['view', 'create', 'edit', 'delete'])}
                />
                <span>EDIT</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.mealOptions?.delete}
                  onChange={() => handleToggleAdvancedFlag('mealOptions', 'delete', ['view', 'create', 'edit', 'delete'])}
                />
                <span>DELETE</span>
              </label>
            </div>
          </div>

          {/* Row 5: Business corporate accounts and market segments */}
          <div className="perm-adv-row">
            <div className="perm-adv-label-col">
              <Building size={16} color="#64748B" />
              <span>Manage business corporate accounts and market segments</span>
            </div>
            <div className="perm-adv-checks-col">
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.corporateAccounts?.all}
                  onChange={() => handleToggleAdvancedRowAll('corporateAccounts', ['view', 'create', 'edit', 'delete', 'viewArLedger'])}
                />
                <span>ALL</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.corporateAccounts?.view}
                  onChange={() => handleToggleAdvancedFlag('corporateAccounts', 'view', ['view', 'create', 'edit', 'delete', 'viewArLedger'])}
                />
                <span>VIEW</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.corporateAccounts?.create}
                  onChange={() => handleToggleAdvancedFlag('corporateAccounts', 'create', ['view', 'create', 'edit', 'delete', 'viewArLedger'])}
                />
                <span>CREATE</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.corporateAccounts?.edit}
                  onChange={() => handleToggleAdvancedFlag('corporateAccounts', 'edit', ['view', 'create', 'edit', 'delete', 'viewArLedger'])}
                />
                <span>EDIT</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.corporateAccounts?.delete}
                  onChange={() => handleToggleAdvancedFlag('corporateAccounts', 'delete', ['view', 'create', 'edit', 'delete', 'viewArLedger'])}
                />
                <span>DELETE</span>
              </label>
              <label className={`perm-adv-check ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={!!permissions.advanced?.corporateAccounts?.viewArLedger}
                  onChange={() => handleToggleAdvancedFlag('corporateAccounts', 'viewArLedger', ['view', 'create', 'edit', 'delete', 'viewArLedger'])}
                />
                <span>VIEW AR LEDGER</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 5. Sticky Footer Actions Bar */}
      <div className="permissions-sticky-footer">
        <button
          type="button"
          className="permissions-btn-back"
          onClick={onBack}
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>

        {activeSubtab === 'manage_team' && selectedMember && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="permissions-btn-reset"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="permissions-btn-save"
              onClick={handleSave}
            >
              <Save size={15} />
              <span>Save Permissions</span>
            </button>
          </div>
        )}

        {activeSubtab === 'my_permissions' && (
          <button
            type="button"
            className="permissions-btn-save disabled opacity-50 cursor-not-allowed"
            disabled
            title="Permissions are in view-only mode under My Permissions."
          >
            <span>View-Only Mode</span>
          </button>
        )}
      </div>
    </div>
  );
}
