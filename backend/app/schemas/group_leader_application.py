import uuid

from pydantic import BaseModel

from app.models.enums import GroupLeaderApplicationStatus
from app.schemas.common import UTCDateTime


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    status: GroupLeaderApplicationStatus
    reviewed_at: UTCDateTime | None
    created_at: UTCDateTime


class MyApplicationResponse(ApplicationResponse):
    can_reapply: bool
