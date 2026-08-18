import React, { useState } from 'react';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';
import { StatCard } from '../../components/ui/StatCard/StatCard';

import { formatNumber } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { FiTrendingUp, FiCpu, FiCalendar, FiSun, FiShoppingBag, FiLayers } from 'react-icons/fi';

export const DemandForecastPage = () => {
  const [seasonality, setSeasonality] = useState('Q3_SUMMER_PEAK');

  const forecastData = [
    { month: 'Jan 2026', historical: 12400, forecast: 12400, upperConf: 13000, lowerConf: 11800 },
    { month: 'Feb 2026', historical: 13800, forecast: 13800, upperConf: 14500, lowerConf: 13100 },
    { month: 'Mar 2026', historical: 15200, forecast: 15200, upperConf: 16000, lowerConf: 14400 },
    { month: 'Apr 2026', historical: 16800, forecast: 16800, upperConf: 17500, lowerConf: 16000 },
    { month: 'May 2026', historical: 18400, forecast: 18400, upperConf: 19200, lowerConf: 17600 },
    { month: 'Jun 2026', historical: 19900, forecast: 19900, upperConf: 20800, lowerConf: 19000 },
    { month: 'Jul 2026 (Live)', historical: 21500, forecast: 21500, upperConf: 22500, lowerConf: 20500 },
    { month: 'Aug 2026 (AI)', forecast: 24200, upperConf: 26000, lowerConf: 22400 },
    { month: 'Sep 2026 (AI)', forecast: 26800, upperConf: 29000, lowerConf: 24600 },
    { month: 'Oct 2026 (AI)', forecast: 29500, upperConf: 32000, lowerConf: 27000 },
    { month: 'Nov 2026 (AI)', forecast: 34000, upperConf: 37500, lowerConf: 30500 },
    { month: 'Dec 2026 (AI)', forecast: 38500, upperConf: 42000, lowerConf: 35000 }
  ];

  const topSellers = [
    { name: '65" 4K OLED Smart TV (v1)', sales: 42500, growth: '+28%' },
    { name: 'ProBook Ultra 15" Laptop (v2)', sales: 31200, growth: '+19%' },
    { name: 'Flagship Phone 5G (v1)', sales: 28400, growth: '+14%' },
    { name: 'ANC Wireless Headphones (v3)', sales: 24100, growth: '+32%' }
  ];


  return (
    <div className="demand-forecast-page">
      {/* Page Title */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">AI Predictive Demand Forecasting</h1>
          <p className="page-subtitle">Transformer-based consumption modeling with 95% confidence intervals</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard title="Projected Q4 Unit Demand" value="102,000" change="+24.8% YoY" isPositive icon={FiTrendingUp} />
        <StatCard title="Model Confidence Score" value="96.4%" change="± 3.2% error margin" isPositive icon={FiCpu} />
        <StatCard title="Holiday Impact Factor" value="1.38x Surge" change="Nov-Dec peak" isPositive icon={FiCalendar} />
        <StatCard title="Top Selling Category" value="Microcontrollers" change="42% total volume" isPositive icon={FiShoppingBag} />
      </div>

      {/* Main Predictive Chart */}
      <ChartCard
        title="12-Month Consumption Forecast Curve with 95% Confidence Interval Band"
        subtitle="Historical actual sales (Green) transitioning to AI Transformer neural projection (Purple)"
      >
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={12} />
            <Tooltip contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="upperConf" stroke="none" fill="url(#colorConf)" name="Upper Confidence Band" />
            <Area type="monotone" dataKey="historical" stroke="#10B981" strokeWidth={3} fill="none" name="Historical Sales" />
            <Area type="monotone" dataKey="forecast" stroke="#7C3AED" strokeWidth={3} strokeDasharray="4 4" fill="none" name="AI Neural Forecast" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 2: Top Products & AI Insights */}
      <div className="forecast-secondary-grid">
        <div className="card-panel">
          <h3><FiShoppingBag size={18} color="#3B82F6" /> Top Projected Products</h3>
          <div className="top-sellers-list">
            {topSellers.map((prod, idx) => (
              <div key={idx} className="seller-row">
                <span className="seller-name">{prod.name}</span>
                <span className="seller-vol">{formatNumber(prod.sales)} units</span>
                <span className="seller-growth">{prod.growth}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel ai-insight-panel">
          <h3><FiCpu size={18} color="#7C3AED" /> Seasonality & Macro Insights</h3>
          <p>
            AI model detects a **38% demand spike** commencing mid-October due to holiday consumer electronics production schedules. 
            Buffer capacity in Warehouse Hub USE-01 should be pre-allocated by **September 15**.
          </p>
          <div className="seasonality-tags">
            <span className="s-tag active"><FiSun size={12} /> Summer Spike (+12%)</span>
            <span className="s-tag"><FiCalendar size={12} /> Black Friday (1.45x)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastPage;
