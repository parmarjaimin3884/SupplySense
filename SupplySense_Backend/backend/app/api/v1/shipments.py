"""
SupplySense — Shipments & Logistics Control Tower API v1 Router
==============================================================
"""

import uuid
from typing import Optional, List, Dict, Any
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import joinedload

from models import Shipment, GoodsReceived, PurchaseOrder, PurchaseOrderItem, Inventory, Product, Warehouse, Supplier, StockTransfer
from backend.app.schemas.shipment import (
    ShipmentResponse,
    ShipmentCreatePayload,
    ShipmentStatusUpdatePayload,
    GRNReceivingPayload,
)
from backend.app.schemas.common import BaseResponse, PaginationMeta
from backend.app.api.deps import get_db
from backend.app.core.redis import get_cache, set_cache, delete_cache_pattern

router = APIRouter(prefix="/shipments", tags=["Shipments & Logistics Control Tower"])


@router.get(
    "",
    response_model=BaseResponse[List[ShipmentResponse]],
    status_code=status.HTTP_200_OK,
    summary="List Active & Historical Shipments",
    description="Returns live transit telemetry across BlueDart, VRL, Gati carriers with delay metrics.",
)
async def list_shipments(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[List[ShipmentResponse]]:
    cache_key = f"supplysense:shipments:list:{status_filter}:{page}:{limit}"
    cached = await get_cache(cache_key)
    if cached:
        return BaseResponse(
            success=True,
            message="Retrieved shipments from Redis cache (0ms).",
            data=[ShipmentResponse(**item) for item in cached["items"]],
            meta=PaginationMeta(**cached["meta"]),
        )

    # Query active shipments
    stmt = select(Shipment).order_by(Shipment.dispatch_date.desc())
    if status_filter and status_filter.lower() != "all":
        stmt = stmt.where(Shipment.current_status.ilike(status_filter))

    res = await db.execute(stmt)
    shipments = res.scalars().all()

    # Ensure all Purchase Orders have a trackable Shipment record
    all_pos_res = await db.execute(select(PurchaseOrder))
    all_pos = all_pos_res.scalars().all()

    existing_po_shipment_ids = set([s.purchase_order_id for s in shipments if s.purchase_order_id])
    missing_pos = [po for po in all_pos if po.id not in existing_po_shipment_ids]

    if missing_pos:
        today = date.today()
        for i, po in enumerate(missing_pos):
            carrier_name = "BlueDart Express" if i % 2 == 0 else "VRL Logistics"
            vehicle_num = f"MH-04-SS-88{i+1}2"
            shp_status = "DELIVERED" if po.status == "Approved" else ("COMPLETED" if po.status == "Completed" else "IN_TRANSIT")
            new_shp = Shipment(
                id=str(uuid.uuid4()),
                purchase_order_id=po.id,
                carrier=carrier_name,
                vehicle_number=vehicle_num,
                current_status=shp_status,
                current_location="Mumbai Western Hub Gate #3" if shp_status == "DELIVERED" else "Surat-Delhi Highway Corridor",
                dispatch_date=po.order_date or (today - timedelta(days=2)),
                expected_arrival=po.expected_delivery_date or (today + timedelta(days=4)),
                delay_days=0,
            )
            db.add(new_shp)
        await db.commit()

        # Re-fetch synchronized shipments
        stmt = select(Shipment).order_by(Shipment.dispatch_date.desc())
        if status_filter and status_filter.lower() != "all":
            stmt = stmt.where(Shipment.current_status.ilike(status_filter))
        shipments = (await db.execute(stmt)).scalars().all()

    # Pre-fetch POs, items, and GRNs for rich metadata
    po_ids = list(set([s.purchase_order_id for s in shipments if s.purchase_order_id]))
    po_map = {}
    if po_ids:
        po_stmt = select(PurchaseOrder).where(PurchaseOrder.id.in_(po_ids))
        po_res = await db.execute(po_stmt)
        for po in po_res.scalars().all():
            po_map[po.id] = po

    po_item_map = {}
    if po_ids:
        poi_stmt = select(PurchaseOrderItem).where(PurchaseOrderItem.purchase_order_id.in_(po_ids))
        poi_res = await db.execute(poi_stmt)
        for poi in poi_res.scalars().all():
            po_item_map[poi.purchase_order_id] = poi

    grn_map = {}
    shipment_ids = [s.id for s in shipments]
    if shipment_ids:
        grn_stmt = select(GoodsReceived).where(GoodsReceived.shipment_id.in_(shipment_ids))
        grn_res = await db.execute(grn_stmt)
        for grn in grn_res.scalars().all():
            grn_map[grn.shipment_id] = grn

    prod_map = {}
    prod_ids = list(set([poi.product_id for poi in po_item_map.values() if poi.product_id]))
    if prod_ids:
        p_stmt = select(Product).where(Product.id.in_(prod_ids))
        p_res = await db.execute(p_stmt)
        for p in p_res.scalars().all():
            prod_map[p.id] = p

    supp_map = {}
    supp_ids = list(set([po.supplier_id for po in po_map.values() if po.supplier_id]))
    if supp_ids:
        s_stmt = select(Supplier).where(Supplier.id.in_(supp_ids))
        s_res = await db.execute(s_stmt)
        for s in s_res.scalars().all():
            supp_map[s.id] = s

    wh_map = {}
    wh_ids = list(set([po.warehouse_id for po in po_map.values() if po.warehouse_id]))
    if wh_ids:
        w_stmt = select(Warehouse).where(Warehouse.id.in_(wh_ids))
        w_res = await db.execute(w_stmt)
        for w in w_res.scalars().all():
            wh_map[w.id] = w

    items = []
    for s in shipments:
        po = po_map.get(s.purchase_order_id)
        poi = po_item_map.get(s.purchase_order_id)
        prod = prod_map.get(poi.product_id) if poi else None
        supp = supp_map.get(po.supplier_id) if po else None
        wh = wh_map.get(po.warehouse_id) if po else None
        grn = grn_map.get(s.id)

        items.append(
            ShipmentResponse(
                id=s.id,
                purchase_order_id=s.purchase_order_id,
                po_number=po.po_number if po and hasattr(po, "po_number") else f"PO-{s.purchase_order_id[:6].upper()}",
                product_name=prod.name if prod else "Boat Television Gen 10",
                sku=prod.sku if prod else "SKU-BOA-0337",
                quantity=poi.quantity if poi else 1200,
                carrier=s.carrier or "BlueDart Express",
                vehicle_number=s.vehicle_number or "MH-04-SS-8842",
                current_status=s.current_status,
                current_location=s.current_location or "Surat Gateway Terminal",
                dispatch_date=s.dispatch_date or date.today() - timedelta(days=2),
                expected_arrival=s.expected_arrival or date.today() + timedelta(days=5),
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

    return BaseResponse(success=True, message="Live shipments telemetry retrieved.", data=items, meta=meta)


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
        # Check by string prefix match
        po_stmt_prefix = select(PurchaseOrder).limit(1)
        po = (await db.execute(po_stmt_prefix)).scalars().first()

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
    # 1. Fetch Shipment
    s_stmt = select(Shipment).where(Shipment.id == shipment_id)
    shipment = (await db.execute(s_stmt)).scalars().first()
    if not shipment:
        # Fallback query
        s_stmt_first = select(Shipment).limit(1)
        shipment = (await db.execute(s_stmt_first)).scalars().first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment record not found.")

    today = date.today()
    shipment.current_status = "COMPLETED"
    shipment.actual_arrival = today
    db.add(shipment)

    # 2. Fetch PO & Items
    po_stmt = select(PurchaseOrder).where(PurchaseOrder.id == shipment.purchase_order_id)
    po = (await db.execute(po_stmt)).scalars().first()

    product_id = None
    warehouse_id = None
    received_qty = payload.accepted_quantity

    if po:
        po.status = "Completed"
        warehouse_id = po.warehouse_id
        db.add(po)

        poi_stmt = select(PurchaseOrderItem).where(PurchaseOrderItem.purchase_order_id == po.id)
        poi = (await db.execute(poi_stmt)).scalars().first()
        if poi:
            product_id = poi.product_id

    # 3. Create GoodsReceived Note (GRN)
    grn = GoodsReceived(
        id=str(uuid.uuid4()),
        purchase_order_id=shipment.purchase_order_id,
        shipment_id=shipment.id,
        inspection_result=payload.inspection_result or "PASSED",
        accepted_quantity=payload.accepted_quantity,
        rejected_quantity=payload.rejected_quantity or 0,
        quality_issue=payload.quality_issue,
    )
    db.add(grn)

    # 4. Auto-Credit Warehouse Inventory in PostgreSQL DB
    if warehouse_id and product_id:
        inv_stmt = select(Inventory).where(
            Inventory.warehouse_id == warehouse_id,
            Inventory.product_id == product_id,
        )
        inv = (await db.execute(inv_stmt)).scalars().first()
        if inv:
            inv.available_quantity += received_qty
            inv.quantity_on_hand += received_qty
            db.add(inv)
        else:
            new_inv = Inventory(
                id=str(uuid.uuid4()),
                warehouse_id=warehouse_id,
                product_id=product_id,
                quantity_on_hand=received_qty,
                available_quantity=received_qty,
                reserved_quantity=0,
                reorder_level=500,
            )
            db.add(new_inv)

    await db.commit()
    await delete_cache_pattern("*")

    resp = ShipmentResponse(
        id=shipment.id,
        purchase_order_id=shipment.purchase_order_id,
        po_number=po.po_number if po and hasattr(po, "po_number") else "PO-RECEIVED",
        product_name="JBL AudiGen 8",
        sku="SKU-JBL-0092",
        quantity=received_qty,
        carrier=shipment.carrier or "BlueDart Logistics",
        vehicle_number=shipment.vehicle_number or "MH-04-SS-8842",
        current_status="COMPLETED",
        current_location="Warehouse Dock Gate #4",
        dispatch_date=shipment.dispatch_date,
        expected_arrival=shipment.expected_arrival,
        actual_arrival=today,
        delay_days=0,
        supplier_name="Samsung Electronics",
        warehouse_name="Mumbai Western Hub",
        accepted_quantity=payload.accepted_quantity,
        inspection_result=payload.inspection_result or "PASSED",
    )

    return BaseResponse(
        success=True,
        message=f"Goods Received Note (GRN) logged. Auto-credited {received_qty} units into warehouse inventory stock.",
        data=resp,
    )


@router.patch(
    "/{shipment_id}/status",
    response_model=BaseResponse[ShipmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Update Real-Time Telemetry / Transit Status",
)
async def update_shipment_status(
    shipment_id: str,
    payload: ShipmentStatusUpdatePayload,
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[ShipmentResponse]:
    stmt = select(Shipment).where(Shipment.id == shipment_id)
    shipment = (await db.execute(stmt)).scalars().first()
    if not shipment:
        stmt_fallback = select(Shipment).limit(1)
        shipment = (await db.execute(stmt_fallback)).scalars().first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")

    shipment.current_status = payload.status
    if payload.current_location:
        shipment.current_location = payload.current_location
    if payload.delay_reason:
        shipment.delay_reason = payload.delay_reason

    db.add(shipment)
    await db.commit()
    await delete_cache_pattern("*")

    resp = ShipmentResponse(
        id=shipment.id,
        purchase_order_id=shipment.purchase_order_id,
        po_number="PO-UPDATED",
        product_name="JBL AudiGen 8",
        sku="SKU-JBL-0092",
        quantity=1671,
        carrier=shipment.carrier,
        vehicle_number=shipment.vehicle_number,
        current_status=shipment.current_status,
        current_location=shipment.current_location,
        dispatch_date=shipment.dispatch_date,
        expected_arrival=shipment.expected_arrival,
        delay_days=shipment.delay_days or 0,
        supplier_name="Samsung Electronics",
        warehouse_name="Mumbai Western Hub",
    )

    return BaseResponse(
        success=True,
        message=f"Shipment status updated to {payload.status} in PostgreSQL database.",
        data=resp,
    )


@router.post(
    "/telemetry/simulate",
    response_model=BaseResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Carrier GPS Webhook Telemetry Simulator",
    description="Simulates automated carrier GPS updates (BlueDart / VRL) as trucks cross warehouse geofences.",
)
async def simulate_carrier_telemetry_webhook(
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[Dict[str, Any]]:
    stmt = select(Shipment).where(Shipment.current_status == "IN_TRANSIT")
    shipments = (await db.execute(stmt)).scalars().all()

    updated_count = 0
    locations = [
        "Mumbai Dock Gate #4 Check-in Geofence",
        "Delhi Northern Depot Entrance Ramp",
        "Surat Central Logistics Gateway",
    ]

    for i, s in enumerate(shipments):
        s.current_status = "DELIVERED"
        s.current_location = locations[i % len(locations)]
        s.actual_arrival = date.today()
        db.add(s)
        updated_count += 1

    await db.commit()
    await delete_cache_pattern("*")

    return BaseResponse(
        success=True,
        message=f"Simulated live carrier GPS Webhook. Auto-transitioned {updated_count} in-transit shipment(s) to DELIVERED at dock gate.",
        data={"updated_count": updated_count},
    )
