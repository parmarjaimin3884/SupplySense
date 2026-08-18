import { StockStatus } from './inventory';

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  stockQuantity: number;
  minThreshold: number;
  maxThreshold: number;
  unitPrice: number;
  totalValue: number;
  status: StockStatus;
  warehouse: string;
  supplier: string;
  leadTimeDays: number;
  lastRestocked: string;
  riskScore: number;
  reorderLevel: number;
  safetyStock: number;
  turnoverRatio: number;
  salesVelocity: number; // units / month
}
