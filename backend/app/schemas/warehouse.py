"""
SupplySense — Warehouse Telematics Pydantic v2 Schemas
======================================================
"""

from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class WarehouseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Warehouse ID.")
    warehouse_code: str = Field(..., description="Unique warehouse code.")
    name: str = Field(..., description="Warehouse name.")
    manager: Optional[str] = Field(default=None, description="Assigned manager name.")
    capacity: int = Field(..., description="Total storage capacity units.")
    current_utilization: Optional[Decimal] = Field(default=Decimal("0.0"), description="Capacity utilization %.")
    operating_hours: Optional[str] = Field(default=None, description="Operating schedule.")


class WarehouseUtilizationResponse(BaseModel):
    warehouse_id: str = Field(..., description="Warehouse ID.")
    name: str = Field(..., description="Warehouse name.")
    warehouse_code: str = Field(..., description="Warehouse code.")
    capacity: int = Field(..., description="Max capacity.")
    used_units: int = Field(..., description="Units stored.")
    utilization_percentage: float = Field(..., description="Utilization %.")
    status: str = Field(..., description="OPTIMAL, NEAR_CAPACITY, OVERFLOW, UNDERUTILIZED.")


class WarehouseCapacityResponse(BaseModel):
    total_network_capacity: int = Field(..., description="Total storage units across all depots.")
    total_used_capacity: int = Field(..., description="Total units stored network-wide.")
    avg_utilization_pct: float = Field(..., description="Network average utilization %.")
    overfilled_depots_count: int = Field(..., description="Hubs with > 90% utilization.")
    underutilized_depots_count: int = Field(..., description="Hubs with < 40% utilization.")
