"""Automatic alert generation from live operational database conditions."""

import asyncio
from contextlib import suppress
from datetime import date
from typing import Optional

from sqlalchemy import select, and_

from backend.app.database.database import async_session_factory
from models import AIRiskAlert, Inventory, Product, Warehouse, Shipment, PurchaseOrder, Supplier, GoodsReceived


_monitor_task: Optional[asyncio.Task] = None
_monitor_running = False


async def _create_alert_if_new(db, alert_type: str, message: str, severity: str, **details) -> None:
    existing = await db.scalar(
        select(AIRiskAlert).where(
            and_(
                AIRiskAlert.alert_type == alert_type,
                AIRiskAlert.message == message,
            )
        ).limit(1)
    )
    if existing is None:
        db.add(
            AIRiskAlert(
                alert_type=alert_type,
                message=message,
                severity=severity,
                created_at=date.today(),
                is_resolved=False,
                **details,
            )
        )
    else:
        for key, value in details.items():
            setattr(existing, key, value)


async def evaluate_alert_conditions() -> int:
    """Create alerts for currently breached real database conditions."""
    created = 0
    async with async_session_factory() as db:
        low_stock = await db.execute(
            select(Inventory, Product, Warehouse)
            .join(Product, Inventory.product_id == Product.id)
            .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
            .where(Inventory.available_quantity <= Product.reorder_level)
        )
        for inventory, product, warehouse in low_stock.all():
            severity = "CRITICAL" if inventory.available_quantity <= (product.reorder_level or 0) * 0.5 else "HIGH"
            message = (
                f"{product.name} ({product.sku}) in {warehouse.warehouse_code} is below its "
                f"reorder threshold: {inventory.available_quantity:,} available vs "
                f"{product.reorder_level:,} reorder level."
            )
            before = await db.scalar(select(AIRiskAlert.id).where(AIRiskAlert.message == message).limit(1))
            await _create_alert_if_new(
                db, "INVENTORY", message, severity,
                title=f"Low Stock: {product.name}", category="Inventory",
                product_name=product.name, affected_sku=product.sku,
                warehouse_name=warehouse.name, current_stock=inventory.available_quantity,
                reorder_level=product.reorder_level,
                recommended_action=f"Replenish {product.sku} before stock reaches zero.",
                ai_insight=f"Available stock is {inventory.available_quantity:,} versus a reorder level of {product.reorder_level:,}.",
            )
            if before is None:
                created += 1

        delayed_shipments = await db.execute(
            select(Shipment, PurchaseOrder, Supplier)
            .join(PurchaseOrder, Shipment.purchase_order_id == PurchaseOrder.id)
            .join(Supplier, PurchaseOrder.supplier_id == Supplier.id)
            .where(Shipment.delay_days > 0)
        )
        for shipment, purchase_order, supplier in delayed_shipments.all():
            message = (
                f"Shipment for PO-{str(purchase_order.id)[:8].upper()} from {supplier.company_name} "
                f"is delayed by {shipment.delay_days} day(s)."
            )
            before = await db.scalar(select(AIRiskAlert.id).where(AIRiskAlert.message == message).limit(1))
            await _create_alert_if_new(
                db, "SHIPMENT", message, "HIGH" if shipment.delay_days >= 3 else "MEDIUM",
                title=f"Shipment Delay: {supplier.company_name}", category="Shipment",
                supplier_name=supplier.company_name, delay_days=shipment.delay_days,
                recommended_action="Contact the carrier and review alternate dispatch options.",
                ai_insight=f"This shipment is {shipment.delay_days} day(s) behind schedule.",
            )
            if before is None:
                created += 1

        risky_suppliers = await db.execute(
            select(Supplier).where(
                (Supplier.risk_rating.ilike("CRITICAL"))
                | (Supplier.risk_rating.ilike("HIGH"))
                | (Supplier.average_delay >= 3)
            )
        )
        for supplier in risky_suppliers.scalars().all():
            message = (
                f"Supplier {supplier.company_name} is at risk: rating {supplier.risk_rating or 'UNKNOWN'}, "
                f"average delay {supplier.average_delay or 0} day(s)."
            )
            before = await db.scalar(select(AIRiskAlert.id).where(AIRiskAlert.message == message).limit(1))
            await _create_alert_if_new(
                db, "SUPPLIER", message, "CRITICAL" if (supplier.risk_rating or '').upper() == "CRITICAL" else "HIGH",
                title=f"Supplier Risk: {supplier.company_name}", category="Supplier",
                supplier_name=supplier.company_name,
                recommended_action="Review supplier allocation and activate an alternate source if required.",
                ai_insight=f"Supplier rating is {supplier.risk_rating or 'UNKNOWN'} with average delay of {supplier.average_delay or 0} day(s).",
            )
            if before is None:
                created += 1

        overdue_orders = await db.execute(
            select(PurchaseOrder, Supplier)
            .join(Supplier, PurchaseOrder.supplier_id == Supplier.id)
            .where(
                PurchaseOrder.expected_delivery_date < date.today(),
                PurchaseOrder.status.in_(["Pending", "Approved", "In Transit", "PENDING", "APPROVED", "IN_TRANSIT"]),
            )
        )
        for purchase_order, supplier in overdue_orders.all():
            message = (
                f"Purchase order PO-{str(purchase_order.id)[:8].upper()} for {supplier.company_name} "
                f"is past its expected delivery date ({purchase_order.expected_delivery_date})."
            )
            before = await db.scalar(select(AIRiskAlert.id).where(AIRiskAlert.message == message).limit(1))
            await _create_alert_if_new(
                db, "PURCHASE_ORDER", message, "HIGH",
                title=f"Overdue Purchase Order: PO-{str(purchase_order.id)[:8].upper()}", category="Purchase Order",
                supplier_name=supplier.company_name,
                recommended_action="Contact the supplier and update the expected delivery date.",
                ai_insight=f"The purchase order was expected on {purchase_order.expected_delivery_date}.",
            )
            if before is None:
                created += 1

        overloaded_warehouses = await db.execute(
            select(Warehouse).where(Warehouse.current_utilization >= 90)
        )
        for warehouse in overloaded_warehouses.scalars().all():
            message = (
                f"Warehouse {warehouse.warehouse_code} is at {warehouse.current_utilization}% utilization "
                "and may not have capacity for incoming stock."
            )
            before = await db.scalar(select(AIRiskAlert.id).where(AIRiskAlert.message == message).limit(1))
            await _create_alert_if_new(
                db, "WAREHOUSE", message, "CRITICAL" if warehouse.current_utilization >= 95 else "HIGH",
                title=f"Warehouse Capacity: {warehouse.warehouse_code}", category="Warehouse",
                warehouse_name=warehouse.name,
                recommended_action="Pause non-critical inbound receipts and rebalance stock.",
                ai_insight=f"Current utilization is {warehouse.current_utilization}%.",
            )
            if before is None:
                created += 1

        quality_issues = await db.execute(
            select(GoodsReceived, Shipment, PurchaseOrder, Supplier)
            .join(Shipment, GoodsReceived.shipment_id == Shipment.id)
            .join(PurchaseOrder, GoodsReceived.purchase_order_id == PurchaseOrder.id)
            .join(Supplier, PurchaseOrder.supplier_id == Supplier.id)
            .where((GoodsReceived.rejected_quantity > 0) | (GoodsReceived.inspection_result.ilike("FAIL%")))
        )
        for receipt, shipment, purchase_order, supplier in quality_issues.all():
            message = (
                f"Quality issue on shipment for PO-{str(purchase_order.id)[:8].upper()} from "
                f"{supplier.company_name}: {receipt.rejected_quantity} units rejected."
            )
            before = await db.scalar(select(AIRiskAlert.id).where(AIRiskAlert.message == message).limit(1))
            await _create_alert_if_new(
                db, "QUALITY", message, "CRITICAL",
                title=f"Quality Issue: PO-{str(purchase_order.id)[:8].upper()}", category="Quality",
                supplier_name=supplier.company_name, recommended_action="Quarantine rejected units and open a supplier quality review.",
                ai_insight=f"Goods receipt inspection rejected {receipt.rejected_quantity} unit(s).",
            )
            if before is None:
                created += 1

        await db.commit()
    return created


async def _monitor_loop(interval_seconds: float) -> None:
    global _monitor_running
    while _monitor_running:
        try:
            await evaluate_alert_conditions()
        except asyncio.CancelledError:
            break
        except Exception:
            pass
        await asyncio.sleep(interval_seconds)


def start_alert_monitor(interval_seconds: float = 15.0) -> None:
    global _monitor_task, _monitor_running
    if not _monitor_running:
        _monitor_running = True
        _monitor_task = asyncio.create_task(_monitor_loop(interval_seconds))


async def stop_alert_monitor() -> None:
    global _monitor_task, _monitor_running
    _monitor_running = False
    if _monitor_task and not _monitor_task.done():
        _monitor_task.cancel()
        with suppress(asyncio.CancelledError):
            await _monitor_task
    _monitor_task = None