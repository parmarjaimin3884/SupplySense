"""
SupplySense — Stock Transfer & Rebalancing Schemas
===================================================
"""

from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class StockTransferResponse(BaseModel):
    id: str
    from_warehouse_id: str
    from_warehouse_name: Optional[str] = None
    from_warehouse_code: Optional[str] = None
    to_warehouse_id: str
    to_warehouse_name: Optional[str] = None
    to_warehouse_code: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    sku: Optional[str] = None
    quantity: int
    reason: Optional[str] = None
    transfer_date: str
    status: str

    class Config:
        from_attributes = True


class StockTransferCreateRequest(BaseModel):
    from_warehouse_id: str = Field(..., description="Source warehouse UUID or warehouse code")
    to_warehouse_id: str = Field(..., description="Destination warehouse UUID or warehouse code")
    product_id: str = Field(..., description="Product UUID or SKU")
    quantity: int = Field(..., gt=0, description="Transfer quantity")
    reason: Optional[str] = Field("Network rebalancing surplus to deficit hub", description="Transfer reason")


class StockTransferRecommendation(BaseModel):
    product_id: str
    product_name: str
    sku: str
    from_warehouse_id: str
    from_warehouse_name: str
    from_warehouse_code: str
    from_available_qty: int
    from_utilization_pct: float
    to_warehouse_id: str
    to_warehouse_name: str
    to_warehouse_code: str
    to_available_qty: int
    to_reorder_level: int
    to_utilization_pct: float
    recommended_transfer_qty: int
    reason: str
    estimated_transit_days: int
    estimated_cost_savings: float
