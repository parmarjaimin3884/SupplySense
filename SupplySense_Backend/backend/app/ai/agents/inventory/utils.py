import asyncio
from typing import Dict, Any
from langchain_core.tools import tool

from backend.app.ai.tools.inventory import (
    get_low_stock_products,
    get_out_of_stock_products,
    get_overstock_products,
    get_dead_stock,
    get_fast_moving_products,
    get_inventory,
    get_inventory_by_warehouse,
    get_inventory_turnover,
    get_inventory_value,
    get_recent_inventory_movements
)

# Wrapper function to safely execute the async DB tools synchronously or await them in agent loops
def _run_async(coro) -> Dict[str, Any]:
    try:
        # If there's already a running event loop, we use it (typical in FastAPI/asyncio apps)
        loop = asyncio.get_running_loop()
        # For full safety in a real app, we might need a dedicated thread, but this suffices for standard LC agents.
        # Actually, since LC agents can run async, we should provide async tools where possible.
        # However, for simplicity of the LangChain tool interface, we will define them as standard async tools.
    except RuntimeError:
        loop = None
        
    if loop and loop.is_running():
        # Fallback for environments with running loops - wrap in task.
        import nest_asyncio
        nest_asyncio.apply()
        return asyncio.run(coro)
    else:
        return asyncio.run(coro)

@tool
async def tool_get_low_stock_products() -> Dict[str, Any]:
    """Retrieve products that are currently below their reorder level."""
    return await get_low_stock_products()

@tool
async def tool_get_out_of_stock_products() -> Dict[str, Any]:
    """Retrieve products that have an available quantity of 0."""
    return await get_out_of_stock_products()

@tool
async def tool_get_overstock_products() -> Dict[str, Any]:
    """Retrieve products that have significantly more stock than needed."""
    return await get_overstock_products()

@tool
async def tool_get_dead_stock() -> Dict[str, Any]:
    """Retrieve products that have stock but zero average daily sales."""
    return await get_dead_stock()

@tool
async def tool_get_fast_moving_products(limit: int = 20) -> Dict[str, Any]:
    """Retrieve the fastest moving products based on average daily sales."""
    return await get_fast_moving_products(limit=limit)

@tool
async def tool_get_inventory(product_id: str) -> Dict[str, Any]:
    """Get all inventory records for a specific product ID across all warehouses."""
    return await get_inventory(product_id=product_id)

@tool
async def tool_get_inventory_by_warehouse(warehouse_id: str) -> Dict[str, Any]:
    """Get all inventory records for a specific warehouse ID."""
    return await get_inventory_by_warehouse(warehouse_id=warehouse_id)

@tool
async def tool_get_inventory_turnover() -> Dict[str, Any]:
    """Calculate the estimated inventory turnover ratio and COGS."""
    return await get_inventory_turnover()

@tool
async def tool_get_inventory_value() -> Dict[str, Any]:
    """Calculate the total financial value of all current inventory."""
    return await get_inventory_value()

@tool
async def tool_get_recent_inventory_movements(limit: int = 50) -> Dict[str, Any]:
    """Get the most recent inventory movements (inbound, outbound, transfers)."""
    return await get_recent_inventory_movements(limit=limit)

def get_all_inventory_tools():
    """Return a list of all available inventory tools for the LangChain agent."""
    return [
        tool_get_low_stock_products,
        tool_get_out_of_stock_products,
        tool_get_overstock_products,
        tool_get_dead_stock,
        tool_get_fast_moving_products,
        tool_get_inventory,
        tool_get_inventory_by_warehouse,
        tool_get_inventory_turnover,
        tool_get_inventory_value,
        tool_get_recent_inventory_movements
    ]
