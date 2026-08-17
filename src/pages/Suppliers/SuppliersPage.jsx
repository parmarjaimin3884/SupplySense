import React, { useState, useEffect } from 'react';
import { mockApiService } from '../../services/mockApi';
import { formatCurrency } from '../../utils/formatters';
import { SearchBox } from '../../components/ui/SearchBox/SearchBox';
import { StatusChip } from '../../components/ui/StatusChip/StatusChip';
import { Drawer } from '../../components/ui/Drawer/Drawer';
import { Loader } from '../../components/ui/Loader/Loader';
import { FiUsers, FiStar, FiClock, FiCheckCircle, FiShield, FiCpu, FiTrendingUp, FiMapPin } from 'react-icons/fi';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    const res = await mockApiService.getSuppliers({ search, status: tabFilter });
    setSuppliers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, tabFilter]);

  return (
    <div className="suppliers-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Global Vendor & Supplier Intelligence</h1>
          <p className="page-subtitle">SLA compliance, geopolitical exposure risk & lead time analytics</p>
        </div>
      </div>

      {/* AI Vendor Recommendation Banner */}
      <div className="ai-supplier-recommendation">
        <div className="ai-rec-icon"><FiCpu size={22} /></div>
        <div className="ai-rec-text">
          <strong>AI Optimal Vendor Rebalancing Notice:</strong> Apex Global Semiconductor (Germany) shows a **98.4% reliability rating** with 4 days shorter transit lead times compared to Asian hubs. Reallocating 15% of Q3 MCU orders will save an estimated **$85,000 in ocean freight buffer costs**.
        </div>
      </div>

      {/* Controls & Filter Tabs */}
      <div className="supplier-controls-bar">
        <SearchBox
          placeholder="Search suppliers by name, code, or country..."
          value={search}
          onChange={(val) => setSearch(val)}
        />

        <div className="tab-pills">
          <button className={`tab-btn ${tabFilter === 'ALL' ? 'active' : ''}`} onClick={() => setTabFilter('ALL')}>
            All Vendors ({suppliers.length})
          </button>
          <button className={`tab-btn ${tabFilter === 'PREFERRED' ? 'active' : ''}`} onClick={() => setTabFilter('PREFERRED')}>
            Preferred Tier
          </button>
          <button className={`tab-btn ${tabFilter === 'MODERATE' ? 'active' : ''}`} onClick={() => setTabFilter('MODERATE')}>
            Moderate Risk
          </button>
          <button className={`tab-btn ${tabFilter === 'HIGH_RISK' ? 'active' : ''}`} onClick={() => setTabFilter('HIGH_RISK')}>
            High Risk Alerts
          </button>
        </div>
      </div>

      {/* Supplier Grid Cards */}
      {loading ? (
        <Loader label="Evaluating vendor performance metrics & SLA history..." />
      ) : (
        <div className="suppliers-card-grid">
          {suppliers.map((s) => (
            <div key={s.id} className="supplier-card" onClick={() => setSelectedSupplier(s)}>
              <div className="sup-card-top">
                <div>
                  <h3 className="sup-name">{s.name}</h3>
                  <span className="sup-code"><FiMapPin size={12} /> {s.region} • {s.code}</span>
                </div>
                <StatusChip status={s.status} />
              </div>

              <div className="sup-metrics-row">
                <div className="sup-metric">
                  <span className="m-label">Rating</span>
                  <span className="m-val text-amber"><FiStar size={12} /> {s.rating} / 5</span>
                </div>
                <div className="sup-metric">
                  <span className="m-label">Reliability</span>
                  <span className="m-val text-blue">{s.reliability}</span>
                </div>
                <div className="sup-metric">
                  <span className="m-label">Lead Time</span>
                  <span className="m-val">{s.avgLeadTime}</span>
                </div>
                <div className="sup-metric">
                  <span className="m-label">Risk Index</span>
                  <span className={`m-val ${s.riskScore > 50 ? 'text-danger' : 'text-success'}`}>
                    {s.riskScore} / 100
                  </span>
                </div>
              </div>

              <div className="sup-progress-bar-group">
                <div className="bar-info">
                  <span>On-Time SLA Delivery</span>
                  <strong>{s.onTimeDelivery}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: s.onTimeDelivery }} />
                </div>
              </div>

              <div className="sup-card-footer">
                <span>Active POs: <strong>{s.activeOrders}</strong></span>
                <span>Annual Spend: <strong>{formatCurrency(s.totalSpend)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Details Slide-out Drawer */}
      <Drawer
        isOpen={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        title={selectedSupplier ? selectedSupplier.name : ''}
      >
        {selectedSupplier && (
          <div className="supplier-drawer-details">
            <div className="sup-drawer-header">
              <StatusChip status={selectedSupplier.status} />
              <span className="sup-code-large">{selectedSupplier.code} • {selectedSupplier.region}</span>
            </div>

            <div className="sup-stats-grid">
              <div className="s-stat-item">
                <span className="lbl">Rating Score</span>
                <span className="val"><FiStar color="#F59E0B" /> {selectedSupplier.rating} / 5</span>
              </div>
              <div className="s-stat-item">
                <span className="lbl">Quality SLA</span>
                <span className="val">{selectedSupplier.qualityScore}</span>
              </div>
              <div className="s-stat-item">
                <span className="lbl">Avg Lead Time</span>
                <span className="val">{selectedSupplier.avgLeadTime}</span>
              </div>
              <div className="s-stat-item">
                <span className="lbl">Annual Order Spend</span>
                <span className="val">{formatCurrency(selectedSupplier.totalSpend)}</span>
              </div>
            </div>

            <div className="sup-ai-breakdown">
              <h4><FiCpu color="#7C3AED" /> Risk Exposure Analysis</h4>
              <p>
                Geopolitical tension index in {selectedSupplier.region} is currently rated **Low-Moderate**. Lead time volatility over past 90 days has remained within a safe **±1.5 day margin**.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SuppliersPage;
