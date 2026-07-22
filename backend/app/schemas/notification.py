import uuid

from pydantic import BaseModel

from app.models.enums import NotificationType
from app.schemas.common import UTCDateTime


class NotificationSource(BaseModel):
    type: str
    id: str | None


class NotificationItem(BaseModel):
    id: uuid.UUID
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    read_at: UTCDateTime | None
    source: NotificationSource
    target_url: str | None
    created_at: UTCDateTime


class UnreadCountResponse(BaseModel):
    unread_count: int
