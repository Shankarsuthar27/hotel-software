import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  Clock,
  KeyRound,
  Building2,
  Image as ImageIcon,
  Pencil,
  Upload,
  Info,
  Save,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import './settings-view.css';

const HOURS_LIST = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_LIST = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function SettingsView({
  property = {},
  onSaveProperty,
  showToast
}) {
  const [activeSubtab, setActiveSubtab] = useState('property'); // 'property' | 'nightaudit' | 'apikeys'

  // Organization Settings State
  const [orgName, setOrgName] = useState(property?.name || 'HOTEL ASTHA');
  const [orgIcon, setOrgIcon] = useState(property?.organizationIcon || property?.logo || null);

  // Property Overbooking State
  const [enableOverbooking, setEnableOverbooking] = useState(property?.enableOverbooking ?? false);

  // Night Audit Settings State
  const [enableNightAudit, setEnableNightAudit] = useState(property?.nightAuditSettings?.enabled ?? true);
  const [auditTime, setAuditTime] = useState(property?.nightAuditSettings?.time || '01:00');
  const [autoExtendDueOut, setAutoExtendDueOut] = useState(property?.nightAuditSettings?.autoExtendDueOut ?? false);

  // Time Picker Popup State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [draftHour, setDraftHour] = useState('01');
  const [draftMinute, setDraftMinute] = useState('00');
  const [activeUnit, setActiveUnit] = useState('minute'); // 'hour' | 'minute'
  const [timeSearch, setTimeSearch] = useState('');

  // Auto-Extend Modal State
  const [isAutoExtendModalOpen, setIsAutoExtendModalOpen] = useState(false);

  // Refs for click outside and auto-scrolling
  const timePickerRef = useRef(null);
  const timeTriggerRef = useRef(null);
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);

  // API Keys State
  const [apiKey, setApiKey] = useState(property?.apiKeys?.key || 'otal_live_9f82d1b74a3c2e105847fae32');
  const [webhookUrl, setWebhookUrl] = useState(property?.apiKeys?.webhookUrl || 'https://api.hotelastha.com/webhooks/pms');
  const [copiedKey, setCopiedKey] = useState(false);

  // Synchronize when property updates from store
  useEffect(() => {
    if (property) {
      if (property.name) setOrgName(property.name);
      if (property.organizationIcon || property.logo) setOrgIcon(property.organizationIcon || property.logo);
      if (property.enableOverbooking !== undefined) setEnableOverbooking(property.enableOverbooking);
      if (property.nightAuditSettings) {
        if (property.nightAuditSettings.enabled !== undefined) setEnableNightAudit(property.nightAuditSettings.enabled);
        if (property.nightAuditSettings.time) {
          setAuditTime(property.nightAuditSettings.time);
          const [h, m] = property.nightAuditSettings.time.split(':');
          if (h) setDraftHour(h.padStart(2, '0'));
          if (m) setDraftMinute(m.padStart(2, '0'));
        }
        if (property.nightAuditSettings.autoExtendDueOut !== undefined) setAutoExtendDueOut(property.nightAuditSettings.autoExtendDueOut);
      }
      if (property.apiKeys) {
        if (property.apiKeys.key) setApiKey(property.apiKeys.key);
        if (property.apiKeys.webhookUrl) setWebhookUrl(property.apiKeys.webhookUrl);
      }
    }
  }, [property]);

  // Click outside to close Time Picker popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isTimePickerOpen &&
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target) &&
        timeTriggerRef.current &&
        !timeTriggerRef.current.contains(event.target)
      ) {
        setIsTimePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimePickerOpen]);

  // Auto-scroll the selected hour and minute to center on open
  useEffect(() => {
    if (isTimePickerOpen) {
      setTimeout(() => {
        const selH = hoursListRef.current?.querySelector('.settings-time-wheel-item.selected');
        if (selH) {
          selH.scrollIntoView({ block: 'center' });
        }
        const selM = minutesListRef.current?.querySelector('.settings-time-wheel-item.selected');
        if (selM) {
          selM.scrollIntoView({ block: 'center' });
        }
      }, 50);
    }
  }, [isTimePickerOpen]);

  // Time Picker search input handler
  const handleTimeSearchChange = (val) => {
    setTimeSearch(val);
    if (val.includes(':')) {
      const [h, m] = val.split(':');
      const cleanH = h ? h.trim().padStart(2, '0') : null;
      const cleanM = m ? m.trim().padStart(2, '0') : null;
      if (cleanH && HOURS_LIST.includes(cleanH)) setDraftHour(cleanH);
      if (cleanM && MINUTES_LIST.includes(cleanM)) setDraftMinute(cleanM);
    }
  };

  const handleTimePickerDone = () => {
    setAuditTime(`${draftHour}:${draftMinute}`);
    setIsTimePickerOpen(false);
  };

  const handleTimePickerCancel = () => {
    const [h = '01', m = '00'] = auditTime.split(':');
    setDraftHour(h);
    setDraftMinute(m);
    setIsTimePickerOpen(false);
  };

  // Filtered hours and minutes based on search
  const filteredHours = timeSearch
    ? HOURS_LIST.filter((h) => h.includes(timeSearch) || (timeSearch.includes(':') && h === timeSearch.split(':')[0]?.trim().padStart(2, '0')))
    : HOURS_LIST;

  const filteredMinutes = timeSearch
    ? MINUTES_LIST.filter((m) => m.includes(timeSearch) || (timeSearch.includes(':') && m === timeSearch.split(':')[1]?.trim().padStart(2, '0')))
    : MINUTES_LIST;

  // Auto-extend modal confirmation handlers
  const handleToggleAutoExtend = () => {
    if (!autoExtendDueOut) {
      setIsAutoExtendModalOpen(true);
    } else {
      setAutoExtendDueOut(false);
    }
  };

  const handleConfirmEnableAutoExtend = () => {
    setAutoExtendDueOut(true);
    setIsAutoExtendModalOpen(false);
  };

  const handleCancelAutoExtend = () => {
    setIsAutoExtendModalOpen(false);
  };

  // Handle Organization Logo Upload
  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOrgIcon(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Organization Settings
  const handleSaveOrganization = (e) => {
    if (e) e.preventDefault();
    if (onSaveProperty) {
      onSaveProperty({
        name: orgName,
        tradeName: orgName,
        organizationIcon: orgIcon,
        logo: orgIcon
      });
    }
    if (showToast) {
      showToast('🏢 Organization settings updated successfully.');
    }
  };

  // Save Overbooking Settings
  const handleSaveOverbooking = (e) => {
    if (e) e.preventDefault();
    if (onSaveProperty) {
      onSaveProperty({
        enableOverbooking
      });
    }
    if (showToast) {
      showToast(`📅 Overbooking ${enableOverbooking ? 'enabled' : 'disabled'} successfully.`);
    }
  };

  // Save Night Audit Settings
  const handleSaveNightAudit = (e) => {
    if (e) e.preventDefault();
    if (onSaveProperty) {
      onSaveProperty({
        nightAuditSettings: {
          enabled: enableNightAudit,
          time: auditTime,
          autoExtendDueOut
        }
      });
    }
    if (showToast) {
      showToast('🌙 Night audit schedule updated successfully.');
    }
  };

  // Save API Key Settings
  const handleSaveApiKeys = (e) => {
    if (e) e.preventDefault();
    if (onSaveProperty) {
      onSaveProperty({
        apiKeys: {
          key: apiKey,
          webhookUrl
        }
      });
    }
    if (showToast) {
      showToast('🔑 API credentials updated successfully.');
    }
  };

  const handleCopyKey = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="settings-container">
      {/* Subtabs Bar */}
      <div className="settings-subtabs-bar">
        <button
          type="button"
          className={`settings-subtab-btn ${activeSubtab === 'property' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('property')}
        >
          <SlidersHorizontal size={16} />
          <span>Property & General</span>
        </button>
        <button
          type="button"
          className={`settings-subtab-btn ${activeSubtab === 'nightaudit' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('nightaudit')}
        >
          <Clock size={16} />
          <span>Night Audit</span>
        </button>
        <button
          type="button"
          className={`settings-subtab-btn ${activeSubtab === 'apikeys' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('apikeys')}
        >
          <KeyRound size={16} />
          <span>API Keys</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="settings-content-area">
        {/* TAB 1: PROPERTY & GENERAL */}
        {activeSubtab === 'property' && (
          <div className="settings-grid-2col">
            {/* Card 1: Organization Settings */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-icon-badge">
                    <Building2 size={20} color="#2563EB" />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Organization Settings</h3>
                    <p className="settings-card-subtitle">Update your organization details and branding.</p>
                  </div>
                </div>

                <div className="settings-org-body">
                  {/* Organization Icon */}
                  <div className="settings-org-icon-col">
                    <label className="settings-label">Organization Icon</label>
                    <div className="settings-icon-upload-box">
                      {orgIcon ? (
                        <img src={orgIcon} alt="Organization Logo" className="settings-uploaded-logo" />
                      ) : (
                        <ImageIcon size={24} color="#94A3B8" />
                      )}
                      <label htmlFor="org-icon-upload" className="settings-edit-icon-badge" title="Change Logo">
                        <Pencil size={11} color="#FFFFFF" strokeWidth={2.5} />
                      </label>
                    </div>
                    <input
                      id="org-icon-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      style={{ display: 'none' }}
                      onChange={handleIconUpload}
                    />
                    <div className="settings-icon-hint">
                      <span>Recommended size</span>
                      <span>512 x 512px, PNG or JPG</span>
                    </div>
                    <label htmlFor="org-icon-upload" className="settings-btn-change">
                      <Upload size={13} />
                      <span>Change</span>
                    </label>
                  </div>

                  {/* Organization Name */}
                  <div className="settings-org-name-col">
                    <label className="settings-label">
                      Organization Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="settings-input"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. HOTEL ASTHA"
                      required
                    />
                    <div className="settings-helper-text">This name will be used across the system.</div>

                    {/* Note Box */}
                    <div className="settings-note-box">
                      <Info size={16} color="#2563EB" className="settings-note-icon" />
                      <div>
                        <div className="settings-note-title">Note</div>
                        <div className="settings-note-desc">Changes to organization details will reflect system wide.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card-footer">
                <button
                  type="button"
                  className="settings-btn-save"
                  onClick={handleSaveOrganization}
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* Card 2: Property Overbooking */}
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-icon-badge">
                    <CalendarCheck size={20} color="#2563EB" />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Property Overbooking</h3>
                    <p className="settings-card-subtitle">Configure overbooking settings for your property.</p>
                  </div>
                </div>

                {/* Info banner */}
                <div className="settings-info-banner">
                  <Info size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span>Overbooking helps maximize occupancy by allowing more bookings than physical capacity.</span>
                </div>

                {/* Enable Overbooking Toggle */}
                <div className="settings-toggle-row">
                  <div>
                    <div className="settings-toggle-label">Enable Overbooking</div>
                    <div className="settings-toggle-sub">Allow reservations beyond physical capacity</div>
                  </div>
                  <div
                    role="switch"
                    aria-checked={enableOverbooking}
                    tabIndex={0}
                    className={`settings-toggle-switch ${enableOverbooking ? 'active' : ''}`}
                    onClick={() => setEnableOverbooking(!enableOverbooking)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setEnableOverbooking(!enableOverbooking);
                      }
                    }}
                  >
                    <div className="settings-toggle-knob" />
                  </div>
                </div>
              </div>

              <div className="settings-card-footer">
                <button
                  type="button"
                  className="settings-btn-save"
                  onClick={handleSaveOverbooking}
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NIGHT AUDIT */}
        {activeSubtab === 'nightaudit' && (
          <div style={{ maxWidth: '640px' }}>
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-icon-badge">
                    <Clock size={20} color="#2563EB" />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Schedule Night Audit</h3>
                    <p className="settings-card-subtitle">Configure automated night audit execution.</p>
                  </div>
                </div>

                {/* Info banner */}
                <div className="settings-info-banner" style={{ margin: '18px 0 24px' }}>
                  <Info size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span>Night audit will automatically process room and tax charges at the selected time.</span>
                </div>

                {/* Row 1: Enable Night Audit */}
                <div className="settings-toggle-row" style={{ marginTop: 0, marginBottom: '24px' }}>
                  <div>
                    <div className="settings-toggle-label">Enable Night Audit</div>
                    <div className="settings-toggle-sub">Automatically run night audit at a specific time</div>
                  </div>
                  <div
                    role="switch"
                    aria-checked={enableNightAudit}
                    tabIndex={0}
                    className={`settings-toggle-switch ${enableNightAudit ? 'active' : ''}`}
                    onClick={() => setEnableNightAudit(!enableNightAudit)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setEnableNightAudit(!enableNightAudit);
                      }
                    }}
                  >
                    <div className="settings-toggle-knob" />
                  </div>
                </div>

                {/* Row 2: Audit Time */}
                <div style={{ marginBottom: '24px', position: 'relative' }}>
                  <label className="settings-label">
                    Audit Time <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div
                    ref={timeTriggerRef}
                    className={`settings-time-selector-box ${isTimePickerOpen ? 'open' : ''}`}
                    onClick={() => {
                      setIsTimePickerOpen(!isTimePickerOpen);
                      if (!isTimePickerOpen) {
                        const [h = '01', m = '00'] = auditTime.split(':');
                        setDraftHour(h.padStart(2, '0'));
                        setDraftMinute(m.padStart(2, '0'));
                        setTimeSearch('');
                        setActiveUnit('minute');
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#64748B" />
                      <span className="settings-time-display-val">{auditTime}</span>
                    </div>
                    {isTimePickerOpen ? (
                      <ChevronUp size={16} color="#2563EB" />
                    ) : (
                      <ChevronDown size={16} color="#64748B" />
                    )}
                  </div>
                  <div className="settings-helper-text" style={{ marginTop: '4px' }}>
                    Select the time to execute night audit
                  </div>

                  {/* Time Picker Popup (Positioned Above Trigger Box) */}
                  {isTimePickerOpen && (
                    <div ref={timePickerRef} className="settings-time-picker-popup">
                      <div className="settings-time-picker-header">
                        <div className="settings-time-picker-header-label">Select time</div>
                        <div className="settings-time-picker-header-time">
                          <span
                            className={`settings-time-unit ${activeUnit === 'hour' ? 'active' : ''}`}
                            onClick={() => setActiveUnit('hour')}
                          >
                            {draftHour}
                          </span>
                          <span className="settings-time-colon"> : </span>
                          <span
                            className={`settings-time-unit ${activeUnit === 'minute' ? 'active' : ''}`}
                            onClick={() => setActiveUnit('minute')}
                          >
                            {draftMinute}
                          </span>
                        </div>
                      </div>

                      <div className="settings-time-search-wrap">
                        <Search size={14} color="#94A3B8" className="settings-time-search-icon" />
                        <input
                          type="text"
                          className="settings-time-search-input"
                          placeholder="Search time..."
                          value={timeSearch}
                          onChange={(e) => handleTimeSearchChange(e.target.value)}
                          autoFocus
                        />
                      </div>

                      <div className="settings-time-columns-container">
                        {/* Hours Column */}
                        <div ref={hoursListRef} className="settings-time-wheel-col">
                          {filteredHours.map((h) => (
                            <div
                              key={h}
                              className={`settings-time-wheel-item ${h === draftHour ? 'selected' : ''}`}
                              onClick={() => {
                                setDraftHour(h);
                                setActiveUnit('minute');
                              }}
                            >
                              {h}
                            </div>
                          ))}
                        </div>

                        <div className="settings-time-wheel-divider" />
                        <span className="settings-time-wheel-colon">:</span>

                        {/* Minutes Column */}
                        <div ref={minutesListRef} className="settings-time-wheel-col">
                          {filteredMinutes.map((m) => (
                            <div
                              key={m}
                              className={`settings-time-wheel-item ${m === draftMinute ? 'selected' : ''}`}
                              onClick={() => {
                                setDraftMinute(m);
                              }}
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="settings-time-picker-footer">
                        <button
                          type="button"
                          className="settings-time-btn-cancel"
                          onClick={handleTimePickerCancel}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="settings-time-btn-done"
                          onClick={handleTimePickerDone}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Auto-Extend Due-Out Reservations */}
                <div className="settings-auto-extend-box">
                  <div style={{ paddingRight: '16px' }}>
                    <div className="settings-toggle-label">Auto-Extend Due-Out Reservations</div>
                    <div className="settings-toggle-sub">
                      Automatically extend departure date by 1 day for checked-in rooms not checked out before night audit
                    </div>
                  </div>
                  <div
                    role="switch"
                    aria-checked={autoExtendDueOut}
                    tabIndex={0}
                    className={`settings-toggle-switch ${autoExtendDueOut ? 'active' : ''}`}
                    onClick={handleToggleAutoExtend}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleToggleAutoExtend();
                      }
                    }}
                  >
                    <div className="settings-toggle-knob" />
                  </div>
                </div>

                {/* Active Note Callout - Visible when Auto-Extend is ON */}
                {autoExtendDueOut && (
                  <div className="settings-active-note-box">
                    <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div className="settings-active-note-text">
                      <strong>Active Note:</strong> When enabled, overdue checked-in reservations will automatically be extended by 1 day during night audit, posting additional nightly room and tax charges.
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-card-footer" style={{ marginTop: '26px' }}>
                <button
                  type="button"
                  className="settings-btn-save"
                  onClick={handleSaveNightAudit}
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: API KEYS */}
        {activeSubtab === 'apikeys' && (
          <div style={{ maxWidth: '640px' }}>
            <div className="settings-card">
              <div>
                <div className="settings-card-header">
                  <div className="settings-icon-badge">
                    <KeyRound size={20} color="#2563EB" />
                  </div>
                  <div>
                    <h3 className="settings-card-title">API Credentials & Webhooks</h3>
                    <p className="settings-card-subtitle">Manage secret keys for OTA integrations, booking engines, and webhooks.</p>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="settings-label">Live Secret API Key</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="settings-input"
                        style={{ fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#F8FAFC' }}
                      />
                      <button
                        type="button"
                        className="settings-btn-secondary"
                        onClick={handleCopyKey}
                      >
                        {copiedKey ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                        <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="settings-helper-text" style={{ marginTop: '4px' }}>
                      Use this bearer token to authenticate REST and webhook requests from channel managers.
                    </div>
                  </div>

                  <div>
                    <label className="settings-label">Webhook Endpoint URL</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="settings-input"
                      style={{ marginTop: '6px' }}
                      placeholder="https://your-domain.com/api/webhook"
                    />
                    <div className="settings-helper-text" style={{ marginTop: '4px' }}>
                      Reservation updates and inventory changes will be posted to this endpoint.
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card-footer" style={{ marginTop: '26px' }}>
                <button
                  type="button"
                  className="settings-btn-save"
                  onClick={handleSaveApiKeys}
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Auto-Extend Due-Out Reservations (Matches Image 3) */}
      {isAutoExtendModalOpen && (
        <div className="settings-modal-overlay" onClick={handleCancelAutoExtend}>
          <div
            className="settings-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auto-extend-modal-title"
          >
            <h3 id="auto-extend-modal-title" className="settings-modal-title">
              Auto-Extend Due-Out Reservations?
            </h3>
            <p className="settings-modal-desc">
              Enabling this will automatically extend the departure date by 1 day and post additional room and tax charges for reservations that are not checked out before the automated night audit runs. Do you want to proceed?
            </p>
            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-modal-btn-cancel"
                onClick={handleCancelAutoExtend}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-modal-btn-enable"
                onClick={handleConfirmEnableAutoExtend}
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

