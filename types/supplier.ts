export type SupplierStatus = 'PREFERRED' | 'MODERATE' | 'HIGH_RISK';

export interface SupplierItem {
  id: string;
  name: string;
  code: string;
  region: string;
  category: string;
  rating: number; // 0 - 5.0
  reliability: string; // e.g. "98%"
  qualityScore: string; // e.g. "96%"
  avgLeadTime: string; // e.g. "12 days"
  onTimeDelivery: string; // e.g. "94%"
  defectRate: string; // e.g. "0.8%"
  riskScore: number; // 0 - 100
  activeOrders: number;
  totalSpend: number;
  status: SupplierStatus;
  contactEmail: string;
}
