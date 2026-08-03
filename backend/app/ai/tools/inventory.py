from typing import Optional
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import Inventory, Product, Warehouse, InventoryMovement
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_inventory(product_id: str, session: AsyncSession = None) -> dict:
    """
    Get all inventory records for a specific product across all warehouses.
    """
    stmt = (
        select(Inventory)
        .options(selectinload(Inventory.warehouse))
        .where(Inventory.product_id == product_id)
    )
    result = await session.execute(stmt)
    inventories = result.scalars().all()
    
    data = [
        {
            "id": inv.id,
            "warehouse_id": inv.warehouse_id,
            "warehouse_name": inv.warehouse.name if inv.warehouse else None,
            "quantity_on_hand": inv.quantity_on_hand,
            "available_quantity": inv.available_quantity,
            "reserved_quantity": inv.reserved_quantity,
            "damaged_quantity": inv.damaged_quantity,
            "last_updated": str(inv.last_updated) if inv.last_updated else None
        }
        for inv in inventories
    ]
    return format_response(True, "Inventory retrieved successfully.", data)

@tool_error_handler
async def get_inventory_by_warehouse(warehouse_id: str, session: AsyncSession = None) -> dict:
    """
    Get all inventory records for a specific warehouse.
    """
    stmt = (
        select(Inventory)
        .options(selectinload(Inventory.product))
        .where(Inventory.warehouse_id == warehouse_id)
        .limit(100)  # Limiting to avoid massive payloads
    )
    result = await session.execute(stmt)
    inventories = result.scalars().all()
    
    data = [
        {
            "id": inv.id,
            "product_id": inv.product_id,
            "product_name": inv.product.name if inv.product else None,
            "sku": inv.product.sku if inv.product else None,
            "available_quantity": inv.available_quantity,
            "quantity_on_hand": inv.quantity_on_hand
        }
        for inv in inventories
    ]
    return format_response(True, f"Retrieved {len(data)} inventory records for warehouse.", data)

@tool_error_handler
async def get_low_stock_products(session: AsyncSession = None) -> dict:
    """
    Get products whose available quantity is below their reorder level.
    """
    stmt = (
        select(Inventory, Product)
        .join(Product)
        .where(Inventory.available_quantity <= Product.reorder_level)
        .where(Inventory.available_quantity > 0)
        .limit(100)
    )
    result = await session.execute(stmt)
    rows = result.all()
    
    data = [
        {
            "inventory_id": inv.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "warehouse_id": inv.warehouse_id,
            "available_quantity": inv.available_quantity,
            "reorder_level": prod.reorder_level
        }
        for inv, prod in rows
    ]
    return format_response(True, "Low stock products retrieved successfully.", data)

@tool_error_handler
async def get_out_of_stock_products(session: AsyncSession = None) -> dict:
    """
    Get products that are currently out of stock (available quantity is 0).
    """
    stmt = (
        select(Inventory, Product)
        .join(Product)
        .where(Inventory.available_quantity == 0)
        .limit(100)
    )
    result = await session.execute(stmt)
    rows = result.all()
    
    data = [
        {
            "inventory_id": inv.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "warehouse_id": inv.warehouse_id
        }
        for inv, prod in rows
    ]
    return format_response(True, "Out of stock products retrieved successfully.", data)

@tool_error_handler
async def get_overstock_products(session: AsyncSession = None) -> dict:
    """
    Get products that have significantly more stock than needed (e.g., > reorder_level * 3).
    """
    stmt = (
        select(Inventory, Product)
        .join(Product)
        .where(Product.reorder_level > 0)
        .where(Inventory.available_quantity > (Product.reorder_level * 3))
        .limit(100)
    )
    result = await session.execute(stmt)
    rows = result.all()
    
    data = [
        {
            "inventory_id": inv.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "warehouse_id": inv.warehouse_id,
            "available_quantity": inv.available_quantity,
            "reorder_level": prod.reorder_level
        }
        for inv, prod in rows
    ]
    return format_response(True, "Overstock products retrieved successfully.", data)

