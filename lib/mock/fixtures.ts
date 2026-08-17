import {
  ProductItem,
  SupplierItem,
  WarehouseItem,
  PurchaseOrderItem,
  ShipmentItem,
  ForecastDataPoint,
  RiskItem,
  ExecutiveSummary,
} from '@/types';

export const CATEGORIES = [
  'Laptops & Workstations',
  'Smart TVs & Displays',
  'Smartphones & Tablets',
  'Smartwatches & Wearables',
  'Audio & Sound Systems',
  'Cameras & Imaging',
  'Servers & Networking'
];

export const BRANDS = ['Apple', 'Samsung', 'Dell', 'Sony', 'LG', 'Lenovo', 'Croma Enterprise', 'Asus', 'Bose'];

const WAREHOUSE_NAMES = [
  'US-East Central Hub (New Jersey)',
  'US-West Logistics Terminal (Oakland)',
  'EU Central Distribution (Rotterdam)',
  'APAC Gateway Hub (Singapore)',
  'East Asia Electronics Depot (Shenzhen)'
];

// Product Generator (50 SKUs for clean fixture data)
export const generateProducts = (count = 50): ProductItem[] => {
  const products: ProductItem[] = [];
  const templates: Record<string, string[]> = {
    'Laptops & Workstations': ['ProBook Ultra 15"', 'Gaming Beast X17', 'Z-Series Workstation', 'SlimBook Air 13"', 'Studio Touch 16"'],
    'Smart TVs & Displays': ['65" 4K OLED Smart TV', '55" QLED HDR TV', '34" UltraWide Curved Monitor', '75" 8K Crystal Display', '27" 240Hz Gaming Display'],
    'Smartphones & Tablets': ['Flagship Phone 5G', 'Pad Ultra 11" Tablet', 'Foldable Z-Phone', 'Lite 5G Smartphone', 'Enterprise Rugged Tablet'],
    'Smartwatches & Wearables': ['Fitness Watch Pro 4', 'Smart Band Active', 'AR Vision Smart Glasses', 'Health Track Wristband', 'GPS Outdoor Watch'],
    'Audio & Sound Systems': ['ANC Wireless Headphones', 'Soundbar 7.1 Surround System', 'Studio Monitor Speaker', 'Pro Earbuds Noise-Cancelling', 'High-Res Audio DAC Amplifier'],
    'Cameras & Imaging': ['4K Mirrorless Cinema Camera', 'IP Security Camera 4K', 'Action Cam 8K Ultra', 'Thermal Imaging Camera', 'Studio DSLR Body'],
    'Servers & Networking': ['Rack Server 2U Dual Xeon', 'Wi-Fi 7 Enterprise Router', '48-Port Managed Switch', 'NVMe SAN Storage Array', 'Edge AI Gateway Unit']
  };

  for (let i = 1; i <= count; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const categoryTemplates = templates[category];
    const baseName = categoryTemplates[i % categoryTemplates.length];
    const stock = (i * 37 + 120) % 4500;
    const minThreshold = 500;
    const maxThreshold = 4000;
    
    let status: ProductItem['status'] = 'OPTIMAL';
    if (stock < 200) status = 'CRITICAL';
    else if (stock < minThreshold) status = 'LOW_STOCK';
    else if (stock > 3800) status = 'OVERSTOCK';
    else if (i % 19 === 0) status = 'EXPIRED';

    const unitPrice = Number(((i * 24.5) % 1800 + 199.99).toFixed(2));
    const totalValue = Number((stock * unitPrice).toFixed(2));
    const brand = BRANDS[i % BRANDS.length];
    const warehouse = WAREHOUSE_NAMES[i % WAREHOUSE_NAMES.length];

    products.push({
      id: `SKU-${1000 + i}`,
      sku: `SKU-${1000 + i}`,
      name: `${brand} ${baseName} (v${(i % 4) + 1})`,
      category,
      brand,
      stockQuantity: stock,
      minThreshold,
      maxThreshold,
      unitPrice,
      totalValue,
      status,
      warehouse,
      supplier: `Apex Global Tech ${ (i % 25) + 1}`,
      leadTimeDays: (i % 14) + 4,
      lastRestocked: `2026-07-${String((i % 28) + 1).padStart(2, '0')}`,
      riskScore: Math.min(99, Math.max(10, (i * 17) % 100)),
      reorderLevel: minThreshold,
      safetyStock: Math.round(minThreshold * 0.4),
      turnoverRatio: Number(((i * 0.3) % 8 + 2.1).toFixed(1)),
      salesVelocity: (i * 15 + 40) % 400 + 80
    });
  }
  return products;
};

