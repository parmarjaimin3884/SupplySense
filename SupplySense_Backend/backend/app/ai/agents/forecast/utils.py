"""
SupplySense — Demand Forecast Agent Utils
Wraps existing tool-layer functions as LangChain tools for agent consumption.
"""

from typing import Dict, Any, List
from langchain_core.tools import tool

# --- Inventory Tools ---
from backend.app.ai.tools.inventory import (
    get_inventory,
    get_inventory_turnover,
    get_fast_moving_products,
)

# --- Analytics Tools ---
from backend.app.ai.tools.analytics import (
    get_sales_summary,
    get_dashboard_metrics,
)

# --- Product Tools ---
from backend.app.ai.tools.product import (
    get_top_selling_products,
    get_slowest_selling_products,
)

# --- Forecast Tools ---
from backend.app.ai.tools.forecast import (
    get_historical_sales,
    get_product_sales_history,
    get_seasonal_sales,
    get_monthly_sales,
    get_demand_forecast,
)


# =========================================================================
# Inventory Tool Wrappers
# =========================================================================

@tool
async def tool_get_inventory(product_id: str) -> Dict[str, Any]:
    """Get all inventory records for a specific product across all warehouses. Useful for checking current stock levels against forecasted demand."""
    return await get_inventory(product_id)


@tool
async def tool_get_inventory_turnover() -> Dict[str, Any]:
    """Calculate the estimated inventory turnover ratio and annual COGS. Useful for understanding how efficiently products are selling relative to stock held."""
    return await get_inventory_turnover()


@tool
async def tool_get_fast_moving_products(limit: int = 20) -> Dict[str, Any]:
    """Get the fastest-moving products based on average daily sales. Useful for identifying products with high demand velocity that may need restocking."""
    return await get_fast_moving_products(limit)


# =========================================================================
# Analytics Tool Wrappers
# =========================================================================

@tool
async def tool_get_sales_summary() -> Dict[str, Any]:
    """Get an aggregated summary of sales performance including total orders, pending orders, and completed revenue. Provides high-level demand context."""
    return await get_sales_summary()


@tool
async def tool_get_dashboard_metrics() -> Dict[str, Any]:
    """Get high-level dashboard metrics including total products, warehouses, and suppliers. Provides system-wide context for demand analysis."""
    return await get_dashboard_metrics()


# =========================================================================
# Product Tool Wrappers
# =========================================================================

@tool
async def tool_get_top_selling_products(limit: int = 10) -> Dict[str, Any]:
    """Get the top-selling products ranked by average daily sales. Useful for identifying trending products with high demand."""
    return await get_top_selling_products(limit)


@tool
async def tool_get_slowest_selling_products(limit: int = 10) -> Dict[str, Any]:
    """Get the slowest-selling products ranked by average daily sales. Useful for identifying dead stock or products needing promotional campaigns."""
    return await get_slowest_selling_products(limit)


# =========================================================================
# Forecast Tool Wrappers
# =========================================================================

@tool
async def tool_get_historical_sales(limit: int = 100) -> Dict[str, Any]:
    """Get recent completed sales orders with dates and totals. Useful for understanding historical demand patterns and revenue trends."""
    return await get_historical_sales(limit)


@tool
async def tool_get_product_sales_history(product_id: str) -> Dict[str, Any]:
    """Get detailed sales history for a specific product including quantities sold per order. Useful for per-product demand analysis."""
    return await get_product_sales_history(product_id)


@tool
async def tool_get_seasonal_sales() -> Dict[str, Any]:
    """Get demand data with seasonality factors and trend indicators from the demand history table. Useful for predicting festive or seasonal demand spikes."""
    return await get_seasonal_sales()


@tool
async def tool_get_monthly_sales() -> Dict[str, Any]:
    """Get aggregated monthly sales totals (revenue and order count). Useful for month-over-month demand trend analysis and forecasting."""
    return await get_monthly_sales()


@tool
async def tool_get_demand_forecast(product_id: str = "") -> Dict[str, Any]:
    """Get stored demand forecasts from the forecast history table. Optionally filter by product_id. Provides pre-computed demand predictions."""
    pid = product_id if product_id else None
    return await get_demand_forecast(product_id=pid)


# =========================================================================
# Tool Registry
# =========================================================================

def get_forecast_agent_tools() -> List[Any]:
    """
    Returns the comprehensive list of LangChain tools available
    to the Demand Forecast Agent.
    """
    return [
        # Inventory Tools
        tool_get_inventory,
        tool_get_inventory_turnover,
        tool_get_fast_moving_products,
        # Analytics Tools
        tool_get_sales_summary,
        tool_get_dashboard_metrics,
        # Product Tools
        tool_get_top_selling_products,
        tool_get_slowest_selling_products,
        # Forecast Tools
        tool_get_historical_sales,
        tool_get_product_sales_history,
        tool_get_seasonal_sales,
        tool_get_monthly_sales,
        tool_get_demand_forecast,
    ]
