import uuid

from pydantic import BaseModel, field_validator

from app.schemas.common import UTCDateTime, normalize_optional_text


class GroupLeaderProfileOwnerResponse(BaseModel):
    id: uuid.UUID
    display_name: str | None
    introduction: str | None
    default_rules: str | None
    facebook_url: str | None
    discord_contact: str | None
    line_contact: str | None
    is_profile_complete: bool
    created_at: UTCDateTime
    updated_at: UTCDateTime


class UpdateGroupLeaderProfileRequest(BaseModel):
    display_name: str | None = None
    introduction: str | None = None
    facebook_url: str | None = None
    discord_contact: str | None = None
    line_contact: str | None = None

    @field_validator("introduction", "facebook_url", "discord_contact", "line_contact", mode="before")
    @classmethod
    def _normalize(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)

    @field_validator("display_name", mode="before")
    @classmethod
    def _normalize_display_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("團主名稱不可為空白。")
        return trimmed


class UpdateDefaultRulesRequest(BaseModel):
    default_rules: str | None = None

    @field_validator("default_rules", mode="before")
    @classmethod
    def _normalize(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class DashboardCard(BaseModel):
    key: str
    label: str
    count: int
    target_url: str


class DashboardResponse(BaseModel):
    cards: list[DashboardCard]
