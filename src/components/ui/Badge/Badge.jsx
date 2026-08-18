import React from 'react';

export const Badge = ({ children, variant = 'primary', icon: Icon, className = '' }) => {
  return (
    <span className={`badge-item badge-${variant} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};
