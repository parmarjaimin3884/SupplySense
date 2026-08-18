import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { RiskBadge } from '../../components/ui/RiskBadge/RiskBadge';

import { FiBell, FiCheckCircle, FiAlertTriangle, FiInfo, FiTrash2 } from 'react-icons/fi';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [filter, setFilter] = useState('ALL');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'CRITICAL') return n.severity === 'CRITICAL';
    return true;
  });

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Real-Time Risk Notification Center</h1>
          <p className="page-subtitle">Telemetry alerts, threshold warnings & automated system logs</p>
        </div>

        <div className="tab-pills">
          <button className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
            All ({notifications.length})
          </button>
          <button className={`tab-btn ${filter === 'UNREAD' ? 'active' : ''}`} onClick={() => setFilter('UNREAD')}>
            Unread ({unreadCount})
          </button>
          <button className={`tab-btn ${filter === 'CRITICAL' ? 'active' : ''}`} onClick={() => setFilter('CRITICAL')}>
            Critical Alerts
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="card-panel notifications-container-card">
        {filteredNotifications.map((n) => (
          <div key={n.id} className={`notification-card-row ${n.read ? 'read' : 'unread'}`} onClick={() => markAsRead(n.id)}>
            <div className={`n-icon-box ${n.severity.toLowerCase()}`}>
              {n.severity === 'CRITICAL' ? <FiAlertTriangle size={18} /> : <FiInfo size={18} />}
            </div>

            <div className="n-row-body">
              <div className="n-row-header">
                <h4 className="n-row-title">{n.title}</h4>
                <RiskBadge level={n.severity} />
              </div>
              <p className="n-row-msg">{n.message}</p>
              <span className="n-row-time">{n.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
