import React, { useState, useEffect } from 'react';
import { mockApiService } from '../../services/mockApi';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';
import { Table } from '../../components/ui/Table/Table';
import { StatusChip } from '../../components/ui/StatusChip/StatusChip';
import { Pagination } from '../../components/ui/Pagination/Pagination';
import { SearchBox } from '../../components/ui/SearchBox/SearchBox';
import { Select } from '../../components/ui/Select/Select';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';
import { Heatmap } from '../../components/ui/Heatmap/Heatmap';
import { Drawer } from '../../components/ui/Drawer/Drawer';
import { Loader } from '../../components/ui/Loader/Loader';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FiBox, FiAlertTriangle, FiRefreshCw, FiSliders, FiCpu, FiTrendingDown, FiArchive } from 'react-icons/fi';

export const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    const res = await mockApiService.getProducts({
      page,
      limit: 10,
      search,
      status: statusFilter,
      category: categoryFilter
    });
    setProducts(res.data);
    setSummary(res.summary);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [page, search, statusFilter, categoryFilter]);

  const columns = [
    { header: 'SKU Code', accessor: 'sku', render: (val) => <span className="table-code">{val}</span> },
    { header: 'Product Name', accessor: 'name', render: (val, row) => (
        <div>
          <div className="table-pname">{val}</div>
          <div className="table-pcat">{row.category}</div>
        </div>
      ) 
    },
    { header: 'Stock Qty', accessor: 'stockQuantity', render: (val) => <strong>{formatNumber(val)}</strong> },
    { header: 'Unit Price', accessor: 'unitPrice', render: (val) => formatCurrency(val) },
    { header: 'Valuation', accessor: 'totalValue', render: (val) => formatCurrency(val) },
    { header: 'Status', accessor: 'status', render: (val) => <StatusChip status={val} /> },
    { header: 'Warehouse Location', accessor: 'warehouse' },
    { header: 'Risk Score', accessor: 'riskScore', render: (val) => (
        <span className={`risk-tag ${val > 70 ? 'high' : val > 40 ? 'med' : 'low'}`}>
          {val} / 100
        </span>
      )
    }
  ];

  const categoryPieData = [
    { name: 'Laptops & Workstations', value: 30 },
    { name: 'Smart TVs & Displays', value: 25 },
    { name: 'Smartphones & Tablets', value: 20 },
    { name: 'Servers & Networking', value: 15 },
    { name: 'Audio & Cameras', value: 10 }
  ];


  const COLORS = ['#3B82F6', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="inventory-page">
      {/* Header Banner */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Global Inventory Intelligence</h1>
          <p className="page-subtitle">Real-time SKU valuation, stock threshold monitors & AI rebalancing</p>
        </div>
        <button className="refresh-btn" onClick={fetchInventory}>
          <FiRefreshCw size={16} /> Sync Telematics
        </button>
      </div>

      {/* Summary KPI Bar */}
      {summary && (
        <div className="inventory-stats-bar">
          <div className="stat-box">
            <div className="stat-icon-wrapper blue"><FiBox size={20} /></div>
            <div>
              <div className="s-label">Total Active SKUs</div>
              <div className="s-val">{formatNumber(summary.totalSkus)}</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper purple"><FiArchive size={20} /></div>
            <div>
              <div className="s-label">Total Inventory Valuation</div>
              <div className="s-val">{formatCurrency(summary.totalValue)}</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper red"><FiAlertTriangle size={20} /></div>
            <div>
              <div className="s-label">Low Stock Alerts</div>
              <div className="s-val text-danger">{summary.lowStockCount}</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper amber"><FiTrendingDown size={20} /></div>
            <div>
              <div className="s-label">Overstocked SKUs</div>
              <div className="s-val text-warning">{summary.overstockCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="inventory-visuals-grid">
        <ChartCard title="Category Breakdown Valuation" subtitle="Distribution of capital across component types">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#131C2F', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Regional Warehouse Heatmap Risk" subtitle="Depot capacity & component bottleneck density">
          <Heatmap />
        </ChartCard>
      </div>

      {/* Filters & Actions Bar */}
      <div className="inventory-controls-card">
        <SearchBox
          placeholder="Search by SKU name or code..."
          value={search}
          onChange={(val) => setSearch(val)}
        />

        <div className="filters-group">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'OPTIMAL', label: 'Optimal' },
              { value: 'LOW_STOCK', label: 'Low Stock' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'OVERSTOCK', label: 'Overstock' },
              { value: 'EXPIRED', label: 'Expired' }
            ]}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...CATEGORIES.map(c => ({ value: c, label: c }))
            ]}
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader label="Fetching inventory database rows..." />
      ) : (
        <div className="table-container-card">
          <Table
            columns={columns}
            data={products}
            onRowClick={(row) => setSelectedProduct(row)}
          />
          <div className="table-footer-pagination">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Product Detail Drawer */}
      <Drawer
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : ''}
      >
        {selectedProduct && (
          <div className="product-drawer-content">
            <div className="drawer-status-header">
              <StatusChip status={selectedProduct.status} />
              <span className="drawer-risk-tag">Risk Score: {selectedProduct.riskScore} / 100</span>
            </div>

            <div className="drawer-info-grid">
              <div className="d-info-item">
                <span className="d-label">Category</span>
                <span className="d-val">{selectedProduct.category}</span>
              </div>
              <div className="d-info-item">
                <span className="d-label">Warehouse Depot</span>
                <span className="d-val">{selectedProduct.warehouse}</span>
              </div>
              <div className="d-info-item">
                <span className="d-label">Current Stock</span>
                <span className="d-val"><strong>{formatNumber(selectedProduct.stockQuantity)} units</strong></span>
              </div>
              <div className="d-info-item">
                <span className="d-label">Min Safety Threshold</span>
                <span className="d-val">{formatNumber(selectedProduct.minThreshold)} units</span>
              </div>
              <div className="d-info-item">
                <span className="d-label">Primary Supplier</span>
                <span className="d-val">{selectedProduct.supplier}</span>
              </div>
              <div className="d-info-item">
                <span className="d-label">Avg Lead Time</span>
                <span className="d-val">{selectedProduct.leadTimeDays} days</span>
              </div>
            </div>

            <div className="drawer-ai-advice">
              <h4><FiCpu color="#7C3AED" /> AI Reorder Recommendation</h4>
              <p>
                Based on historical consumption rates and seasonal Q3 demand spikes, SupplySense AI advises issuing a Purchase Order for **{selectedProduct.minThreshold * 2} units** to prevent buffer depletion.
              </p>
              <button className="create-po-btn" onClick={() => alert(`PO draft created for ${selectedProduct.sku}`)}>
                Auto-Generate PO Draft
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default InventoryPage;
