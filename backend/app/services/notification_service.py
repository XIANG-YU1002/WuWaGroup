import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.announcement import Announcement
from app.models.enums import AnnouncementAudienceScope, AnnouncementType, NotificationType
from app.models.notification import Notification
from app.repositories import notification_repository
from app.schemas.notification import NotificationItem, NotificationSource, UnreadCountResponse


def notify_order_event(
    db: Session, *, user_id: uuid.UUID, order_id: uuid.UUID, title: str, message: str
) -> Notification:
    """建立系統通知（訂單狀態變更／取消申請結果），呼叫端需與相關狀態變更同一次 commit。"""
    notification = Notification(
        user_id=user_id,
        notification_type=NotificationType.SYSTEM,
        title=title,
        message=message,
        order_id=order_id,
    )
    db.add(notification)
    return notification


def notify_announcement_recipients(
    db: Session, *, user_ids: list[uuid.UUID], announcement_id: uuid.UUID, title: str, message: str
) -> None:
    """依 Business Rules §24.4：同一會員同一公告只建立一則通知（呼叫端需先去重 user_ids）。"""
    for user_id in user_ids:
        db.add(
            Notification(
                user_id=user_id,
                notification_type=NotificationType.GROUP_LEADER,
                title=title,
                message=message,
                announcement_id=announcement_id,
            )
        )


def _source_and_target_url(db: Session, notification: Notification) -> tuple[NotificationSource, str | None]:
    """依 Business Rules §26.5：依通知來源決定導向頁面。"""
    if notification.order_id is not None:
        return (
            NotificationSource(type="order", id=str(notification.order_id)),
            f"/orders/{notification.order_id}",
        )

    if notification.announcement_id is not None:
        source = NotificationSource(type="announcement", id=str(notification.announcement_id))
        announcement = db.get(Announcement, notification.announcement_id)
        if (
            announcement is not None
            and announcement.is_public
            and announcement.announcement_type == AnnouncementType.GROUP_LEADER
        ):
            if announcement.audience_scope == AnnouncementAudienceScope.LEADER_UNFINISHED:
                return source, f"/group-leaders/{announcement.group_leader_profile_id}"
            if announcement.audience_scope == AnnouncementAudienceScope.GROUP_BUY_UNFINISHED:
                return source, f"/group-buys/{announcement.group_buy_id}"
        return source, None

    if notification.group_leader_application_id is not None:
        return (
            NotificationSource(
                type="group_leader_application", id=str(notification.group_leader_application_id)
            ),
            "/profile",
        )

    return NotificationSource(type="unknown", id=None), None


def _to_item(db: Session, notification: Notification) -> NotificationItem:
    source, target_url = _source_and_target_url(db, notification)
    return NotificationItem(
        id=notification.id,
        notification_type=notification.notification_type,
        title=notification.title,
        message=notification.message,
        is_read=notification.is_read,
        read_at=notification.read_at,
        source=source,
        target_url=target_url,
        created_at=notification.created_at,
    )


def list_notifications(
    db: Session,
    user_id: uuid.UUID,
    *,
    notification_type: NotificationType | None,
    is_read: bool | None,
    page: int,
    page_size: int,
) -> tuple[list[NotificationItem], int]:
    notifications, total = notification_repository.list_by_user(
        db,
        user_id,
        notification_type=notification_type,
        is_read=is_read,
        page=page,
        page_size=page_size,
    )
    return [_to_item(db, n) for n in notifications], total


def get_unread_count(db: Session, user_id: uuid.UUID) -> UnreadCountResponse:
    return UnreadCountResponse(unread_count=notification_repository.get_unread_count(db, user_id))


def mark_notification_read(db: Session, user_id: uuid.UUID, notification_id: uuid.UUID) -> None:
    notification = notification_repository.get_by_id(db, notification_id)
    if notification is None or notification.user_id != user_id:
        raise AppError(404, "RESOURCE_NOT_FOUND", "找不到指定的通知。")
    notification_repository.mark_read(db, notification)


def mark_all_notifications_read(db: Session, user_id: uuid.UUID) -> None:
    notification_repository.mark_all_read(db, user_id)
