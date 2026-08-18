import React from 'react';

export const Toast = ({ message, type = 'info' }) => {
  return (
    <div className={`toast-wrapper-standalone toast-${type}`}>
      <span>{message}</span>
    </div>
  );
};
