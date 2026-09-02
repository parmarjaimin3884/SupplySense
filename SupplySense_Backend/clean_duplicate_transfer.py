import asyncio
from backend.app.database.database import get_db_session
from sqlalchemy import select, delete
from models import StockTransfer, InventoryMovement, Inventory, Product, Warehouse

async def inspect_and_clean():
    async for session in get_db_session():
        # Find product JBL-0092
        p_res = await session.execute(select(Product).where(Product.sku == 'SKU-JBL-0092'))
        prod = p_res.scalar_one_or_none()
        
        print("=== CURRENT TRANSFERS FOR SKU-JBL-0092 ===")
        t_res = await session.execute(select(StockTransfer).where(StockTransfer.product_id == prod.id).order_by(StockTransfer.transfer_date.desc()))
        transfers = t_res.scalars().all()
        for t in transfers:
            print(f"Transfer ID: {t.id} | Qty: {t.quantity} | Status: {t.status} | Date: {t.transfer_date}")

        # Check inventory movements
        print("\n=== RECENT INVENTORY MOVEMENTS ===")
        m_res = await session.execute(select(InventoryMovement).where(InventoryMovement.product_id == prod.id).order_by(InventoryMovement.id.desc()).limit(10))
        movements = m_res.scalars().all()
        for m in movements:
            print(f"Movement: {m.id} | Type: {m.movement_type} | Qty: {m.quantity} | Ref: {m.reference_id}")

        # Delete the duplicate transfer 613c960f-dce0-433e-8a51-a231df02f657
        dup_id = "613c960f-dce0-433e-8a51-a231df02f657"
        await session.execute(delete(StockTransfer).where(StockTransfer.id == dup_id))
        await session.execute(delete(InventoryMovement).where(InventoryMovement.reference_id == f"TRF-{dup_id[:8].upper()}"))
        
        # In Ahmedabad warehouse, when the second transfer happened, 1520 was deducted twice from available and added to reserved.
        # Let's check inventory levels for Ahmedabad (WH-AHM)
        wh_res = await session.execute(select(Warehouse).where(Warehouse.warehouse_code == 'WH-AHM'))
        wh_ahm = wh_res.scalar_one_or_none()
        if wh_ahm and prod:
            inv_res = await session.execute(select(Inventory).where(Inventory.warehouse_id == wh_ahm.id, Inventory.product_id == prod.id))
            inv = inv_res.scalar_one_or_none()
            if inv:
                print(f"\nBefore restoration WH-AHM: Available={inv.available_quantity}, Reserved={inv.reserved_quantity}")
                # Restore the 1520 units from the duplicate transfer
                inv.available_quantity += 1520
                inv.reserved_quantity = max(0, inv.reserved_quantity - 1520)
                print(f"After restoration WH-AHM: Available={inv.available_quantity}, Reserved={inv.reserved_quantity}")

        await session.commit()
        print("\nSuccessfully removed duplicate transfer TRF-613C960F and restored stock!")
        break

asyncio.run(inspect_and_clean())
