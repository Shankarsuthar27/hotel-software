import React, { useState, useRef, useEffect } from 'react';
import { Users, X, Plus, ChevronDown, ChevronUp, AlertCircle, Building2, Check } from 'lucide-react';
import { PREDEFINED_ROLES } from '../../data/rolePresets';

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  propertiesList = ['HOTEL ASTHA'],
  currentProperty = 'HOTEL ASTHA',
  onSendInvitations
}) {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [emailError, setEmailError] = useState('');

  // Selected properties
  const [selectedProperties, setSelectedProperties] = useState([currentProperty]);
  const [isPropDropdownOpen, setIsPropDropdownOpen] = useState(false);

  // Roles per property map: { [propertyName]: roleString }
  const [propertyRoles, setPropertyRoles] = useState({});
  const [openRoleDropdownProp, setOpenRoleDropdownProp] = useState(null); // propName or null

  const propDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Close dropdowns on outside click
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

  if (!isOpen) return null;

  // Real-time email validation
  const validateEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailInputChange = (e) => {
    const val = e.target.value;
    setEmailInput(val);
    if (!val.trim()) {
      setEmailError('');
    } else if (!validateEmailFormat(val.trim())) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleAddEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!validateEmailFormat(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (emails.includes(trimmed)) {
      setEmailError('Email already added to invitation list');
      return;
    }
    setEmails([...emails, trimmed]);
    setEmailInput('');
    setEmailError('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleToggleProperty = (propName) => {
    if (selectedProperties.includes(propName)) {
      if (selectedProperties.length === 1) return; // Keep at least one
      setSelectedProperties(selectedProperties.filter((p) => p !== propName));
    } else {
      setSelectedProperties([...selectedProperties, propName]);
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

    let finalEmails = [...emails];
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && validateEmailFormat(trimmed) && !finalEmails.includes(trimmed)) {
      finalEmails.push(trimmed);
    }

    if (finalEmails.length === 0) {
      setEmailError('Please enter at least one valid email address');
      return;
    }

    const assignments = selectedProperties.map((propName) => ({
      property: propName,
      role: propertyRoles[propName] || 'Hotel Manager / GM'
    }));

    onSendInvitations({
      emails: finalEmails,
      assignments
    });

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
            <h3 className="team-drawer-title">Add Team Member</h3>
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

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="team-drawer-form">
          <div className="team-drawer-body">
            {/* Field 1: Email Address */}
            <div className="team-drawer-field">
              <label className="team-drawer-label">
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="team-drawer-helper">
                Type an email address and click Add to add to invitation list.
              </div>

              <div className="team-drawer-email-input-wrap">
                <input
                  type="email"
                  className={`team-drawer-input ${emailError ? 'error' : ''}`}
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={handleEmailInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                />
                <button
                  type="button"
                  className="team-drawer-btn-add"
                  onClick={handleAddEmail}
                >
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </div>

              {emailError && (
                <div className="team-drawer-error-row">
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>{emailError}</span>
                </div>
              )}

              {emails.length > 0 && (
                <div className="team-drawer-chips-wrap">
                  {emails.map((em) => (
                    <div key={em} className="team-drawer-chip">
                      <span>{em}</span>
                      <button
                        type="button"
                        className="team-drawer-chip-remove"
                        onClick={() => handleRemoveEmail(em)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  const currentRole = propertyRoles[propName] || '';
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
                          <span className={currentRole ? 'text-selected' : 'text-placeholder'}>
                            {currentRole || 'Select role...'}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={16} color="#2563EB" />
                          ) : (
                            <ChevronDown size={16} color="#94A3B8" />
                          )}
                        </button>

                        {/* Dropdown Menu (Matches Image 3) */}
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
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
