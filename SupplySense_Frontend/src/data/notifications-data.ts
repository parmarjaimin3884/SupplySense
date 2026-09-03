export interface NotificationItem {
  id: string;
  type: "Critical" | "High" | "Medium" | "Low";
  category: "Inventory" | "Supplier" | "Shipment" | "Purchase Order" | "Warehouse" | "Quality" | "Forecast" | "System" | "Report";
  title: string;
  summary: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  timeAgo: string;
  affectedSKU?: string;
  currentStock?: number;
  daysRemaining?: number;
  potentialLoss?: string;
  supplier?: string;
  delayDays?: number;
  affectedSKUCount?: number;
  productName?: string;
  expectedDemandChange?: string;
  recommendedAction: string;
  aiInsight: string;
  actionLabel: string;
  actionUrl: string;
  warehouseName?: string;
  reorderLevel?: number;
}
