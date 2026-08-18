export interface SupplyChainHealthScore {
  overallScore: number;
  inventoryHealth: number;
  supplierHealth: number;
  shipmentHealth: number;
  demandHealth: number;
  riskHealth: number;
}

export interface ExecutiveSummary {
  healthScore: SupplyChainHealthScore;
  totalInventoryValue: number;
  workingCapitalEfficiency: string;
  top5Priorities: string[];
  boardBriefingSummary: string;
}
