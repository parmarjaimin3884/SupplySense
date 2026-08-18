"""
SupplySense — Freight Telematics & Shipment Pydantic v2 Schemas
================================================================
"""

from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Shipment ID.")
    purchase_order_id: str = Field(..., description="Associated PO ID.")
    carrier: Optional[str] = Field(default=None, description="Logistics carrier (e.g. Maersk, DHL, BlueDart).")
    vehicle_number: Optional[str] = Field(default=None, description="Vessel or vehicle tracking number.")
    current_status: str = Field(..., description="IN_TRANSIT, DELAYED, CUSTOMS_HOLD, DELIVERED.")
    current_location: Optional[str] = Field(default=None, description="GPS location or ocean port.")
    dispatch_date: Optional[date] = Field(default=None, description="Dispatch date.")
    expected_arrival: Optional[date] = Field(default=None, description="ETA date.")
    actual_arrival: Optional[date] = Field(default=None, description="Actual arrival date.")
    delay_days: Optional[int] = Field(default=0, description="Delay duration in days.")
    delay_reason: Optional[str] = Field(default=None, description="Delay root cause description.")


class CarrierPerformanceResponse(BaseModel):
    carrier_name: str = Field(..., description="Logistics carrier company.")
    total_shipments: int = Field(..., description="Total shipments handled.")
    on_time_deliveries: int = Field(..., description="On-time deliveries count.")
    delayed_shipments: int = Field(..., description="Delayed shipments count.")
    on_time_delivery_rate: float = Field(..., description="On-time SLA compliance %.")
    avg_delay_days: float = Field(..., description="Average delay duration.")
