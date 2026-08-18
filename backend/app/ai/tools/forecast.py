"""
SupplySense — Forecast & Sales Data Tools
Data-access functions for demand forecasting, historical sales analysis,
seasonal patterns, and monthly sales trends.
These tools query the DemandHistory, ForecastHistory, SalesOrder, and
SalesOrderItem models via SQLAlchemy async sessions.
"""

from typing import Optional
from sqlalchemy import select, func, desc, extract
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import (
    SalesOrder, SalesOrderItem, Product,
    DemandHistory, ForecastHistory,
)
from backend.app.ai.tools.common import tool_error_handler, format_response


@tool_error_handler
async def get_historical_sales(limit: int = 100, session: AsyncSession = None) -> dict:
    """
    Get historical sales orders with their totals.
    Returns the most recent completed sales orders.
    """
    stmt = (
        select(SalesOrder)
        .where(SalesOrder.status == "Completed")
        .order_by(desc(SalesOrder.order_date))
        .limit(limit)
    )
    result = await session.execute(stmt)
    orders = result.scalars().all()

    data = [
        {
            "id": o.id,
            "order_date": str(o.order_date),
            "customer_name": o.customer_name,
            "total_amount": float(o.total_amount),
            "status": o.status,
        }
        for o in orders
    ]
    return format_response(True, f"Retrieved {len(data)} historical sales orders.", data)


@tool_error_handler
async def get_product_sales_history(
    product_id: str, limit: int = 100, session: AsyncSession = None
) -> dict:
    """
    Get sales history for a specific product, including quantities sold per order.
    """
    stmt = (
        select(SalesOrderItem)
        .options(selectinload(SalesOrderItem.sales_order))
        .where(SalesOrderItem.product_id == product_id)
        .order_by(desc(SalesOrderItem.sales_order.has(SalesOrder.order_date)))
        .limit(limit)
    )
    result = await session.execute(stmt)
    items = result.scalars().all()

    data = [
        {
            "sales_order_id": item.sales_order_id,
            "order_date": str(item.sales_order.order_date) if item.sales_order else None,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "total_price": float(item.total_price),
        }
        for item in items
    ]
    return format_response(
        True, f"Retrieved {len(data)} sales records for product.", data
    )


@tool_error_handler
async def get_seasonal_sales(session: AsyncSession = None) -> dict:
    """
    Get demand data with seasonality and trend indicators from the demand_history table.
    Useful for understanding seasonal spikes (e.g., festivals, end-of-year).
    """
    stmt = (
        select(DemandHistory)
        .order_by(desc(DemandHistory.date))
        .limit(200)
    )
    result = await session.execute(stmt)
    records = result.scalars().all()

    data = [
        {
            "product_id": r.product_id,
            "date": str(r.date),
            "demand": r.demand,
            "seasonality_factor": float(r.seasonality_factor) if r.seasonality_factor else None,
            "trend_indicator": float(r.trend_indicator) if r.trend_indicator else None,
        }
        for r in records
    ]
    return format_response(
        True, f"Retrieved {len(data)} seasonal demand records.", data
    )


@tool_error_handler
async def get_monthly_sales(session: AsyncSession = None) -> dict:
    """
    Get aggregated monthly sales totals (revenue and order count) from completed sales orders.
    """
    stmt = (
        select(
            extract("year", SalesOrder.order_date).label("year"),
            extract("month", SalesOrder.order_date).label("month"),
            func.count(SalesOrder.id).label("order_count"),
            func.sum(SalesOrder.total_amount).label("total_revenue"),
        )
        .where(SalesOrder.status == "Completed")
        .group_by(
            extract("year", SalesOrder.order_date),
            extract("month", SalesOrder.order_date),
        )
        .order_by(
            extract("year", SalesOrder.order_date).desc(),
            extract("month", SalesOrder.order_date).desc(),
        )
        .limit(24)
    )
    result = await session.execute(stmt)
    rows = result.all()

    data = [
        {
            "year": int(row.year),
            "month": int(row.month),
            "order_count": row.order_count,
            "total_revenue": float(row.total_revenue) if row.total_revenue else 0.0,
        }
        for row in rows
    ]
    return format_response(
        True, f"Retrieved {len(data)} months of sales data.", data
    )


@tool_error_handler
async def get_demand_forecast(
    product_id: Optional[str] = None, limit: int = 50, session: AsyncSession = None
) -> dict:
    """
    Get stored demand forecasts from the forecast_history table.
    Optionally filter by product_id.
    """
    stmt = select(ForecastHistory).order_by(desc(ForecastHistory.target_date))

    if product_id:
        stmt = stmt.where(ForecastHistory.product_id == product_id)

    stmt = stmt.limit(limit)
    result = await session.execute(stmt)
    forecasts = result.scalars().all()

    data = [
        {
            "product_id": f.product_id,
            "forecast_date": str(f.forecast_date),
            "target_date": str(f.target_date),
            "forecasted_demand": f.forecasted_demand,
        }
        for f in forecasts
    ]
    return format_response(
        True, f"Retrieved {len(data)} demand forecasts.", data
    )
