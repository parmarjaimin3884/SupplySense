import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export const Alert = ({ type = 'info', title, children, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} size={18} />;
      case 'warning': return <FiAlertTriangle style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} size={18} />;
      case 'danger': return <FiAlertCircle style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: 2 }} size={18} />;
      default: return <FiInfo style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: 2 }} size={18} />;
    }
  };

  return (
    <div className={`alert-box alert-${type} ${className}`}>
      {getIcon()}
      <div style={{ flex: 1 }}>
        {title && <div className="alert-title">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};
