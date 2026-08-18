export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'RESOLVED';

export interface RiskItem {
  id: string;
  title: string;
  severity: RiskSeverity;
  category: 'SUPPLY_CHAIN' | 'INVENTORY' | 'LOGISTICS' | 'SUPPLIER' | 'WEATHER';
  entity: string;
  entityType: 'Product' | 'Warehouse' | 'Supplier' | 'Shipment' | 'Purchase Order';
  reason: string;
  impact: string;
  detectedTime: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
  recommendedAction: string;
  likelihoodScore: number;
  impactScore: number;
}