// 20 Suppliers Generator
export const generateSuppliers = (count = 20): SupplierItem[] => {
  const suppliers: SupplierItem[] = [];
  const regions = ['Taiwan', 'South Korea', 'Germany', 'USA', 'Japan', 'Vietnam', 'Mexico'];
  
  for (let i = 1; i <= count; i++) {
    const score = Math.min(98, Math.max(40, 100 - ((i * 7) % 55)));
    const risk = 100 - score;
    const region = regions[i % regions.length];
    const status: SupplierItem['status'] = risk > 55 ? 'HIGH_RISK' : risk > 30 ? 'MODERATE' : 'PREFERRED';

    suppliers.push({
      id: `SUP-${100 + i}`,
      name: `Apex Semiconductor Hub ${i}`,
      code: `SUP-${100 + i}`,
      region,
      category: CATEGORIES[i % CATEGORIES.length],
      rating: Number((score / 20).toFixed(1)),
      reliability: `${Math.min(99, Math.max(60, score + 2))}%`,
      qualityScore: `${Math.min(99, Math.max(65, score + 4))}%`,
      avgLeadTime: `${(i % 12) + 4} days`,
      onTimeDelivery: `${Math.min(99, Math.max(55, score - 3))}%`,
      defectRate: `${((100 - score) * 0.04).toFixed(1)}%`,
      riskScore: risk,
      activeOrders: (i % 8) + 1,
      totalSpend: Number((i * 145000 + 55000).toFixed(0)),
      status,
      contactEmail: `procurement@apex-semi-${i}.com`
    });
  }
  return suppliers;
};

// 10 Warehouses Generator
export const generateWarehouses = (count = 10): WarehouseItem[] => {
  const warehouses: WarehouseItem[] = [];
  const locations = [
    'New Jersey, USA', 'Oakland, CA, USA', 'Rotterdam, Netherlands', 
    'Jurong, Singapore', 'Shenzhen, China', 'Frankfurt, Germany', 
    'Tokyo Bay, Japan', 'Guadalajara, Mexico', 'Busan, South Korea'
  ];

  for (let i = 1; i <= count; i++) {
    const util = (i * 13 + 45) % 55 + 40;
    const status: WarehouseItem['status'] = util > 90 ? 'CRITICAL_CAPACITY' : util > 75 ? 'HIGH_UTILIZATION' : 'HEALTHY';
    const riskLevel = util > 88 ? 'HIGH' : util > 72 ? 'MEDIUM' : 'LOW';

    warehouses.push({
      id: `WH-${100 + i}`,
      name: `Warehouse Hub ${i} - ${locations[i % locations.length].split(',')[0]}`,
      code: `WH-${100 + i}`,
      location: locations[i % locations.length],
      utilization: util,
      capacitySqFt: `${(i * 15000 + 50000).toLocaleString()} sq ft`,
      storedSkus: (i * 45 + 120),
      activeWorkers: (i * 3 + 15),
      status,
      transferSuggestions: util > 85 ? `Transfer 12% excess stock to Hub ${(i % count) + 1}` : 'Capacity healthy. No rebalancing required.',
      inventoryValue: (i * 850000 + 2500000),
      riskLevel
    });
  }
  return warehouses;
};

