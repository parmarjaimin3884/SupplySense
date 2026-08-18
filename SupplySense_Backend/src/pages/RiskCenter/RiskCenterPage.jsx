import React, { useState } from 'react';
import { Gauge } from '../../components/ui/Gauge/Gauge';
import { StatCard } from '../../components/ui/StatCard/StatCard';
import { RiskBadge } from '../../components/ui/RiskBadge/RiskBadge';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';

import {
  FiShield,
  FiAlertTriangle,
  FiActivity,
  FiCpu,
  FiTrendingUp,
  FiLayers,
  FiCheckCircle,
  FiArrowRight,
  FiCompass,
  FiCornerDownRight
} from 'react-icons/fi';

export const RiskCenterPage = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const riskMatrixData = [
    { likelihood: 'High', impact: 'High', count: 3, label: 'Port Clearance & Geopolitical', color: '#EF4444' },
    { likelihood: 'High', impact: 'Medium', count: 5, label: 'Lithium Raw Price Spike', color: '#F59E0B' },
    { likelihood: 'High', impact: 'Low', count: 12, label: 'Minor Custom Clearance', color: '#3B82F6' },
    { likelihood: 'Medium', impact: 'High', count: 2, label: 'Supplier Single-Source Failure', color: '#EF4444' },
    { likelihood: 'Medium', impact: 'Medium', count: 8, label: 'Warehouse Spatial Capacity', color: '#F59E0B' },
    { likelihood: 'Medium', impact: 'Low', count: 14, label: 'Packaging Material Lead Time', color: '#10B981' },
    { likelihood: 'Low', impact: 'High', count: 1, label: 'Cyber Infrastructure Disruption', color: '#EF4444' },
    { likelihood: 'Low', impact: 'Medium', count: 4, label: 'Ocean Freight Rate Volatility', color: '#3B82F6' },
    { likelihood: 'Low', impact: 'Low', count: 22, label: 'Standard Buffer Variability', color: '#10B981' }
  ];

  const criticalAlerts = [
    {
      id: 'ALT-101',
      title: 'Taiwan Straits Container Queue Delay',
      severity: 'CRITICAL',
      likelihood: 'High',
      impact: 'High',
      affectedSkus: ['SKU-1042', 'SKU-1088'],
      description: 'Customs throughput index dropped by 24%. Estimated delay on MCU shipments: +4.5 days.',
      rootCause: 'Port authority labor strikes + unexpected typhoon redirection.',
      recommendation: 'Re-route 20% air-freight allocation to Frankfurt Hub.'
    },
    {
      id: 'ALT-102',
      title: 'EuroPower Lithium SLA Default Risk',
      severity: 'HIGH',
      likelihood: 'Medium',
      impact: 'High',
      affectedSkus: ['SKU-1190'],
      description: 'On-time delivery dropped to 74% over consecutive 30-day window.',
      rootCause: 'Raw lithium carbonate supply shortages in South America.',
      recommendation: 'Activate secondary SLA contract with Nippon Energy.'
    }
  ];

  return (
    <div className="risk-center-page">
      {/* Top Banner Header */}
      <div className="risk-header-row">
        <div>
          <h1 className="page-title"><FiShield size={24} color="#EF4444" /> Enterprise Risk & Vulnerability Center</h1>
          <p className="page-subtitle">Real-time threat matrix, root cause diagnostics & autonomous risk mitigation</p>
        </div>
        <span className="live-risk-badge">PROPRIETARY AI RADAR ACTIVE</span>
      </div>

      {/* Top Hero Section: Gauge + KPI Metrics */}
      <div className="risk-hero-grid">
        <div className="card-panel gauge-hero-card">
          <h3>Overall Supply Chain Risk Score</h3>
          <p className="gauge-sub">Weighted composite index of lead times, vendor SLA & geopolitical telemetry</p>
          <Gauge value={42} label="MODERATE RISK" />
        </div>

        <div className="risk-kpi-column">
          <StatCard title="Critical Threat Count" value="3 Active" change="+1 since yesterday" isPositive={false} icon={FiAlertTriangle} />
          <StatCard title="Financial Exposure" value="$1,420,000" change="At risk revenue" isPositive={false} icon={FiShield} />
          <StatCard title="Vendor Vulnerability Ratio" value="12.4%" change="High risk vendors" isPositive={false} icon={FiActivity} />
          <StatCard title="Mean Recovery Time (MTTR)" value="1.8 Days" change="-0.4 days improvement" isPositive={true} icon={FiTrendingUp} />
        </div>
      </div>

      {/* 3x3 Risk Matrix Grid */}
      <div className="card-panel risk-matrix-panel">
        <div className="panel-header">
          <h3><FiCompass size={18} color="#7C3AED" /> 3x3 Likelihood vs Impact Risk Matrix</h3>
          <span className="matrix-count">71 Tracked Threats</span>
        </div>

        <div className="risk-matrix-grid">
          <div className="matrix-axis-label y-axis">LIKELIHOOD ➔</div>
          <div className="matrix-cells-container">
            {riskMatrixData.map((cell, idx) => (
              <div key={idx} className="matrix-cell" style={{ borderTopColor: cell.color }}>
                <div className="cell-top">
                  <span className="cell-badge" style={{ background: `${cell.color}25`, color: cell.color }}>
                    {cell.count} Threats
                  </span>
                  <span className="cell-coords">{cell.likelihood} L / {cell.impact} I</span>
                </div>
                <div className="cell-label">{cell.label}</div>
              </div>
            ))}
          </div>
          <div className="matrix-axis-label x-axis">IMPACT SEVERITY ➔</div>
        </div>
      </div>

      {/* Root Cause Analysis & Critical Alerts Stream */}
      <div className="risk-alerts-section">
        <div className="section-header">
          <h3><FiAlertTriangle size={18} color="#EF4444" /> Live Critical Risk Alerts & Root Cause Diagnostics</h3>
          <div className="severity-filters">
            <button className={`s-btn ${selectedSeverity === 'ALL' ? 'active' : ''}`} onClick={() => setSelectedSeverity('ALL')}>All Alerts</button>
            <button className={`s-btn ${selectedSeverity === 'CRITICAL' ? 'active' : ''}`} onClick={() => setSelectedSeverity('CRITICAL')}>Critical</button>
            <button className={`s-btn ${selectedSeverity === 'HIGH' ? 'active' : ''}`} onClick={() => setSelectedSeverity('HIGH')}>High</button>
          </div>
        </div>

        <div className="alerts-list">
          {criticalAlerts.map((alt) => (
            <div key={alt.id} className="alert-card-detailed">
              <div className="alt-top-bar">
                <div className="alt-title-group">
                  <RiskBadge level={alt.severity} />
                  <h4 className="alt-title">{alt.title}</h4>
                </div>
                <span className="alt-id">{alt.id}</span>
              </div>

              <p className="alt-desc">{alt.description}</p>

              <div className="root-cause-box">
                <div className="rc-header"><FiCornerDownRight color="#F59E0B" /> Root Cause Diagnosis:</div>
                <p className="rc-text">{alt.rootCause}</p>
              </div>

              <div className="ai-rec-box">
                <div className="rec-header"><FiCpu color="#7C3AED" /> Prescribed AI Mitigation:</div>
                <p className="rec-text">{alt.recommendation}</p>
                <button className="execute-remediation-btn">
                  Execute Mitigation Playbook <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskCenterPage;
