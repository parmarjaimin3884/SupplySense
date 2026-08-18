export interface ForecastDataPoint {
  month: string;
  historicalDemand: number | null;
  projectedDemand: number;
  lowerBound95: number;
  upperBound95: number;
  actualDemand?: number;
}