// Purchase Orders
export const MOCK_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    id: 'PO-2026-8801',
    poNumber: 'PO-8801',
    supplierName: 'Apex Semiconductor Corp (Taiwan)',
    supplierId: 'SUP-101',
    warehouseName: 'US-East Central Hub (New Jersey)',
    orderDate: '2026-07-28',
    expectedDelivery: '2026-08-15',
    totalValue: 340000,
    status: 'SHIPPED',
    isDelayed: false,
    delayDays: 0,
    itemsCount: 1500,
    paymentTerms: 'Net 30',
    skuList: [
      { sku: 'SKU-1002', name: 'Apple ProBook Ultra 15"', quantity: 500, unitPrice: 400 },
      { sku: 'SKU-1005', name: 'Dell Z-Series Workstation', quantity: 1000, unitPrice: 140 }
    ]
  },
  {
    id: 'PO-2026-8802',
    poNumber: 'PO-8802',
    supplierName: 'EuroPower Lithium Components (Germany)',
    supplierId: 'SUP-103',
    warehouseName: 'EU Central Distribution (Rotterdam)',
    orderDate: '2026-07-20',
    expectedDelivery: '2026-08-05',
    totalValue: 195000,
    status: 'SUPPLIER_CONFIRMED',
    isDelayed: true,
    delayDays: 5,
    itemsCount: 2200,
    paymentTerms: 'Net 45',
    skuList: [
      { sku: 'SKU-1012', name: 'Bose Soundbar 7.1 Surround System', quantity: 2200, unitPrice: 88.63 }
    ]
  },
  {
    id: 'PO-2026-8803',
    poNumber: 'PO-8803',
    supplierName: 'Nippon Precision Optics (Japan)',
    supplierId: 'SUP-105',
    warehouseName: 'APAC Gateway Hub (Singapore)',
    orderDate: '2026-08-01',
    expectedDelivery: '2026-08-20',
    totalValue: 520000,
    status: 'PENDING_APPROVAL',
    isDelayed: false,
    delayDays: 0,
    itemsCount: 850,
    paymentTerms: 'Net 30',
    skuList: [
      { sku: 'SKU-1020', name: 'Sony 4K Mirrorless Cinema Camera', quantity: 850, unitPrice: 611.76 }
    ]
  }
];

// Shipments
export const MOCK_SHIPMENTS: ShipmentItem[] = [
  {
    id: 'SHP-9021',
    shipmentNo: 'SHP-9021',
    trackingNo: 'TRK-8890123-US',
    poNumber: 'PO-8801',
    supplier: 'Apex Semiconductor Corp',
    carrier: 'Oceanic Express Lines',
    origin: 'Shenzhen, China',
    destination: 'Oakland, CA, USA',
    departureDate: '2026-07-29',
    originalEta: '2026-08-12',
    revisedEta: '2026-08-16',
    status: 'DELAYED',
    delayReason: 'Weather warning in East China Sea & Port Congestion at Oakland',
    estimatedDaysDelay: 4,
    itemsCount: 14500,
    totalValue: 640000,
    riskScore: 84,
    progressPercentage: 65,
    currentCoordinates: { lat: 24.8, lng: 135.2, locationName: 'Philippine Sea Transit' }
  },
  {
    id: 'SHP-9022',
    shipmentNo: 'SHP-9022',
    trackingNo: 'TRK-9901452-EU',
    poNumber: 'PO-8802',
    supplier: 'EuroPower Lithium Components',
    carrier: 'DHL Air Freight Express',
    origin: 'Frankfurt, Germany',
    destination: 'Rotterdam, Netherlands',
    departureDate: '2026-08-08',
    originalEta: '2026-08-10',
    revisedEta: '2026-08-10',
    status: 'IN_TRANSIT',
    estimatedDaysDelay: 0,
    itemsCount: 3200,
    totalValue: 185000,
    riskScore: 22,
    progressPercentage: 82,
    currentCoordinates: { lat: 50.1, lng: 8.6, locationName: 'Central European Route' }
  }
];

