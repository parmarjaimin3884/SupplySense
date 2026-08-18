from typing import Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import Warehouse, Inventory
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_warehouse(warehouse_id: str, session: AsyncSession = None) -> dict:
    """
    Get detailed information about a specific warehouse.
    """
    stmt = select(Warehouse).where(Warehouse.id == warehouse_id)
    result = await session.execute(stmt)
    warehouse = result.scalar_one_or_none()
    
    if not warehouse:
        return format_response(False, f"Warehouse {warehouse_id} not found.")
        
    data = {
        "id": warehouse.id,
        "warehouse_code": warehouse.warehouse_code,
        "name": warehouse.name,
        "manager": warehouse.manager,
        "capacity": warehouse.capacity,
        "current_utilization": float(warehouse.current_utilization) if warehouse.current_utilization else None,
        "operating_hours": warehouse.operating_hours
    }
    return format_response(True, "Warehouse retrieved successfully.", data)

@tool_error_handler
async def get_all_warehouses(session: AsyncSession = None) -> dict:
    """
    Get a list of all warehouses.
    """
    stmt = select(Warehouse)
    result = await session.execute(stmt)
    warehouses = result.scalars().all()
    
    data = [
        {
            "id": w.id,
            "warehouse_code": w.warehouse_code,
            "name": w.name,
            "capacity": w.capacity,
            "current_utilization": float(w.current_utilization) if w.current_utilization else None
        }
        for w in warehouses
    ]
    return format_response(True, "All warehouses retrieved successfully.", data)

@tool_error_handler
async def get_warehouse_inventory(warehouse_id: str, limit: int = 100, session: AsyncSession = None) -> dict:
    """
    Get inventory records for a specific warehouse.
    """
    stmt = (
        select(Inventory)
        .options(selectinload(Inventory.product))
        .where(Inventory.warehouse_id == warehouse_id)
        .limit(limit)
    )
    result = await session.execute(stmt)
    inventories = result.scalars().all()
    
    data = [
        {
            "id": inv.id,
            "product_id": inv.product_id,
            "product_name": inv.product.name if inv.product else None,
            "quantity_on_hand": inv.quantity_on_hand,
            "available_quantity": inv.available_quantity
        }
        for inv in inventories
    ]
    return format_response(True, f"Found {len(data)} inventory records in warehouse.", data)

@tool_error_handler
async def get_warehouse_capacity(warehouse_id: str, session: AsyncSession = None) -> dict:
    """
    Get the total capacity of a specific warehouse.
    """
    stmt = select(Warehouse.capacity).where(Warehouse.id == warehouse_id)
    result = await session.execute(stmt)
    capacity = result.scalar()
    
    if capacity is None:
        return format_response(False, "Warehouse not found.")
        
    return format_response(True, "Warehouse capacity retrieved.", {"capacity": capacity})

@tool_error_handler
async def get_available_capacity(warehouse_id: str, session: AsyncSession = None) -> dict:
    """
    Estimate available capacity of a specific warehouse based on utilization.
    """
    stmt = select(Warehouse.capacity, Warehouse.current_utilization).where(Warehouse.id == warehouse_id)
    result = await session.execute(stmt)
    row = result.first()
    
    if not row:
        return format_response(False, "Warehouse not found.")
        
    capacity, utilization = row
    utilization = float(utilization) if utilization else 0.0
    
    available = capacity * (1 - (utilization / 100))
    
    return format_response(True, "Available capacity calculated.", {"available_capacity": round(available, 2)})

@tool_error_handler
async def get_utilization_percentage(warehouse_id: str, session: AsyncSession = None) -> dict:
    """
    Get the current utilization percentage of a specific warehouse.
    """
    stmt = select(Warehouse.current_utilization).where(Warehouse.id == warehouse_id)
    result = await session.execute(stmt)
    utilization = result.scalar()
    
    if utilization is None:
        return format_response(False, "Warehouse not found or has no utilization data.")
        
    return format_response(True, "Utilization percentage retrieved.", {"current_utilization": float(utilization)})

@tool_error_handler
async def get_top_occupied_warehouses(limit: int = 5, session: AsyncSession = None) -> dict:
    """
    Get warehouses with the highest current utilization.
    """
    stmt = (
        select(Warehouse)
        .order_by(desc(Warehouse.current_utilization))
        .limit(limit)
    )
    result = await session.execute(stmt)
    warehouses = result.scalars().all()
    
    data = [
        {
            "id": w.id,
            "name": w.name,
            "capacity": w.capacity,
            "current_utilization": float(w.current_utilization) if w.current_utilization else None
        }
        for w in warehouses
    ]
    return format_response(True, "Top occupied warehouses retrieved.", data)
