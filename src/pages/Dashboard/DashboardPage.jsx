import React from 'react';
import { useSupplyChain } from '../../context/SupplyChainContext';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { StatCard } from '../../components/ui/StatCard/StatCard';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';
import { RiskBadge } from '../../components/ui/RiskBadge/RiskBadge';
import { Loader } from '../../components/ui/Loader/Loader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FiBox,
  FiShoppingCart,
  FiShield,
  FiTruck,
  FiUsers,
  FiDatabase,
  FiDollarSign,
  FiCpu,
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight
} from 'react-icons/fi';

export const DashboardPage = () => {
  const { dashboardData, loading } = useSupplyChain();

  if (loading || !dashboardData) {
    return <Loader label="Computing real-time executive supply chain telemetry..." />;
  }

  const COLORS = ['#3B82F6', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="dashboard-page">
      {/* Top AI Executive Summary Banner */}
      <div className="ai-executive-banner">
        <div className="ai-banner-icon">
          <FiCpu size={24} />
        </div>
        <div className="ai-banner-content">
          <div className="ai-banner-title">
            <span>AI Executive Summary</span>
            <span className="ai-status-tag">Real-Time Synthesis</span>
          </div>
          <p className="ai-banner-text">
            SupplySense AI detected a **14% surge in component lead times** originating from Taiwan port congestions. Inventory buffer for microcontrollers is at **94.2% stability**, but 2 critical SKUs require PO authorization within 48 hours to avert assembly line downtime.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <StatCard
          title="Inventory Health Score"
          value={`${dashboardData?.kpis?.inventoryHealth?.value || 0}%`}
          change={`${dashboardData?.kpis?.inventoryHealth?.change || ''} vs last wk`}
          isPositive={dashboardData?.kpis?.inventoryHealth?.isPositive}
          icon={FiBox}
        />
        <StatCard
          title="Active Orders Today"
          value={formatNumber(dashboardData?.kpis?.ordersToday?.value || 0)}
          change={`${dashboardData?.kpis?.ordersToday?.change || ''} target surge`}
          isPositive={dashboardData?.kpis?.ordersToday?.isPositive}
          icon={FiShoppingCart}
        />
        <StatCard
          title="Global Risk Index"
          value={`${dashboardData?.kpis?.globalRiskIndex?.value || 0} / 100`}
          change={`${dashboardData?.kpis?.globalRiskIndex?.change || ''} risk level`}
          isPositive={dashboardData?.kpis?.globalRiskIndex?.isPositive}
          icon={FiShield}
        />
        <StatCard
          title="Delayed Shipments"
          value={dashboardData?.kpis?.delayedShipments?.value || 0}
          change={`${dashboardData?.kpis?.delayedShipments?.change || ''} transit queue`}
          isPositive={dashboardData?.kpis?.delayedShipments?.isPositive}
          icon={FiTruck}
        />
        <StatCard
          title="Supplier Reliability"
          value={`${dashboardData?.kpis?.supplierReliability?.value || 0}%`}
          change={`${dashboardData?.kpis?.supplierReliability?.change || ''} SLA compliance`}
          isPositive={dashboardData?.kpis?.supplierReliability?.isPositive}
          icon={FiUsers}
        />
        <StatCard
          title="Warehouse Utilization"
          value={`${dashboardData?.kpis?.warehouseCapacity?.value || 0}%`}
          change={`${dashboardData?.kpis?.warehouseCapacity?.change || ''} spatial cap`}
          isPositive={dashboardData?.kpis?.warehouseCapacity?.isPositive}
          icon={FiDatabase}
        />
        <StatCard
          title="Revenue at Risk"
          value={formatCurrency(dashboardData?.kpis?.revenueAtRisk?.value || 0)}
          change={`${dashboardData?.kpis?.revenueAtRisk?.change || ''} vulnerability`}
          isPositive={dashboardData?.kpis?.revenueAtRisk?.isPositive}
          icon={FiDollarSign}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-main-grid">
        <ChartCard
          title="30-Day Inventory Valuation vs Safety Threshold"
          subtitle="Real-time stock valuation ($ Millions) vs minimum buffer"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboardData?.charts?.inventoryTrend || []}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(val) => [`$${val}M`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
              <Line type="monotone" dataKey="threshold" stroke="#EF4444" strokeDasharray="4 4" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>


        <ChartCard
          title="Demand Forecast vs Actual Demand"
          subtitle="AI Neural model predictive curve for upcoming months"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dashboardData?.charts?.demandForecast || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} name="Actual Units" />
              <Line type="monotone" dataKey="forecast" stroke="#7C3AED" strokeWidth={2.5} strokeDasharray="3 3" name="AI Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Supplier Performance & Risk Panel */}
      <div className="charts-secondary-grid">
        <ChartCard title="Supplier On-Time SLA Delivery %" subtitle="Top 5 Critical Component Vendors">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dashboardData?.charts?.supplierPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {(dashboardData?.charts?.supplierPerformance || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AI Recommendation Stream */}
        <div className="card-panel ai-recs-panel">
          <div className="panel-header">
            <h3><FiCpu size={18} color="#7C3AED" /> AI Automated Prescriptions</h3>
            <span className="badge-pulse">3 Actions Ready</span>
          </div>
          <div className="recs-list">
            {(dashboardData?.aiRecommendations || []).map((rec) => (
              <div key={rec.id} className="rec-item">
                <div className="rec-top">
                  <span className="rec-action">{rec.action}</span>
                  <RiskBadge level={rec.impact.includes('High') || rec.impact.includes('$') ? 'CRITICAL' : 'MODERATE'} />
                </div>
                <p className="rec-desc">{rec.description}</p>
                <div className="rec-footer">
                  <span className="rec-impact">Impact: <strong>{rec.impact}</strong></span>
                  <button className="rec-execute-btn">Apply Action <FiArrowUpRight size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Live Telematics Activity Feed */}
      <div className="card-panel live-activities-panel">
        <div className="panel-header">
          <h3><FiActivity size={18} color="#3B82F6" /> Real-Time Telematics & ERP Stream</h3>
          <span className="live-indicator">LIVE UPDATING</span>
        </div>
        <div className="activities-stream">
          {(dashboardData?.recentActivities || []).map((act) => (
            <div key={act.id} className="activity-row">
              <span className="activity-time">{act.time}</span>
              <span className={`activity-type-badge ${act.type.toLowerCase()}`}>{act.type}</span>
              <span className="activity-text">{act.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