// Demand Forecast Data
export const MOCK_FORECAST_DATA: ForecastDataPoint[] = [
  { month: 'Sep 25', historicalDemand: 14200, projectedDemand: 14200, lowerBound95: 13800, upperBound95: 14600 },
  { month: 'Oct 25', historicalDemand: 16800, projectedDemand: 16800, lowerBound95: 16100, upperBound95: 17400 },
  { month: 'Nov 25', historicalDemand: 22500, projectedDemand: 22500, lowerBound95: 21500, upperBound95: 23500 },
  { month: 'Dec 25', historicalDemand: 31000, projectedDemand: 31000, lowerBound95: 29800, upperBound95: 32200 },
  { month: 'Jan 26', historicalDemand: 18400, projectedDemand: 18400, lowerBound95: 17500, upperBound95: 19200 },
  { month: 'Feb 26', historicalDemand: 17200, projectedDemand: 17200, lowerBound95: 16400, upperBound95: 18000 },
  { month: 'Mar 26', historicalDemand: 19500, projectedDemand: 19500, lowerBound95: 18700, upperBound95: 20300 },
  { month: 'Apr 26', historicalDemand: 20100, projectedDemand: 20100, lowerBound95: 19200, upperBound95: 21000 },
  { month: 'May 26', historicalDemand: 21800, projectedDemand: 21800, lowerBound95: 20800, upperBound95: 22800 },
  { month: 'Jun 26', historicalDemand: 24200, projectedDemand: 24200, lowerBound95: 23000, upperBound95: 25400 },
  { month: 'Jul 26', historicalDemand: 23900, projectedDemand: 23900, lowerBound95: 22600, upperBound95: 25100 },
  { month: 'Aug 26 (Current)', historicalDemand: 25100, projectedDemand: 25100, lowerBound95: 23800, upperBound95: 26400 },
  { month: 'Sep 26 (Projected)', historicalDemand: null, projectedDemand: 26800, lowerBound95: 24900, upperBound95: 28700 },
  { month: 'Oct 26 (Projected)', historicalDemand: null, projectedDemand: 29400, lowerBound95: 27100, upperBound95: 31700 },
  { month: 'Nov 26 (Projected)', historicalDemand: null, projectedDemand: 36200, lowerBound95: 33400, upperBound95: 39000 },
  { month: 'Dec 26 (Projected)', historicalDemand: null, projectedDemand: 42500, lowerBound95: 38900, upperBound95: 46100 },
];

// Risks Feed
export const MOCK_RISKS: RiskItem[] = [
  {
    id: 'RSK-101',
    title: 'Port Clearance Bottleneck at Oakland Hub',
    severity: 'CRITICAL',
    category: 'LOGISTICS',
    entity: 'Shipment SHP-9021',
    entityType: 'Shipment',
    reason: 'Berth congestion + weather delay in East China Sea.',
    impact: 'Potential stockout across 14 West Coast retail outlets.',
    detectedTime: '2026-08-12T14:32:00Z',
    status: 'ACTIVE',
    recommendedAction: 'Reroute 20% inventory buffer via Seattle feeder port.',
    likelihoodScore: 3,
    impactScore: 3
  },
  {
    id: 'RSK-102',
    title: 'High Stockout Threat on ProBook Ultra 15"',
    severity: 'HIGH',
    category: 'INVENTORY',
    entity: 'SKU-1002 (ProBook Ultra)',
    entityType: 'Product',
    reason: 'Stock level dropped to 142 units (Min Threshold: 500).',
    impact: 'Potential revenue impact if not restocked within 5 business days.',
    detectedTime: '2026-08-12T11:15:00Z',
    status: 'ACTIVE',
    recommendedAction: 'Trigger purchase order to preferred supplier Apex Semiconductor.',
    likelihoodScore: 3,
    impactScore: 2
  }
];

// Executive Summary Data
export const MOCK_EXECUTIVE_SUMMARY: ExecutiveSummary = {
  healthScore: {
    overallScore: 88,
    inventoryHealth: 92,
    supplierHealth: 84,
    shipmentHealth: 79,
    demandHealth: 95,
    riskHealth: 86
  },
  totalInventoryValue: 48920500,
  workingCapitalEfficiency: '14.2 days turnover',
  top5Priorities: [
    'Mitigate Oakland port delay on shipment SHP-9021 before Q3 promotional spike.',
    'Authorize emergency PO for Apple ProBook Ultra 15" (SKU-1002) safety stock breach.',
    'Execute inter-warehouse rebalancing from New Jersey Depot (92% cap) to Rotterdam (64%).',
    'Renegotiate EuroPower Lithium SLA penalty clause following 5-day delivery slippage.',
    'Finalize Q4 holiday demand forecast approval with Executive Board.'
  ],
  boardBriefingSummary: `SupplySense operational intelligence indicates strong performance with an overall Supply Chain Health Score of 88/100. Total inventory valuation across distribution hubs stands at $48.9M. Primary immediate threat is a 4-day maritime delay on shipment SHP-9021.`
};
