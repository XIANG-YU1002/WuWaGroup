import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import AppUser


def get_by_email(db: Session, email: str) -> AppUser | None:
    stmt = select(AppUser).where(func.lower(AppUser.email) == email)
    return db.execute(stmt).scalar_one_or_none()


def get_by_id(db: Session, user_id: uuid.UUID) -> AppUser | None:
    return db.get(AppUser, user_id)
