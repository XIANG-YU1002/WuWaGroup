import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.announcement import Announcement
from app.models.enums import AnnouncementAudienceScope, AnnouncementType


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
