import React, { useState } from 'react';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';
import { Select } from '../../components/ui/Select/Select';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { FiPieChart, FiBarChart2, FiCalendar, FiFilter } from 'react-icons/fi';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('90D');

  const radarData = [
    { subject: 'Lead Time', A: 120, B: 110, fullMark: 150 },
    { subject: 'Quality', A: 98, B: 130, fullMark: 150 },
    { subject: 'Risk', A: 86, B: 130, fullMark: 150 },
    { subject: 'Cost', A: 99, B: 100, fullMark: 150 },
    { subject: 'SLA', A: 85, B: 90, fullMark: 150 },
    { subject: 'Capacity', A: 65, B: 85, fullMark: 150 }
  ];

  const categorySpendData = [
    { name: 'Laptops', spend: 850000 },
    { name: 'Smart TVs', spend: 720000 },
    { name: 'Smartphones', spend: 680000 },
    { name: 'Servers', spend: 490000 },
    { name: 'Cameras', spend: 340000 }
  ];


  const COLORS = ['#3B82F6', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="analytics-page">
      {/* Header Bar */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Executive Supply Chain Analytics Suite</h1>
          <p className="page-subtitle">Multi-dimensional operational telemetry & capital allocation charts</p>
        </div>

        <div className="analytics-filters">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: '30D', label: 'Past 30 Days' },
              { value: '90D', label: 'Past 90 Days' },
              { value: 'YTD', label: 'Year To Date (2026)' }
            ]}
          />
        </div>
      </div>

      {/* Grid 1: Radar Chart + Capital Spend Bar Chart */}
      <div className="analytics-grid-two">
        <ChartCard title="Vendor SLA & Health Radar Index" subtitle="Multivariate radar across Lead Time, Risk, Quality & Cost">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} />
              <PolarRadiusAxis stroke="#94A3B8" fontSize={10} />
              <Radar name="North America" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
              <Radar name="EMEA & APAC" dataKey="B" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.4} />
              <Tooltip contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Capital Allocation by Category ($)" subtitle="Total purchase volume across component types">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categorySpendData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#64748B" fontSize={11} formatter={(v) => `$${v/1000}k`} />
              <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={110} />
              <Tooltip contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="spend" radius={[0, 6, 6, 0]}>
                {categorySpendData.map((e, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
