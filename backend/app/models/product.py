import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import Currency

currency_enum = Enum(
    Currency,
    name="currency",
    values_callable=lambda enum_cls: [member.value for member in enum_cls],
)


class Product(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """儲存官方活動中的商品。一項商品只屬於一項活動，可關聯多名角色。

    `official_currency` 為需求追蹤矩陣衝突解法 #2 的擴充欄位：依使用者決議支援
    CNY／JPY／TWD 原始幣別，不自動換算。團主售價（group_buy_product.unit_price）
    與訂單金額仍固定 TWD，不受此擴充影響。
    """

    __tablename__ = "product"

    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("activity.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    official_price: Mapped[object | None] = mapped_column(Numeric(12, 2), nullable=True)
    official_currency: Mapped[Currency | None] = mapped_column(currency_enum, nullable=True)
    primary_image_url: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")

    __table_args__ = (
        UniqueConstraint("activity_id", "name", name="uq_product_activity_name"),
        CheckConstraint("length(trim(name)) > 0", name="ck_product_name_not_blank"),
        CheckConstraint(
            "length(trim(primary_image_url)) > 0", name="ck_product_primary_image_url_not_blank"
        ),
        CheckConstraint(
            "official_price IS NULL OR official_price >= 0", name="ck_product_official_price_non_negative"
        ),
        CheckConstraint(
            "(official_price IS NULL AND official_currency IS NULL) "
            "OR (official_price IS NOT NULL AND official_currency IS NOT NULL)",
            name="ck_product_official_price_currency_pair",
        ),
    )


class ProductImage(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """儲存商品主要圖片以外的額外官方圖片。"""

    __tablename__ = "product_image"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product.id", ondelete="CASCADE"), nullable=False
    )
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

    __table_args__ = (
        UniqueConstraint("product_id", "sort_order", name="uq_product_image_product_sort_order"),
        CheckConstraint("sort_order >= 0", name="ck_product_image_sort_order_non_negative"),
        CheckConstraint("length(trim(image_url)) > 0", name="ck_product_image_image_url_not_blank"),
    )


class Character(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """儲存可跨活動共用的角色名稱。

    註：`uq_character_name_lower`（LOWER(name) 唯一索引）由 Alembic Migration
    以原生 SQL 建立，詳見 Database Design §9.6。
    """

    __tablename__ = "character"

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name="ck_character_name_not_blank"),
    )


class ProductCharacter(Base):
    """商品與角色的多對多關聯。`character_id` 使用 RESTRICT，確保有商品關聯的角色不會被刪除。"""

    __tablename__ = "product_character"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product.id", ondelete="CASCADE"), primary_key=True
    )
    character_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("character.id", ondelete="RESTRICT"), primary_key=True
    )
