export interface SKUItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  onHand: number;
  available: number;
  safetyStock: number;
  daysRemaining: number;
  daysOfSupply: number;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  riskStatus: "Critical" | "Low Buffer" | "Optimal" | "Overstocked";
  recommendedAction: string;
  reorderQuantity: number;
  unitCost: number;
  supplier: string;
  leadTimeDays: number;
  forecastDemand30d: number;
  predictedDemandMonthly: number;
  confidenceScore: number;
  burnRatePerDay: number;
  status: "Critical" | "Low Stock" | "Healthy" | "Reorder Suggested";
  location: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  demandTrend: "Rising" | "Stable" | "Declining";
  alternateSupplier?: string;
  warehouses?: { name: string; onHand: number; bufferStatus: string }[];
}

export interface SupplierItem {
  id: string;
  name: string;
  performanceScore: number;
  onTimeDeliveryPct: number;
  otifRate: string;
  defectRatePpm: number;
  leadTimeVariance: string;
  riskStatus: "Healthy" | "At Risk" | "Under Review";
  riskScore: number;
  status: string;
  recentDelays: string;
  activeSpend: string;
  contactEmail: string;
  contactPhone: string;
  origin: string;
  activePOCount: number;
  paymentTerms: string;
  certifications: string[];
  recommendedAlternate: string;
  aiInsight: string;
  recentPOs: { poNumber: string; sku: string; qty: number; eta: string; status: string }[];
}

export interface ShipmentItem {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  itemCount: number;
  skus: string[];
  status: "In Transit" | "Customs Hold" | "Delivered" | "Delayed";
  delayRisk: "Critical" | "High" | "Medium" | "Low";
  disruptionProbability: number;
  estimatedArrival: string;
  historicalCarrierPerformance: number;
  aiInsight: string;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  sku: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  orderDate: string;
  expectedDelivery: string;
  status: "Draft" | "Approved" | "In Transit" | "Received";
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
}

export interface RiskItem {
  id: string;
  category: "Inventory" | "Supplier" | "Shipment" | "Forecast";
  level: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  businessImpact: string;
  recommendation: string;
  priority: "P0" | "P1" | "P2" | "P3";
  affectedEntity: string;
  timestamp: string;
  severity?: string;
  exposureValue?: string;
  impact?: string;
  recommendedAction?: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Inventory Manager";
  department: string;
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
  mfaEnabled: boolean;
}

