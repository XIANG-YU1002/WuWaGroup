import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import OrderStatus
from app.models.group_buy import GroupBuy
from app.models.group_leader import GroupLeaderApplication, GroupLeaderProfile
from app.models.order import GroupOrder


def get_profile_by_user_id(db: Session, user_id: uuid.UUID) -> GroupLeaderProfile | None:
    stmt = select(GroupLeaderProfile).where(GroupLeaderProfile.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def get_profile_by_id(db: Session, profile_id: uuid.UUID) -> GroupLeaderProfile | None:
    return db.get(GroupLeaderProfile, profile_id)


def display_name_taken(
    db: Session, display_name: str, exclude_profile_id: uuid.UUID | None = None
) -> bool:
    stmt = select(GroupLeaderProfile).where(
        func.lower(GroupLeaderProfile.display_name) == display_name.lower()
    )
    if exclude_profile_id is not None:
        stmt = stmt.where(GroupLeaderProfile.id != exclude_profile_id)
    return db.execute(stmt).scalar_one_or_none() is not None


def get_pending_application_by_user_id(
    db: Session, user_id: uuid.UUID
) -> GroupLeaderApplication | None:
    stmt = select(GroupLeaderApplication).where(
        GroupLeaderApplication.user_id == user_id,
        GroupLeaderApplication.status == "pending",
    )
    return db.execute(stmt).scalar_one_or_none()


def get_latest_application_by_user_id(
    db: Session, user_id: uuid.UUID
) -> GroupLeaderApplication | None:
    stmt = (
        select(GroupLeaderApplication)
        .where(GroupLeaderApplication.user_id == user_id)
        .order_by(GroupLeaderApplication.created_at.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


def get_public_statistics(db: Session, group_leader_profile_id: uuid.UUID) -> dict:
    """依 API Design §21.1：公開頁顯示開團數與完成訂單數。"""
    group_buy_count = db.execute(
        select(func.count())
        .select_from(GroupBuy)
        .where(GroupBuy.group_leader_profile_id == group_leader_profile_id)
    ).scalar_one()

    completed_order_count = db.execute(
        select(func.count())
        .select_from(GroupOrder)
        .join(GroupBuy, GroupBuy.id == GroupOrder.group_buy_id)
        .where(
            GroupBuy.group_leader_profile_id == group_leader_profile_id,
            GroupOrder.status == OrderStatus.COMPLETED,
        )
    ).scalar_one()

    return {"group_buy_count": group_buy_count, "completed_order_count": completed_order_count}
