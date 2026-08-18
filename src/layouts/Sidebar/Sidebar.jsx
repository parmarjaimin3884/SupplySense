import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiBox,
  FiDatabase,
  FiUsers,
  FiTruck,
  FiTrendingUp,
  FiShoppingBag,
  FiShield,
  FiCpu,
  FiPieChart,
  FiFileText,
  FiBell,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiLayers
} from 'react-icons/fi';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { label: 'Inventory', path: '/inventory', icon: FiBox },
    { label: 'Warehouses', path: '/warehouses', icon: FiDatabase },
    { label: 'Suppliers', path: '/suppliers', icon: FiUsers },
    { label: 'Shipments', path: '/shipments', icon: FiTruck },
    { label: 'Demand Forecast', path: '/demand-forecast', icon: FiTrendingUp },
    { label: 'Procurement', path: '/procurement', icon: FiShoppingBag },
    { label: 'Risk Center', path: '/risk-center', icon: FiShield, badge: 'AI Risk' },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: FiCpu },
    { label: 'Analytics', path: '/analytics', icon: FiPieChart },
    { label: 'Reports', path: '/reports', icon: FiFileText },
    { label: 'Notifications', path: '/notifications', icon: FiBell },
    { label: 'Settings', path: '/settings', icon: FiSettings }
  ];

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand-header">
        <div className="sidebar-logo-group">
          <div className="sidebar-logo-icon">
            <FiLayers size={20} />
          </div>
          {!isCollapsed && (
            <span className="sidebar-brand-title">SupplySense</span>
          )}
        </div>
        <button 
          className="sidebar-collapse-btn icon-btn-reset" 
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="sidebar-nav-icon" />
              {!isCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-nav-item logout-btn" onClick={handleLogout} title={isCollapsed ? "Logout" : undefined}>
          <FiLogOut className="sidebar-nav-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
