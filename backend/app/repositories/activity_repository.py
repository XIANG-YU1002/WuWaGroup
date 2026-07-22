import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.enums import ActivityStatus
from app.models.group_buy import GroupBuy
from app.models.product import Product


def get_by_id(db: Session, activity_id: uuid.UUID) -> Activity | None:
    return db.get(Activity, activity_id)


def list_activities(
    db: Session, status: ActivityStatus | None, page: int, page_size: int
) -> tuple[list[Activity], int]:
    """依 Business Rules §10.5：各區依 created_at DESC 排序。"""
    stmt = select(Activity)
    if status is not None:
        stmt = stmt.where(Activity.status == status)

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = db.execute(
        stmt.order_by(Activity.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    ).scalars().all()
    return items, total


def search_activities(
    db: Session, *, q: str | None, page: int, page_size: int
) -> tuple[list[Activity], int]:
    """依 Business Rules §14.2/§14.3：搜尋活動名稱，支援部分文字。"""
    stmt = select(Activity)
    if q:
        stmt = stmt.where(Activity.name.ilike(f"%{q}%"))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Activity.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def list_active_products_by_activity(db: Session, activity_id: uuid.UUID) -> list[Product]:
    """依 API Design §13.3：活動商品只回傳上架商品。"""
    stmt = (
        select(Product)
        .where(Product.activity_id == activity_id, Product.is_active.is_(True))
        .order_by(Product.created_at.desc())
    )
    return db.execute(stmt).scalars().all()


def list_activities_admin(
    db: Session, *, status: ActivityStatus | None, keyword: str | None, page: int, page_size: int
) -> tuple[list[Activity], int]:
    stmt = select(Activity)
    if status is not None:
        stmt = stmt.where(Activity.status == status)
    if keyword:
        stmt = stmt.where(Activity.name.ilike(f"%{keyword}%"))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Activity.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_activity(db: Session, **fields) -> Activity:
    activity = Activity(**fields)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def count_products_for_activity(db: Session, activity_id: uuid.UUID) -> int:
    stmt = select(func.count()).select_from(Product).where(Product.activity_id == activity_id)
    return db.execute(stmt).scalar_one()


def count_group_buys_for_activity(db: Session, activity_id: uuid.UUID) -> int:
    stmt = select(func.count()).select_from(GroupBuy).where(GroupBuy.activity_id == activity_id)
    return db.execute(stmt).scalar_one()


def count_open_activities(db: Session) -> int:
    stmt = select(func.count()).select_from(Activity).where(Activity.status == ActivityStatus.OPEN)
    return db.execute(stmt).scalar_one()
