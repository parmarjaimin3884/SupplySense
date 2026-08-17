// Enterprise Mock Data Generator for SupplySense AI

// Generate 500 Electronics Products
const categories = [
  'Laptops & Workstations',
  'Smart TVs & Displays',
  'Smartphones & Tablets',
  'Smartwatches & Wearables',
  'Audio & Sound Systems',
  'Cameras & Imaging',
  'Servers & Networking'
];

const productTemplates = {
  'Laptops & Workstations': ['ProBook Ultra 15"', 'Gaming Beast X17', 'Z-Series Workstation', 'SlimBook Air 13"', 'Studio Touch 16"'],
  'Smart TVs & Displays': ['65" 4K OLED Smart TV', '55" QLED HDR TV', '34" UltraWide Curved Monitor', '75" 8K Crystal Display', '27" 240Hz Gaming Display'],
  'Smartphones & Tablets': ['Flagship Phone 5G', 'Pad Ultra 11" Tablet', 'Foldable Z-Phone', 'Lite 5G Smartphone', 'Enterprise Rugged Tablet'],
  'Smartwatches & Wearables': ['Fitness Watch Pro 4', 'Smart Band Active', 'AR Vision Smart Glasses', 'Health Track Wristband', 'GPS Outdoor Watch'],
  'Audio & Sound Systems': ['ANC Wireless Headphones', 'Soundbar 7.1 Surround System', 'Studio Monitor Speaker', 'Pro Earbuds Noise-Cancelling', 'High-Res Audio DAC Amplifier'],
  'Cameras & Imaging': ['4K Mirrorless Cinema Camera', 'IP Security Camera 4K', 'Action Cam 8K Ultra', 'Thermal Imaging Camera', 'Studio DSLR Body'],
  'Servers & Networking': ['Rack Server 2U Dual Xeon', 'Wi-Fi 7 Enterprise Router', '48-Port Managed Switch', 'NVMe SAN Storage Array', 'Edge AI Gateway Unit']
};

const warehousesList = [
  { id: 'wh-1', name: 'US-East Central Hub (New Jersey)', code: 'USE-01', location: 'New Jersey, USA', capacity: '92%' },
  { id: 'wh-2', name: 'US-West Logistics Terminal (Oakland)', code: 'USW-02', location: 'Oakland, CA, USA', capacity: '78%' },
  { id: 'wh-3', name: 'EU Central Distribution (Rotterdam)', code: 'EUR-01', location: 'Rotterdam, Netherlands', capacity: '85%' },
  { id: 'wh-4', name: 'APAC Gateway Hub (Singapore)', code: 'SGP-01', location: 'Jurong, Singapore', capacity: '64%' },
  { id: 'wh-5', name: 'East Asia Electronics Depot (Shenzhen)', code: 'SZX-01', location: 'Shenzhen, China', capacity: '95%' }
];

export const generateProducts = (count = 500) => {
  const products = [];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const templates = productTemplates[category];
    const baseName = templates[i % templates.length];
    const stock = (i * 37 + 120) % 4500;
    const minThreshold = 500;
    let status = 'OPTIMAL';
    if (stock < 200) status = 'CRITICAL';
    else if (stock < minThreshold) status = 'LOW_STOCK';
    else if (stock > 3800) status = 'OVERSTOCK';
    else if (i % 19 === 0) status = 'EXPIRED';

    products.push({
      id: `SKU-${1000 + i}`,
      name: `${baseName} (v${(i % 5) + 1})`,
      category,
      sku: `SKU-${1000 + i}`,
      stockQuantity: stock,
      minThreshold,
      maxThreshold: 4000,
      unitPrice: Number(((i * 24.5) % 1800 + 199.99).toFixed(2)),
      totalValue: Number((stock * ((i * 24.5) % 1800 + 199.99)).toFixed(2)),
      status,
      warehouse: warehousesList[i % warehousesList.length].name,
      supplier: `Apex Electronics Supplier ${(i % 25) + 1}`,
      leadTimeDays: (i % 14) + 3,
      lastRestocked: `2026-07-${String((i % 28) + 1).padStart(2, '0')}`,
      riskScore: Math.min(99, Math.max(10, (i * 17) % 100))
    });
  }
  return products;
};


