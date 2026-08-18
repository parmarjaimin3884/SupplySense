import React, { useState } from 'react';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Table } from '../../components/ui/Table/Table';
import { StatusChip } from '../../components/ui/StatusChip/StatusChip';
import { RiskBadge } from '../../components/ui/RiskBadge/RiskBadge';

import { FiShoppingBag, FiCheck, FiX, FiCpu, FiDollarSign, FiClock, FiFileText } from 'react-icons/fi';

export const ProcurementPage = () => {
  const [orders, setOrders] = useState([
    { id: 'PO-9041', sku: 'SKU-1001', name: 'ProBook Ultra 15" Laptop (v1)', recommendedQty: 1200, supplier: 'Apex Electronics Supplier 1', cost: 840000, expectedDelivery: '2026-08-18', status: 'PENDING_APPROVAL', riskScore: 28 },
    { id: 'PO-9042', sku: 'SKU-1002', name: '65" 4K OLED Smart TV (v1)', recommendedQty: 800, supplier: 'Apex Electronics Supplier 2', cost: 720000, expectedDelivery: '2026-08-22', status: 'PENDING_APPROVAL', riskScore: 64 },
    { id: 'PO-9043', sku: 'SKU-1003', name: 'Flagship Phone 5G (v1)', recommendedQty: 2500, supplier: 'Apex Electronics Supplier 3', cost: 1250000, expectedDelivery: '2026-08-15', status: 'APPROVED', riskScore: 15 },
    { id: 'PO-9044', sku: 'SKU-1004', name: 'Fitness Watch Pro 4 (v1)', recommendedQty: 3500, supplier: 'Apex Electronics Supplier 4', cost: 525000, expectedDelivery: '2026-08-25', status: 'APPROVED', riskScore: 22 }
  ]);


  const handleApprove = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'APPROVED' } : o));
  };

  const handleReject = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'REJECTED' } : o));
  };

  const columns = [
    { header: 'PO Number', accessor: 'id', render: (val) => <span className="table-code">{val}</span> },
    { header: 'SKU / Item', accessor: 'name', render: (val, row) => `${val} (${row.sku})` },
    { header: 'AI Recommended Qty', accessor: 'recommendedQty', render: (val) => <strong>{formatNumber(val)} units</strong> },
    { header: 'Recommended Supplier', accessor: 'supplier' },
    { header: 'Estimated Cost', accessor: 'cost', render: (val) => formatCurrency(val) },
    { header: 'Est. Delivery', accessor: 'expectedDelivery' },
    { header: 'Risk Exposure', accessor: 'riskScore', render: (val) => <RiskBadge score={val} /> },
    { header: 'Approval Workflow', accessor: 'status', render: (val, row) => (
        val === 'PENDING_APPROVAL' ? (
          <div className="action-btns-row">
            <button className="approve-btn" onClick={() => handleApprove(row.id)}><FiCheck size={14} /> Approve PO</button>
            <button className="reject-btn" onClick={() => handleReject(row.id)}><FiX size={14} /></button>
          </div>
        ) : (
          <StatusChip status={val} />
        )
      )
    }
  ];

  return (
    <div className="procurement-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Autonomous AI Procurement Engine</h1>
          <p className="page-subtitle">Auto-generated PO drafts, supplier cost optimization & multi-stage approvals</p>
        </div>
      </div>

      {/* Top AI Optimization Card */}
      <div className="procurement-ai-banner">
        <div className="ai-banner-icon"><FiCpu size={24} /></div>
        <div>
          <h3>Smart Purchase Order Generation</h3>
          <p>
            SupplySense AI dynamically analyzed inventory depletion speeds across 5 hubs. 4 Purchase Orders totaling **$535,500** are recommended to maintain safety buffers through Q3 without capital bloat.
          </p>
        </div>
      </div>

      {/* Main PO Table */}
      <div className="table-container-card">
        <Table columns={columns} data={orders} />
      </div>
    </div>
  );
};

export default ProcurementPage;
