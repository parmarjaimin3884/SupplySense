import React from 'react';

export const StatusChip = ({ status = 'OPTIMAL' }) => {
  const norm = status.toLowerCase();
  return (
    <span className={`status-chip ${norm}`}>
      <span className="status-chip-dot" />
      {status.replace('_', ' ')}
    </span>
  );
};