// Generate 100 Suppliers
export const generateSuppliers = (count = 100) => {
  const suppliers = [];
  const regions = ['Taiwan', 'South Korea', 'Germany', 'USA', 'Japan', 'Vietnam', 'Mexico'];
  
  for (let i = 1; i <= count; i++) {
    const score = Math.min(98, Math.max(40, 100 - ((i * 7) % 55)));
    const risk = 100 - score;
    suppliers.push({
      id: `SUP-${100 + i}`,
      name: `Apex Global Semiconductor ${i}`,
      code: `SUP-${100 + i}`,
      region: regions[i % regions.length],
      category: categories[i % categories.length],
      rating: Number(((score / 20).toFixed(1))),
      reliability: `${Math.min(99, Math.max(60, score + 2))}%`,
      qualityScore: `${Math.min(99, Math.max(65, score + 4))}%`,
      avgLeadTime: `${(i % 12) + 4} days`,
      onTimeDelivery: `${Math.min(99, Math.max(55, score - 3))}%`,
      riskScore: risk,
      activeOrders: (i % 8) + 1,
      totalSpend: Number((i * 125000 + 45000).toFixed(0)),
      status: risk > 60 ? 'HIGH_RISK' : risk > 35 ? 'MODERATE' : 'PREFERRED'
    });
  }
  return suppliers;
};

// Generate 50 Warehouses
export const generateWarehouses = (count = 50) => {
  const warehouses = [];
  const locations = [
    'New Jersey, USA', 'Oakland, CA, USA', 'Rotterdam, Netherlands', 
    'Singapore Gateway', 'Shenzhen, China', 'Frankfurt, Germany', 
    'Tokyo Bay, Japan', 'Guadalajara, Mexico', 'Busan, South Korea'
  ];

  for (let i = 1; i <= count; i++) {
    const util = (i * 13 + 45) % 55 + 40;
    warehouses.push({
      id: `WH-${100 + i}`,
      name: `Warehouse Hub ${i} - ${locations[i % locations.length].split(',')[0]}`,
      code: `WH-${100 + i}`,
      location: locations[i % locations.length],
      utilization: util,
      capacitySqFt: `${(i * 15000 + 50000).toLocaleString()} sq ft`,
      storedSkus: (i * 45 + 120),
      activeWorkers: (i * 3 + 15),
      status: util > 90 ? 'CRITICAL_CAPACITY' : util > 75 ? 'HIGH_UTILIZATION' : 'HEALTHY',
      transferSuggestions: util > 85 ? `Suggest transferring 15% stock to Hub ${(i % count) + 1}` : 'No transfer required'
    });
  }
  return warehouses;
};

// Shipments
export const generateShipments = () => {
  return [
    {
      id: 'SHP-9021',
      trackingNo: 'TRK-8890123-US',
      origin: 'Shenzhen, China',
      destination: 'Oakland, CA, USA',
      carrier: 'Oceanic Express Lines',
      itemsCount: 14500,
      value: 640000,
      status: 'DELAYED',
      delayReason: 'Typhoon Weather Warning in East China Sea',
      estimatedDaysDelay: 4,
      originalEta: '2026-08-04',
      revisedEta: '2026-08-08',
      riskScore: 84,
      progress: 65
    },
    {
      id: 'SHP-9022',
      trackingNo: 'TRK-9901452-EU',
      origin: 'Rotterdam, Netherlands',
      destination: 'Frankfurt, Germany',
      carrier: 'DHL Freight Transit',
      itemsCount: 3200,
      value: 185000,
      status: 'IN_TRANSIT',
      delayReason: 'On Schedule',
      estimatedDaysDelay: 0,
      originalEta: '2026-08-03',
      revisedEta: '2026-08-03',
      riskScore: 12,
      progress: 88
    },
    {
      id: 'SHP-9023',
      trackingNo: 'TRK-3341908-APAC',
      origin: 'Taipei, Taiwan',
      destination: 'Singapore Hub',
      carrier: 'Cathay Cargo Air',
      itemsCount: 8900,
      value: 1250000,
      status: 'CRITICAL_ALERT',
      delayReason: 'Customs Port Clearance Inspection Hold',
      estimatedDaysDelay: 6,
      originalEta: '2026-08-02',
      revisedEta: '2026-08-08',
      riskScore: 92,
      progress: 40
    },
    {
      id: 'SHP-9024',
      trackingNo: 'TRK-1102948-US',
      origin: 'Guadalajara, Mexico',
      destination: 'Dallas Freight Depot',
      carrier: 'FedEx Custom Critical',
      itemsCount: 6100,
      value: 310000,
      status: 'DELIVERED',
      delayReason: 'None',
      estimatedDaysDelay: 0,
      originalEta: '2026-08-01',
      revisedEta: '2026-08-01',
      riskScore: 5,
      progress: 100
    }
  ];
};

