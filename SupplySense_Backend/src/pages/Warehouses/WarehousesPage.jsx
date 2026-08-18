import React, { useState, useEffect } from 'react';
import { mockApiService } from '../../services/mockApi';
import { ProgressRing } from '../../components/ui/ProgressRing/ProgressRing';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';
import { Loader } from '../../components/ui/Loader/Loader';

import { FiDatabase, FiMapPin, FiCpu, FiArrowRight, FiHardDrive } from 'react-icons/fi';

export const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApiService.getWarehouses().then((res) => {
      setWarehouses(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="warehouses-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Global Warehouse Network & Rebalancing</h1>
          <p className="page-subtitle">Spatial capacity, temperature-controlled storage & depot transfer suggestions</p>
        </div>
      </div>

      {/* AI Transfer Rebalancing Banner */}
      <div className="ai-rebalance-banner">
        <div className="ai-banner-icon"><FiCpu size={22} /></div>
        <div>
          <h3>AI Automated Rebalancing Prescription</h3>
          <p>
            US-East Central Hub (NJ) is operating at **92% spatial capacity**, while US-West Terminal (Oakland) is at **78%**. 
            Transferring **400 units of SKU-1042** via rail freight will reduce storage overflow fees by **$18,400/month**.
          </p>
        </div>
      </div>

      {/* Warehouses Grid Cards */}
      {loading ? (
        <Loader label="Fetching global warehouse telematics..." />
      ) : (
        <div className="warehouses-grid">
          {warehouses.slice(0, 6).map((wh) => (
            <div key={wh.id} className="wh-card">
              <div className="wh-card-top">
                <div className="wh-icon"><FiDatabase size={20} /></div>
                <div>
                  <h3 className="wh-name">{wh.name}</h3>
                  <span className="wh-code"><FiMapPin size={12} /> {wh.location}</span>
                </div>
              </div>

              <div className="wh-ring-row">
                <ProgressRing progress={parseInt(wh.capacity)} size={84} strokeWidth={8} color={parseInt(wh.capacity) > 85 ? '#EF4444' : '#3B82F6'} />
                <div className="wh-capacity-info">
                  <span className="wh-lbl">Spatial Capacity</span>
                  <span className="wh-val">{wh.capacity} Utilized</span>
                  <span className="wh-sub">Status: {parseInt(wh.capacity) > 85 ? 'HIGH DENSITY' : 'OPTIMAL'}</span>
                </div>
              </div>

              <div className="wh-card-footer">
                <button className="transfer-btn" onClick={() => alert(`Rebalancing order initiated for ${wh.code}`)}>
                  Suggest Stock Transfer <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
