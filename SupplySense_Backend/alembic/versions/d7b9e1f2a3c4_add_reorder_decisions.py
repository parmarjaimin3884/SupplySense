"""Add persistent reorder decisions."""

from alembic import op
import sqlalchemy as sa


revision = "d7b9e1f2a3c4"
down_revision = "c1a4d6e8f901"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reorder_decisions",
        sa.Column("id", sa.UUID(as_uuid=False), nullable=False),
        sa.Column("product_id", sa.UUID(as_uuid=False), nullable=False),
        sa.Column("warehouse_id", sa.UUID(as_uuid=False), nullable=False),
        sa.Column("decision", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_reorder_decision_product_warehouse",
        "reorder_decisions",
        ["product_id", "warehouse_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("idx_reorder_decision_product_warehouse", table_name="reorder_decisions")
    op.drop_table("reorder_decisions")