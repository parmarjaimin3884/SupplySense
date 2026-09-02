import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Date, DateTime, ForeignKey, Index, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    
    products = relationship("Product", back_populates="category")

class Brand(Base):
    __tablename__ = 'brands'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    
    products = relationship("Product", back_populates="brand")

class Warehouse(Base):
    __tablename__ = 'warehouses'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    warehouse_code = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    manager = Column(String)
    capacity = Column(Integer, nullable=False)
    current_utilization = Column(Numeric(5, 2))
    operating_hours = Column(String)

    employees = relationship("Employee", back_populates="warehouse")
    inventory = relationship("Inventory", back_populates="warehouse")
    kpis = relationship("WarehouseKPI", back_populates="warehouse")

class Supplier(Base):
    __tablename__ = 'suppliers'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    company_name = Column(String, nullable=False)
    gst_number = Column(String, unique=True)
    pan = Column(String)
    address = Column(Text)
    city = Column(String)
    country = Column(String)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    lead_time = Column(Integer)
    moq = Column(Integer)
    payment_terms = Column(String)
    reliability_score = Column(Numeric(5, 2))
    quality_score = Column(Numeric(5, 2))
    risk_rating = Column(String)
    average_delay = Column(Numeric(5, 2))

    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    performance = relationship("SupplierPerformance", back_populates="supplier")

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=True)
    role = Column(String, nullable=False)

    employee = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    __tablename__ = 'employees'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey('users.id'), nullable=False)
    warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    name = Column(String, nullable=False)
    position = Column(String)

    user = relationship("User", back_populates="employee")
    warehouse = relationship("Warehouse", back_populates="employees")

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False, unique=True)
    barcode = Column(String, unique=True)
    brand_id = Column(UUID(as_uuid=False), ForeignKey('brands.id'), nullable=False)
    category_id = Column(UUID(as_uuid=False), ForeignKey('categories.id'), nullable=False)
    supplier_id = Column(UUID(as_uuid=False), ForeignKey('suppliers.id'), nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=False)
    selling_price = Column(Numeric(12, 2), nullable=False)
    mrp = Column(Numeric(12, 2), nullable=False)
    warranty = Column(String)
    weight = Column(Numeric(8, 2))
    dimensions = Column(String)
    launch_date = Column(Date)
    average_daily_sales = Column(Integer, default=0)
    lead_time = Column(Integer)
    reorder_level = Column(Integer)
    economic_order_quantity = Column(Integer)

    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    inventory = relationship("Inventory", back_populates="product")
    
    __table_args__ = (
        Index('idx_product_sku', 'sku'),
        Index('idx_product_category', 'category_id'),
        Index('idx_product_brand', 'brand_id')
    )

