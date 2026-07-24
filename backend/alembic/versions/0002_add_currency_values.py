"""add KRW and USD to currency enum

Revision ID: 0002_add_currency_values
Revises: 0001_initial_schema
Create Date: 2026-07-24

新增 product.official_currency 可用幣別：韓幣 (KRW)、美金 (USD)。
PostgreSQL 的 ALTER TYPE ... ADD VALUE 需在 autocommit 下執行，
故此 migration 以 autocommit block 包裹。
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0002_add_currency_values"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE currency ADD VALUE IF NOT EXISTS 'KRW'")
        op.execute("ALTER TYPE currency ADD VALUE IF NOT EXISTS 'USD'")


def downgrade() -> None:
    # PostgreSQL 不支援從 enum 移除值；downgrade 不還原（保留新增的值不影響資料）。
    pass