export const MOCK_SKUS: SKUItem[] = [
  {
    id: "sku-mbp16",
    sku: "MBP-M3-16",
    name: "MacBook Pro 16\" (M3 Pro, 36GB, 512GB)",
    category: "Laptops & Compute",
    currentStock: 12,
    onHand: 12,
    available: 12,
    safetyStock: 20,
    daysRemaining: 6,
    daysOfSupply: 6,
    riskLevel: "Critical",
    riskStatus: "Critical",
    recommendedAction: "Create Purchase Order (80 units)",
    reorderQuantity: 80,
    unitCost: 2199.0,
    supplier: "Apple Enterprise Distribution",
    leadTimeDays: 10,
    forecastDemand30d: 140,
    predictedDemandMonthly: 140,
    confidenceScore: 98.2,
    burnRatePerDay: 2,
    status: "Critical",
    location: "Main Facility - Bay 3A",
    priority: "HIGH",
    demandTrend: "Rising",
    alternateSupplier: "Arrow Global Tech",
    warehouses: [{ name: "Main Facility - Bay 3A", onHand: 12, bufferStatus: "Stockout in 6d" }],
  },
  {
    id: "sku-net-sw",
    sku: "NET-GS728TP",
    name: "24-Port Gigabit PoE+ Smart Switch",
    category: "Networking",
    currentStock: 24,
    onHand: 24,
    available: 24,
    safetyStock: 35,
    daysRemaining: 8,
    daysOfSupply: 8,
    riskLevel: "High",
    riskStatus: "Low Buffer",
    recommendedAction: "Create Purchase Order (60 units)",
    reorderQuantity: 60,
    unitCost: 389.0,
    supplier: "ABC Electronics",
    leadTimeDays: 14,
    forecastDemand30d: 95,
    predictedDemandMonthly: 95,
    confidenceScore: 94.5,
    burnRatePerDay: 3,
    status: "Reorder Suggested",
    location: "Main Facility - Bay 1B",
    priority: "HIGH",
    demandTrend: "Rising",
    alternateSupplier: "Cisco Commercial Direct",
    warehouses: [{ name: "Main Facility - Bay 1B", onHand: 24, bufferStatus: "Low Buffer" }],
  },
  {
    id: "sku-nv-a100",
    sku: "GPU-A100-80",
    name: "Enterprise Tensor Core GPU 80GB SXM",
    category: "Accelerators",
    currentStock: 6,
    onHand: 6,
    available: 6,
    safetyStock: 10,
    daysRemaining: 5,
    daysOfSupply: 5,
    riskLevel: "Critical",
    riskStatus: "Critical",
    recommendedAction: "Authorize replenishment PO (15 units)",
    reorderQuantity: 15,
    unitCost: 11500.0,
    supplier: "Kyoto Micro Tech",
    leadTimeDays: 21,
    forecastDemand30d: 22,
    predictedDemandMonthly: 22,
    confidenceScore: 96.1,
    burnRatePerDay: 1.2,
    status: "Critical",
    location: "Main Facility - Secure Vault A",
    priority: "HIGH",
    demandTrend: "Rising",
    alternateSupplier: "Supermicro Direct",
    warehouses: [{ name: "Secure Vault A", onHand: 6, bufferStatus: "Critical Buffer" }],
  },
  {
    id: "sku-tb4-hub",
    sku: "DOCK-TB4-PRO",
    name: "Thunderbolt 4 Dual 4K Pro Dock",
    category: "Accessories",
    currentStock: 145,
    onHand: 145,
    available: 145,
    safetyStock: 80,
    daysRemaining: 42,
    daysOfSupply: 42,
    riskLevel: "Low",
    riskStatus: "Optimal",
    recommendedAction: "Maintain standard buffer",
    reorderQuantity: 0,
    unitCost: 145.0,
    supplier: "Nordic Extrusions",
    leadTimeDays: 7,
    forecastDemand30d: 110,
    predictedDemandMonthly: 110,
    confidenceScore: 99.1,
    burnRatePerDay: 3.5,
    status: "Healthy",
    location: "Main Facility - Bay 5C",
    priority: "LOW",
    demandTrend: "Stable",
    alternateSupplier: "CalDigit Partner",
    warehouses: [{ name: "Main Facility - Bay 5C", onHand: 145, bufferStatus: "Optimal" }],
  },
  {
    id: "sku-cat6a-100",
    sku: "CAB-CAT6A-BLK",
    name: "Cat6A Shielded Patch Cable 100-Pack",
    category: "Cabling",
    currentStock: 380,
    onHand: 380,
    available: 380,
    safetyStock: 150,
    daysRemaining: 76,
    daysOfSupply: 76,
    riskLevel: "Low",
    riskStatus: "Optimal",
    recommendedAction: "Buffer healthy",
    reorderQuantity: 0,
    unitCost: 42.0,
    supplier: "Taiwan Polymer Solutions",
    leadTimeDays: 5,
    forecastDemand30d: 160,
    predictedDemandMonthly: 160,
    confidenceScore: 97.4,
    burnRatePerDay: 5,
    status: "Healthy",
    location: "Main Facility - Bay 2A",
    priority: "LOW",
    demandTrend: "Stable",
    warehouses: [{ name: "Main Facility - Bay 2A", onHand: 380, bufferStatus: "Optimal" }],
  },
];

