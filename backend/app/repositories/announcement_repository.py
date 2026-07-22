import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.announcement import Announcement
from app.models.enums import AnnouncementAudienceScope, AnnouncementType
from app.models.group_buy import GroupBuy
from app.models.notification import Notification
from app.models.order import GroupOrder

_UNFINISHED_STATUSES = ("pending_confirmation", "pending_payment", "paid", "shipped")


def list_public_group_buy_announcements(db: Session, group_buy_id: uuid.UUID) -> list[Announcement]:
    """依 API Design §15.3：group_leader + group_buy_unfinished + is_public。"""
    stmt = (
        select(Announcement)
        .where(
            Announcement.announcement_type == AnnouncementType.GROUP_LEADER,
            Announcement.audience_scope == AnnouncementAudienceScope.GROUP_BUY_UNFINISHED,
            Announcement.is_public.is_(True),
            Announcement.group_buy_id == group_buy_id,
        )
        .order_by(Announcement.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


def get_by_id(db: Session, announcement_id: uuid.UUID) -> Announcement | None:
    return db.get(Announcement, announcement_id)


def list_platform_announcements(
    db: Session, *, keyword: str | None, page: int, page_size: int
) -> tuple[list[Announcement], int]:
    stmt = select(Announcement).where(Announcement.announcement_type == AnnouncementType.PLATFORM)
    if keyword:
        stmt = stmt.where(Announcement.title.ilike(f"%{keyword}%"))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Announcement.published_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create(db: Session, **fields) -> Announcement:
    announcement = Announcement(**fields)
    db.add(announcement)
    db.flush()
    return announcement


def delete(db: Session, announcement: Announcement) -> None:
    db.delete(announcement)


def list_by_leader(
    db: Session,
    group_leader_profile_id: uuid.UUID,
    *,
    audience_scope: AnnouncementAudienceScope | None,
    group_buy_id: uuid.UUID | None,
    is_public: bool | None,
    page: int,
    page_size: int,
) -> tuple[list[Announcement], int]:
    stmt = select(Announcement).where(
        Announcement.announcement_type == AnnouncementType.GROUP_LEADER,
        Announcement.group_leader_profile_id == group_leader_profile_id,
    )
    if audience_scope is not None:
        stmt = stmt.where(Announcement.audience_scope == audience_scope)
    if group_buy_id is not None:
        stmt = stmt.where(Announcement.group_buy_id == group_buy_id)
    if is_public is not None:
        stmt = stmt.where(Announcement.is_public.is_(is_public))

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Announcement.published_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def get_leader_unfinished_recipient_user_ids(
    db: Session, group_leader_profile_id: uuid.UUID
) -> list[uuid.UUID]:
    """依 Business Rules §24.2/§24.3：曾加入該團主且至少一筆未完成訂單的會員。"""
    stmt = (
        select(GroupOrder.user_id)
        .join(GroupBuy, GroupBuy.id == GroupOrder.group_buy_id)
        .where(
            GroupBuy.group_leader_profile_id == group_leader_profile_id,
            GroupOrder.status.in_(_UNFINISHED_STATUSES),
        )
        .distinct()
    )
    return [row[0] for row in db.execute(stmt).all()]


def get_group_buy_unfinished_recipient_user_ids(
    db: Session, group_buy_id: uuid.UUID
) -> list[uuid.UUID]:
    stmt = (
        select(GroupOrder.user_id)
        .where(
            GroupOrder.group_buy_id == group_buy_id,
            GroupOrder.status.in_(_UNFINISHED_STATUSES),
        )
        .distinct()
    )
    return [row[0] for row in db.execute(stmt).all()]


def count_recipients(db: Session, announcement_id: uuid.UUID) -> int:
    stmt = (
        select(func.count())
        .select_from(Notification)
        .where(Notification.announcement_id == announcement_id)
    )
    return db.execute(stmt).scalar_one()


def sync_notifications_content(db: Session, announcement_id: uuid.UUID, title: str, message: str) -> None:
    """依 Business Rules §24.9：修改公告時同步更新通知標題與內容，不重設已讀狀態。"""
    stmt = select(Notification).where(Notification.announcement_id == announcement_id)
    for notification in db.execute(stmt).scalars().all():
        notification.title = title
        notification.message = message


def list_public_group_leader_announcements(
    db: Session, group_leader_profile_id: uuid.UUID
) -> list[Announcement]:
    """依 API Design §21.3：group_leader + leader_unfinished + is_public。"""
    stmt = (
        select(Announcement)
        .where(
            Announcement.announcement_type == AnnouncementType.GROUP_LEADER,
            Announcement.audience_scope == AnnouncementAudienceScope.LEADER_UNFINISHED,
            Announcement.is_public.is_(True),
            Announcement.group_leader_profile_id == group_leader_profile_id,
        )
        .order_by(Announcement.published_at.desc())
    )
    return db.execute(stmt).scalars().all()
