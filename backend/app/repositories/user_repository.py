import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import AppUser


def get_by_email(db: Session, email: str) -> AppUser | None:
    stmt = select(AppUser).where(func.lower(AppUser.email) == email)
    return db.execute(stmt).scalar_one_or_none()


def get_by_id(db: Session, user_id: uuid.UUID) -> AppUser | None:
    return db.get(AppUser, user_id)


def get_all_user_ids(db: Session) -> list[uuid.UUID]:
    return [row[0] for row in db.execute(select(AppUser.id)).all()]


def list_users_admin(
    db: Session, *, keyword: str | None, page: int, page_size: int
) -> tuple[list[AppUser], int]:
    stmt = select(AppUser)
    if keyword:
        stmt = stmt.where(
            AppUser.nickname.ilike(f"%{keyword}%") | AppUser.email.ilike(f"%{keyword}%")
        )

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = (
        db.execute(
            stmt.order_by(AppUser.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total