@tool_error_handler
async def get_dead_stock(session: AsyncSession = None) -> dict:
    """
    Get products that have stock but 0 average daily sales.
    """
    stmt = (
        select(Inventory, Product)
        .join(Product)
        .where(Inventory.available_quantity > 0)
        .where(Product.average_daily_sales == 0)
        .limit(100)
    )
    result = await session.execute(stmt)
    rows = result.all()
    
    data = [
        {
            "inventory_id": inv.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "warehouse_id": inv.warehouse_id,
            "available_quantity": inv.available_quantity
        }
        for inv, prod in rows
    ]
    return format_response(True, "Dead stock products retrieved successfully.", data)

@tool_error_handler
async def get_fast_moving_products(limit: int = 20, session: AsyncSession = None) -> dict:
    """
    Get products with high average daily sales.
    """
    stmt = select(Product).order_by(desc(Product.average_daily_sales)).limit(limit)
    result = await session.execute(stmt)
    products = result.scalars().all()
    
    data = [
        {
            "product_id": p.id,
            "product_name": p.name,
            "sku": p.sku,
            "average_daily_sales": p.average_daily_sales
        }
        for p in products
    ]
    return format_response(True, "Fast moving products retrieved successfully.", data)

@tool_error_handler
async def get_inventory_value(session: AsyncSession = None) -> dict:
    """
    Calculate total inventory value (available_quantity * cost_price).
    """
    stmt = select(
        func.sum(Inventory.available_quantity * Product.cost_price).label("total_value")
    ).select_from(Inventory).join(Product)
    
    result = await session.execute(stmt)
    total_value = result.scalar() or 0.0
    
    return format_response(True, "Inventory value calculated.", {"total_value": float(total_value)})

@tool_error_handler
async def get_inventory_turnover(session: AsyncSession = None) -> dict:
    """
    Calculate inventory turnover ratio (simplified: total sales / average inventory).
    Returns mock analytical calculation logic.
    """
    # In a real scenario, this involves querying SalesOrders over a period and averaging inventory.
    # Here we perform a basic approximation based on current inventory and average daily sales.
    stmt = select(
        func.sum(Product.average_daily_sales * Product.cost_price * 365).label("annual_cogs"),
        func.sum(Inventory.available_quantity * Product.cost_price).label("current_inv_value")
    ).select_from(Inventory).join(Product)
    
    result = await session.execute(stmt)
    row = result.first()
    
    annual_cogs = row.annual_cogs or 0
    current_inv_value = row.current_inv_value or 1  # prevent division by zero
    
    turnover_ratio = float(annual_cogs) / float(current_inv_value) if current_inv_value > 0 else 0
    
    data = {
        "annual_cogs_estimate": float(annual_cogs),
        "current_inventory_value": float(current_inv_value),
        "estimated_turnover_ratio": turnover_ratio
    }
    return format_response(True, "Inventory turnover estimated.", data)

@tool_error_handler
async def get_recent_inventory_movements(limit: int = 50, session: AsyncSession = None) -> dict:
    """
    Get recent inventory movements (inbound, outbound, transfers).
    """
    stmt = (
        select(InventoryMovement)
        .options(selectinload(InventoryMovement.warehouse))
        .order_by(desc(InventoryMovement.movement_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    movements = result.scalars().all()
    
    data = [
        {
            "id": mov.id,
            "warehouse_id": mov.warehouse_id,
            "warehouse_name": mov.warehouse.name if mov.warehouse else None,
            "product_id": mov.product_id,
            "movement_type": mov.movement_type,
            "quantity": mov.quantity,
            "reference_id": mov.reference_id,
            "movement_date": str(mov.movement_date) if mov.movement_date else None
        }
        for mov in movements
    ]
    return format_response(True, "Recent inventory movements retrieved successfully.", data)
