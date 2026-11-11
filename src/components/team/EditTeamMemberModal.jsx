import React, { useState, useRef, useEffect } from 'react';
import { Users, X, ChevronDown, ChevronUp, Building2, Check } from 'lucide-react';
import { PREDEFINED_ROLES } from '../../data/rolePresets';

export default function EditTeamMemberModal({
  isOpen,
  onClose,
  member,
  propertiesList = ['HOTEL ASTHA'],
  onUpdateMember,
  showToast
}) {
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [propertyRoles, setPropertyRoles] = useState({});
  const [isPropDropdownOpen, setIsPropDropdownOpen] = useState(false);
  const [openRoleDropdownProp, setOpenRoleDropdownProp] = useState(null);

  const propDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Initialize form state when member changes or modal opens
  useEffect(() => {
    if (member) {
      const initialProps =
        member.properties && member.properties.length > 0
          ? [...member.properties]
          : [propertiesList[0] || 'HOTEL ASTHA'];
      setSelectedProperties(initialProps);

      // Pre-fill role for each property
      const initialRoles = {};
      initialProps.forEach((prop) => {
        initialRoles[prop] = member.role || 'Hotel Manager / GM';
      });
      setPropertyRoles(initialRoles);
    }
    setIsPropDropdownOpen(false);
    setOpenRoleDropdownProp(null);
  }, [member, isOpen, propertiesList]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (propDropdownRef.current && !propDropdownRef.current.contains(event.target)) {
        setIsPropDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setOpenRoleDropdownProp(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen || !member) return null;

  const handleToggleProperty = (propName) => {
    if (selectedProperties.includes(propName)) {
      if (selectedProperties.length === 1) return; // Keep at least one property selected
      setSelectedProperties(selectedProperties.filter((p) => p !== propName));
    } else {
      setSelectedProperties([...selectedProperties, propName]);
      if (!propertyRoles[propName]) {
        setPropertyRoles((prev) => ({
          ...prev,
          [propName]: member.role || 'Hotel Manager / GM'
        }));
      }
    }
  };

  const handleSelectRole = (propName, roleName) => {
    setPropertyRoles((prev) => ({
      ...prev,
      [propName]: roleName
    }));
    setOpenRoleDropdownProp(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProperties.length === 0) return;

    // Primary role from first assigned property
    const primaryRole = propertyRoles[selectedProperties[0]] || member.role || 'Hotel Manager / GM';

    if (onUpdateMember) {
      onUpdateMember(member.id, {
        role: primaryRole,
        properties: selectedProperties,
        propertyRoles
      });
    }

    if (showToast) {
      showToast('Success: Team member updated successfully');
    }

    onClose();
  };

  return (
    <div className="team-drawer-overlay" onClick={onClose}>
      <div
        className="team-drawer-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="team-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="team-drawer-icon-badge">
              <Users size={18} color="#2563EB" />
            </div>
            <h3 className="team-drawer-title">Edit Team Member</h3>
          </div>
          <button
            type="button"
            className="team-drawer-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Form */}
        <form onSubmit={handleSubmit} className="team-drawer-form">
          <div className="team-drawer-body">
            {/* Field 1: Email Address (Read-Only) */}
            <div className="team-drawer-field">
              <label className="team-drawer-label">
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>

              <div className="team-drawer-email-input-wrap">
                <input
                  type="email"
                  className="team-drawer-input"
                  style={{
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                    cursor: 'not-allowed',
                    borderColor: '#E2E8F0'
                  }}
                  value={member.email || ''}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Field 2: Assign Properties */}
            <div className="team-drawer-field" ref={propDropdownRef}>
              <div className="team-drawer-field-header">
                <label className="team-drawer-label">
                  Assign Properties <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <span className="team-drawer-counter">
                  My Properties ({selectedProperties.length})
                </span>
              </div>

              <div className="team-drawer-prop-selector-wrap">
                <button
                  type="button"
                  className={`team-drawer-select-box ${isPropDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsPropDropdownOpen(!isPropDropdownOpen)}
                >
                  <span className="team-drawer-select-val">
                    {selectedProperties.join(', ')}
                  </span>
                  <ChevronDown
                    size={16}
                    color="#94A3B8"
                    className={`team-drawer-chevron ${isPropDropdownOpen ? 'rotated' : ''}`}
                  />
                </button>

                {isPropDropdownOpen && (
                  <div className="team-drawer-prop-dropdown">
                    {propertiesList.map((propName) => {
                      const isChecked = selectedProperties.includes(propName);
                      return (
                        <div
                          key={propName}
                          className={`team-drawer-prop-item ${isChecked ? 'active' : ''}`}
                          onClick={() => handleToggleProperty(propName)}
                        >
                          <div className={`team-drawer-checkbox ${isChecked ? 'checked' : ''}`}>
                            {isChecked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                          </div>
                          <Building2 size={15} color={isChecked ? '#2563EB' : '#64748B'} />
                          <span>{propName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Field 3: Roles per Property */}
            <div className="team-drawer-field" ref={roleDropdownRef}>
              <label className="team-drawer-label">
                Roles per Property <span style={{ color: '#EF4444' }}>*</span>
              </label>

              <div className="team-drawer-roles-list">
                {selectedProperties.map((propName) => {
                  const currentRole = propertyRoles[propName] || member.role || 'Hotel Manager / GM';
                  const isOpen = openRoleDropdownProp === propName;

                  return (
                    <div key={propName} className="team-drawer-role-row">
                      <div className="team-drawer-role-prop-name">
                        {propName}
                      </div>

                      <div className="team-drawer-role-select-wrap">
                        <button
                          type="button"
                          className={`team-drawer-role-select-btn ${isOpen ? 'open' : ''}`}
                          onClick={() => setOpenRoleDropdownProp(isOpen ? null : propName)}
                        >
                          <span
                            className={currentRole ? 'text-selected' : 'text-placeholder'}
                            style={{
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {currentRole || 'Select role...'}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={16} color="#2563EB" />
                          ) : (
                            <ChevronDown size={16} color="#94A3B8" />
                          )}
                        </button>

                        {/* Dropdown Menu matching Image 2 with checkmark */}
                        {isOpen && (
                          <div className="team-drawer-role-menu">
                            {PREDEFINED_ROLES.map((roleOpt) => {
                              const isSelected = currentRole === roleOpt;
                              return (
                                <div
                                  key={roleOpt}
                                  className={`team-drawer-role-item ${isSelected ? 'active' : ''}`}
                                  onClick={() => handleSelectRole(propName, roleOpt)}
                                >
                                  <span>{roleOpt}</span>
                                  {isSelected && (
                                    <Check size={14} color="#2563EB" strokeWidth={2.5} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="team-drawer-footer">
            <button
              type="button"
              className="team-drawer-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="team-drawer-btn-submit"
            >
              Update Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