export const MOCK_SUPPLIERS: SupplierItem[] = [
  {
    id: "sup-abc",
    name: "ABC Electronics",
    performanceScore: 78,
    onTimeDeliveryPct: 82.0,
    otifRate: "82.0%",
    defectRatePpm: 340,
    leadTimeVariance: "+5.2 days",
    riskStatus: "At Risk",
    riskScore: 82,
    status: "High Risk",
    recentDelays: "+5 Days on PO-8890",
    activeSpend: "$480,000",
    contactEmail: "orders@abcelectronics.com",
    contactPhone: "+1 (555) 234-8900",
    origin: "San Jose, CA",
    activePOCount: 2,
    paymentTerms: "Net 30",
    certifications: ["ISO 9001"],
    recommendedAlternate: "Kyoto Micro Tech (97.8% On-Time)",
    aiInsight: "ABC Electronics delivery reliability dropped 18% during the last 60 days. Recommend dual-sourcing active networking purchase orders.",
    recentPOs: [
      { poNumber: "PO-8890", sku: "NET-GS728TP", qty: 60, eta: "Aug 26 (Delayed 5d)", status: "In Transit" },
    ],
  },
  {
    id: "sup-kyoto",
    name: "Kyoto Micro Tech",
    performanceScore: 96,
    onTimeDeliveryPct: 97.8,
    otifRate: "97.8%",
    defectRatePpm: 45,
    leadTimeVariance: "+0.4 days",
    riskStatus: "Healthy",
    riskScore: 14,
    status: "Preferred",
    recentDelays: "On-Time (0 days delay)",
    activeSpend: "$720,000",
    contactEmail: "sales@kyotomicro.jp",
    contactPhone: "+81 75 342 9011",
    origin: "Kyoto, Japan",
    activePOCount: 3,
    paymentTerms: "Net 45",
    certifications: ["ISO 9001", "IATF 16949"],
    recommendedAlternate: "Supermicro Direct",
    aiInsight: "Exceptional OTIF fulfillment across high-value compute modules. Primary candidate for volume shift.",
    recentPOs: [
      { poNumber: "PO-8799", sku: "GPU-A100-80", qty: 15, eta: "Aug 28", status: "Customs" },
    ],
  },
  {
    id: "sup-apple",
    name: "Apple Enterprise Distribution",
    performanceScore: 94,
    onTimeDeliveryPct: 95.5,
    otifRate: "95.5%",
    defectRatePpm: 8,
    leadTimeVariance: "+1.0 days",
    riskStatus: "Healthy",
    riskScore: 22,
    status: "Strategic Partner",
    recentDelays: "On-Time",
    activeSpend: "$1,240,000",
    contactEmail: "enterprise@apple.com",
    contactPhone: "+1 (800) 692-7753",
    origin: "Cupertino, CA",
    activePOCount: 2,
    paymentTerms: "Net 30",
    certifications: ["ISO 9001", "ISO 14001"],
    recommendedAlternate: "Arrow Global Tech",
    aiInsight: "Lead times stable at 10 days. Reorder window requires release 48h prior to weekend cycles.",
    recentPOs: [
      { poNumber: "PO-8921", sku: "MBP-M3-16", qty: 80, eta: "Aug 29", status: "Approved" },
    ],
  },
  {
    id: "sup-nordic",
    name: "Nordic Extrusions",
    performanceScore: 99,
    onTimeDeliveryPct: 99.2,
    otifRate: "99.2%",
    defectRatePpm: 12,
    leadTimeVariance: "-0.5 days",
    riskStatus: "Healthy",
    riskScore: 8,
    status: "Strategic Partner",
    recentDelays: "On-Time (-0.5 days early)",
    activeSpend: "$340,000",
    contactEmail: "supply@nordicextrusions.se",
    contactPhone: "+46 31 789 2000",
    origin: "Gothenburg, Sweden",
    activePOCount: 1,
    paymentTerms: "Net 30",
    certifications: ["ISO 9001", "ISO 14001"],
    recommendedAlternate: "Taiwan Polymer Solutions",
    aiInsight: "Consistently delivers ahead of schedule. Zero quality non-conformances in 12 months.",
    recentPOs: [
      { poNumber: "PO-8910", sku: "DOCK-TB4-PRO", qty: 100, eta: "Aug 30", status: "Delivered" },
    ],
  },
];

