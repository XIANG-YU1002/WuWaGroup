import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.enums import ActivityStatus
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
