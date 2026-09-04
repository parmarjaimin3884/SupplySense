"""
SupplySense — API v1 Router Aggregator
=======================================
Aggregates all 13 enterprise API routers under /api/v1.
"""

from fastapi import APIRouter, Depends
from backend.app.api.deps import get_current_user

from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.assistant import router as assistant_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.inventory import router as inventory_router
from backend.app.api.v1.products import router as products_router
from backend.app.api.v1.suppliers import router as suppliers_router
from backend.app.api.v1.warehouses import router as warehouses_router
from backend.app.api.v1.purchase_orders import router as purchase_orders_router
from backend.app.api.v1.shipments import router as shipments_router
from backend.app.api.v1.forecast import router as forecast_router
from backend.app.api.v1.risks import router as risks_router
from backend.app.api.v1.executive import router as executive_router
from backend.app.api.v1.settings import router as settings_router
from backend.app.api.v1.transfers import router as transfers_router
from backend.app.api.v1.reports import router as reports_router
from backend.app.api.v1.demo import router as demo_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
for protected_router in [
	assistant_router, dashboard_router, inventory_router, products_router,
	suppliers_router, warehouses_router, purchase_orders_router, shipments_router,
	forecast_router, risks_router, executive_router, settings_router,
	transfers_router, reports_router, demo_router,
]:
	api_v1_router.include_router(protected_router, dependencies=[Depends(get_current_user)])

__all__ = ["api_v1_router"]
