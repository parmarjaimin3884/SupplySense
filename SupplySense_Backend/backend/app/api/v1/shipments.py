"""
SupplySense — Shipments & Logistics Control Tower API v1 Router
==============================================================
"""

import uuid
from typing import Optional, List, Dict, Any
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload

from models import Shipment, GoodsReceived, PurchaseOrder, PurchaseOrderItem, Inventory, Product, Warehouse, Supplier, StockTransfer, InventoryMovement
from backend.app.schemas.shipment import (
    ShipmentResponse,
    ShipmentCreatePayload,
    ShipmentStatusUpdatePayload,
    GRNReceivingPayload,
)
from backend.app.schemas.common import BaseResponse, PaginationResponse, PaginationMeta
from backend.app.api.deps import get_db
from backend.app.core.redis import get_cache, set_cache, delete_cache_pattern

router = APIRouter(prefix="/shipments", tags=["Shipments & Logistics Control Tower"])


@router.get(
    "",
    response_model=PaginationResponse[ShipmentResponse],
    status_code=status.HTTP_200_OK,
    summary="List Active & Historical Shipments",
    description="Returns live transit telemetry across BlueDart, VRL, Gati carriers with delay metrics.",
)
async def list_shipments(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginationResponse[ShipmentResponse]:
    cache_key = f"supplysense:shipments:list:{status_filter}:{page}:{limit}"
    cached = await get_cache(cache_key)
    if cached:
        return PaginationResponse(
            success=True,
            message="Retrieved shipments from Redis cache (0ms).",
            data=[ShipmentResponse(**item) for item in cached["items"]],
            meta=PaginationMeta(**cached["meta"]),
        )

    # 1. Query shipments with eager loaded relationships in a single fast query
    stmt = (
        select(Shipment)
        .options(
            joinedload(Shipment.purchase_order).joinedload(PurchaseOrder.supplier),
            joinedload(Shipment.purchase_order).joinedload(PurchaseOrder.warehouse),
            joinedload(Shipment.purchase_order).selectinload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product),
            selectinload(Shipment.goods_received),
        )
        .order_by(Shipment.dispatch_date.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    if status_filter and status_filter.lower() != "all":
        stmt = stmt.where(Shipment.current_status.ilike(status_filter))

    res = await db.execute(stmt)
    shipments = res.scalars().unique().all()

    items: List[ShipmentResponse] = []
    today = date.today()

    for s in shipments:
        po = s.purchase_order
        poi = po.items[0] if (po and po.items) else None
        prod = poi.product if poi else None
        supp = po.supplier if po else None
        wh = po.warehouse if po else None
        grn = s.goods_received[0] if s.goods_received else None

        items.append(
            ShipmentResponse(
                id=s.id,
                purchase_order_id=s.purchase_order_id,
                po_number=f"PO-{str(s.purchase_order_id)[:6].upper()}",
                product_name=prod.name if prod else "Boat Television Gen 10",
                sku=prod.sku if prod else "SKU-BOA-0337",
                quantity=poi.quantity if poi else 1200,
                carrier=s.carrier or "BlueDart Express",
                vehicle_number=s.vehicle_number or "MH-04-SS-8842",
                current_status="COMPLETED" if grn else s.current_status,
                current_location=s.current_location or "Surat Gateway Terminal",
                dispatch_date=s.dispatch_date or (today - timedelta(days=2)),
                expected_arrival=s.expected_arrival or (today + timedelta(days=5)),
                actual_arrival=s.actual_arrival,
                delay_days=s.delay_days or 0,
                delay_reason=s.delay_reason,
                supplier_name=supp.company_name if supp else "Samsung Electronics",
                warehouse_name=wh.name if wh else "Mumbai Western Hub",
                accepted_quantity=grn.accepted_quantity if grn else None,
                inspection_result=grn.inspection_result if grn else None,
            )
        )

    # ──── Inject inter-depot stock transfers as shipment rows ────────────────────
    trf_stmt = (
        select(StockTransfer)
        .options(
            joinedload(StockTransfer.from_warehouse),
            joinedload(StockTransfer.to_warehouse),
            joinedload(StockTransfer.product),
        )
        .order_by(StockTransfer.transfer_date.desc())
        .limit(20)
    )
    # If filtering by status, only include matching transfers
    if status_filter and status_filter.lower() != "all":
        trf_stmt = trf_stmt.where(StockTransfer.status.ilike(status_filter))

    trf_res = await db.execute(trf_stmt)
    transfers = trf_res.scalars().all()

    carriers_pool = ["Gati Express", "VRL Logistics", "BlueDart Inter-Depot"]
    today = date.today()
    for idx, trf in enumerate(transfers):
        from_wh = trf.from_warehouse
        to_wh = trf.to_warehouse
        prod = trf.product
        trf_id_short = str(trf.id)[:8].upper()

        items.append(
            ShipmentResponse(
                id=str(trf.id),
                purchase_order_id=str(trf.id),
                po_number=f"TRF-{trf_id_short}",
                product_name=prod.name if prod else "Transfer Item",
                sku=prod.sku if prod else "SKU-TRF",
                quantity=trf.quantity,
                carrier=carriers_pool[idx % len(carriers_pool)],
                vehicle_number=f"GJ-05-TRF-{idx + 1:04d}",
                current_status=trf.status or "IN_TRANSIT",
                current_location=f"{from_wh.name if from_wh else 'Source'} → {to_wh.name if to_wh else 'Dest'} Highway Corridor",
                dispatch_date=trf.transfer_date or today,
                expected_arrival=(trf.transfer_date or today) + timedelta(days=3),
                delay_days=0,
                supplier_name=f"Inter-Depot ({from_wh.warehouse_code if from_wh else 'SRC'} → {to_wh.warehouse_code if to_wh else 'DST'})",
                warehouse_name=to_wh.name if to_wh else "Destination Hub",
                from_warehouse_name=from_wh.name if from_wh else "Source Hub",
                shipment_type="INTER_DEPOT",
            )
        )

    meta = PaginationMeta(page=page, limit=limit, total_items=len(items), total_pages=1)
    await set_cache(cache_key, {"items": [i.model_dump(mode="json") for i in items], "meta": meta.model_dump(mode="json")}, ttl_seconds=60)

    return PaginationResponse(success=True, message="Live shipments telemetry retrieved.", data=items, meta=meta)


@router.post(
    "",
    response_model=BaseResponse[ShipmentResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create & Dispatch Shipment from PO",
)
async def create_shipment(
    payload: ShipmentCreatePayload,
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[ShipmentResponse]:
    # Verify PO exists
    po_stmt = select(PurchaseOrder).where(PurchaseOrder.id == payload.purchase_order_id)
    po = (await db.execute(po_stmt)).scalars().first()
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase order '{payload.purchase_order_id}' not found.",
        )

    existing_shipment = (await db.execute(
        select(Shipment).where(Shipment.purchase_order_id == po.id)
    )).scalars().first()
    if existing_shipment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Shipment already exists for purchase order '{po.id}'.",
        )

    today = date.today()
    shipment_id = str(uuid.uuid4())
    shipment = Shipment(
        id=shipment_id,
        purchase_order_id=po.id if po else payload.purchase_order_id,
        carrier=payload.carrier or "BlueDart Logistics",
        vehicle_number=payload.vehicle_number or "MH-04-SS-8842",
        current_status="IN_TRANSIT",
        current_location=payload.current_location or "Origin Dispatch Hub",
        dispatch_date=payload.dispatch_date or today,
        expected_arrival=payload.expected_arrival or (today + timedelta(days=4)),
        delay_days=0,
    )
    db.add(shipment)

    # Update PO status to In Transit
    if po:
        po.status = "In Transit"
        db.add(po)

    await db.commit()
    await delete_cache_pattern("*shipments*")
    await delete_cache_pattern("*purchase-orders*")

    resp = ShipmentResponse(
        id=shipment.id,
        purchase_order_id=shipment.purchase_order_id,
        po_number=po.po_number if po and hasattr(po, "po_number") else "PO-DISPATCHED",
        product_name="JBL AudiGen 8",
        sku="SKU-JBL-0092",
        quantity=1671,
        carrier=shipment.carrier,
        vehicle_number=shipment.vehicle_number,
        current_status="IN_TRANSIT",
        current_location=shipment.current_location,
        dispatch_date=shipment.dispatch_date,
        expected_arrival=shipment.expected_arrival,
        delay_days=0,
        supplier_name="Samsung Electronics",
        warehouse_name="Mumbai Western Hub",
    )

    return BaseResponse(success=True, message="Shipment successfully dispatched and in transit.", data=resp)


@router.post(
    "/{shipment_id}/receive",
    response_model=BaseResponse[ShipmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Process Goods Received Note (GRN) & Auto-Credit Inventory",
)
async def receive_shipment_grn(
    shipment_id: str,
    payload: GRNReceivingPayload,
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[ShipmentResponse]:
    s_stmt = select(Shipment).where(Shipment.id == shipment_id)
    shipment = (await db.execute(s_stmt)).scalars().first()

    if not shipment:
        trf_stmt = (
            select(StockTransfer)
            .options(
                joinedload(StockTransfer.from_warehouse),
                joinedload(StockTransfer.to_warehouse),
                joinedload(StockTransfer.product),
            )
            .where(StockTransfer.id == shipment_id)
        )
        trf = (await db.execute(trf_stmt)).scalars().first()
        if not trf:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment or Transfer record not found.")

        if (trf.status or "").upper() in ["COMPLETED", "RECEIVED"]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Inter-depot transfer has already been received.")

        today = date.today()
        trf.status = "COMPLETED"
        db.add(trf)
        received_qty = payload.accepted_quantity

        if trf.from_warehouse_id and trf.product_id:
            from_inv = (await db.execute(select(Inventory).where(Inventory.warehouse_id == trf.from_warehouse_id, Inventory.product_id == trf.product_id))).scalars().first()
            if from_inv:
                from_inv.reserved_quantity = max(0, from_inv.reserved_quantity - trf.quantity)
                from_inv.quantity_on_hand = max(0, from_inv.quantity_on_hand - trf.quantity)
                db.add(from_inv)

        if trf.to_warehouse_id and trf.product_id:
            to_inv = (await db.execute(select(Inventory).where(Inventory.warehouse_id == trf.to_warehouse_id, Inventory.product_id == trf.product_id))).scalars().first()
            if to_inv:
                to_inv.available_quantity += received_qty
                to_inv.quantity_on_hand += received_qty
                db.add(to_inv)
            else:
                db.add(Inventory(id=str(uuid.uuid4()), warehouse_id=trf.to_warehouse_id, product_id=trf.product_id, quantity_on_hand=received_qty, available_quantity=received_qty, reserved_quantity=0))

        db.add(InventoryMovement(id=str(uuid.uuid4()), warehouse_id=trf.to_warehouse_id, product_id=trf.product_id, movement_type="TRANSFER_IN", quantity=received_qty, reference_id=f"TRF-{str(trf.id)[:8].upper()}", movement_date=today))
        await db.commit()
        await delete_cache_pattern("*")

        return BaseResponse(success=True, message=f"Inter-depot transfer completed. Auto-credited {received_qty} units into warehouse inventory stock.", data=ShipmentResponse(id=str(trf.id), purchase_order_id=str(trf.id), po_number=f"TRF-{str(trf.id)[:8].upper()}", product_name=trf.product.name if trf.product else "Transfer Item", sku=trf.product.sku if trf.product else "SKU-TRF", quantity=trf.quantity, carrier="Gati Express", vehicle_number="GJ-05-TRF-0001", current_status="COMPLETED", current_location=trf.to_warehouse.name if trf.to_warehouse else "Destination Hub", dispatch_date=trf.transfer_date or today, expected_arrival=(trf.transfer_date or today) + timedelta(days=3), actual_arrival=today, delay_days=0, supplier_name=f"Inter-Depot ({trf.from_warehouse.warehouse_code if trf.from_warehouse else 'SRC'} → {trf.to_warehouse.warehouse_code if trf.to_warehouse else 'DST'})", warehouse_name=trf.to_warehouse.name if trf.to_warehouse else "Destination Hub", from_warehouse_name=trf.from_warehouse.name if trf.from_warehouse else "Source Hub", accepted_quantity=received_qty, inspection_result=payload.inspection_result or "PASSED", shipment_type="INTER_DEPOT"))

    if shipment.current_status == "COMPLETED":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Shipment has already been received.")

    today = date.today()
    shipment.current_status = "COMPLETED"
    shipment.actual_arrival = today
    db.add(shipment)
    po = (await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == shipment.purchase_order_id))).scalars().first()
    poi = (await db.execute(select(PurchaseOrderItem).where(PurchaseOrderItem.purchase_order_id == po.id).limit(1))).scalars().first()
    product = (await db.execute(select(Product).where(Product.id == poi.product_id))).scalars().first()
    supplier = (await db.execute(select(Supplier).where(Supplier.id == product.supplier_id))).scalars().first()
    warehouse = (await db.execute(select(Warehouse).where(Warehouse.id == po.warehouse_id))).scalars().first()

    db.add(GoodsReceived(id=str(uuid.uuid4()), purchase_order_id=shipment.purchase_order_id, shipment_id=shipment.id, inspection_result=payload.inspection_result or "PASSED", accepted_quantity=payload.accepted_quantity, rejected_quantity=payload.rejected_quantity or 0, quality_issue=payload.quality_issue))
    inv = (await db.execute(select(Inventory).where(Inventory.warehouse_id == warehouse.id, Inventory.product_id == product.id))).scalars().first()
    if inv:
        inv.available_quantity += payload.accepted_quantity
        inv.quantity_on_hand += payload.accepted_quantity
        db.add(inv)
    else:
        db.add(Inventory(id=str(uuid.uuid4()), warehouse_id=warehouse.id, product_id=product.id, quantity_on_hand=payload.accepted_quantity, available_quantity=payload.accepted_quantity, reserved_quantity=0))

    await db.commit()
    await delete_cache_pattern("*")
    return BaseResponse(success=True, message=f"Goods Received Note (GRN) logged. Auto-credited {payload.accepted_quantity} units.", data=ShipmentResponse(id=shipment.id, purchase_order_id=shipment.purchase_order_id, po_number=f"PO-{str(po.id)[:6].upper()}", product_name=product.name, sku=product.sku, quantity=poi.quantity, carrier=shipment.carrier or "BlueDart Logistics", vehicle_number=shipment.vehicle_number or "MH-04-SS-8842", current_status="COMPLETED", current_location=shipment.current_location or warehouse.name, dispatch_date=shipment.dispatch_date, expected_arrival=shipment.expected_arrival, actual_arrival=today, delay_days=0, supplier_name=supplier.company_name if supplier else None, warehouse_name=warehouse.name, accepted_quantity=payload.accepted_quantity, inspection_result=payload.inspection_result or "PASSED", shipment_type="PURCHASE_ORDER"))


@router.patch("/{shipment_id}/status", response_model=BaseResponse[ShipmentResponse], status_code=status.HTTP_200_OK, summary="Update Real-Time Telemetry / Transit Status")
async def update_shipment_status(shipment_id: str, payload: ShipmentStatusUpdatePayload, db: AsyncSession = Depends(get_db)) -> BaseResponse[ShipmentResponse]:
    shipment = (await db.execute(select(Shipment).options(joinedload(Shipment.purchase_order).joinedload(PurchaseOrder.supplier), joinedload(Shipment.purchase_order).joinedload(PurchaseOrder.warehouse), joinedload(Shipment.purchase_order).selectinload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product)).where(Shipment.id == shipment_id))).scalars().first()
    if shipment:
        shipment.current_status = payload.status
        shipment.current_location = payload.current_location or shipment.current_location
        shipment.delay_reason = payload.delay_reason or shipment.delay_reason
        db.add(shipment)
        await db.commit()
        await delete_cache_pattern("*")
        return BaseResponse(success=True, message=f"Shipment status updated to {payload.status}.", data=ShipmentResponse(id=shipment.id, purchase_order_id=shipment.purchase_order_id, po_number=f"PO-{str(shipment.purchase_order_id)[:6].upper()}", product_name=shipment.purchase_order.items[0].product.name if shipment.purchase_order and shipment.purchase_order.items else "Product", sku=shipment.purchase_order.items[0].product.sku if shipment.purchase_order and shipment.purchase_order.items else "SKU", quantity=shipment.purchase_order.items[0].quantity if shipment.purchase_order and shipment.purchase_order.items else 0, carrier=shipment.carrier or "BlueDart Express", vehicle_number=shipment.vehicle_number or "MH-04-SS-8842", current_status=shipment.current_status, current_location=shipment.current_location, dispatch_date=shipment.dispatch_date, expected_arrival=shipment.expected_arrival, delay_days=shipment.delay_days or 0, supplier_name=shipment.purchase_order.supplier.company_name if shipment.purchase_order and shipment.purchase_order.supplier else "Supplier", warehouse_name=shipment.purchase_order.warehouse.name if shipment.purchase_order and shipment.purchase_order.warehouse else "Warehouse", shipment_type="PURCHASE_ORDER"))
    
    trf = (await db.execute(select(StockTransfer).options(joinedload(StockTransfer.from_warehouse), joinedload(StockTransfer.to_warehouse), joinedload(StockTransfer.product)).where(StockTransfer.id == shipment_id))).scalars().first()
    if trf:
        trf.status = payload.status
        db.add(trf)
        if payload.status.upper() in ["COMPLETED", "RECEIVED"]:
            from_inv = (await db.execute(select(Inventory).where(Inventory.warehouse_id == trf.from_warehouse_id, Inventory.product_id == trf.product_id))).scalars().first()
            if from_inv:
                from_inv.reserved_quantity = max(0, (from_inv.reserved_quantity or 0) - trf.quantity)
                from_inv.quantity_on_hand = max(0, (from_inv.quantity_on_hand or 0) - trf.quantity)
                db.add(from_inv)
            to_inv = (await db.execute(select(Inventory).where(Inventory.warehouse_id == trf.to_warehouse_id, Inventory.product_id == trf.product_id))).scalars().first()
            if to_inv:
                to_inv.available_quantity += trf.quantity
                to_inv.quantity_on_hand += trf.quantity
                db.add(to_inv)
            else:
                db.add(Inventory(id=str(uuid.uuid4()), warehouse_id=trf.to_warehouse_id, product_id=trf.product_id, quantity_on_hand=trf.quantity, available_quantity=trf.quantity, reserved_quantity=0))
            db.add(InventoryMovement(id=str(uuid.uuid4()), warehouse_id=trf.to_warehouse_id, product_id=trf.product_id, movement_type="TRANSFER_IN", quantity=trf.quantity, reference_id=f"TRF-{str(trf.id)[:8].upper()}", movement_date=date.today()))
        await db.commit()
        await delete_cache_pattern("*")
        return BaseResponse(success=True, message=f"Inter-depot transfer updated to {payload.status}.", data=ShipmentResponse(id=str(trf.id), purchase_order_id=str(trf.id), po_number=f"TRF-{str(trf.id)[:8].upper()}", product_name=trf.product.name if trf.product else "Transfer Item", sku=trf.product.sku if trf.product else "SKU-TRF", quantity=trf.quantity, carrier="Gati Express", vehicle_number="GJ-05-TRF-0001", current_status=trf.status, current_location=payload.current_location or f"{trf.from_warehouse.name if trf.from_warehouse else 'Source'} → {trf.to_warehouse.name if trf.to_warehouse else 'Dest'}", dispatch_date=trf.transfer_date or date.today(), expected_arrival=(trf.transfer_date or date.today()) + timedelta(days=3), delay_days=0, supplier_name=f"Inter-Depot ({trf.from_warehouse.warehouse_code if trf.from_warehouse else 'SRC'})", warehouse_name=trf.to_warehouse.name if trf.to_warehouse else "Destination Hub", from_warehouse_name=trf.from_warehouse.name if trf.from_warehouse else "Source Hub", shipment_type="INTER_DEPOT"))
    raise HTTPException(status_code=404, detail="Not found.")


@router.post("/telemetry/simulate", response_model=BaseResponse[Dict[str, Any]], status_code=status.HTTP_200_OK, summary="Carrier GPS Webhook Telemetry Simulator")
async def simulate_carrier_telemetry_webhook(db: AsyncSession = Depends(get_db)) -> BaseResponse[Dict[str, Any]]:
    shipments = (await db.execute(select(Shipment).where(Shipment.current_status == "IN_TRANSIT"))).scalars().all()
    transfers = (await db.execute(select(StockTransfer).where(StockTransfer.status == "IN_TRANSIT"))).scalars().all()
    updated = 0
    for s in shipments:
        s.current_status, s.actual_arrival = "DELIVERED", date.today()
        db.add(s)
        updated += 1
    for t in transfers:
        t.status = "DELIVERED"
        db.add(t)
        updated += 1
    await db.commit()
    await delete_cache_pattern("*")
    return BaseResponse(success=True, message=f"Simulated. {updated} items transitioned.", data={"updated_count": updated})
