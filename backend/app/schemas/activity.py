import uuid

from pydantic import BaseModel

from app.models.enums import ActivityStatus
from app.schemas.common import UTCDateTime


class ActivityListItem(BaseModel):
    id: uuid.UUID
    name: str
    image_url: str
    status: ActivityStatus
    has_full_gift: bool
    created_at: UTCDateTime


class ActivityDetailResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    image_url: str
    status: ActivityStatus
    has_full_gift: bool
    created_at: UTCDateTime
    updated_at: UTCDateTime


class ActivityProductCard(BaseModel):
    id: uuid.UUID
    name: str
    primary_image_url: str
