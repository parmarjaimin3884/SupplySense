import React from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { getRiskLabel } from '../../../utils/formatters';

export const RiskBadge = ({ score, level }) => {
  const label = level || (score !== undefined ? getRiskLabel(score) : 'OPTIMAL');
  const type = (label.toUpperCase() === 'CRITICAL' || label.toUpperCase() === 'HIGH') ? 'critical' : label.toUpperCase() === 'MODERATE' ? 'moderate' : 'optimal';

  return (
    <span className={`risk-badge ${type}`}>
      {type === 'critical' ? <FiAlertTriangle size={12} /> : <FiCheckCircle size={12} />}
      {label} {score !== undefined && `(${score})`}
    </span>
  );
};