export const MOCK_SHIPMENTS: ShipmentItem[] = [
  {
    id: "sh-882",
    trackingNumber: "SH-882-US",
    carrier: "DHL Express Freight",
    origin: "San Jose Facility (ABC Electronics)",
    destination: "Main Warehouse",
    itemCount: 60,
    skus: ["NET-GS728TP"],
    status: "Delayed",
    delayRisk: "High",
    disruptionProbability: 84,
    estimatedArrival: "Aug 26 (+5 days delay)",
    historicalCarrierPerformance: 88,
    aiInsight: "Shipment SH-882 has a high probability of delay due to supplier lead-time variance and testing bottlenecks.",
  },
  {
    id: "sh-901",
    trackingNumber: "SH-901-JP",
    carrier: "Nippon Express Air",
    origin: "Kyoto Terminal",
    destination: "Main Warehouse",
    itemCount: 15,
    skus: ["GPU-A100-80"],
    status: "In Transit",
    delayRisk: "Low",
    disruptionProbability: 12,
    estimatedArrival: "Aug 28 (On Track)",
    historicalCarrierPerformance: 98,
    aiInsight: "Cleared Tokyo Air Cargo customs smoothly. Expected to arrive within scheduled 48h delivery window.",
  },
  {
    id: "sh-940",
    trackingNumber: "SH-940-CA",
    carrier: "FedEx Priority Freight",
    origin: "Cupertino Hub",
    destination: "Main Warehouse",
    itemCount: 80,
    skus: ["MBP-M3-16"],
    status: "In Transit",
    delayRisk: "Medium",
    disruptionProbability: 38,
    estimatedArrival: "Aug 29 (On Track)",
    historicalCarrierPerformance: 94,
    aiInsight: "Standard overland routing. Monitoring regional transit weather alerts.",
  },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    id: "po-1",
    poNumber: "PO-8921",
    sku: "MBP-M3-16",
    productName: "MacBook Pro 16\" (M3 Pro)",
    supplier: "Apple Enterprise Distribution",
    quantity: 80,
    unitCost: 2199.0,
    totalCost: 175920.0,
    orderDate: "2026-08-18",
    expectedDelivery: "2026-08-29",
    status: "Approved",
    priority: "HIGH",
    reason: "Stockout predicted in 6 days (current stock: 12).",
  },
  {
    id: "po-2",
    poNumber: "PO-8890",
    sku: "NET-GS728TP",
    productName: "24-Port Gigabit PoE+ Smart Switch",
    supplier: "ABC Electronics",
    quantity: 60,
    unitCost: 389.0,
    totalCost: 23340.0,
    orderDate: "2026-08-10",
    expectedDelivery: "2026-08-26",
    status: "In Transit",
    priority: "HIGH",
    reason: "Buffer replenishment for +22% projected networking demand surge.",
  },
  {
    id: "po-3",
    poNumber: "PO-8799",
    sku: "GPU-A100-80",
    productName: "Enterprise Tensor Core GPU 80GB",
    supplier: "Kyoto Micro Tech",
    quantity: 15,
    unitCost: 11500.0,
    totalCost: 172500.0,
    orderDate: "2026-08-05",
    expectedDelivery: "2026-08-28",
    status: "In Transit",
    priority: "HIGH",
    reason: "AI lab expansion hardware order.",
  },
];

