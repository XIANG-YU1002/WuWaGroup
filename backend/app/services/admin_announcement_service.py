import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.announcement import Announcement
from app.models.enums import AnnouncementType, NotificationType
from app.models.user import AppUser
from app.repositories import announcement_repository, user_repository
from app.schemas.admin_announcement import (
    CreatePlatformAnnouncementRequest,
    PlatformAnnouncementResponse,
    UpdatePlatformAnnouncementRequest,
)
from app.services import notification_service


def _load_platform_announcement_or_404(db: Session, announcement_id: uuid.UUID) -> Announcement:
    announcement = announcement_repository.get_by_id(db, announcement_id)
    if announcement is None or announcement.announcement_type != AnnouncementType.PLATFORM:
        raise AppError(404, "ANNOUNCEMENT_NOT_FOUND", "找不到指定的平台公告。")
    return announcement


def _to_response(db: Session, announcement: Announcement) -> PlatformAnnouncementResponse:
    return PlatformAnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        recipient_count=announcement_repository.count_recipients(db, announcement.id),
        published_at=announcement.published_at,
        updated_at=announcement.updated_at,
    )


def create_announcement(
    db: Session, admin_user: AppUser, payload: CreatePlatformAnnouncementRequest
) -> PlatformAnnouncementResponse:
    """依 Business Rules §25.1/§25.2：只有管理員可建立，通知所有已註冊會員。"""
    announcement = announcement_repository.create(
        db,
        announcement_type=AnnouncementType.PLATFORM,
        audience_scope=None,
        group_leader_profile_id=None,
        group_buy_id=None,
        created_by_user_id=admin_user.id,
        title=payload.title,
        content=payload.content,
        is_public=False,
    )

    recipient_ids = user_repository.get_all_user_ids(db)
    notification_service.notify_announcement_recipients(
        db,
        user_ids=recipient_ids,
        announcement_id=announcement.id,
        title=announcement.title,
        message=announcement.content,
        notification_type=NotificationType.SYSTEM,
    )

    db.commit()
    db.refresh(announcement)
    return _to_response(db, announcement)


def get_announcements(
    db: Session, keyword: str | None, page: int, page_size: int
) -> tuple[list[PlatformAnnouncementResponse], int]:
    announcements, total = announcement_repository.list_platform_announcements(
        db, keyword=keyword, page=page, page_size=page_size
    )
    return [_to_response(db, a) for a in announcements], total


def get_announcement_detail(db: Session, announcement_id: uuid.UUID) -> PlatformAnnouncementResponse:
    announcement = _load_platform_announcement_or_404(db, announcement_id)
    return _to_response(db, announcement)


def update_announcement(
    db: Session, announcement_id: uuid.UUID, payload: UpdatePlatformAnnouncementRequest
) -> PlatformAnnouncementResponse:
    """依 Business Rules §25.4：同步更新既有通知內容，不建立第二批通知。"""
    announcement = _load_platform_announcement_or_404(db, announcement_id)
    provided = payload.model_fields_set

    if "title" in provided:
        announcement.title = payload.title
    if "content" in provided:
        announcement.content = payload.content

    if "title" in provided or "content" in provided:
        announcement_repository.sync_notifications_content(
            db, announcement.id, announcement.title, announcement.content
        )

    db.commit()
    return _to_response(db, announcement)


def delete_announcement(db: Session, announcement_id: uuid.UUID) -> None:
    """依 Business Rules §25.5：只刪除該平台公告與其通知（由 FK CASCADE 保證）。"""
    announcement = _load_platform_announcement_or_404(db, announcement_id)
    announcement_repository.delete(db, announcement)
    db.commit()
