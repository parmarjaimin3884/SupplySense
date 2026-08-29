"""
SupplySense — Autonomous Procurement API v1 Router
===================================================
Endpoints for listing, searching, approving, and auditing Purchase Orders.
"""

from typing import Optional, List
from decimal import Decimal
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from models import PurchaseOrder, Supplier, Warehouse, PurchaseOrderItem, Product
from backend.app.schemas.purchase_order import PurchaseOrderResponse, PurchaseOrderDetailResponse, PurchaseOrderItemSchema
from backend.app.schemas.common import PaginationResponse, BaseResponse, PaginationMeta
from backend.app.api.deps import get_db

router = APIRouter(prefix="/purchase-orders", tags=["Autonomous Procurement"])


@router.get(
    "",
    response_model=PaginationResponse[PurchaseOrderResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Paginated Purchase Orders List",
    description="Returns filtered list of purchase orders.",
)
async def list_purchase_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=500),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Pending, Approved, Shipped, Delivered, Draft."),
    supplier_id: Optional[str] = Query(default=None, description="Filter by supplier ID."),
    db: AsyncSession = Depends(get_db),
) -> PaginationResponse[PurchaseOrderResponse]:
    """Returns paginated PO ledger."""
    stmt = select(PurchaseOrder, Supplier, Warehouse).join(Supplier, PurchaseOrder.supplier_id == Supplier.id).join(Warehouse, PurchaseOrder.warehouse_id == Warehouse.id)

    if status_filter:
        stmt = stmt.where(PurchaseOrder.status == status_filter)
    if supplier_id:
        stmt = stmt.where(PurchaseOrder.supplier_id == supplier_id)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_items = (await db.execute(count_stmt)).scalar() or 0

    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit).order_by(PurchaseOrder.order_date.desc())
    results = (await db.execute(stmt)).all()

    items = []
    for po, s, w in results:
        items.append(
            PurchaseOrderResponse(
                id=po.id,
                supplier_id=s.id,
                supplier_name=s.company_name,
                warehouse_id=w.id,
                warehouse_name=w.name,
                order_date=po.order_date,
                expected_delivery_date=po.expected_delivery_date,
                status=po.status,
                priority=po.priority or "Normal",
                approved_by=po.approved_by,
                total_amount=po.total_amount
            )
        )

    total_pages = max(1, (total_items + limit - 1) // limit)
    return PaginationResponse(
        success=True,
        message="Purchase orders retrieved.",
        data=items,
        meta=PaginationMeta(page=page, limit=limit, total_items=total_items, total_pages=total_pages)
    )


@router.get(
    "/open",
    response_model=BaseResponse[List[PurchaseOrderResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Open / Active Purchase Orders",
    description="Returns active POs in Pending or Approved status.",
)
async def get_open_pos(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[PurchaseOrderResponse]]:
    """Returns active POs."""
    stmt = select(PurchaseOrder, Supplier, Warehouse).join(Supplier, PurchaseOrder.supplier_id == Supplier.id).join(Warehouse, PurchaseOrder.warehouse_id == Warehouse.id).where(or_(PurchaseOrder.status == "Pending", PurchaseOrder.status == "Approved", PurchaseOrder.status == "Draft")).limit(30)
    results = (await db.execute(stmt)).all()

    items = []
    for po, s, w in results:
        items.append(
            PurchaseOrderResponse(
                id=po.id,
                supplier_id=s.id,
                supplier_name=s.company_name,
                warehouse_id=w.id,
                warehouse_name=w.name,
                order_date=po.order_date,
                expected_delivery_date=po.expected_delivery_date,
                status=po.status,
                priority=po.priority or "Normal",
                approved_by=po.approved_by,
                total_amount=po.total_amount
            )
        )
    return BaseResponse(success=True, message="Open purchase orders retrieved.", data=items)


@router.get(
    "/overdue",
    response_model=BaseResponse[List[PurchaseOrderResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Overdue Purchase Orders",
    description="Returns POs past expected SLA delivery date.",
)
async def get_overdue_pos(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[PurchaseOrderResponse]]:
    """Returns overdue POs past expected delivery date."""
    today = date.today()
    stmt = select(PurchaseOrder, Supplier, Warehouse).join(Supplier, PurchaseOrder.supplier_id == Supplier.id).join(Warehouse, PurchaseOrder.warehouse_id == Warehouse.id).where(PurchaseOrder.expected_delivery_date < today, PurchaseOrder.status != "Delivered").limit(20)
    results = (await db.execute(stmt)).all()

    items = []
    for po, s, w in results:
        items.append(
            PurchaseOrderResponse(
                id=po.id,
                supplier_id=s.id,
                supplier_name=s.company_name,
                warehouse_id=w.id,
                warehouse_name=w.name,
                order_date=po.order_date,
                expected_delivery_date=po.expected_delivery_date,
                status=po.status,
                priority="Urgent",
                approved_by=po.approved_by,
                total_amount=po.total_amount
            )
        )
    return BaseResponse(success=True, message="Overdue purchase orders retrieved.", data=items)


@router.get(
    "/pending-approval",
    response_model=BaseResponse[List[PurchaseOrderResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Draft POs Awaiting Approval",
    description="Returns auto-drafted POs awaiting manager approval.",
)
async def get_pending_approval(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[PurchaseOrderResponse]]:
    """Returns PO drafts awaiting approval."""
    stmt = select(PurchaseOrder, Supplier, Warehouse).join(Supplier, PurchaseOrder.supplier_id == Supplier.id).join(Warehouse, PurchaseOrder.warehouse_id == Warehouse.id).where(or_(PurchaseOrder.status == "Draft", PurchaseOrder.status == "Pending")).limit(20)
    results = (await db.execute(stmt)).all()

    items = []
    for po, s, w in results:
        items.append(
            PurchaseOrderResponse(
                id=po.id,
                supplier_id=s.id,
                supplier_name=s.company_name,
                warehouse_id=w.id,
                warehouse_name=w.name,
                order_date=po.order_date,
                expected_delivery_date=po.expected_delivery_date,
                status=po.status,
                priority=po.priority or "Normal",
                approved_by=po.approved_by,
                total_amount=po.total_amount
            )
        )
    return BaseResponse(success=True, message="Pending approval PO drafts retrieved.", data=items)


@router.get(
    "/{id}",
    response_model=BaseResponse[PurchaseOrderDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Purchase Order Details with Line Items",
    description="Returns detailed PO info and itemized line items.",
)
async def get_po_by_id(id: str, db: AsyncSession = Depends(get_db)) -> BaseResponse[PurchaseOrderDetailResponse]:
    """Returns single PO detail with line items."""
    stmt = select(PurchaseOrder, Supplier, Warehouse).join(Supplier, PurchaseOrder.supplier_id == Supplier.id).join(Warehouse, PurchaseOrder.warehouse_id == Warehouse.id).where(PurchaseOrder.id == id)
    res = (await db.execute(stmt)).first()

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Purchase Order ID '{id}' not found.")

    po, s, w = res
    items_stmt = select(PurchaseOrderItem, Product).join(Product, PurchaseOrderItem.product_id == Product.id).where(PurchaseOrderItem.purchase_order_id == po.id)
    raw_items = (await db.execute(items_stmt)).all()

    line_items = []
    for it, pr in raw_items:
        line_items.append(
            PurchaseOrderItemSchema(
                id=it.id,
                product_id=pr.id,
                product_name=pr.name,
                sku=pr.sku,
                quantity=it.quantity,
                unit_price=it.unit_price,
                total_price=it.total_price
            )
        )

    detail = PurchaseOrderDetailResponse(
        id=po.id,
        supplier_id=s.id,
        supplier_name=s.company_name,
        warehouse_id=w.id,
        warehouse_name=w.name,
        order_date=po.order_date,
        expected_delivery_date=po.expected_delivery_date,
        status=po.status,
        priority=po.priority or "Normal",
        approved_by=po.approved_by,
        total_amount=po.total_amount,
        items=line_items
    )
    return BaseResponse(success=True, message="Purchase order detail retrieved.", data=detail)


from backend.app.schemas.purchase_order import CreatePOInput

@router.post(
    "",
    response_model=BaseResponse[PurchaseOrderDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create New Purchase Order (Draft / Pending)",
    description="Creates a new Purchase Order in database with line items.",
)
async def create_purchase_order(
    payload: CreatePOInput,
    db: AsyncSession = Depends(get_db)
) -> BaseResponse[PurchaseOrderDetailResponse]:
    """Creates a new Purchase Order."""
    import uuid

    supplier_stmt = select(Supplier).where(Supplier.id == payload.supplier_id)
    supplier = (await db.execute(supplier_stmt)).scalar_one_or_none()

    warehouse_stmt = select(Warehouse).where(Warehouse.id == payload.warehouse_id)
    warehouse = (await db.execute(warehouse_stmt)).scalar_one_or_none()

    s_name = supplier.company_name if supplier else "Selected Supplier"
    w_name = warehouse.name if warehouse else "Destination Warehouse"

    po_id = f"po-{uuid.uuid4().hex[:8]}"
    today = date.today()
    deliv_date = payload.expected_delivery_date or (today + timedelta(days=7))

    total_val = Decimal("0.00")
    created_items = []

    for item in payload.items:
        prod_stmt = select(Product).where(Product.id == item.product_id)
        prod = (await db.execute(prod_stmt)).scalar_one_or_none()
        p_name = prod.name if prod else "Product"
        p_sku = prod.sku if prod else "SKU-GEN"
        u_price = item.unit_price or (prod.cost_price if prod else Decimal("500.00"))

        tot_price = u_price * item.quantity
        total_val += tot_price

        item_id = f"poi-{uuid.uuid4().hex[:8]}"
        new_item = PurchaseOrderItem(
            id=item_id,
            purchase_order_id=po_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=u_price,
            total_price=tot_price,
        )
        db.add(new_item)
        created_items.append(
            PurchaseOrderItemSchema(
                id=item_id,
                product_id=item.product_id,
                product_name=p_name,
                sku=p_sku,
                quantity=item.quantity,
                unit_price=u_price,
                total_price=tot_price,
            )
        )

    new_po = PurchaseOrder(
        id=po_id,
        supplier_id=payload.supplier_id,
        warehouse_id=payload.warehouse_id,
        order_date=today,
        expected_delivery_date=deliv_date,
        status="Pending Approval",
        priority=payload.priority or "Normal",
        total_amount=total_val,
    )
    db.add(new_po)
    await db.commit()

    detail = PurchaseOrderDetailResponse(
        id=po_id,
        supplier_id=payload.supplier_id,
        supplier_name=s_name,
        warehouse_id=payload.warehouse_id,
        warehouse_name=w_name,
        order_date=today,
        expected_delivery_date=deliv_date,
        status="Pending Approval",
        priority=payload.priority or "Normal",
        approved_by=None,
        total_amount=total_val,
        items=created_items,
    )
    return BaseResponse(
        success=True,
        message=f"Purchase Order '{po_id}' created successfully for {s_name}.",
        data=detail
    )


@router.post(
    "/{id}/approve",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Approve Purchase Order",
    description="Approves a draft or pending Purchase Order for vendor fulfillment.",
)
async def approve_purchase_order(
    id: str,
    db: AsyncSession = Depends(get_db)
) -> BaseResponse[dict]:
    """Approves PO."""
    po_stmt = select(PurchaseOrder).where(PurchaseOrder.id == id)
    po = (await db.execute(po_stmt)).scalar_one_or_none()

    if po:
        po.status = "Approved"
        po.approved_by = "Supply Chain Manager"
        await db.commit()

    return BaseResponse(
        success=True,
        message=f"Purchase Order '{id}' approved.",
        data={"po_id": id, "status": "Approved", "approved_by": "Supply Chain Manager"}
    )

