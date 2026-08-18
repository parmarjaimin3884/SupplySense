"""
SupplySense — Product Catalog API v1 Router
============================================
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from models import Product, Brand, Category, Supplier, Inventory
from backend.app.schemas.product import ProductResponse, ProductDetailResponse
from backend.app.schemas.common import PaginationResponse, BaseResponse, PaginationMeta
from backend.app.api.deps import get_db

router = APIRouter(prefix="/products", tags=["Product Catalog"])


@router.get(
    "",
    response_model=PaginationResponse[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Paginated Product List",
    description="Returns filtered electronics SKU catalog list.",
)
async def list_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=500),
    search: Optional[str] = Query(default=None, description="Search by name, SKU, barcode."),
    category_id: Optional[str] = Query(default=None, description="Filter by Category ID."),
    brand_id: Optional[str] = Query(default=None, description="Filter by Brand ID."),
    db: AsyncSession = Depends(get_db),
) -> PaginationResponse[ProductResponse]:
    """Returns paginated product list."""
    stmt = select(Product, Brand, Category, Supplier).outerjoin(Brand, Product.brand_id == Brand.id).outerjoin(Category, Product.category_id == Category.id).outerjoin(Supplier, Product.supplier_id == Supplier.id)

    if search:
        q_term = f"%{search}%"
        stmt = stmt.where(or_(Product.name.ilike(q_term), Product.sku.ilike(q_term)))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if brand_id:
        stmt = stmt.where(Product.brand_id == brand_id)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_items = (await db.execute(count_stmt)).scalar() or 0

    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)
    results = (await db.execute(stmt)).all()

    items = []
    for prod, b, c, s in results:
        items.append(
            ProductResponse(
                id=prod.id,
                name=prod.name,
                sku=prod.sku,
                barcode=prod.barcode,
                brand_id=prod.brand_id,
                brand_name=b.name if b else "Generic",
                category_id=prod.category_id,
                category_name=c.name if c else "Electronics",
                supplier_id=prod.supplier_id,
                supplier_name=s.company_name if s else "Direct Vendor",
                cost_price=prod.cost_price,
                selling_price=prod.selling_price,
                mrp=prod.mrp,
                reorder_level=prod.reorder_level,
                average_daily_sales=prod.average_daily_sales,
                lead_time=prod.lead_time
            )
        )

    total_pages = max(1, (total_items + limit - 1) // limit)
    return PaginationResponse(
        success=True,
        message="Product catalog retrieved.",
        data=items,
        meta=PaginationMeta(page=page, limit=limit, total_items=total_items, total_pages=total_pages)
    )


@router.get(
    "/top-selling",
    response_model=BaseResponse[List[ProductResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Top-Selling SKUs",
    description="Returns SKUs with highest average daily sales velocity.",
)
async def get_top_selling(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[ProductResponse]]:
    """Returns top selling SKUs."""
    stmt = select(Product, Brand, Category, Supplier).outerjoin(Brand, Product.brand_id == Brand.id).outerjoin(Category, Product.category_id == Category.id).outerjoin(Supplier, Product.supplier_id == Supplier.id).order_by(Product.average_daily_sales.desc()).limit(10)
    results = (await db.execute(stmt)).all()

    items = []
    for prod, b, c, s in results:
        items.append(
            ProductResponse(
                id=prod.id,
                name=prod.name,
                sku=prod.sku,
                barcode=prod.barcode,
                brand_id=prod.brand_id,
                brand_name=b.name if b else "Generic",
                category_id=prod.category_id,
                category_name=c.name if c else "Electronics",
                supplier_id=prod.supplier_id,
                supplier_name=s.company_name if s else "Direct Vendor",
                cost_price=prod.cost_price,
                selling_price=prod.selling_price,
                mrp=prod.mrp,
                reorder_level=prod.reorder_level,
                average_daily_sales=prod.average_daily_sales,
                lead_time=prod.lead_time
            )
        )
    return BaseResponse(success=True, message="Top-selling products retrieved.", data=items)


@router.get(
    "/slow-moving",
    response_model=BaseResponse[List[ProductResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Slow-Moving SKUs",
    description="Returns SKUs with low sales velocity.",
)
async def get_slow_moving(db: AsyncSession = Depends(get_db)) -> BaseResponse[List[ProductResponse]]:
    """Returns slow-moving SKUs."""
    stmt = select(Product, Brand, Category, Supplier).outerjoin(Brand, Product.brand_id == Brand.id).outerjoin(Category, Product.category_id == Category.id).outerjoin(Supplier, Product.supplier_id == Supplier.id).order_by(Product.average_daily_sales.asc()).limit(10)
    results = (await db.execute(stmt)).all()

    items = []
    for prod, b, c, s in results:
        items.append(
            ProductResponse(
                id=prod.id,
                name=prod.name,
                sku=prod.sku,
                barcode=prod.barcode,
                brand_id=prod.brand_id,
                brand_name=b.name if b else "Generic",
                category_id=prod.category_id,
                category_name=c.name if c else "Electronics",
                supplier_id=prod.supplier_id,
                supplier_name=s.company_name if s else "Direct Vendor",
                cost_price=prod.cost_price,
                selling_price=prod.selling_price,
                mrp=prod.mrp,
                reorder_level=prod.reorder_level,
                average_daily_sales=prod.average_daily_sales,
                lead_time=prod.lead_time
            )
        )
    return BaseResponse(success=True, message="Slow-moving products retrieved.", data=items)


@router.get(
    "/{id}",
    response_model=BaseResponse[ProductDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Product Detail by ID",
    description="Returns comprehensive details for a specific product ID.",
)
async def get_product_by_id(id: str, db: AsyncSession = Depends(get_db)) -> BaseResponse[ProductDetailResponse]:
    """Returns single product detail."""
    stmt = select(Product, Brand, Category, Supplier).outerjoin(Brand, Product.brand_id == Brand.id).outerjoin(Category, Product.category_id == Category.id).outerjoin(Supplier, Product.supplier_id == Supplier.id).where(Product.id == id)
    res = (await db.execute(stmt)).first()

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product ID '{id}' not found.")

    prod, b, c, s = res
    stock_sum_stmt = select(func.sum(Inventory.available_quantity)).where(Inventory.product_id == prod.id)
    total_stock = (await db.execute(stock_sum_stmt)).scalar() or 0

    detail = ProductDetailResponse(
        id=prod.id,
        name=prod.name,
        sku=prod.sku,
        barcode=prod.barcode,
        brand_id=prod.brand_id,
        brand_name=b.name if b else "Generic",
        category_id=prod.category_id,
        category_name=c.name if c else "Electronics",
        supplier_id=prod.supplier_id,
        supplier_name=s.company_name if s else "Direct Vendor",
        cost_price=prod.cost_price,
        selling_price=prod.selling_price,
        mrp=prod.mrp,
        reorder_level=prod.reorder_level,
        average_daily_sales=prod.average_daily_sales,
        lead_time=prod.lead_time,
        warranty=prod.warranty,
        weight=prod.weight,
        dimensions=prod.dimensions,
        launch_date=prod.launch_date,
        economic_order_quantity=prod.economic_order_quantity,
        total_on_hand_stock=total_stock
    )
    return BaseResponse(success=True, message="Product detail retrieved.", data=detail)
