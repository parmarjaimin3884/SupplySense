"""
SupplySense — Order Fulfillment & Multi-Warehouse Routing Tool
Evaluates stock availability, warehouse capacity utilization, and estimated transit distance
to recommend the optimal fulfillment warehouse for customer orders.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from models import Product, Warehouse, Inventory
from backend.app.ai.tools.common import tool_error_handler, format_response

# Regional distance / transit matrix approximation (in days)
REGIONAL_TRANSIT_MATRIX: Dict[str, Dict[str, int]] = {
    "WH-SUR": {"surat": 0, "mumbai": 1, "pune": 1, "ahmedabad": 1, "delhi": 2, "bangalore": 2, "chennai": 3, "hyderabad": 2, "kolkata": 3},
    "WH-MUM": {"mumbai": 0, "pune": 1, "surat": 1, "ahmedabad": 1, "bangalore": 2, "goa": 1, "hyderabad": 2, "delhi": 2, "chennai": 2, "kolkata": 3},
    "WH-AHM": {"ahmedabad": 0, "surat": 1, "rajkot": 1, "jaipur": 1, "delhi": 1, "mumbai": 1, "bangalore": 3, "kolkata": 3},
    "WH-DEL": {"delhi": 0, "noida": 0, "gurgaon": 0, "jaipur": 1, "chandigarh": 1, "lucknow": 1, "ahmedabad": 1, "mumbai": 2, "kolkata": 2, "bangalore": 3},
    "WH-BAN": {"bangalore": 0, "mysore": 1, "chennai": 1, "hyderabad": 1, "coimbatore": 1, "kochi": 1, "mumbai": 2, "pune": 2, "delhi": 3, "kolkata": 3}
}


@tool_error_handler
async def find_best_fulfillment_warehouse(
    product_name_or_sku: str,
    quantity: int = 1,
    destination_city: Optional[str] = None,
    session: AsyncSession = None
) -> dict:
    """
    Determines the best warehouse to fulfill an order of `quantity` units of `product_name_or_sku`
    to a given `destination_city`. Evaluates available stock, warehouse capacity headroom, and transit SLA.
    """
    # 1. Locate Product
    p_clean = product_name_or_sku.strip()
    p_stmt = select(Product).where(
        or_(
            Product.name.ilike(f"%{p_clean}%"),
            Product.sku.ilike(f"%{p_clean}%")
        )
    )
    p_res = await session.execute(p_stmt)
    products = p_res.scalars().all()

    if not products:
        return format_response(False, f"Product matching '{product_name_or_sku}' was not found in catalog.")

    product = products[0]

    # 2. Get Inventory across ALL Warehouses
    inv_stmt = (
        select(Inventory, Warehouse)
        .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
        .where(Inventory.product_id == product.id)
    )
    inv_res = await session.execute(inv_stmt)
    rows = inv_res.all()

    if not rows:
        return format_response(False, f"No inventory records found for {product.name} (SKU: {product.sku}).")

    dest_lower = destination_city.strip().lower() if destination_city else "general"

    candidate_warehouses: List[Dict[str, Any]] = []

    for inv, wh in rows:
        avail = inv.available_quantity
        util_pct = float(wh.current_utilization or 50.0)
        has_sufficient_stock = avail >= quantity
        
        wh_code = wh.warehouse_code
        transit_days = REGIONAL_TRANSIT_MATRIX.get(wh_code, {}).get(dest_lower, 2)

        # Fulfillment Scoring:
        # Stock suitability: 40 pts
        # Utilization headroom (lower utilization is better for dispatch): 30 pts
        # Proximity/transit speed: 30 pts
        stock_score = 40 if has_sufficient_stock else (avail / max(1, quantity)) * 20
        headroom_score = max(0, (100 - util_pct) * 0.3)
        transit_score = max(5, 30 - (transit_days * 8))

        total_score = round(stock_score + headroom_score + transit_score, 1)

        candidate_warehouses.append({
            "warehouse_id": wh.id,
            "warehouse_code": wh.warehouse_code,
            "warehouse_name": wh.name,
            "available_quantity": avail,
            "quantity_on_hand": inv.quantity_on_hand,
            "has_sufficient_stock": has_sufficient_stock,
            "warehouse_utilization_pct": util_pct,
            "estimated_transit_days": transit_days,
            "fulfillment_score": total_score
        })

    # Sort candidate warehouses by fulfillment score descending
    candidate_warehouses.sort(key=lambda x: (x["has_sufficient_stock"], x["fulfillment_score"]), reverse=True)

    top_choice = candidate_warehouses[0]
    
    explanation = (
        f"Recommended fulfillment hub for {quantity}x {product.name} (SKU: {product.sku}) "
        f"{f'to {destination_city.title()}' if destination_city else ''} is {top_choice['warehouse_name']} "
        f"({top_choice['warehouse_code']}). It has {top_choice['available_quantity']} units available "
        f"(utilization at {top_choice['warehouse_utilization_pct']:.1f}%, estimated transit: {top_choice['estimated_transit_days']} days)."
    )

    data = {
        "product_id": product.id,
        "product_name": product.name,
        "sku": product.sku,
        "requested_quantity": quantity,
        "destination_city": destination_city or "Not specified",
        "recommended_warehouse": top_choice,
        "all_warehouse_options": candidate_warehouses,
        "recommendation_reasoning": explanation
    }

    return format_response(True, explanation, data)
