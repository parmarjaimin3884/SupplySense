"""
SupplySense — Shipment & GRN Receiving Pydantic Schemas
=====================================================
"""

from typing import Optional, List
from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from backend.app.schemas.common import BaseResponse, PaginationMeta

class ShipmentCreatePayload(BaseModel):
    purchase_order_id: str
    carrier: Optional[str] = "BlueDart Logistics"
    vehicle_number: Optional[str] = "MH-04-SS-8842"
    dispatch_date: Optional[date] = None
    expected_arrival: Optional[date] = None
    current_location: Optional[str] = "Surat Gateway Terminal"

class ShipmentStatusUpdatePayload(BaseModel):
    status: str = Field(..., description="Status: DISPATCHED, IN_TRANSIT, DELIVERED, COMPLETED, DELAYED")
    current_location: Optional[str] = None
    delay_days: Optional[int] = 0
    delay_reason: Optional[str] = None

class GRNReceivingPayload(BaseModel):
    accepted_quantity: int = Field(..., gt=0, description="Inspected & accepted unit count")
    rejected_quantity: Optional[int] = 0
    inspection_result: Optional[str] = "PASSED"
    quality_issue: Optional[str] = None

class ShipmentResponse(BaseModel):
    id: str
    purchase_order_id: str
    po_number: Optional[str] = None
    product_name: Optional[str] = "Industrial Supply Component"
    sku: Optional[str] = "SKU-IND-01"
    quantity: int = 100
    carrier: Optional[str] = "BlueDart Logistics"
    vehicle_number: Optional[str] = "MH-04-SS-8842"
    current_status: str
    current_location: Optional[str] = "Central Depot"
    dispatch_date: Optional[date] = None
    expected_arrival: Optional[date] = None
    actual_arrival: Optional[date] = None
    delay_days: int = 0
    delay_reason: Optional[str] = None
    supplier_name: Optional[str] = "Tier-1 Vendor"
    warehouse_name: Optional[str] = "Surat Central Warehouse"
    accepted_quantity: Optional[int] = None
    inspection_result: Optional[str] = None

    class Config:
        from_attributes = True

class CarrierPerformanceResponse(BaseModel):
    carrier_name: str
    on_time_delivery_rate: float
    total_dispatches: int
    average_transit_days: float
    damaged_shipment_rate: float

    class Config:
        from_attributes = True
