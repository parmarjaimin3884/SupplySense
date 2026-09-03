"""
SupplySense — Cloud Enterprise ERP Transaction Simulator Service
==================================================================
Provides background automated simulation and interactive on-demand event triggers
for realistic live demonstrations on AWS without requiring connection to real ERPs.
"""

import asyncio
import random
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from sqlalchemy import select, update, func
from backend.app.database.database import async_session_factory
from backend.app.core.redis import delete_cache_pattern
from models import Inventory, Product, Warehouse, Shipment, AIRiskAlert

logger = logging.getLogger("supplysense.simulator")

_simulation_task: Optional[asyncio.Task] = None
_simulation_running: bool = False
_simulation_interval: float = 6.0
_events_fired_count: int = 0
_recent_events: List[Dict[str, Any]] = []

CITIES_AND_HIGHWAYS = [
    "Mumbai Western Highway KM-142",
    "Delhi Ring Road Entry Dock",
    "Surat Industrial Toll Plaza",
    "Bangalore Tech Corridor Gate #2",
    "Ahmedabad Logistics Bypass",
    "Pune Express Highway Hub",
    "Chennai Port Transit Junction",
]


async def _invalidate_relevant_caches():
    """Purge cached dashboard, inventory, and shipment keys in Upstash Redis."""
    try:
        await delete_cache_pattern("supplysense:inventory:*")
        await delete_cache_pattern("supplysense:shipments:*")
        await delete_cache_pattern("supplysense:dashboard:*")
        await delete_cache_pattern("supplysense:executive:*")
    except Exception as e:
        logger.debug(f"Redis cache invalidation note: {e}")


async def trigger_event(event_type: str = "random") -> Dict[str, Any]:
    """
    Executes a single realistic supply chain transaction in PostgreSQL and invalidates cache.
    """
    global _events_fired_count, _recent_events
    _events_fired_count += 1
    now = datetime.now()
    now_str = now.strftime("%H:%M:%S")

    valid_types = ["SALES_DISPATCH", "SHIPMENT_TRANSIT", "STOCK_INFLOW", "ROP_CHECK"]
    if event_type == "random" or event_type not in valid_types:
        event_type = random.choice(valid_types)

    result_payload: Dict[str, Any] = {
        "event_id": f"EVT-{_events_fired_count:05d}",
        "event_type": event_type,
        "timestamp": now.isoformat(),
        "time_str": now_str,
        "title": "",
        "message": "",
        "severity": "info",
    }

    try:
        async with async_session_factory() as db:
            try:
                if event_type == "SALES_DISPATCH":
                    # 1. Customer sales order draining 15-45 units
                    inv_rows = (await db.execute(select(Inventory).limit(15))).scalars().all()
                    if inv_rows:
                        target_inv = random.choice(inv_rows)
                        drain_qty = random.randint(15, 45)
                        new_avail = max(10, (target_inv.available_quantity or 100) - drain_qty)

                        await db.execute(
                            update(Inventory)
                            .where(Inventory.id == target_inv.id)
                            .values(available_quantity=new_avail)
                        )
                        await db.commit()

                        prod = await db.get(Product, target_inv.product_id)
                        wh = await db.get(Warehouse, target_inv.warehouse_id)
                        prod_name = prod.name if prod else "SKU"
                        wh_name = wh.warehouse_code if wh else "Hub"

                        result_payload["title"] = f"Sales Order Dispatched (-{drain_qty} units)"
                        result_payload["message"] = f"Dispatched {drain_qty} units of '{prod_name}' from {wh_name}. Stock remaining: {new_avail:,} units."
                        result_payload["sku"] = prod.sku if prod else ""
                        result_payload["new_stock"] = new_avail

                elif event_type == "SHIPMENT_TRANSIT":
                    # 2. Freight movement telemetry update
                    shipments = (await db.execute(select(Shipment).limit(10))).scalars().all()
                    if shipments:
                        target_shp = random.choice(shipments)
                        new_delay = random.choice([0, 1, 2, 0])
                        new_loc = random.choice(CITIES_AND_HIGHWAYS)

                        await db.execute(
                            update(Shipment)
                            .where(Shipment.id == target_shp.id)
                            .values(delay_days=new_delay, current_location=new_loc)
                        )
                        await db.commit()

                        truck_no = target_shp.vehicle_number or f"TRK-{target_shp.id[:6]}"
                        result_payload["title"] = f"Carrier Telemetry Update ({truck_no})"
                        result_payload["message"] = f"Vehicle {truck_no} checked in at '{new_loc}'. Delay status: +{new_delay} days."
                        result_payload["delay_days"] = new_delay
                        result_payload["location"] = new_loc

                elif event_type == "STOCK_INFLOW":
                    # 3. Dock receipt GRN restocking inventory
                    inv_rows = (await db.execute(select(Inventory).limit(15))).scalars().all()
                    if inv_rows:
                        target_inv = random.choice(inv_rows)
                        restock_qty = random.randint(80, 200)
                        new_avail = (target_inv.available_quantity or 100) + restock_qty

                        await db.execute(
                            update(Inventory)
                            .where(Inventory.id == target_inv.id)
                            .values(available_quantity=new_avail)
                        )
                        await db.commit()

                        prod = await db.get(Product, target_inv.product_id)
                        wh = await db.get(Warehouse, target_inv.warehouse_id)
                        prod_name = prod.name if prod else "SKU"
                        wh_name = wh.warehouse_code if wh else "Hub"

                        result_payload["title"] = f"Inbound Dock Receipt (+{restock_qty} units)"
                        result_payload["message"] = f"Received and restocked +{restock_qty} units of '{prod_name}' at {wh_name}. Total available: {new_avail:,} units."
                        result_payload["sku"] = prod.sku if prod else ""
                        result_payload["new_stock"] = new_avail

                elif event_type == "ROP_CHECK":
                    # 4. Check for safety buffer crossings
                    stmt = (
                        select(Inventory, Product, Warehouse)
                        .join(Product, Inventory.product_id == Product.id)
                        .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
                        .where(Inventory.available_quantity <= Product.reorder_level)
                        .limit(1)
                    )
                    low_row = (await db.execute(stmt)).first()
                    if low_row:
                        inv, prod, wh = low_row
                        result_payload["title"] = f"AI Sentinel Buffer Alert: {prod.name}"
                        result_payload["message"] = f"Stock level ({inv.available_quantity:,} u) breached Reorder Point ({prod.reorder_level:,} u) in {wh.warehouse_code}."
                        result_payload["severity"] = "warning"
                    else:
                        result_payload["title"] = "Multi-Hub Inventory Health Check"
                        result_payload["message"] = "All active warehouse SKUs maintaining nominal safety stock buffers."
            except Exception:
                await db.rollback()
                raise

        await _invalidate_relevant_caches()

        # Add to recent events queue (keep last 20)
        _recent_events.insert(0, result_payload)
        if len(_recent_events) > 20:
            _recent_events.pop()

        logger.info(f"[SIMULATOR] {result_payload['title']} — {result_payload['message']}")
        return result_payload

    except Exception as e:
        logger.error(f"Simulator error executing event {event_type}: {e}", exc_info=True)
        result_payload["message"] = str(e)
        result_payload["error"] = True
        return result_payload


