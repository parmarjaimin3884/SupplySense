import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApiService } from '../services/mockApi';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    mockApiService.getNotifications().then(res => {
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    });
  }, []);

  const addToast = (message, type = 'info', title = '') => {
    const id = `toast-${Date.now()}`;
    const newToast = { id, message, type, title };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    mockApiService.markNotificationRead(id);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      addToast,
      removeToast,
      markAsRead,
      markAllRead
    }}>
      {children}
      <div className="toast-container-global">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            {toast.type === 'success' && <FiCheckCircle style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />}
            {toast.type === 'danger' && <FiAlertCircle style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: 2 }} />}
            {toast.type === 'warning' && <FiAlertCircle style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />}
            {toast.type === 'info' && <FiInfo style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: 2 }} />}
            <div style={{ flex: 1 }}>
              {toast.title && <strong style={{ display: 'block', marginBottom: 2 }}>{toast.title}</strong>}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} style={{ color: 'var(--text-subtle-blue)', cursor: 'pointer' }}>
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export const useNotification = () => useContext(NotificationContext);

