import uuid

from pydantic import BaseModel

from app.schemas.common import UTCDateTime
from app.schemas.group_leader_profile import DashboardCard, DashboardResponse

__all__ = ["DashboardCard", "DashboardResponse", "CurrentGroupBuyItem"]


class CurrentGroupBuyItem(BaseModel):
    id: uuid.UUID
    activity_name: str
    group_leader_name: str
    deadline_at: UTCDateTime
    order_count: int
    created_at: UTCDateTime
