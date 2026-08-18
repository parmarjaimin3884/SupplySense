import React from 'react';
import { StatCard } from '../../components/ui/StatCard/StatCard';

import { FiFileText, FiDownload, FiCpu, FiTrendingUp, FiShield, FiBox, FiCheckCircle } from 'react-icons/fi';

export const ReportsPage = () => {
  const handleExport = (format) => {
    alert(`Generating & Downloading SupplySense Executive Report (${format.toUpperCase()})...`);
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Executive Supply Chain Reports & Export</h1>
          <p className="page-subtitle">Board-ready PDF & Excel telemetry digests with AI executive summaries</p>
        </div>

        <div className="export-btns-group">
          <button className="export-btn pdf" onClick={() => handleExport('pdf')}>
            <FiDownload size={14} /> Export PDF Report
          </button>
          <button className="export-btn excel" onClick={() => handleExport('excel')}>
            <FiDownload size={14} /> Export Excel Data (.xlsx)
          </button>
        </div>
      </div>

      {/* AI Report Executive Brief */}
      <div className="card-panel report-hero-card">
        <div className="rh-header">
          <div className="rh-icon"><FiCpu size={22} /></div>
          <div>
            <h3>Q3 2026 AI Executive Briefing</h3>
            <span className="rh-date">Generated on August 1, 2026 • 256-bit Hash Verified</span>
          </div>
        </div>

        <p className="rh-text">
          Global inventory valuation stands at **$14.2M** across 5 hub depots with an overall stock health index of **94.2%**. Geopolitical threat modeling indicates moderate vulnerability (+4 days) in Taiwan transit corridors. Prescribed mitigation actions have successfully preserved **$140,000 in SLA delay penalties**.
        </p>
      </div>

      {/* Summary KPI Grid */}
      <div className="kpi-grid">
        <StatCard title="Total Skus Audited" value="500 Active" change="100% indexed" isPositive icon={FiBox} />
        <StatCard title="SLA Compliance Rate" value="98.2%" change="On-time target met" isPositive icon={FiCheckCircle} />
        <StatCard title="Annual Savings via AI" value="$420,000" change="Cost optimization" isPositive icon={FiTrendingUp} />
      </div>
    </div>
  );
};

export default ReportsPage;