export const MOCK_RISKS: RiskItem[] = [
  {
    id: "risk-inv-1",
    category: "Inventory",
    level: "Critical",
    title: "Critical Stockout: MacBook Pro 16\"",
    description: "MacBook Pro inventory expected to stock out within 6 days (Current: 12 units, Safety Stock: 20).",
    businessImpact: "$175,000 revenue at risk from deferred customer deliveries.",
    recommendation: "Authorize immediate Purchase Order PO-8921 for 80 units.",
    priority: "P0",
    affectedEntity: "MBP-M3-16",
    timestamp: "10m ago",
    severity: "P0",
    exposureValue: "$175,000",
    impact: "$175,000 revenue at risk from deferred customer deliveries.",
    recommendedAction: "Authorize immediate Purchase Order PO-8921 for 80 units.",
  },
  {
    id: "risk-sup-1",
    category: "Supplier",
    level: "High",
    title: "Supplier Reliability Drop: ABC Electronics",
    description: "ABC Electronics delivery reliability dropped 18% over the last 60 days with +5.2d lead-time variance.",
    businessImpact: "Affects replenishment timelines across 6 networking product lines.",
    recommendation: "Shift 40% volume to Kyoto Micro Tech or Cisco Commercial Direct.",
    priority: "P1",
    affectedEntity: "ABC Electronics",
    timestamp: "25m ago",
    severity: "P1",
    exposureValue: "$96,000",
    impact: "Affects replenishment timelines across 6 networking product lines.",
    recommendedAction: "Shift 40% volume to Kyoto Micro Tech or Cisco Commercial Direct.",
  },
  {
    id: "risk-sh-1",
    category: "Shipment",
    level: "High",
    title: "Shipment Delay: SH-882-US",
    description: "Shipment SH-882 has an 84% probability of 5-day delay due to supplier QA verification backlog.",
    businessImpact: "Pushes switch deployment buffer to 3 days remaining.",
    recommendation: "Request expedited carrier dispatch and notify downstream deployment teams.",
    priority: "P1",
    affectedEntity: "SH-882-US (DHL Express)",
    timestamp: "45m ago",
  },
  {
    id: "risk-fc-1",
    category: "Forecast",
    level: "Medium",
    title: "Demand Surge: Networking Devices (+22%)",
    description: "Demand spike expected next month for networking devices and PoE+ switches.",
    businessImpact: "Could cause stockout if reorder point is not adjusted by +15%.",
    recommendation: "Increase forward safety stock buffers on 24-Port switches by 20 units.",
    priority: "P2",
    affectedEntity: "Networking Category",
    timestamp: "1h ago",
  },
];

export const MOCK_USERS: UserItem[] = [
  {
    id: "usr-1",
    name: "Alex Sterling",
    email: "alex.sterling@enterprise.com",
    role: "Admin",
    department: "Supply Chain Operations",
    status: "Active",
    lastActive: "Just now",
    mfaEnabled: true,
  },
  {
    id: "usr-2",
    name: "Sarah Chen",
    email: "sarah.chen@enterprise.com",
    role: "Inventory Manager",
    department: "Warehouse & Procurement",
    status: "Active",
    lastActive: "10m ago",
    mfaEnabled: true,
  },
];

export const MOCK_REPORTS = [
  {
    id: "rep-1",
    title: "Warehouse Inventory Valuation & Safety Stock Audit",
    category: "Inventory",
    format: "PDF & XLSX",
    description: "Detailed breakdown of $1.42M active working capital, depot allocation, and low-buffer flags.",
    frequency: "Weekly (Every Mon 08:00 UTC)",
    fileSize: "2.4 MB",
    lastGenerated: "Yesterday at 08:00 UTC",
  },
  {
    id: "rep-2",
    title: "Supplier SLA Compliance & Quality Defect Audit",
    category: "Supplier",
    format: "PDF",
    description: "Quarterly OTIF performance metrics, defect rate PPM benchmarks, and dual-sourcing recommendations.",
    frequency: "Monthly (1st of month)",
    fileSize: "1.8 MB",
    lastGenerated: "3 days ago",
  },
  {
    id: "rep-3",
    title: "Quarterly Demand Forecast & Anomaly Projection",
    category: "Forecast",
    format: "XLSX",
    description: "90-day predictive velocity ensemble models with 95% confidence intervals across all product SKUs.",
    frequency: "Monthly",
    fileSize: "4.1 MB",
    lastGenerated: "1 week ago",
  },
  {
    id: "rep-4",
    title: "Executive Board Supply Chain Intelligence Pack",
    category: "Executive",
    format: "PDF",
    description: "High-level strategic briefing, capital-at-risk synthesis, and multi-echelon risk heatmaps.",
    frequency: "Quarterly",
    fileSize: "5.6 MB",
    lastGenerated: "2 weeks ago",
  },
];

export const MOCK_LOGISTICS_ROUTES = [
  {
    id: "route-1",
    corridor: "Trans-Pacific (Ningbo -> Long Beach)",
    carrier: "Maersk Line",
    status: "Delayed",
    delayDays: 11,
    reason: "Typhoon weather hold & berth congestion",
    disruptionRisk: "High",
    riskRating: "Critical",
    affectedContainers: 8,
  },
  {
    id: "route-2",
    corridor: "Trans-Atlantic (Antwerp -> Chicago)",
    carrier: "Hapag-Lloyd",
    status: "On Schedule",
    delayDays: 0,
    reason: "Normal maritime velocity",
    disruptionRisk: "Low",
    riskRating: "Low",
    affectedContainers: 0,
  },
  {
    id: "route-3",
    corridor: "Asia Air Express (Tokyo -> Dallas)",
    carrier: "DHL Express Air",
    status: "In Transit",
    delayDays: 1,
    reason: "Customs inspection clearance",
    disruptionRisk: "Medium",
    riskRating: "Medium",
    affectedContainers: 2,
  },
];

