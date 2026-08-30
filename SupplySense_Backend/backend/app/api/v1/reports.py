"""
SupplySense — Dynamic Reports & DB Aggregates API v1 Router with Upstash Redis Caching
====================================================================================
"""

from typing import List, Dict, Any
from decimal import Decimal
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models import Inventory, Product, Warehouse, Supplier, PurchaseOrder, StockTransfer
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import get_db
from backend.app.core.redis import get_cache, set_cache

router = APIRouter(prefix="/reports", tags=["Executive Reports & DB Aggregates"])


@router.get(
    "/summary",
    response_model=BaseResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get Network Executive DB Aggregates",
    description="Returns live database aggregate totals for inventory valuation, active POs, and supplier SLAs.",
)
async def get_reports_summary(db: AsyncSession = Depends(get_db)) -> BaseResponse[Dict[str, Any]]:
    """Returns database summary metrics with 0ms Redis caching."""
    cache_key = "supplysense:reports:summary"
    
    # 1. Check Cloud Redis Cache (0ms Fast Read)
    cached_data = await get_cache(cache_key)
    if cached_data:
        return BaseResponse(
            success=True,
            message="Retrieved from Upstash Cloud Redis cache (0ms).",
            data=cached_data
        )

    # 2. Database Query on Cache Miss
    inv_val_stmt = (
        select(func.sum(Inventory.available_quantity * Product.cost_price))
        .select_from(Inventory)
        .join(Product, Inventory.product_id == Product.id)
    )
    total_inv_value = (await db.execute(inv_val_stmt)).scalar() or 0.0

    # Total Active PO Value
    po_val_stmt = select(func.sum(PurchaseOrder.total_amount)).where(PurchaseOrder.status.in_(["Pending", "Approved", "In Transit", "PENDING", "APPROVED"]))
    total_po_value = (await db.execute(po_val_stmt)).scalar() or 0.0

    # Counts
    wh_count = (await db.execute(select(func.count(Warehouse.id)))).scalar() or 0
    supp_count = (await db.execute(select(func.count(Supplier.id)))).scalar() or 0
    sku_count = (await db.execute(select(func.count(Product.id)))).scalar() or 0

    # Supplier Avg Reliability
    avg_rel_stmt = select(func.avg(Supplier.reliability_score))
    avg_reliability = (await db.execute(avg_rel_stmt)).scalar() or 0.0

    data = {
        "total_inventory_value_inr": float(total_inv_value),
        "total_active_po_value_inr": float(total_po_value),
        "warehouses_count": wh_count,
        "suppliers_count": supp_count,
        "products_count": sku_count,
        "average_supplier_sla": round(float(avg_reliability), 1),
    }

    # 3. Store in Cloud Redis with 5-minute TTL
    await set_cache(cache_key, data, ttl_seconds=300)

    return BaseResponse(
        success=True,
        message="Live DB report aggregates retrieved and cached.",
        data=data
    )
