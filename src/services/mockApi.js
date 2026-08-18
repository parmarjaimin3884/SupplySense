import axios from 'axios';
import {
  generateProducts,
  generateSuppliers,
  generateWarehouses,
  generateShipments,
  dashboardMetrics,
  initialNotifications
} from './dummyData';

// Create a customized Axios instance
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000
});

// Cache mock datasets in memory
let productsCache = generateProducts(500);
let suppliersCache = generateSuppliers(100);
let warehousesCache = generateWarehouses(50);
let shipmentsCache = generateShipments();
let notificationsCache = [...initialNotifications];

// Simulated Async Delay helper
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiService = {
  // Inventory Endpoints
  async getProducts(params = {}) {
    await delay(300);
    const { page = 1, limit = 10, search = '', status = 'ALL', category = 'ALL', sortBy = 'name' } = params;
    
    let filtered = [...productsCache];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (status !== 'ALL') {
      filtered = filtered.filter(p => p.status === status);
    }

    if (category !== 'ALL') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'stockAsc') return a.stockQuantity - b.stockQuantity;
      if (sortBy === 'stockDesc') return b.stockQuantity - a.stockQuantity;
      if (sortBy === 'valueDesc') return b.totalValue - a.totalValue;
      if (sortBy === 'riskDesc') return b.riskScore - a.riskScore;
      return a.name.localeCompare(b.name);
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages,
      summary: {
        totalSkus: productsCache.length,
        totalValue: productsCache.reduce((acc, p) => acc + p.totalValue, 0),
        lowStockCount: productsCache.filter(p => p.status === 'LOW_STOCK' || p.status === 'CRITICAL').length,
        overstockCount: productsCache.filter(p => p.status === 'OVERSTOCK').length,
        expiredCount: productsCache.filter(p => p.status === 'EXPIRED').length
      }
    };
  },

  // Supplier Endpoints
  async getSuppliers(params = {}) {
    await delay(300);
    const { search = '', status = 'ALL' } = params;
    let list = [...suppliersCache];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
    }
    if (status !== 'ALL') {
      list = list.filter(s => s.status === status);
    }
    return { data: list, total: list.length };
  },

  // Warehouses
  async getWarehouses() {
    await delay(250);
    return { data: warehousesCache };
  },

  // Shipments
  async getShipments() {
    await delay(300);
    return { data: shipmentsCache };
  },

  // Executive Dashboard
  async getDashboardData() {
    await delay(350);
    return { data: dashboardMetrics };
  },

  // Notifications
  async getNotifications() {
    await delay(200);
    return { data: notificationsCache };
  },

  async markNotificationRead(id) {
    await delay(150);
    notificationsCache = notificationsCache.map(n => n.id === id ? { ...n, read: true } : n);
    return { success: true };
  },

  // AI Knowledge Base & Assistant Query Simulator
  async askAiAssistant(question) {
    await delay(800);
    const qLower = question.toLowerCase();

    let answer = "SupplySense AI model analyzed real-time telematics and ERP streams. Key observation: Stock rebalancing is recommended for high-demand microcontrollers before Wk 33.";

    if (qLower.includes('risk') || qLower.includes('delay')) {
      answer = "### Risk Alert Insights\n- **Primary Vulnerability**: Semiconductor shipments from Taiwan face a +4 day port clearance bottleneck.\n- **Recommended Action**: Pivot 20% order allocation to backup supplier Apex Semi (Germany Hub). Estimated savings in delay penalty: **$140,000**.";
    } else if (qLower.includes('inventory') || qLower.includes('stock')) {
      answer = "### Stock Health Assessment\n- Current optimal stock ratio: **94.2%**.\n- 14 SKUs require immediate PO authorization to prevent buffer breach in Q3.\n- Safety stock recommendation: Increase MCU A-412 reserve by 15%.";
    } else if (qLower.includes('supplier')) {
      answer = "### Supplier Performance Summary\n- **Top Reliable Supplier**: Nippon Sensors (98% quality rating, 12-day lead time).\n- **High Risk Notice**: EuroPower Lithium on-time delivery dropped to 74% due to raw lithium price volatility.";
    }

    return {
      answer,
      sources: [
        { title: 'ERP Inventory Ledger 2026-Q3.pdf', snippet: 'SKU-1042 safety stock levels dropping below 200 units.' },
        { title: 'Ocean Freight Customs Manifest.csv', snippet: 'Port of Oakland container queue delay index +14%.' },
        { title: 'Supplier SLA Contracts 2026.docx', snippet: 'EuroPower SLA clause 4.2 penalty threshold reached.' }
      ],
      timestamp: new Date().toLocaleTimeString()
    };
  }
};

export default api;