export const MOCK_AGENTS = [
  {
    id: "agent-inventory",
    name: "Inventory Velocity Copilot",
    role: "Automated Safety Stock & ROP Recalibration",
    status: "Active",
    description: "Monitors consumption velocity 24/7. Triggers draft purchase orders before stock drops below buffer.",
    triggerEvent: "Stockout horizon < 7 days",
    action: "Generate Draft PO with dynamic lead-time buffer",
    confidence: 99.4,
    impactMetric: "Zero Line Stoppages (99.8% Fill Rate)",
    tagline: "Dynamic Buffer & Safety Stock Balancing",
    exampleInsight: "Detected velocity spike on MacBook Pro 16. Burn rate increased from 1.2 to 2.0 units/day.",
    exampleAction: "Staged Purchase Order PO-8921 for 80 units with Apple Enterprise.",
    activeRules: "Safety stock < 14d supply · Demand drift > 15%",
    executionTag: "Draft PO Staged",
  },
  {
    id: "agent-risk",
    name: "Multi-Echelon Risk Sentinel",
    role: "Threat Detection & Supply Disruption Early Warning",
    status: "Active",
    description: "Evaluates freight telematics, geopolitics, and vendor lead-time drift to predict disruption impact.",
    triggerEvent: "Carrier delay > 3 days OR supplier SLA drift > 15%",
    action: "Stage alternate carrier dispatch & supplier volume shift",
    confidence: 96.8,
    impactMetric: "48-Hour Disruption Advance Warning",
    tagline: "Predictive Telematics & Threat Modeling",
    exampleInsight: "ABC Electronics delivery reliability dropped 18% with +5.2d lead-time drift.",
    exampleAction: "Recommended dual-sourcing 40% switch volume to Kyoto Micro Tech.",
    activeRules: "Lead-time variance > 3.0d · Carrier delay probability > 70%",
    executionTag: "Mitigation Plan Staged",
  },
  {
    id: "agent-forecast",
    name: "Demand Forecasting Ensemble",
    role: "Deep Demand Modeling & Spike Detection",
    status: "Active",
    description: "Runs seasonal, trend, and cyclical regression ensemble models over historical order streams.",
    triggerEvent: "Demand anomaly detected (> 15% variance)",
    action: "Recalibrate safety buffer parameters",
    confidence: 98.1,
    impactMetric: "96.8% 30-Day Forecast Accuracy",
    tagline: "Deep Ensemble Demand Modeling",
    exampleInsight: "Detected +22% demand acceleration for enterprise networking devices next month.",
    exampleAction: "Automatically adjusted reorder points by +20 units.",
    activeRules: "Ensemble confidence > 90% · Seasonal coefficient > 1.15",
    executionTag: "Buffers Recalibrated",
  },
  {
    id: "agent-supplier",
    name: "Supplier Scorecard & Dual-Sourcing Copilot",
    role: "Vendor Health & Reliability Optimization",
    status: "Active",
    description: "Continuously scores supplier performance, lead-time compliance, and quality defect rates.",
    triggerEvent: "Reliability score drops below 85%",
    action: "Recommend allocation shift to certified secondary vendor",
    confidence: 97.2,
    impactMetric: "$140k Annual Expedited Freight Savings",
    tagline: "Autonomous Vendor Scoring & SLA Audits",
    exampleInsight: "Kyoto Micro Tech maintains 97.8% on-time delivery with zero defect non-conformances.",
    exampleAction: "Staged master procurement contract allocation shift.",
    activeRules: "OTIF compliance < 90% · Defect rate > 50 PPM",
    executionTag: "Supplier Scorecard Updated",
  },
];


