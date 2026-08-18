import React from 'react';

export const Spinner = ({ size = 24, color = 'var(--primary-blue)' }) => {
  return (
    <span
      className="spinner-circle"
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(255,255,255,0.1)`,
        borderTopColor: color
      }}
    />
  );
};
