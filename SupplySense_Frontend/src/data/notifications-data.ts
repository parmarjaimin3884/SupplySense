export interface NotificationItem {
  id: string;
  type: "Critical" | "High" | "Medium" | "Low";
  category: "Inventory" | "Supplier" | "Forecast" | "System" | "Report";
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
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "Critical",
    category: "Inventory",
    title: "Stockout Risk",
    summary: "SKU TX-8820-A has 25 units left with only 2 days of supply before line stoppage.",
    description: "Current stock has dropped below critical emergency threshold. Predicted stockout within 48 hours based on active manufacturing burn rate.",
    timestamp: "2026-08-18T22:37:00Z",
    timeAgo: "2 minutes ago",
    isRead: false,
    affectedSKU: "TX-8820-A",
    currentStock: 25,
    daysRemaining: 2,
    potentialLoss: "$48,000",
    supplier: "ABC Electronics",
    recommendedAction: "Reorder 500 Units Immediately",
    aiInsight: "Predicted stockout within 48 hours. Expediting purchase order PO-8920 avoids $48k downtime loss.",
    actionLabel: "Approve Reorder",
    actionUrl: "/purchase-orders",
  },
  {
    id: "notif-2",
    type: "Critical",
    category: "Inventory",
    title: "Inventory Depletion Warning",
    summary: "MacBook Pro 16\" inventory expected to stock out within 6 days.",
    description: "MacBook Pro (M3 Pro) stock stands at 12 units against 20-unit safety stock threshold. Lead time from Apple Enterprise is 10 days.",
    timestamp: "2026-08-18T22:29:00Z",
    timeAgo: "10 minutes ago",
    isRead: false,
    affectedSKU: "MBP-M3-16",
    currentStock: 12,
    daysRemaining: 6,
    potentialLoss: "$175,000",
    supplier: "Apple Enterprise Distribution",
    recommendedAction: "Authorize replenishment PO-8921 for 80 units",
    aiInsight: "Delivery window requires PO release 48 hours prior to supplier manufacturing batch lock.",
    actionLabel: "Create Purchase Order",
    actionUrl: "/inventory/sku-mbp16",
  },
  {
    id: "notif-3",
    type: "High",
    category: "Supplier",
    title: "Supplier Delay Detected",
    summary: "ABC Electronics delivery reliability dropped 18% with +5 days delay on PO-8890.",
    description: "Inbound shipment PO-8890 delayed by 5 days due to component testing backlog at ABC Electronics facility.",
    timestamp: "2026-08-18T22:14:00Z",
    timeAgo: "25 minutes ago",
    isRead: false,
    supplier: "ABC Electronics",
    delayDays: 5,
    affectedSKUCount: 6,
    recommendedAction: "Shift 40% switch allocation to Kyoto Micro Tech",
    aiInsight: "ABC Electronics delivery reliability dropped 18% in 60 days. Alternate vendor Kyoto Micro Tech has 97.8% on-time record.",
    actionLabel: "Review Supplier",
    actionUrl: "/suppliers/sup-abc",
  },
  {
    id: "notif-4",
    type: "High",
    category: "Inventory",
    title: "Low Stock Warning",
    summary: "24-Port PoE+ Switch buffer reached 8 days of supply remaining.",
    description: "Current stock is 24 units. Minimum safety buffer is 35 units. Expected demand acceleration next month will breach baseline.",
    timestamp: "2026-08-18T21:59:00Z",
    timeAgo: "40 minutes ago",
    isRead: false,
    affectedSKU: "NET-GS728TP",
    currentStock: 24,
    daysRemaining: 8,
    potentialLoss: "$23,340",
    supplier: "ABC Electronics",
    recommendedAction: "Draft PO for 60 units",
    aiInsight: "Expanding safety buffer ahead of +22% projected campus networking demand.",
    actionLabel: "Review Reorder",
    actionUrl: "/purchase-orders",
  },
  {
    id: "notif-5",
    type: "Medium",
    category: "Forecast",
    title: "Forecast Spike Alert",
    summary: "Climate Controllers & Air Conditioning subassemblies demand spike +25%.",
    description: "Machine learning ensemble forecast detected statistical anomaly in seasonal order acceleration for thermal management components.",
    timestamp: "2026-08-18T21:39:00Z",
    timeAgo: "1 hour ago",
    isRead: true,
    productName: "Thermal Management & Climate Controllers",
    expectedDemandChange: "+25%",
    recommendedAction: "Increase safety stock buffer by 15%",
    aiInsight: "Predicted temperature peak will drive accelerated facility maintenance replacement cycles.",
    actionLabel: "Review Forecast",
    actionUrl: "/forecasting",
  },
  {
    id: "notif-6",
    type: "Medium",
    category: "Forecast",
    title: "Demand Spike: Networking Devices",
    summary: "Networking accessories & PoE+ switches expected to increase +22% next month.",
    description: "Forward demand signals indicate enterprise campus rollout cycles scheduled across Q3.",
    timestamp: "2026-08-18T20:39:00Z",
    timeAgo: "2 hours ago",
    isRead: true,
    productName: "Networking Devices",
    expectedDemandChange: "+22%",
    recommendedAction: "Recalibrate reorder point ROP by +20 units",
    aiInsight: "Adjusting forward buffers prevents emergency expedited air freight charges.",
    actionLabel: "Review Forecast",
    actionUrl: "/forecasting",
  },
  {
    id: "notif-7",
    type: "Low",
    category: "Report",
    title: "Weekly Valuation Report Generated",
    summary: "Warehouse Inventory Valuation & Stockout Audit report is ready for download.",
    description: "Automated executive weekly audit detailing $1.42M monitored capital, safety stock health, and supplier SLA performance.",
    timestamp: "2026-08-18T19:39:00Z",
    timeAgo: "3 hours ago",
    isRead: true,
    recommendedAction: "Download audit package",
    aiInsight: "Generated automatically every Monday at 08:00 UTC.",
    actionLabel: "View Reports",
    actionUrl: "/reports",
  },
  {
    id: "notif-8",
    type: "Low",
    category: "System",
    title: "ERP Telemetry Sync Complete",
    summary: "Warehouse floor sensors and ERP ledger synchronized (1,420 items verified).",
    description: "Data ingestion pipeline verified 100% data consistency across local warehouse inventory bays.",
    timestamp: "2026-08-18T17:39:00Z",
    timeAgo: "5 hours ago",
    isRead: true,
    recommendedAction: "Inspect synchronization log",
    aiInsight: "Zero telemetry packet loss across last 24 hours.",
    actionLabel: "View Settings",
    actionUrl: "/settings",
  },
];
