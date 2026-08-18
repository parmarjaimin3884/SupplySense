import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSupplyChain } from '../../context/SupplyChainContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { COMPANY_OPTIONS } from '../../utils/constants';
import {
  FiSearch,
  FiBell,
  FiCpu,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiMenu,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiLogOut
} from 'react-icons/fi';

export const Navbar = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAsRead } = useNotification();
  const {
    selectedCompany,
    setSelectedCompany,
    setIsAiDrawerOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    setGlobalSearchOpen
  } = useSupplyChain();

  const location = useLocation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname.substring(1);
    if (!path || path === 'dashboard') return 'Executive Dashboard';
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      setGlobalSearchOpen(true);
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <button className="mobile-menu-toggle" onClick={onToggleMobileSidebar}>
          <FiMenu size={20} />
        </button>
        <div className="navbar-breadcrumbs">
          <span className="breadcrumb-root">SupplySense</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="navbar-center">
        <form className="navbar-search-form" onSubmit={handleGlobalSearchSubmit}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search SKUs, suppliers, shipments... (Cmd+K)"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </form>
      </div>

      <div className="navbar-right">
        {/* Real-time Clock */}
        <div className="navbar-clock" title="Current System Time">
          <FiClock size={14} />
          <span>{currentTime}</span>
        </div>

        {/* Company Selector Dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="company-select-btn"
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
          >
            <span className="company-badge-code">{selectedCompany.code}</span>
            <span className="company-name">{selectedCompany.name}</span>
            <FiChevronDown size={14} />
          </button>

          {showCompanyMenu && (
            <div className="dropdown-menu company-dropdown">
              <div className="dropdown-header">Select Enterprise Unit</div>
              {COMPANY_OPTIONS.map((comp) => (
                <button
                  key={comp.id}
                  className={`dropdown-item ${selectedCompany.id === comp.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCompany(comp);
                    setShowCompanyMenu(false);
                  }}
                >
                  <span className="comp-code">{comp.code}</span>
                  <span>{comp.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          className="ai-assistant-trigger"
          onClick={() => setIsAiDrawerOpen(true)}
          title="Open AI Supply Assistant"
        >
          <FiCpu size={16} />
          <span className="ai-trigger-label">AI Copilot</span>
        </button>

        {/* Theme Toggle */}
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="icon-btn notification-btn"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            title="Notifications"
          >
            <FiBell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotificationMenu && (
            <div className="dropdown-menu notification-dropdown">
              <div className="dropdown-header">
                <span>Recent Risk Notifications</span>
                <button
                  className="mark-all-read-btn"
                  onClick={() => {
                    notifications.forEach((n) => markAsRead(n.id));
                  }}
                >
                  Clear All
                </button>
              </div>
              <div className="notification-list">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                    <div className={`n-severity-dot ${n.severity.toLowerCase()}`} />
                    <div className="n-content">
                      <div className="n-title">{n.title}</div>
                      <div className="n-desc">{n.message}</div>
                      <div className="n-time">{n.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button
                  onClick={() => {
                    setShowNotificationMenu(false);
                    navigate('/notifications');
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="dropdown-wrapper">
          <button className="user-profile-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            <img src={user?.avatar} alt={user?.name} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <FiChevronDown size={14} />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu user-dropdown">
              <div className="dropdown-header">
                <strong>{user?.name}</strong>
                <p>{user?.email}</p>
              </div>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
              >
                <FiUser size={14} /> Profile & Settings
              </button>
              <button
                className="dropdown-item logout"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
              >
                <FiLogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
