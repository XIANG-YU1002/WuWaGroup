import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.enums import GroupBuyStatus, PaymentMethod
from app.models.group_buy import GroupBuy, GroupBuyProduct
from app.models.group_leader import GroupLeaderProfile
from app.models.product import Product


def get_by_id(db: Session, group_buy_id: uuid.UUID) -> GroupBuy | None:
    return db.get(GroupBuy, group_buy_id)


def get_group_buy_product_by_id(db: Session, group_buy_product_id: uuid.UUID) -> GroupBuyProduct | None:
    return db.get(GroupBuyProduct, group_buy_product_id)


def get_group_buy_products_for_update(
    db: Session, group_buy_product_ids: list[uuid.UUID]
) -> list[GroupBuyProduct]:
    """依 API Design §33.2：多筆 group_buy_product 依 UUID 排序鎖定，降低 Deadlock 風險。"""
    stmt = (
        select(GroupBuyProduct)
        .where(GroupBuyProduct.id.in_(group_buy_product_ids))
        .order_by(GroupBuyProduct.id.asc())
        .with_for_update()
    )
    return db.execute(stmt).scalars().all()


def get_products_for_group_buy(
    db: Session, group_buy_id: uuid.UUID
) -> list[tuple[GroupBuyProduct, Product]]:
    stmt = (
        select(GroupBuyProduct, Product)
        .join(Product, Product.id == GroupBuyProduct.product_id)
        .where(GroupBuyProduct.group_buy_id == group_buy_id)
        .order_by(GroupBuyProduct.created_at.asc())
    )
    return [(row[0], row[1]) for row in db.execute(stmt).all()]


def list_group_buy_products_for_product(
    db: Session,
    product_id: uuid.UUID,
    *,
    cash_on_delivery_only: bool,
    requires_second_payment: bool | None,
    includes_full_gift: bool | None,
) -> list[tuple[GroupBuyProduct, GroupBuy, Activity, GroupLeaderProfile]]:
    """依 Business Rules §17.3：取得可套用 SQL 篩選的候選集合，可用性篩選於 Service 層計算。"""
    stmt = (
        select(GroupBuyProduct, GroupBuy, Activity, GroupLeaderProfile)
        .join(GroupBuy, GroupBuy.id == GroupBuyProduct.group_buy_id)
        .join(Activity, Activity.id == GroupBuy.activity_id)
        .join(GroupLeaderProfile, GroupLeaderProfile.id == GroupBuy.group_leader_profile_id)
        .where(GroupBuyProduct.product_id == product_id)
    )
    if cash_on_delivery_only:
        stmt = stmt.where(GroupBuy.payment_method == PaymentMethod.CASH_ON_DELIVERY)
    if requires_second_payment is not None:
        stmt = stmt.where(GroupBuy.requires_second_payment.is_(requires_second_payment))
    if includes_full_gift is not None:
        stmt = stmt.where(GroupBuy.includes_full_gift.is_(includes_full_gift))

    return [(row[0], row[1], row[2], row[3]) for row in db.execute(stmt).all()]


def list_by_group_leader(
    db: Session, group_leader_profile_id: uuid.UUID, status: GroupBuyStatus | None
) -> list[GroupBuy]:
    stmt = select(GroupBuy).where(GroupBuy.group_leader_profile_id == group_leader_profile_id)
    if status is not None:
        stmt = stmt.where(GroupBuy.status == status)
    stmt = stmt.order_by(GroupBuy.created_at.desc())
    return db.execute(stmt).scalars().all()


def count_group_buys_by_group_leader(db: Session, group_leader_profile_id: uuid.UUID) -> int:
    stmt = select(func.count()).select_from(GroupBuy).where(
        GroupBuy.group_leader_profile_id == group_leader_profile_id
    )
    return db.execute(stmt).scalar_one()
