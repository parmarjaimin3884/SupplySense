import React from 'react';

export const Heatmap = ({ items = [] }) => {
  return (
    <div className="heatmap-grid">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="heatmap-cell"
          style={{
            borderColor: item.color ? item.color : 'var(--border-color)',
            background: item.bg ? item.bg : 'var(--bg-card)'
          }}
        >
          <span className="heatmap-cell-title">{item.label}</span>
          <span className="heatmap-cell-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
