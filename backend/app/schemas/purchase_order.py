"""
SupplySense — Purchase Order Pydantic v2 Schemas
=================================================
"""

from typing import Optional, List
from decimal import Decimal
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class PurchaseOrderItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Item ID.")
    product_id: str = Field(..., description="Product ID.")
    product_name: Optional[str] = Field(default=None, description="Product name.")
    sku: Optional[str] = Field(default=None, description="Product SKU.")
    quantity: int = Field(..., description="Ordered quantity.")
    unit_price: Decimal = Field(..., description="Unit purchase price.")
    total_price: Decimal = Field(..., description="Line total price.")


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="PO ID.")
    supplier_id: str = Field(..., description="Supplier ID.")
    supplier_name: Optional[str] = Field(default=None, description="Supplier company name.")
    warehouse_id: str = Field(..., description="Target Warehouse ID.")
    warehouse_name: Optional[str] = Field(default=None, description="Target Warehouse name.")
    order_date: date = Field(..., description="PO issuance date.")
    expected_delivery_date: Optional[date] = Field(default=None, description="Expected SLA delivery date.")
    status: str = Field(..., description="Draft, Pending, Approved, Shipped, Delivered, Rejected.")
    priority: Optional[str] = Field(default="Normal", description="Normal, High, Urgent.")
    approved_by: Optional[str] = Field(default=None, description="Approving manager username.")
    total_amount: Decimal = Field(..., description="Total PO value.")


class PurchaseOrderDetailResponse(PurchaseOrderResponse):
    items: List[PurchaseOrderItemSchema] = Field(default_factory=list, description="PO line items.")
