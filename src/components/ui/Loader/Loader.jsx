import React from 'react';
import { Spinner } from '../Spinner/Spinner';

export const Loader = ({ text = 'Loading AI Supply Chain data...' }) => {
  return (
    <div className="full-page-loader">
      <Spinner size={36} color="var(--primary-blue)" />
      <span style={{ fontSize: 14, fontWeight: 500 }}>{text}</span>
    </div>
  );
};
