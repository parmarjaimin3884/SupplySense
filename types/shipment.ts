export type ShipmentStatus = 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'AT_RISK';

export interface ShipmentItem {
  id: string;
  shipmentNo: string;
  poNumber: string;
  supplier: string;
  carrier: string;
  trackingNo: string;
  origin: string;
  destination: string;
  departureDate: string;
  originalEta: string;
  revisedEta: string;
  status: ShipmentStatus;
  delayReason?: string;
  estimatedDaysDelay: number;
  itemsCount: number;
  totalValue: number;
  riskScore: number;
  progressPercentage: number;
  currentCoordinates?: { lat: number; lng: number; locationName: string };
}
