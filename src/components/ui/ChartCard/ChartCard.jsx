import React from 'react';

export const ChartCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div className={`chart-card-wrapper ${className}`}>
      <div className="chart-card-header">
        <div>
          <h4 className="chart-card-title">{title}</h4>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="chart-content-area">{children}</div>
    </div>
  );
};
