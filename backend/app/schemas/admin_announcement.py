import uuid

from pydantic import BaseModel, field_validator, model_validator

from app.schemas.common import UTCDateTime


class CreatePlatformAnnouncementRequest(BaseModel):
    title: str
    content: str

    @field_validator("title", "content")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("此欄位不可為空白。")
        return trimmed


class UpdatePlatformAnnouncementRequest(BaseModel):
    title: str | None = None
    content: str | None = None

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
    def _validate_at_least_one_field(self) -> "UpdatePlatformAnnouncementRequest":
        if not self.model_fields_set:
            raise ValueError("至少需要提供一個欄位。")
        return self


class PlatformAnnouncementResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    recipient_count: int
    published_at: UTCDateTime
    updated_at: UTCDateTime
