import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};
