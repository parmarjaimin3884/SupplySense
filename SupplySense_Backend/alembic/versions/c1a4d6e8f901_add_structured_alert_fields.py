"""Add structured fields for dynamic notification details."""

from alembic import op
import sqlalchemy as sa


revision = "c1a4d6e8f901"
down_revision = "752aadb36230"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = [
        ("title", sa.String()),
        ("category", sa.String()),
        ("product_name", sa.String()),
        ("affected_sku", sa.String()),
        ("warehouse_name", sa.String()),
        ("current_stock", sa.Integer()),
        ("reorder_level", sa.Integer()),
        ("supplier_name", sa.String()),
        ("delay_days", sa.Integer()),
        ("recommended_action", sa.Text()),
        ("ai_insight", sa.Text()),
    ]
    for name, column_type in columns:
        op.add_column("ai_risk_alerts", sa.Column(name, column_type, nullable=True))


def downgrade() -> None:
    for name in [
        "ai_insight", "recommended_action", "delay_days", "supplier_name",
        "reorder_level", "current_stock", "warehouse_name", "affected_sku",
        "product_name", "category", "title",
    ]:
        op.drop_column("ai_risk_alerts", name)