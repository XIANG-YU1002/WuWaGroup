import uuid

from pydantic import BaseModel

from app.schemas.common import UTCDateTime


class PublicAnnouncementItem(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    published_at: UTCDateTime