// Executive Dashboard Charts & Metrics
export const dashboardMetrics = {
  kpis: {
    inventoryHealth: { value: 94.2, label: 'Inventory Health Index', change: '+2.4%', isPositive: true },
    ordersToday: { value: 1428, label: 'Orders Processed Today', change: '+18.5%', isPositive: true },
    globalRiskIndex: { value: 68, label: 'Global Supply Risk Score', change: '+6 pts', isPositive: false },
    delayedShipments: { value: 14, label: 'Delayed High-Priority Shipments', change: '-3', isPositive: true },
    supplierReliability: { value: 91.8, label: 'Avg Supplier Reliability', change: '+1.1%', isPositive: true },
    warehouseCapacity: { value: 84.5, label: 'Avg Storage Utilization', change: '+3.2%', isPositive: false },
    revenueAtRisk: { value: 420000, label: 'Est Risk Revenue Impact', change: '-$45K', isPositive: true }
  },

  charts: {
    inventoryTrend: [
      { day: 'Day 1', value: 12.4, threshold: 10.0 },
      { day: 'Day 5', value: 13.1, threshold: 10.0 },
      { day: 'Day 10', value: 12.8, threshold: 10.0 },
      { day: 'Day 15', value: 14.2, threshold: 10.0 },
      { day: 'Day 20', value: 13.9, threshold: 10.0 },
      { day: 'Day 25', value: 14.8, threshold: 10.0 },
      { day: 'Day 30', value: 15.4, threshold: 10.0 }
    ],

    demandForecast: [
      { month: 'Jan', actual: 1240, forecast: 1200 },
      { month: 'Feb', actual: 1380, forecast: 1350 },
      { month: 'Mar', actual: 1450, forecast: 1420 },
      { month: 'Apr', actual: 1510, forecast: 1500 },
      { month: 'May', actual: 1680, forecast: 1650 },
      { month: 'Jun', actual: 1820, forecast: 1800 },
      { month: 'Jul', actual: 1950, forecast: 1910 }
    ],

    supplierPerformance: [
      { name: 'Apex Semi', score: 92 },
      { name: 'Nippon Sensors', score: 98 },
      { name: 'EuroPower Lithium', score: 74 },
      { name: 'SinoDisplay Tech', score: 81 },
      { name: 'AmeriConnect', score: 95 }
    ]
  },

  aiRecommendations: [
    {
      id: 'rec-1',
      action: 'Re-route 20% MCU allocation to Apex Semi (Germany)',
      description: 'Taiwan port congestion causing 4.5 day delay. Re-routing saves line stoppage penalty.',
      impact: '$140,000 Saved'
    },
    {
      id: 'rec-2',
      action: 'Issue PO for 3,000 units of SKU-1042',
      description: 'Buffer depletion predicted in 14 days based on seasonal summer spike.',
      impact: 'High Priority'
    },
    {
      id: 'rec-3',
      action: 'Transfer 400 Lithium units to Oakland Depot',
      description: 'NJ Hub capacity breached 92%. Spatial rebalancing recommended.',
      impact: '$18,400 Monthly Savings'
    }
  ],

  recentActivities: [
    { id: 'act-1', time: '14:22', type: 'INVENTORY', text: 'SKU-1042 safety threshold warning triggered in Rotterdam Hub.' },
    { id: 'act-2', time: '14:10', type: 'RISK', text: 'AI Risk Radar updated Taiwan geopolitical threat score to 68.' },
    { id: 'act-3', time: '13:45', type: 'SHIPMENT', text: 'Shipment SHP-9021 customs clearance verified at Port of Oakland.' },
    { id: 'act-4', time: '13:00', type: 'SUPPLIER', text: 'EuroPower SLA compliance report updated (74% on-time delivery).' }
  ]
};


// Mock Initial Notifications
export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'Critical Risk Alert: Microcontroller Stockout Warning',
    message: 'SupplySense AI predicts stock depletion of MCU Model A-412 in 14 days due to supplier shipment delays.',
    severity: 'CRITICAL',
    timestamp: '10 minutes ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Shipment Delayed: SHP-9021',
    message: 'Oceanic Express shipping container delayed by 4 days due to typhoon weather in East China Sea.',
    severity: 'HIGH',
    timestamp: '45 minutes ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'PO Auto-Recommendation Approved',
    message: 'Purchase Order #PO-8812 for 5,000 Lithium Battery Cells automatically queued for procurement review.',
    severity: 'MEDIUM',
    timestamp: '2 hours ago',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Warehouse Capacity Warning: Rotterdam Hub',
    message: 'EU Central Distribution has reached 85% storage capacity limit. Redistribution recommended.',
    severity: 'MEDIUM',
    timestamp: '4 hours ago',
    read: true
  }
];
