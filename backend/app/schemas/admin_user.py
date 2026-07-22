import uuid

from pydantic import BaseModel

from app.models.enums import UserRole
from app.schemas.common import UTCDateTime


class UserAdminRef(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str


class UserAdminListItem(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    role: UserRole
    has_group_leader_profile: bool
    created_at: UTCDateTime


class UserAdminGroupLeaderSummary(BaseModel):
    id: uuid.UUID
    display_name: str | None
    is_profile_complete: bool


class UserAdminDetailResponse(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    avatar_url: str | None
    role: UserRole
    created_at: UTCDateTime
    group_leader_profile: UserAdminGroupLeaderSummary | None
