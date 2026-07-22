import uuid

from pydantic import BaseModel

from app.models.enums import GroupBuyStatus
from app.schemas.common import UTCDateTime
from app.schemas.admin_user import UserAdminRef
from app.schemas.group_leader import PublicContacts


class GroupLeaderAdminCurrentGroupBuy(BaseModel):
    id: uuid.UUID
    activity_name: str
    status: GroupBuyStatus
    deadline_at: UTCDateTime


class GroupLeaderAdminListItem(BaseModel):
    id: uuid.UUID
    display_name: str | None
    is_profile_complete: bool
    user: UserAdminRef
    group_buy_count: int
    completed_order_count: int
    created_at: UTCDateTime


class GroupLeaderAdminDetailResponse(BaseModel):
    id: uuid.UUID
    display_name: str | None
    introduction: str | None
    default_rules: str | None
    public_contacts: PublicContacts
    is_profile_complete: bool
    user: UserAdminRef
    group_buy_count: int
    completed_order_count: int
    current_group_buys: list[GroupLeaderAdminCurrentGroupBuy]
    created_at: UTCDateTime
    updated_at: UTCDateTime
