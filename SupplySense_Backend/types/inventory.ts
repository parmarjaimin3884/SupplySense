export type StockStatus = 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OVERSTOCK' | 'EXPIRED';

export interface InventorySummary {
  totalSkus: number;
  totalValue: number;
  lowStockCount: number;
  criticalCount: number;
  overstockCount: number;
  expiredCount: number;
  healthyRatioPercentage: number;
}

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StockStatus | 'ALL';
  category?: string | 'ALL';
  warehouse?: string | 'ALL';
  brand?: string | 'ALL';
  sortBy?: string;
}