class Inventory(Base):
    __tablename__ = 'inventory'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    quantity_on_hand = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    available_quantity = Column(Integer, nullable=False, default=0)
    damaged_quantity = Column(Integer, nullable=False, default=0)
    last_updated = Column(Date, default=date.today)

    warehouse = relationship("Warehouse", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")

    __table_args__ = (
        CheckConstraint('quantity_on_hand >= 0', name='check_qty_positive'),
        CheckConstraint('available_quantity >= 0', name='check_avail_positive'),
        Index('idx_inventory_warehouse_product', 'warehouse_id', 'product_id', unique=True)
    )

class PurchaseOrder(Base):
    __tablename__ = 'purchase_orders'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    supplier_id = Column(UUID(as_uuid=False), ForeignKey('suppliers.id'), nullable=False)
    warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    order_date = Column(Date, nullable=False)
    expected_delivery_date = Column(Date)
    status = Column(String, nullable=False)
    priority = Column(String)
    approved_by = Column(String)
    total_amount = Column(Numeric(12, 2), nullable=False)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    warehouse = relationship("Warehouse")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")
    shipments = relationship("Shipment", back_populates="purchase_order")
    
    __table_args__ = (
        Index('idx_po_status', 'status'),
        Index('idx_po_supplier', 'supplier_id')
    )

class PurchaseOrderItem(Base):
    __tablename__ = 'purchase_order_items'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    purchase_order_id = Column(UUID(as_uuid=False), ForeignKey('purchase_orders.id'), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

class Shipment(Base):
    __tablename__ = 'shipments'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    purchase_order_id = Column(UUID(as_uuid=False), ForeignKey('purchase_orders.id'), nullable=False)
    carrier = Column(String)
    vehicle_number = Column(String)
    current_status = Column(String, nullable=False)
    current_location = Column(String)
    dispatch_date = Column(Date)
    expected_arrival = Column(Date)
    actual_arrival = Column(Date)
    delay_days = Column(Integer, default=0)
    delay_reason = Column(String)

    purchase_order = relationship("PurchaseOrder", back_populates="shipments")
    goods_received = relationship("GoodsReceived", back_populates="shipment")

    __table_args__ = (
        Index('idx_shipment_status', 'current_status'),
    )

class GoodsReceived(Base):
    __tablename__ = 'goods_received'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    purchase_order_id = Column(UUID(as_uuid=False), ForeignKey('purchase_orders.id'), nullable=False)
    shipment_id = Column(UUID(as_uuid=False), ForeignKey('shipments.id'), nullable=False)
    inspection_result = Column(String, nullable=False)
    accepted_quantity = Column(Integer, nullable=False)
    rejected_quantity = Column(Integer, nullable=False, default=0)
    quality_issue = Column(String)

    purchase_order = relationship("PurchaseOrder")
    shipment = relationship("Shipment", back_populates="goods_received")

class SalesOrder(Base):
    __tablename__ = 'sales_orders'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    order_date = Column(Date, nullable=False)
    customer_name = Column(String)
    status = Column(String, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)

    items = relationship("SalesOrderItem", back_populates="sales_order")
    
    __table_args__ = (
        Index('idx_so_date', 'order_date'),
    )

class SalesOrderItem(Base):
    __tablename__ = 'sales_order_items'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    sales_order_id = Column(UUID(as_uuid=False), ForeignKey('sales_orders.id'), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)

    sales_order = relationship("SalesOrder", back_populates="items")
    product = relationship("Product")

class Return(Base):
    __tablename__ = 'returns'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    sales_order_id = Column(UUID(as_uuid=False), ForeignKey('sales_orders.id'), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    reason = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String, nullable=False)

class StockTransfer(Base):
    __tablename__ = 'stock_transfers'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    from_warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    to_warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    reason = Column(String)
    transfer_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

    from_warehouse = relationship("Warehouse", foreign_keys=[from_warehouse_id])
    to_warehouse = relationship("Warehouse", foreign_keys=[to_warehouse_id])
    product = relationship("Product")

class InventoryMovement(Base):
    __tablename__ = 'inventory_movements'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    movement_type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    reference_id = Column(String)
    movement_date = Column(Date, nullable=False)
    
    warehouse = relationship("Warehouse")
    product = relationship("Product")

    __table_args__ = (
        Index('idx_inv_mov_date', 'movement_date'),
        Index('idx_inv_mov_type', 'movement_type')
    )

class SupplierPerformance(Base):
    __tablename__ = 'supplier_performance'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    supplier_id = Column(UUID(as_uuid=False), ForeignKey('suppliers.id'), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    delivery_percentage = Column(Numeric(5, 2))
    average_delay = Column(Numeric(5, 2))
    complaint_count = Column(Integer)
    quality_score = Column(Numeric(5, 2))
    risk_score = Column(Numeric(5, 2))

    supplier = relationship("Supplier", back_populates="performance")

class WarehouseKPI(Base):
    __tablename__ = 'warehouse_kpi'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    warehouse_id = Column(UUID(as_uuid=False), ForeignKey('warehouses.id'), nullable=False)
    date = Column(Date, nullable=False)
    inbound = Column(Integer)
    outbound = Column(Integer)
    picking = Column(Integer)
    packing = Column(Integer)
    returns = Column(Integer)
    warehouse_utilization = Column(Numeric(5, 2))

    warehouse = relationship("Warehouse", back_populates="kpis")

class DemandHistory(Base):
    __tablename__ = 'demand_history'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    date = Column(Date, nullable=False)
    demand = Column(Integer, nullable=False)
    seasonality_factor = Column(Numeric(5, 2))
    trend_indicator = Column(Numeric(5, 2))

class ForecastHistory(Base):
    __tablename__ = 'forecast_history'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    product_id = Column(UUID(as_uuid=False), ForeignKey('products.id'), nullable=False)
    forecast_date = Column(Date, nullable=False)
    target_date = Column(Date, nullable=False)
    forecasted_demand = Column(Integer, nullable=False)

class AIRiskAlert(Base):
    __tablename__ = 'ai_risk_alerts'
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    alert_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, nullable=False)
    created_at = Column(Date, nullable=False)
    is_resolved = Column(Boolean, default=False)
