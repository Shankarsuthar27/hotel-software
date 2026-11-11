import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Calendar,
  CreditCard,
  LayoutGrid,
  FileText,
  BarChart2,
  Users,
  Menu,
  Globe,
  LogOut,
  Building2,
  Settings,
  ShieldCheck,
  CircleDollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  activeSubtab,
  setActiveTab,
  counts,
  property,
  currentUser,
  teamMembers = [],
  onSwitchUser,
  hasPermission,
  onLogout,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [lang, setLang] = useState('IN'); // 'IN' | 'HI'
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(activeTab === 'properties');

  React.useEffect(() => {
    if (activeTab === 'properties') {
      setIsPropertiesOpen(true);
    }
  }, [activeTab]);

  const propertyName = property?.name || 'HOTEL ASTHA';
  const propertyTagline = property?.tagline || 'HOTEL ASTHA';
  const propertyInitials = property?.initials || 'HA';

  const activeUser = currentUser || property?.userProfile || {
    name: 'Astha India',
    role: 'Owner',
    initials: 'AI'
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: CalendarCheck2,
      badge: counts?.reservations > 0 ? counts.reservations : null
    },
    {
      id: 'calendar',
      label: 'Calendar View',
      icon: Calendar
    },
    {
      id: 'rates',
      label: 'Rates & Inventory',
      icon: CreditCard
    },
    {
      id: 'housekeeping',
      label: 'Room View',
      icon: LayoutGrid,
      badge: counts?.dirtyRooms > 0 ? counts.dirtyRooms : null,
      badgeDanger: true
    },
    {
      id: 'cashier',
      label: 'Cashier',
      icon: CircleDollarSign
    },
    {
      id: 'nightaudit',
      label: 'Night Audit',
      icon: FileText
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart2
    },
    {
      id: 'guests',
      label: 'Guests',
      icon: Users
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    },
    {
      id: 'myteam',
      label: 'My Team',
      icon: Users
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: ShieldCheck
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Building2,
      hasDropdown: true
    }
  ];

  return (
    <aside className={`sidebar-light ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 1. Header Bar: Hamburger + Modern Brand Logo (without OTAL name) */}
      <div className="sidebar-brand-row">
        <button
          className="sidebar-menu-btn"
          title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          onClick={onToggleCollapse}
        >
          <Menu size={18} color="#0f172a" />
        </button>
        <div className="sidebar-brand-title">
          <span className="brand-logo-text" style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>OTAL</span>
        </div>
      </div>

      {/* 2. Hotel Switcher Card */}
      <div className="sidebar-hotel-card">
        <div className="hotel-avatar-ha">
          {propertyInitials}
        </div>
        <div className="hotel-info">
          <div className="hotel-name">{propertyName}</div>
          <div className="hotel-sub">{propertyTagline}</div>
        </div>
      </div>

      {/* 3. Navigation List */}
      <nav className="sidebar-menu-list">
        {navItems.map((item) => {
          if (hasPermission) {
            if (item.id === 'rates' && !hasPermission('ratesInventory.view')) return null;
            if (item.id === 'nightaudit' && !hasPermission('reservations.nightAudit')) return null;
            if (item.id === 'calendar' && !hasPermission('dashboard.viewCalendar')) return null;
            if (item.id === 'reservations' && !hasPermission('reservations.view')) return null;
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;
          if (item.id === 'properties') {
            const isPropertiesActive = activeTab === 'properties';
            const propertySubItems = [
              { id: 'all', label: 'All Properties' },
              { id: 'meal-plans', label: 'Meal Plans' },
              { id: 'rooms', label: 'Rooms' },
              { id: 'rate-plans', label: 'Rate Plans' },
              { id: 'business-account', label: 'Business Account' },
              { id: 'market-segment', label: 'Market Segment' },
              { id: 'tax-services', label: 'Tax & Services' }
            ];

            return (
              <div key="properties-group" className="sidebar-group-wrap">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${isPropertiesActive ? 'active' : ''}`}
                  onClick={() => {
                    const nextOpen = !isPropertiesOpen;
                    setIsPropertiesOpen(nextOpen);
                    if (nextOpen && activeTab !== 'properties') {
                      setActiveTab('properties', activeSubtab || 'all');
                    }
                  }}
                >
                  <div className="nav-btn-left">
                    <Icon size={18} className="nav-btn-icon" />
                    <span className="nav-btn-label">{item.label}</span>
                  </div>
                  {isPropertiesOpen ? (
                    <ChevronUp size={14} color={isPropertiesActive ? "#0066ff" : "#64748b"} style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
                  )}
                </button>

                {isPropertiesOpen && !isCollapsed && (
                  <div className="sidebar-sub-menu">
                    {propertySubItems.map((sub) => {
                      const isSubActive =
                        isPropertiesActive &&
                        (activeSubtab === sub.id || (!activeSubtab && sub.id === 'all'));
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          className={`sidebar-sub-nav-btn ${isSubActive ? 'active' : ''}`}
                          onClick={() => setActiveTab('properties', sub.id)}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-btn-left">
                <Icon size={18} className="nav-btn-icon" />
                <span className="nav-btn-label">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`nav-pill-badge ${item.badgeDanger ? 'badge-danger' : 'badge-primary'}`}>
                  {item.badge}
                </span>
              )}
              {item.hasDropdown && (
                <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. Bottom Controls: Language & User Card */}
      <div className="sidebar-bottom-section">
        {/* Language Row */}
        <div className="sidebar-lang-row">
          <div className="lang-label-group">
            <Globe size={16} color="#64748b" />
            <span className="lang-label-text">Language</span>
          </div>
          <div className="lang-toggle-pills">
            <button
              className={`lang-pill-btn ${lang === 'US' ? 'active' : ''}`}
              onClick={() => setLang('US')}
            >
              US
            </button>
            <button
              className={`lang-pill-btn ${lang === 'EN' ? 'active' : ''}`}
              onClick={() => setLang('EN')}
            >
              EN
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="sidebar-user-card" style={{ position: 'relative' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
            title="Click to switch active role or profile"
          >
            <div className="user-avatar-ai">
              {activeUser.initials || 'AI'}
            </div>
            <div className="user-details">
              <div className="user-name">{activeUser.name}</div>
              <div className="user-role">{activeUser.role}</div>
            </div>
          </div>

          <button
            className="user-logout-btn"
            title="Sign out / Switch user"
            onClick={() => {
              if (onLogout) onLogout();
              else setIsUserSwitcherOpen(!isUserSwitcherOpen);
            }}
          >
            <LogOut size={16} color="#ef4444" />
          </button>

          {/* User Switcher Dropdown Menu */}
          {isUserSwitcherOpen && (
            <div
              className="sidebar-user-switcher-menu"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                padding: '6px',
                zIndex: 100
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Active Profile (RBAC Mode)
              </div>

              {/* Owner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  backgroundColor: activeUser.role === 'Owner' ? '#eff6ff' : 'transparent',
                  color: activeUser.role === 'Owner' ? '#1d4ed8' : '#334155',
                  fontWeight: activeUser.role === 'Owner' ? 600 : 500
                }}
                onClick={() => {
                  if (onSwitchUser) onSwitchUser('usr_owner');
                  setIsUserSwitcherOpen(false);
                }}
              >
                <span>👑</span>
                <span>Astha India (Owner)</span>
              </div>

              {/* Team Members */}
              {teamMembers
                .filter((m) => m.role !== 'Owner')
                .map((m) => {
                  const isCurrent = activeUser.id === m.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        backgroundColor: isCurrent ? '#eff6ff' : 'transparent',
                        color: isCurrent ? '#1d4ed8' : '#334155',
                        fontWeight: isCurrent ? 600 : 500
                      }}
                      onClick={() => {
                        if (onSwitchUser) onSwitchUser(m.id);
                        setIsUserSwitcherOpen(false);
                      }}
                    >
                      <span>👤</span>
                      <span className="truncate">{m.name || m.email} ({m.role})</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
