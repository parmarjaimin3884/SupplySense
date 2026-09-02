import asyncio
from backend.app.database.database import get_db_session
from sqlalchemy import select
from models import StockTransfer, Inventory, Product, Warehouse

async def check():
    async for session in get_db_session():
        # 1. Check all stock_transfers records
        stmt = select(StockTransfer).order_by(StockTransfer.transfer_date.desc()).limit(5)
        res = await session.execute(stmt)
        transfers = res.scalars().all()
        print("=== STOCK TRANSFERS IN DATABASE:", len(transfers), "===")
        for t in transfers:
            fw = await session.execute(select(Warehouse).where(Warehouse.id == t.from_warehouse_id))
            tw = await session.execute(select(Warehouse).where(Warehouse.id == t.to_warehouse_id))
            pw = await session.execute(select(Product).where(Product.id == t.product_id))
            fwh = fw.scalar_one_or_none()
            twh = tw.scalar_one_or_none()
            prod = pw.scalar_one_or_none()
            prod_name = prod.name if prod else "Unknown"
            prod_sku = prod.sku if prod else "?"
            from_code = fwh.warehouse_code if fwh else "?"
            to_code = twh.warehouse_code if twh else "?"
            trf_id = str(t.id)[:8].upper()
            print(f"  TRF-{trf_id} | {prod_name} ({prod_sku}) | {t.quantity} units | {from_code} -> {to_code} | Status: {t.status} | Date: {t.transfer_date}")

        # 2. Check JBL-0092 stock after transfer
        print()
        print("=== JBL-0092 STOCK AFTER TRANSFER ===")
        p = (await session.execute(select(Product).where(Product.sku == 'SKU-JBL-0092'))).scalar_one_or_none()
        if p:
            invs = (await session.execute(select(Inventory).where(Inventory.product_id == p.id))).scalars().all()
            for inv in invs:
                wh = (await session.execute(select(Warehouse).where(Warehouse.id == inv.warehouse_id))).scalar_one_or_none()
                wcode = wh.warehouse_code if wh else "?"
                wname = wh.name if wh else "?"
                print(f"  {wcode} ({wname}): Available={inv.available_quantity}, Reserved={inv.reserved_quantity}")
        break

asyncio.run(check())
