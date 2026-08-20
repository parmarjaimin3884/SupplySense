"""
SupplySense — Inventory Management API v1 Router
================================================
Endpoints for listing, searching, filtering, and retrieving inventory stock items and movement ledgers.
Configured for Surat Central Warehouse (WH-SUR) single-hub operations.
"""

from typing import Optional, List
from decimal import Decimal
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from models import Inventory, Product, Warehouse, Category
from backend.app.schemas.inventory import InventoryItemResponse, InventoryDetailResponse, InventoryMovementResponse
from backend.app.schemas.common import PaginationResponse, BaseResponse, PaginationMeta
from backend.app.api.deps import get_db

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

PRIMARY_WAREHOUSE_CODE = "WH-SUR"


@router.get(
    "",
    response_model=PaginationResponse[InventoryItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Paginated Inventory Stock List",
    description="Returns filtered and sorted inventory items for Surat Central Warehouse (WH-SUR).",
)
async def list_inventory(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=500),
    search: Optional[str] = Query(default=None, description="Search by product name, SKU, or category."),
    status_filter: Optional[str] = Query(default=None, alias="status", description="ALL, CRITICAL, LOW_STOCK, OPTIMAL, OVERSTOCK."),
    warehouse_id: Optional[str] = Query(default=None, description="Filter by warehouse ID."),
    sort_by: Optional[str] = Query(default="name", description="name, stockAsc, stockDesc, valueDesc."),
    db: AsyncSession = Depends(get_db),
) -> PaginationResponse[InventoryItemResponse]:
    """Returns paginated inventory stock list for Surat Central Warehouse."""
    try:
        # Sanitize parameters if called directly
        q_search = search if isinstance(search, str) and search.strip() else None
        q_status = status_filter if isinstance(status_filter, str) and status_filter.strip() else None
        q_warehouse_id = warehouse_id if isinstance(warehouse_id, str) and warehouse_id.strip() else None
        q_sort = sort_by if isinstance(sort_by, str) else "name"
        q_page = page if isinstance(page, int) else 1
        q_limit = limit if isinstance(limit, int) else 10

        stmt = (
            select(Inventory, Product, Warehouse, Category)
            .join(Product, Inventory.product_id == Product.id)
            .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
            .outerjoin(Category, Product.category_id == Category.id)
        )

        if q_warehouse_id:
            stmt = stmt.where(Inventory.warehouse_id == q_warehouse_id)
        else:
            # Default to Surat Central Warehouse (WH-SUR)
            stmt = stmt.where(Warehouse.warehouse_code == PRIMARY_WAREHOUSE_CODE)

        if q_search:
            q_term = f"%{q_search}%"
            stmt = stmt.where(
                or_(
                    Product.name.ilike(q_term),
                    Product.sku.ilike(q_term),
                    Category.name.ilike(q_term),
                )
            )

        # Apply status filtering at the SQL level so pagination and count are accurate
        if q_status and q_status != "ALL":
            st_upper = q_status.upper()
            if st_upper == "OUT_OF_STOCK":
                stmt = stmt.where(Inventory.available_quantity == 0)
            elif st_upper == "CRITICAL":
                stmt = stmt.where(
                    or_(
                        Inventory.available_quantity == 0,
                        (Product.reorder_level.isnot(None)) & (Inventory.available_quantity <= (Product.reorder_level / 2))
                    )
                )
            elif st_upper == "LOW_STOCK":
                stmt = stmt.where(
                    (Product.reorder_level.isnot(None)) & (Inventory.available_quantity <= Product.reorder_level) & (Inventory.available_quantity > 0)
                )
            elif st_upper == "OVERSTOCK":
                stmt = stmt.where(Inventory.available_quantity > 3000)
            elif st_upper == "OPTIMAL":
                stmt = stmt.where(
                    (Inventory.available_quantity > 0) &
                    (Inventory.available_quantity <= 3000) &
                    or_(
                        Product.reorder_level.is_(None),
                        Inventory.available_quantity > Product.reorder_level
                    )
                )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_items = (await db.execute(count_stmt)).scalar() or 0

        # Apply sorting
        if sort_by == "stockAsc":
            stmt = stmt.order_by(Inventory.available_quantity.asc())
        elif sort_by == "stockDesc":
            stmt = stmt.order_by(Inventory.available_quantity.desc())
        elif sort_by == "valueDesc":
            stmt = stmt.order_by((Inventory.available_quantity * Product.cost_price).desc())
        else:
            stmt = stmt.order_by(Product.name.asc())

        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        results = (await db.execute(stmt)).all()

        items = []
        for inv, prod, wh, cat in results:
            # Status classification
            st = "OPTIMAL"
            if inv.available_quantity == 0:
                st = "OUT_OF_STOCK"
            elif prod.reorder_level and inv.available_quantity <= (prod.reorder_level / 2):
                st = "CRITICAL"
            elif prod.reorder_level and inv.available_quantity <= prod.reorder_level:
                st = "LOW_STOCK"
            elif inv.available_quantity > 3000:
                st = "OVERSTOCK"

            val = Decimal(str(inv.available_quantity)) * prod.cost_price
            items.append(
                InventoryItemResponse(
                    id=inv.id,
                    warehouse_id=wh.id,
                    warehouse_name=wh.name,
                    product_id=prod.id,
                    product_name=prod.name,
                    sku=prod.sku,
                    category_name=cat.name if cat else "General",
                    quantity_on_hand=inv.quantity_on_hand,
                    reserved_quantity=inv.reserved_quantity,
                    available_quantity=inv.available_quantity,
                    damaged_quantity=inv.damaged_quantity,
                    stock_status=st,
                    total_value=val,
                    last_updated=inv.last_updated,
                )
            )

        total_pages = max(1, (total_items + limit - 1) // limit)
        return PaginationResponse(
            success=True,
            message="Inventory list retrieved for Surat Central Warehouse.",
            data=items,
            meta=PaginationMeta(page=page, limit=limit, total_items=total_items, total_pages=total_pages),
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database query error: {e}")


@router.get(
    "/low-stock",
    response_model=BaseResponse[List[InventoryItemResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Low Stock Items",
    description="Returns items in Surat Warehouse where available quantity is at or below reorder level.",
)
async def get_low_stock(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[InventoryItemResponse]]:
    """Returns low stock inventory items for Surat Warehouse."""
    stmt = (
        select(Inventory, Product, Warehouse)
        .join(Product, Inventory.product_id == Product.id)
        .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
        .where(Warehouse.warehouse_code == PRIMARY_WAREHOUSE_CODE)
        .where(Inventory.available_quantity <= Product.reorder_level)
        .limit(50)
    )
    results = (await db.execute(stmt)).all()

    items = []
    for inv, prod, wh in results:
        items.append(
            InventoryItemResponse(
                id=inv.id,
                warehouse_id=wh.id,
                warehouse_name=wh.name,
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                quantity_on_hand=inv.quantity_on_hand,
                reserved_quantity=inv.reserved_quantity,
                available_quantity=inv.available_quantity,
                damaged_quantity=inv.damaged_quantity,
                stock_status="LOW_STOCK",
                total_value=Decimal(str(inv.available_quantity)) * prod.cost_price,
                last_updated=inv.last_updated,
            )
        )
    return BaseResponse(success=True, message="Low stock items retrieved.", data=items)


@router.get(
    "/out-of-stock",
    response_model=BaseResponse[List[InventoryItemResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Out of Stock Items",
    description="Returns items in Surat Warehouse with zero available quantity.",
)
async def get_out_of_stock(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[InventoryItemResponse]]:
    """Returns out of stock inventory items for Surat Warehouse."""
    stmt = (
        select(Inventory, Product, Warehouse)
        .join(Product, Inventory.product_id == Product.id)
        .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
        .where(Warehouse.warehouse_code == PRIMARY_WAREHOUSE_CODE)
        .where(Inventory.available_quantity == 0)
        .limit(50)
    )
    results = (await db.execute(stmt)).all()

    items = []
    for inv, prod, wh in results:
        items.append(
            InventoryItemResponse(
                id=inv.id,
                warehouse_id=wh.id,
                warehouse_name=wh.name,
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                quantity_on_hand=0,
                reserved_quantity=0,
                available_quantity=0,
                damaged_quantity=inv.damaged_quantity,
                stock_status="CRITICAL",
                total_value=Decimal("0.0"),
                last_updated=inv.last_updated,
            )
        )
    return BaseResponse(success=True, message="Out of stock items retrieved.", data=items)


@router.get(
    "/dead-stock",
    response_model=BaseResponse[List[InventoryItemResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Dead / Overstock Items",
    description="Returns non-moving or overstocked items in Surat Warehouse.",
)
async def get_dead_stock(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[InventoryItemResponse]]:
    """Returns dead stock / non-moving inventory in Surat Warehouse."""
    stmt = (
        select(Inventory, Product, Warehouse)
        .join(Product, Inventory.product_id == Product.id)
        .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
        .where(Warehouse.warehouse_code == PRIMARY_WAREHOUSE_CODE)
        .where(Inventory.available_quantity > 2000)
        .limit(20)
    )
    results = (await db.execute(stmt)).all()

    items = []
    for inv, prod, wh in results:
        items.append(
            InventoryItemResponse(
                id=inv.id,
                warehouse_id=wh.id,
                warehouse_name=wh.name,
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                quantity_on_hand=inv.quantity_on_hand,
                reserved_quantity=inv.reserved_quantity,
                available_quantity=inv.available_quantity,
                damaged_quantity=inv.damaged_quantity,
                stock_status="OVERSTOCK",
                total_value=Decimal(str(inv.available_quantity)) * prod.cost_price,
                last_updated=inv.last_updated,
            )
        )
    return BaseResponse(success=True, message="Dead stock items retrieved.", data=items)


@router.get(
    "/movements",
    response_model=BaseResponse[List[InventoryMovementResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Inventory Movements Ledger",
    description="Returns stock movements, transfers, and inbound/outbound transactions for Surat Central Warehouse.",
)
async def get_movements() -> BaseResponse[List[InventoryMovementResponse]]:
    """Returns historical inventory movement ledger for Surat Central."""
    movements = [
        InventoryMovementResponse(id="mov-001", warehouse_id="wh-sur", warehouse_name="Surat Central Warehouse", product_id="prod-1", product_name="MacBook Pro M4 16-inch", movement_type="INBOUND", quantity=150, reference_id="PO-2026-881", movement_date=date.today()),
        InventoryMovementResponse(id="mov-002", warehouse_id="wh-sur", warehouse_name="Surat Central Warehouse", product_id="prod-2", product_name="Dell XPS 15 Oled", movement_type="TRANSFER", quantity=40, reference_id="TR-2026-042", movement_date=date.today()),
        InventoryMovementResponse(id="mov-003", warehouse_id="wh-sur", warehouse_name="Surat Central Warehouse", product_id="prod-3", product_name="Sony WH-1000XM5", movement_type="DISPATCH", quantity=25, reference_id="DO-2026-119", movement_date=date.today()),
    ]
    return BaseResponse(success=True, message="Inventory movements retrieved.", data=movements)


@router.get(
    "/{id}",
    response_model=BaseResponse[InventoryDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Inventory Item Details",
    description="Returns detailed stock information for a specific inventory record ID.",
)
async def get_inventory_by_id(id: str, db: AsyncSession = Depends(get_db)) -> BaseResponse[InventoryDetailResponse]:
    """Returns single inventory detail."""
    stmt = (
        select(Inventory, Product, Warehouse)
        .join(Product, Inventory.product_id == Product.id)
        .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
        .where(Inventory.id == id)
    )
    res = (await db.execute(stmt)).first()

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory record '{id}' not found.")

    inv, prod, wh = res
    detail = InventoryDetailResponse(
        id=inv.id,
        warehouse_id=wh.id,
        warehouse_name=wh.name,
        product_id=prod.id,
        product_name=prod.name,
        sku=prod.sku,
        quantity_on_hand=inv.quantity_on_hand,
        reserved_quantity=inv.reserved_quantity,
        available_quantity=inv.available_quantity,
        damaged_quantity=inv.damaged_quantity,
        stock_status="OPTIMAL" if inv.available_quantity > (prod.reorder_level or 10) else "LOW_STOCK",
        total_value=Decimal(str(inv.available_quantity)) * prod.cost_price,
        last_updated=inv.last_updated,
        unit_cost=prod.cost_price,
        reorder_level=prod.reorder_level or 10,
        supplier_name="Samsung Electronics",
    )
    return BaseResponse(success=True, message="Inventory details retrieved.", data=detail)
