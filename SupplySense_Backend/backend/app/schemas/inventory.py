"""
SupplySense — Inventory Pydantic v2 Schemas
============================================
"""

from typing import Optional, List
from decimal import Decimal
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Inventory record ID.")
    warehouse_id: str = Field(..., description="Warehouse ID.")
    warehouse_name: Optional[str] = Field(default=None, description="Warehouse name.")
    product_id: str = Field(..., description="Product ID.")
    product_name: Optional[str] = Field(default=None, description="Product SKU name.")
    sku: Optional[str] = Field(default=None, description="Product SKU code.")
    category_name: Optional[str] = Field(default=None, description="Product category.")
    quantity_on_hand: int = Field(..., description="Total quantity on hand.")
    reserved_quantity: int = Field(..., description="Reserved quantity.")
    available_quantity: int = Field(..., description="Available quantity for sale/transfer.")
    damaged_quantity: int = Field(..., description="Damaged quantity.")
    stock_status: str = Field(default="OPTIMAL", description="CRITICAL, LOW_STOCK, OPTIMAL, OVERSTOCK.")
    total_value: Optional[Decimal] = Field(default=None, description="Stock value.")
    last_updated: Optional[date] = Field(default=None, description="Last stock update date.")


class InventoryDetailResponse(InventoryItemResponse):
    unit_cost: Optional[Decimal] = Field(default=None, description="Unit cost price.")
    reorder_level: Optional[int] = Field(default=None, description="Reorder threshold.")
    supplier_name: Optional[str] = Field(default=None, description="Primary supplier name.")


class InventoryMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Movement ID.")
    warehouse_id: str = Field(..., description="Warehouse ID.")
    warehouse_name: Optional[str] = Field(default=None, description="Warehouse name.")
    product_id: str = Field(..., description="Product ID.")
    product_name: Optional[str] = Field(default=None, description="Product name.")
    movement_type: str = Field(..., description="INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT.")
    quantity: int = Field(..., description="Quantity moved.")
    reference_id: Optional[str] = Field(default=None, description="PO/SO/Transfer reference.")
    movement_date: date = Field(..., description="Movement date.")
