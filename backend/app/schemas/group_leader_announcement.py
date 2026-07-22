import uuid

from pydantic import BaseModel, field_validator, model_validator

from app.models.enums import AnnouncementAudienceScope
from app.schemas.common import UTCDateTime


class CreateAnnouncementRequest(BaseModel):
    audience_scope: AnnouncementAudienceScope
    group_buy_id: uuid.UUID | None = None
    title: str
    content: str
    is_public: bool = False

    @field_validator("title", "content")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("此欄位不可為空白。")
        return trimmed

    @model_validator(mode="after")
    def _validate_scope_group_buy_pair(self) -> "CreateAnnouncementRequest":
        if self.audience_scope == AnnouncementAudienceScope.LEADER_UNFINISHED and self.group_buy_id is not None:
            raise ValueError("團主整體公告不可指定開團。")
        if self.audience_scope == AnnouncementAudienceScope.GROUP_BUY_UNFINISHED and self.group_buy_id is None:
            raise ValueError("特定開團公告必須指定開團。")
        return self


class UpdateAnnouncementRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    is_public: bool | None = None

    @field_validator("title", "content")
    @classmethod
    def _not_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("此欄位不可為空白。")
        return trimmed

    @model_validator(mode="after")
    def _validate_at_least_one_field(self) -> "UpdateAnnouncementRequest":
        if not self.model_fields_set:
            raise ValueError("至少需要提供一個欄位。")
        return self


class AnnouncementOwnerResponse(BaseModel):
    id: uuid.UUID
    audience_scope: AnnouncementAudienceScope
    group_buy_id: uuid.UUID | None
    title: str
    content: str
    is_public: bool
    recipient_count: int
    published_at: UTCDateTime
    updated_at: UTCDateTime
