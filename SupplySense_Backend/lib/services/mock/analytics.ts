import { AnalyticsServiceContract, AnalyticsKPIs } from '../contracts/analytics';
import { generateProducts, MOCK_SHIPMENTS, MOCK_PURCHASE_ORDERS, MOCK_RISKS, MOCK_EXECUTIVE_SUMMARY } from '@/lib/mock/fixtures';
import { InventorySummary, SupplyChainHealthScore } from '@/types';

const mockProducts = generateProducts(50);

export class MockAnalyticsService implements AnalyticsServiceContract {
  async getDashboardKPIs(): Promise<AnalyticsKPIs> {
    const totalValue = mockProducts.reduce((sum, p) => sum + p.totalValue, 0);
    const lowStockCount = mockProducts.filter(p => p.status === 'LOW_STOCK').length;
    const criticalCount = mockProducts.filter(p => p.status === 'CRITICAL').length;
    const activeShipmentsCount = MOCK_SHIPMENTS.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED').length;
    const delayedShipmentsCount = MOCK_SHIPMENTS.filter(s => s.status === 'DELAYED').length;
    const criticalRisksCount = MOCK_RISKS.filter(r => r.severity === 'CRITICAL').length;

    return {
      totalInventoryValue: totalValue,
      totalSkus: mockProducts.length,
      lowStockCount,
      criticalCount,
      activeShipmentsCount,
      delayedShipmentsCount,
      openPOsCount: MOCK_PURCHASE_ORDERS.length,
      criticalRisksCount,
    };
  }

  async getInventoryOverview(): Promise<InventorySummary> {
    const totalValue = mockProducts.reduce((sum, p) => sum + p.totalValue, 0);
    const lowStockCount = mockProducts.filter(p => p.status === 'LOW_STOCK').length;
    const criticalCount = mockProducts.filter(p => p.status === 'CRITICAL').length;
    const overstockCount = mockProducts.filter(p => p.status === 'OVERSTOCK').length;
    const expiredCount = mockProducts.filter(p => p.status === 'EXPIRED').length;
    const healthyCount = mockProducts.filter(p => p.status === 'OPTIMAL').length;

    return {
      totalSkus: mockProducts.length,
      totalValue,
      lowStockCount,
      criticalCount,
      overstockCount,
      expiredCount,
      healthyRatioPercentage: Number(((healthyCount / mockProducts.length) * 100).toFixed(1)),
    };
  }

  async getSupplyChainHealth(): Promise<SupplyChainHealthScore> {
    return MOCK_EXECUTIVE_SUMMARY.healthScore;
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
