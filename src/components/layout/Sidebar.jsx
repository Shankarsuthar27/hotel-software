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
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  counts,
  property,
  onLogout,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [lang, setLang] = useState('IN'); // 'IN' | 'HI'

  const propertyName = property?.name || 'HOTEL ASTHA';
  const propertyTagline = property?.tagline || 'HOTEL ASTHA';
  const propertyInitials = property?.initials || 'HA';

  const userProfile = property?.userProfile || {
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
          const Icon = item.icon;
          const isActive = activeTab === item.id;
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
        <div className="sidebar-user-card">
          <div className="user-avatar-ai">
            {userProfile.initials}
          </div>
          <div className="user-details">
            <div className="user-name">{userProfile.name}</div>
            <div className="user-role">{userProfile.role}</div>
          </div>
          <button
            className="user-logout-btn"
            title="Sign out"
            onClick={() => {
              if (onLogout) onLogout();
              else alert('Signed out of Hotel Astha PMS session.');
            }}
          >
            <LogOut size={16} color="#ef4444" />
          </button>
        </div>
      </div>
    </aside>
  );
}
