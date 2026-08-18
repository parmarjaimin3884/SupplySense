import apiClient from './client';
import { generateProducts } from './mockData';
import { ProductItem, InventorySummary, InventoryQueryParams } from '@/types';

// Cached products for mock failover
const mockProducts = generateProducts(500);

export const inventoryApi = {
  async getInventory(params: InventoryQueryParams = {}): Promise<{
    data: ProductItem[];
    total: number;
    page: number;
    totalPages: number;
    summary: InventorySummary;
  }> {
    try {
      const response = await apiClient.get('/api/v1/inventory', { params });
      return response.data;
    } catch {
      // Mock Fallback Engine
      const {
        page = 1,
        limit = 10,
        search = '',
        status = 'ALL',
        category = 'ALL',
        warehouse = 'ALL',
        brand = 'ALL',
        sortBy = 'name'
      } = params;

      let filtered = [...mockProducts];

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

      if (warehouse !== 'ALL') {
        filtered = filtered.filter(p => p.warehouse === warehouse);
      }

      if (brand !== 'ALL') {
        filtered = filtered.filter(p => p.brand === brand);
      }

      // Sorting
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

      const totalValue = mockProducts.reduce((sum, p) => sum + p.totalValue, 0);
      const lowStockCount = mockProducts.filter(p => p.status === 'LOW_STOCK').length;
      const criticalCount = mockProducts.filter(p => p.status === 'CRITICAL').length;
      const overstockCount = mockProducts.filter(p => p.status === 'OVERSTOCK').length;
      const expiredCount = mockProducts.filter(p => p.status === 'EXPIRED').length;
      const healthyCount = mockProducts.filter(p => p.status === 'OPTIMAL').length;

      return {
        data: paginated,
        total,
        page,
        totalPages,
        summary: {
          totalSkus: mockProducts.length,
          totalValue,
          lowStockCount,
          criticalCount,
          overstockCount,
          expiredCount,
          healthyRatioPercentage: Number(((healthyCount / mockProducts.length) * 100).toFixed(1))
        }
      };
    }
  },

  async getInventoryItemById(id: string): Promise<ProductItem | null> {
    try {
      const response = await apiClient.get(`/api/v1/inventory/${id}`);
      return response.data;
    } catch {
      const item = mockProducts.find(p => p.id === id || p.sku === id);
      return item || mockProducts[0];
    }
  }
};
