import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.favorite import ProductFavorite
from app.models.product import Character, Product, ProductCharacter, ProductImage


def get_by_id(db: Session, product_id: uuid.UUID) -> Product | None:
    return db.get(Product, product_id)


def get_images(db: Session, product_id: uuid.UUID) -> list[ProductImage]:
    stmt = (
        select(ProductImage)
        .where(ProductImage.product_id == product_id)
        .order_by(ProductImage.sort_order.asc())
    )
    return db.execute(stmt).scalars().all()


def get_characters(db: Session, product_id: uuid.UUID) -> list[Character]:
    stmt = (
        select(Character)
        .join(ProductCharacter, ProductCharacter.character_id == Character.id)
        .where(ProductCharacter.product_id == product_id)
        .order_by(Character.name.asc())
    )
    return db.execute(stmt).scalars().all()


def is_favorited(db: Session, user_id: uuid.UUID, product_id: uuid.UUID) -> bool:
    stmt = select(ProductFavorite).where(
        ProductFavorite.user_id == user_id, ProductFavorite.product_id == product_id
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def search_active_products(
    db: Session,
    *,
    q: str | None,
    character_id: uuid.UUID | None,
    page: int,
    page_size: int,
) -> tuple[list[Product], int]:
    """依 Business Rules §14.5：公開搜尋只回傳上架商品。"""
    stmt = select(Product).where(Product.is_active.is_(True))
    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q}%"))
    if character_id is not None:
        stmt = stmt.join(ProductCharacter, ProductCharacter.product_id == Product.id).where(
            ProductCharacter.character_id == character_id
        )

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Product.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total