async def _simulation_loop(interval_seconds: float):
    """Continuous background loop triggering events every N seconds."""
    global _simulation_running
    logger.info(f"Enterprise ERP Stream Simulator background loop started (Interval: {interval_seconds}s)")
    while _simulation_running:
        try:
            await trigger_event("random")
            await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning(f"Simulator loop iteration note: {e}")
            await asyncio.sleep(interval_seconds)


def start_simulation(interval_seconds: float = 6.0) -> bool:
    """Starts the background simulation task."""
    global _simulation_task, _simulation_running, _simulation_interval
    if _simulation_running:
        return True
    _simulation_running = True
    _simulation_interval = interval_seconds
    _simulation_task = asyncio.create_task(_simulation_loop(interval_seconds))
    return True


def stop_simulation() -> bool:
    """Stops/pauses the background simulation task."""
    global _simulation_task, _simulation_running
    _simulation_running = False
    if _simulation_task and not _simulation_task.done():
        _simulation_task.cancel()
        _simulation_task = None
    logger.info("Enterprise ERP Stream Simulator paused.")
    return True


def get_simulation_status() -> Dict[str, Any]:
    """Returns current live simulator status and recent event logs."""
    return {
        "is_running": _simulation_running,
        "interval_seconds": _simulation_interval,
        "total_events_fired": _events_fired_count,
        "recent_events": _recent_events[:8],
    }


async def reset_demo_baseline() -> Dict[str, Any]:
    """
    Restores inventory and shipment baseline numbers to pristine starting state.
    """
    try:
        async with async_session_factory() as db:
            # Set default healthy stock numbers for all inventory rows
            inv_rows = (await db.execute(select(Inventory))).scalars().all()
            for inv in inv_rows:
                inv.available_quantity = random.randint(350, 950)
                inv.reserved_quantity = random.randint(20, 60)

            # Reset shipment delays to on-time
            shipments = (await db.execute(select(Shipment))).scalars().all()
            for s in shipments:
                s.delay_days = 0
                s.current_location = "Origin Hub Hub"

            await db.commit()

        await _invalidate_relevant_caches()
        logger.info("Demo data reset to baseline successfully.")
        return {"success": True, "message": "Baseline inventory and shipment status successfully reset."}
    except Exception as e:
        logger.error(f"Error resetting demo baseline: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
