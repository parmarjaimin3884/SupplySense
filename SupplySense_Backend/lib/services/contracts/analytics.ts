import { InventorySummary, SupplyChainHealthScore } from '@/types';

export interface AnalyticsKPIs {
  totalInventoryValue: number;
  totalSkus: number;
  lowStockCount: number;
  criticalCount: number;
  activeShipmentsCount: number;
  delayedShipmentsCount: number;
  openPOsCount: number;
  criticalRisksCount: number;
}

export interface AnalyticsServiceContract {
  getDashboardKPIs(): Promise<AnalyticsKPIs>;
  getInventoryOverview(): Promise<InventorySummary>;
  getSupplyChainHealth(): Promise<SupplyChainHealthScore>;
}
