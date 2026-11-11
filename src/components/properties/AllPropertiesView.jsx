import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Archive,
  Plus,
  MapPin,
  MoreVertical,
  SquarePen,
  Copy,
  Building2,
  Settings,
  FileText,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Check
} from 'lucide-react';

export default function AllPropertiesView({
  property,
  onSaveProperty,
  onOpenCashDrawer,
  showToast
}) {
  const [mode, setMode] = useState('list'); // 'list' | 'edit'
  const [activeMenu, setActiveMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Form state initialized from current property
  const [name, setName] = useState(property?.name || 'HOTEL ASTHA');
  const [email, setEmail] = useState(property?.email || 'info@asthasoftindia.com');
  const [phoneCode, setPhoneCode] = useState(property?.phoneCode || '+91');
  const [phone, setPhone] = useState(property?.phone || '7023318111');
  const [propertyType, setPropertyType] = useState(property?.propertyType || 'Hotel');

  const [addressLine, setAddressLine] = useState(property?.addressLine || 'Jalore');
  const [country, setCountry] = useState(property?.country || 'India');
  const [stateName, setStateName] = useState(property?.state || 'Rajasthan');
  const [city, setCity] = useState(property?.city || 'Jalore');
  const [postalCode, setPostalCode] = useState(property?.postalCode || '343001');

  const [currency, setCurrency] = useState(property?.currency || '₹ (Indian Rupee)');
  const [timezoneLabel, setTimezoneLabel] = useState(
    property?.timezoneLabel || 'IST, Indian Standard Time (Asia/Kolkata)'
  );
  const [checkInTime, setCheckInTime] = useState(property?.checkInTime || '14:00');
  const [checkOutTime, setCheckOutTime] = useState(property?.checkOutTime || '11:00');

  const [gstin, setGstin] = useState(property?.gstin || '');
  const [legalName, setLegalName] = useState(property?.legalName || 'HOTEL ASTHA');
  const [tradeName, setTradeName] = useState(property?.tradeName || 'HOTEL ASTHA');

  const [terms, setTerms] = useState(
    Array.isArray(property?.terms) ? property.terms : []
  );

  // Sync state if property prop changes
  useEffect(() => {
    if (property) {
      setName(property.name || 'HOTEL ASTHA');
      setEmail(property.email || 'info@asthasoftindia.com');
      setPhoneCode(property.phoneCode || '+91');
      setPhone(property.phone || '7023318111');
      setPropertyType(property.propertyType || 'Hotel');
      setAddressLine(property.addressLine || 'Jalore');
      setCountry(property.country || 'India');
      setStateName(property.state || 'Rajasthan');
      setCity(property.city || 'Jalore');
      setPostalCode(property.postalCode || '343001');
      setCurrency(property.currency || '₹ (Indian Rupee)');
      setTimezoneLabel(
        property.timezoneLabel || 'IST, Indian Standard Time (Asia/Kolkata)'
      );
      setCheckInTime(property.checkInTime || '14:00');
      setCheckOutTime(property.checkOutTime || '11:00');
      setGstin(property.gstin || '');
      setLegalName(property.legalName || 'HOTEL ASTHA');
      setTradeName(property.tradeName || 'HOTEL ASTHA');
      setTerms(Array.isArray(property.terms) ? property.terms : []);
    }
  }, [property]);

  // Click outside listener for the 3-dots actions menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(false);
      }
    }
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  // Auto close on scroll/resize
  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => setActiveMenu(false);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenu]);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (activeMenu) {
      setActiveMenu(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 110;
    const menuWidth = 170;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight + 20;

    setMenuPos({
      top: openUpwards ? Math.max(10, rect.top - menuHeight - 4) : rect.bottom + 4,
      left: Math.max(10, rect.right - menuWidth)
    });
    setActiveMenu(true);
  };

  const handleCopyPropertyId = () => {
    const propId = property?.id || 'prop_hotel_astha';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(propId);
    }
    setActiveMenu(false);
    if (showToast) {
      showToast('Property ID copied to clipboard!');
    }
  };

  const handleStartEdit = () => {
    setActiveMenu(false);
    setMode('edit');
  };

  const handleAddTerm = () => {
    setTerms([...terms, '']);
  };

  const handleUpdateTerm = (index, value) => {
    const next = [...terms];
    next[index] = value;
    setTerms(next);
  };

  const handleRemoveTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const patch = {
      name: name.trim() || 'HOTEL ASTHA',
      email: email.trim(),
      phone: phone.trim(),
      phoneCode,
      propertyType,
      addressLine: addressLine.trim(),
      country,
      state: stateName,
      city: city.trim(),
      postalCode: postalCode.trim(),
      location: `${city.trim() || 'Jalore'}, ${city.trim() || 'Jalore'}, ${country}`,
      currency,
      timezone: 'Asia/Kolkata',
      timezoneLabel,
      checkInTime,
      checkOutTime,
      gstin: gstin.trim().toUpperCase(),
      legalName: legalName.trim(),
      tradeName: tradeName.trim(),
      terms: terms.filter((t) => t.trim().length > 0)
    };

    if (onSaveProperty) {
      onSaveProperty(patch);
    }
    if (showToast) {
      showToast('Success: Property details updated successfully');
    }
    setMode('list');
  };

  // =========================================================================
  // VIEW 1: TABLE VIEW (MATCHING IMAGE 1 & IMAGE 3)
  // =========================================================================
  if (mode === 'list') {
    const displayLocation =
      property?.location ||
      `${property?.city || 'Jalore'}, ${property?.city || 'Jalore'}, ${property?.country || 'India'}`;

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar (Matching Image 1) */}
        <div
          style={{
            height: '54px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px'
          }}
        >
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <Home size={14} />
            </span>
            <span style={{ color: '#64748b', fontWeight: 500 }}>PMS</span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>&gt;</span>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Properties</span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>&gt;</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>All Properties</span>
          </div>

          {/* Top-Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="properties-cash-drawer-pill"
              onClick={onOpenCashDrawer}
              title="Open Register Cash Drawer"
            >
              <Archive size={14} strokeWidth={2.2} />
              <span>Open Cash Drawer</span>
            </button>

            <button
              type="button"
              className="properties-btn-primary"
              onClick={() => setMode('edit')}
            >
              <Plus size={16} />
              <span>Create Property</span>
            </button>
          </div>
        </div>

        {/* Flush Edge-to-Edge Table (Matching Image 1) */}
        <div style={{ flex: 1, width: '100%', overflowX: 'auto', backgroundColor: '#ffffff' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <th
                  style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    width: '26%'
                  }}
                >
                  Property
                </th>
                <th
                  style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    width: '24%'
                  }}
                >
                  Location
                </th>
                <th
                  style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    width: '16%'
                  }}
                >
                  Created At
                </th>
                <th
                  style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    width: '16%'
                  }}
                >
                  Timezone
                </th>
                <th
                  style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    width: '10%'
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '14px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#475569',
                    width: '8%',
                    textAlign: 'center'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {/* 1. Property Name */}
                <td style={{ padding: '16px 24px', verticalAlign: 'middle' }}>
                  <strong style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {property?.name || 'HOTEL ASTHA'}
                  </strong>
                </td>

                {/* 2. Location */}
                <td style={{ padding: '16px 24px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13.5px', color: '#1e293b' }}>
                      {displayLocation}
                    </span>
                    <MapPin size={14} color="#2563EB" />
                  </div>
                </td>

                {/* 3. Created At */}
                <td style={{ padding: '16px 24px', verticalAlign: 'middle', fontSize: '13.5px', color: '#1e293b' }}>
                  {property?.createdAt || '22 Oct 2026'}
                </td>

                {/* 4. Timezone */}
                <td style={{ padding: '16px 24px', verticalAlign: 'middle', fontSize: '13.5px', color: '#1e293b' }}>
                  {property?.timezone || 'Asia/Kolkata'}
                </td>

                {/* 5. Status */}
                <td style={{ padding: '16px 24px', verticalAlign: 'middle' }}>
                  <span className="properties-status-pill">
                    Active
                  </span>
                </td>

                {/* 6. Actions (Matching Image 3 Menu) */}
                <td
                  style={{
                    padding: '16px 24px',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <button
                    type="button"
                    className="properties-action-btn"
                    onClick={handleToggleMenu}
                    title="Actions"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Popover Dropdown (Matching Image 3) */}
                  {activeMenu && (
                    <div
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'fixed',
                        top: `${menuPos.top}px`,
                        left: `${menuPos.left}px`,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        minWidth: '170px',
                        zIndex: 9999,
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          fontWeight: 500,
                          color: '#1e293b',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <SquarePen size={15} color="#475569" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyPropertyId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          borderRadius: '6px',
                          fontSize: '13.5px',
                          fontWeight: 500,
                          color: '#1e293b',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Copy size={15} color="#475569" />
                        <span>Copy Property Id</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Footer (Matching Image 1) */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>1–1</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>1</strong> results
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="properties-page-btn"
              disabled
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="properties-page-btn active"
              title="Page 1"
            >
              1
            </button>
            <button
              type="button"
              className="properties-page-btn"
              disabled
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: EDIT PROPERTY DETAILS (MATCHING IMAGE 2)
  // =========================================================================
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar (Matching Image 2) */}
      <div
        style={{
          height: '54px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <Home size={14} />
          </span>
          <span style={{ color: '#64748b', fontWeight: 500 }}>PMS</span>
        </div>

        <button
          type="button"
          className="properties-cash-drawer-pill"
          onClick={onOpenCashDrawer}
          title="Open Register Cash Drawer"
        >
          <Archive size={14} strokeWidth={2.2} />
          <span>Open Cash Drawer</span>
        </button>
      </div>

      {/* Main Form Container (Matching Image 2) */}
      <div style={{ padding: '24px 32px 48px', maxWidth: '1200px', width: '100%' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 20px 0',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Edit Property Details
        </h2>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Information */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Building2 size={18} color="#2563EB" />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Property Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    style={{
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 8px',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+971">+971</option>
                  </select>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      flex: 1,
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Villa">Villa</option>
                  <option value="Motel">Motel</option>
                  <option value="Guest House">Guest House</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Location Details */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <MapPin size={18} color="#2563EB" />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                Location Details
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Address Line 1 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Country <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    State <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    City <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Jalore">Jalore</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Jodhpur">Jodhpur</option>
                    <option value="Udaipur">Udaipur</option>
                    <option value="Kota">Kota</option>
                    <option value="Bikaner">Bikaner</option>
                    <option value="Ajmer">Ajmer</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Zip Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Operations */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Settings size={18} color="#2563EB" />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                Operations
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Currency <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="₹ (Indian Rupee)">₹ (Indian Rupee)</option>
                    <option value="$ (US Dollar)">$ (US Dollar)</option>
                    <option value="€ (Euro)">€ (Euro)</option>
                    <option value="£ (British Pound)">£ (British Pound)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Timezone <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={timezoneLabel}
                    onChange={(e) => setTimezoneLabel(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="IST, Indian Standard Time (Asia/Kolkata)">
                      IST, Indian Standard Time (Asia/Kolkata)
                    </option>
                    <option value="UTC (Coordinated Universal Time)">
                      UTC (Coordinated Universal Time)
                    </option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Check-in Time <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0 12px 0 34px',
                        fontSize: '13.5px',
                        color: '#0f172a',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                    <Clock
                      size={15}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Check-out Time <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0 12px 0 34px',
                        fontSize: '13.5px',
                        color: '#0f172a',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                    </select>
                    <Clock
                      size={15}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: GST Details (Optional) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <FileText size={18} color="#2563EB" />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                GST Details (Optional)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  GSTIN
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="Enter 15-digit GSTIN"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                  {gstin.length}/15
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Legal Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Trade Name (Optional)
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 5: Terms & Conditions */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <FileText size={18} color="#2563EB" />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                Terms & Conditions
              </h3>
            </div>

            {/* Box area */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #e2e8f0',
                borderRadius: '8px',
                padding: terms.length > 0 ? '16px' : '36px',
                textAlign: terms.length > 0 ? 'left' : 'center',
                color: '#64748b',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {terms.length === 0 ? (
                <span>No terms and conditions added yet.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {terms.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={t}
                        placeholder={`Term ${idx + 1}`}
                        onChange={(e) => handleUpdateTerm(idx, e.target.value)}
                        style={{
                          flex: 1,
                          height: '38px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0 12px',
                          fontSize: '13px',
                          color: '#0f172a',
                          backgroundColor: '#ffffff'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(idx)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px'
                        }}
                        title="Remove Term"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddTerm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#2563EB',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={15} />
              <span>Add Another Term</span>
            </button>
          </div>

          {/* Form Action Buttons (Matching Image 2 Footer) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '8px'
            }}
          >
            <button
              type="button"
              onClick={() => setMode('list')}
              style={{
                height: '40px',
                padding: '0 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="properties-btn-primary"
              style={{
                height: '40px',
                padding: '0 24px',
                fontSize: '13.5px',
                fontWeight: 600
              }}
            >
              Update All Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

