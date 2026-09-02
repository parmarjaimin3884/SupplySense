"""
SupplySense — Real-Time Live Enterprise ERP Transaction Simulator
==================================================================
Simulates continuous real-world supply chain changes every few seconds:
1. Customer sales orders reducing available stock in depots
2. Inbound shipment freight movements and telematics updates
3. Dock warehouse Goods Receipts (GRN) restocking inventory
4. Autonomous AI risk triggers when stock crosses safety thresholds

Run this script in a terminal window to watch SupplySense update dynamically.
"""

import asyncio
import random
import sys
from datetime import datetime

from sqlalchemy import select, update
from backend.app.database.database import async_session_factory
from models import Inventory, Product, Warehouse, Shipment, AIRiskAlert


async def run_enterprise_simulation(interval_seconds: float = 3.5):
    print("=" * 72)
    print(" [STREAM SIMULATOR] SupplySense Real-Time Enterprise ERP Feed")
    print(" Connected to PostgreSQL Database")
    print(f" Simulating live multi-depot ERP events every {interval_seconds}s...")
    print(" Press Ctrl+C in terminal to stop.")
    print("=" * 72)

    event_counter = 0

    while True:
        try:
            async with async_session_factory() as db:
                event_counter += 1
                event_type = random.choice(["SALES_DISPATCH", "SHIPMENT_TRANSIT", "STOCK_INFLOW", "ROP_CHECK"])
                now_str = datetime.now().strftime("%H:%M:%S")

                if event_type == "SALES_DISPATCH":
                    # Simulate customer sales order draining 15-40 units
                    inv_rows = (await db.execute(select(Inventory).limit(10))).scalars().all()
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
                        print(f"[{now_str}] [ERP SALES #{event_counter:04d}] Dispatched {drain_qty} units of '{prod.name if prod else 'SKU'}' from {wh.warehouse_code if wh else 'Hub'}. (New Stock: {new_avail:,} u)")

                elif event_type == "SHIPMENT_TRANSIT":
                    # Simulate carrier telemetry update
                    shipments = (await db.execute(select(Shipment).limit(6))).scalars().all()
                    if shipments:
                        target_shp = random.choice(shipments)
                        new_delay = random.choice([0, 1, 2, 3, 0])
                        locations = [
                            "Mumbai Western Highway KM-142",
                            "Delhi Ring Road Entry Dock",
                            "Surat Industrial Toll Plaza",
                            "Bangalore Tech Corridor Gate #2",
                            "Ahmedabad Logistics Bypass",
                        ]
                        new_loc = random.choice(locations)

                        await db.execute(
                            update(Shipment)
                            .where(Shipment.id == target_shp.id)
                            .values(delay_days=new_delay, current_location=new_loc)
                        )
                        await db.commit()
                        print(f"[{now_str}] [CARRIER GPS] Truck '{target_shp.vehicle_number or 'MH-04'}' at '{new_loc}'. (Delay: +{new_delay}d)")

                elif event_type == "STOCK_INFLOW":
                    # Simulate dock shipment arrival restocking inventory
                    inv_rows = (await db.execute(select(Inventory).limit(10))).scalars().all()
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
                        print(f"[{now_str}] [DOCK RECEIPT GRN] Restocked +{restock_qty} units of '{prod.name if prod else 'SKU'}' at {wh.warehouse_code if wh else 'Hub'}. (New Stock: {new_avail:,} u)")

                elif event_type == "ROP_CHECK":
                    stmt = select(Inventory, Product, Warehouse).join(Product, Inventory.product_id == Product.id).join(Warehouse, Inventory.warehouse_id == Warehouse.id).where(Inventory.available_quantity <= Product.reorder_level).limit(1)
                    low_row = (await db.execute(stmt)).first()
                    if low_row:
                        inv, prod, wh = low_row
                        print(f"[{now_str}] [AI SENTINEL ALERT] Safety buffer breached for '{prod.name}' at {wh.warehouse_code} (Avail: {inv.available_quantity:,} vs ROP: {prod.reorder_level:,} u).")

            await asyncio.sleep(interval_seconds)

        except asyncio.CancelledError:
            print("\nSimulation stopped cleanly.")
            break
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Simulation note: {e}")
            await asyncio.sleep(interval_seconds)


if __name__ == "__main__":
    interval = float(sys.argv[1]) if len(sys.argv) > 1 else 3.5
    try:
        asyncio.run(run_enterprise_simulation(interval))
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")
