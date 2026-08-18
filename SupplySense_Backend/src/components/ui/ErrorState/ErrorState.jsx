import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../Button/Button';

export const ErrorState = ({ title = 'Failed to load telemetry', message = 'An unexpected error occurred while communicating with SupplySense server.', onRetry }) => {
  return (
    <div className="error-state-box">
      <FiAlertTriangle size={32} />
      <h4 style={{ color: '#fff', fontSize: 16 }}>{title}</h4>
      <p style={{ fontSize: 13, color: 'var(--text-light-gray)', maxWidth: 400 }}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginTop: 8 }}>
          Retry Request
        </Button>
      )}
    </div>
  );
};
