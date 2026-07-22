import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Character, ProductCharacter


def get_by_id(db: Session, character_id: uuid.UUID) -> Character | None:
    return db.get(Character, character_id)


def _related_product_count_subquery():
    return (
        select(ProductCharacter.character_id, func.count().label("product_count"))
        .group_by(ProductCharacter.character_id)
        .subquery()
    )


def search_characters(
    db: Session, *, q: str | None, page: int, page_size: int
) -> tuple[list[tuple[Character, int]], int]:
    """依 Business Rules §14.3：支援部分文字搜尋；回傳 related_product_count。"""
    counts = _related_product_count_subquery()
    stmt = select(Character, func.coalesce(counts.c.product_count, 0)).outerjoin(
        counts, counts.c.character_id == Character.id
    )
    if q:
        stmt = stmt.where(Character.name.ilike(f"%{q}%"))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    rows = db.execute(
        stmt.order_by(Character.name.asc()).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return [(row[0], row[1]) for row in rows], total


def get_suggestions(db: Session, *, q: str, limit: int) -> list[tuple[Character, int]]:
    counts = _related_product_count_subquery()
    stmt = (
        select(Character, func.coalesce(counts.c.product_count, 0))
        .outerjoin(counts, counts.c.character_id == Character.id)
        .where(Character.name.ilike(f"%{q}%"))
        .order_by(Character.name.asc())
        .limit(limit)
    )
    return [(row[0], row[1]) for row in db.execute(stmt).all()]


def name_taken(db: Session, name: str, exclude_character_id: uuid.UUID | None = None) -> bool:
    stmt = select(Character.id).where(func.lower(Character.name) == name.lower())
    if exclude_character_id is not None:
        stmt = stmt.where(Character.id != exclude_character_id)
    return db.execute(stmt).scalar_one_or_none() is not None


def get_by_name_case_insensitive(db: Session, name: str) -> Character | None:
    stmt = select(Character).where(func.lower(Character.name) == name.lower())
    return db.execute(stmt).scalar_one_or_none()


def create(db: Session, name: str) -> Character:
    character = Character(name=name)
    db.add(character)
    db.flush()
    return character


def update_name(db: Session, character: Character, name: str) -> None:
    character.name = name


def delete(db: Session, character: Character) -> None:
    db.delete(character)


def get_related_product_count(db: Session, character_id: uuid.UUID) -> int:
    stmt = (
        select(func.count())
        .select_from(ProductCharacter)
        .where(ProductCharacter.character_id == character_id)
    )
    return db.execute(stmt).scalar_one()
