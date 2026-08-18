import React from 'react';
import { getRiskSeverityColor, getRiskLabel } from '../../../utils/formatters';

export const Gauge = ({ score = 68, size = 200 }) => {
  const color = getRiskSeverityColor(score);
  const label = getRiskLabel(score);

  // SVG Arc calculation for half-gauge (180 deg)
  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="gauge-wrapper" style={{ width: size, height: size / 1.7 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Background Arc */}
        <path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Filled Score Arc */}
        <path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="gauge-score-overlay">
        <div className="gauge-score-number">{score}</div>
        <div className="gauge-score-label" style={{ color }}>{label}</div>
      </div>
    </div>
  );
};
