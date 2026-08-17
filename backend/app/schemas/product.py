"""
SupplySense — Product Catalog Pydantic v2 Schemas
==================================================
"""

from typing import Optional
from decimal import Decimal
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Product ID.")
    name: str = Field(..., description="Product name.")
    sku: str = Field(..., description="Unique SKU code.")
    barcode: Optional[str] = Field(default=None, description="Barcode/EAN.")
    brand_id: str = Field(..., description="Brand ID.")
    brand_name: Optional[str] = Field(default=None, description="Brand name.")
    category_id: str = Field(..., description="Category ID.")
    category_name: Optional[str] = Field(default=None, description="Category name.")
    supplier_id: str = Field(..., description="Supplier ID.")
    supplier_name: Optional[str] = Field(default=None, description="Supplier company name.")
    cost_price: Decimal = Field(..., description="Unit cost price.")
    selling_price: Decimal = Field(..., description="Selling price.")
    mrp: Decimal = Field(..., description="Maximum retail price.")
    reorder_level: Optional[int] = Field(default=0, description="Reorder trigger level.")
    average_daily_sales: Optional[int] = Field(default=0, description="Average daily sales velocity.")
    lead_time: Optional[int] = Field(default=0, description="Replenishment lead time in days.")


class ProductDetailResponse(ProductResponse):
    warranty: Optional[str] = Field(default=None, description="Warranty terms.")
    weight: Optional[Decimal] = Field(default=None, description="Weight in kg.")
    dimensions: Optional[str] = Field(default=None, description="Dimensions string.")
    launch_date: Optional[date] = Field(default=None, description="Market launch date.")
    economic_order_quantity: Optional[int] = Field(default=None, description="EOQ calculation.")
    total_on_hand_stock: Optional[int] = Field(default=0, description="Summed stock across all hubs.")
