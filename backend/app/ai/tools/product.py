from typing import Optional
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import Product, Category, Brand, Inventory
from backend.app.ai.tools.common import tool_error_handler, format_response

@tool_error_handler
async def get_product(product_id: str, session: AsyncSession = None) -> dict:
    """
    Retrieve product details by product ID.
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.brand))
        .where(Product.id == product_id)
    )
    result = await session.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        return format_response(False, f"Product with ID {product_id} not found.")
        
    data = {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "barcode": product.barcode,
        "category": product.category.name if product.category else None,
        "brand": product.brand.name if product.brand else None,
        "cost_price": float(product.cost_price),
        "selling_price": float(product.selling_price),
        "mrp": float(product.mrp),
        "weight": float(product.weight) if product.weight else None,
        "dimensions": product.dimensions,
        "launch_date": str(product.launch_date) if product.launch_date else None,
        "average_daily_sales": product.average_daily_sales,
        "lead_time": product.lead_time,
        "reorder_level": product.reorder_level,
        "economic_order_quantity": product.economic_order_quantity
    }
    return format_response(True, "Product retrieved successfully.", data)

@tool_error_handler
async def search_products(keyword: str, session: AsyncSession = None) -> dict:
    """
    Search products by keyword (name or sku).
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.brand))
        .where(
            or_(
                Product.name.ilike(f"%{keyword}%"),
                Product.sku.ilike(f"%{keyword}%")
            )
        )
        .limit(50)
    )
    result = await session.execute(stmt)
    products = result.scalars().all()
    
    data = [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else None,
            "brand": p.brand.name if p.brand else None,
            "selling_price": float(p.selling_price)
        }
        for p in products
    ]
    return format_response(True, f"Found {len(data)} products.", data)

@tool_error_handler
async def get_products_by_category(category_id: str, session: AsyncSession = None) -> dict:
    """
    Get products belonging to a specific category.
    """
    stmt = select(Product).where(Product.category_id == category_id)
    result = await session.execute(stmt)
    products = result.scalars().all()
    
    data = [
        {"id": p.id, "name": p.name, "sku": p.sku, "selling_price": float(p.selling_price)}
        for p in products
    ]
    return format_response(True, f"Found {len(data)} products for category.", data)

@tool_error_handler
async def get_products_by_brand(brand_id: str, session: AsyncSession = None) -> dict:
    """
    Get products belonging to a specific brand.
    """
    stmt = select(Product).where(Product.brand_id == brand_id)
    result = await session.execute(stmt)
    products = result.scalars().all()
    
    data = [
        {"id": p.id, "name": p.name, "sku": p.sku, "selling_price": float(p.selling_price)}
        for p in products
    ]
    return format_response(True, f"Found {len(data)} products for brand.", data)

@tool_error_handler
async def get_top_selling_products(limit: int = 10, session: AsyncSession = None) -> dict:
    """
    Get the top selling products based on average daily sales.
    """
    stmt = select(Product).order_by(desc(Product.average_daily_sales)).limit(limit)
    result = await session.execute(stmt)
    products = result.scalars().all()
    
    data = [
        {"id": p.id, "name": p.name, "sku": p.sku, "average_daily_sales": p.average_daily_sales}
        for p in products
    ]
    return format_response(True, "Top selling products retrieved successfully.", data)

@tool_error_handler
async def get_slowest_selling_products(limit: int = 10, session: AsyncSession = None) -> dict:
    """
    Get the slowest selling products based on average daily sales.
    """
    stmt = select(Product).order_by(Product.average_daily_sales).limit(limit)
    result = await session.execute(stmt)
    products = result.scalars().all()
    
    data = [
        {"id": p.id, "name": p.name, "sku": p.sku, "average_daily_sales": p.average_daily_sales}
        for p in products
    ]
    return format_response(True, "Slowest selling products retrieved successfully.", data)

@tool_error_handler
async def get_product_inventory(product_id: str, session: AsyncSession = None) -> dict:
    """
    Get inventory details across all warehouses for a specific product.
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
            "warehouse_id": inv.warehouse_id,
            "warehouse_name": inv.warehouse.name if inv.warehouse else None,
            "quantity_on_hand": inv.quantity_on_hand,
            "reserved_quantity": inv.reserved_quantity,
            "available_quantity": inv.available_quantity,
            "damaged_quantity": inv.damaged_quantity,
            "last_updated": str(inv.last_updated) if inv.last_updated else None
        }
        for inv in inventories
    ]
    return format_response(True, "Product inventory retrieved successfully.", data)
