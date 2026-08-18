export type WarehouseStatus = 'HEALTHY' | 'HIGH_UTILIZATION' | 'CRITICAL_CAPACITY';

export interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  location: string;
  utilization: number; // percentage
  capacitySqFt: string;
  storedSkus: number;
  activeWorkers: number;
  status: WarehouseStatus;
  transferSuggestions?: string;
  inventoryValue: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
