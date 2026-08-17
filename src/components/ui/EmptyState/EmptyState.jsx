import React from 'react';
import { FiInbox } from 'react-icons/fi';

export const EmptyState = ({ title = 'No Data Found', description = 'There are no items matching your current view criteria.', action }) => {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">
        <FiInbox size={24} />
      </div>
      <h4 style={{ color: '#fff', fontSize: 16 }}>{title}</h4>
      <p style={{ fontSize: 13, maxWidth: 360 }}>{description}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
};
