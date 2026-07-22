import re
import uuid

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import GroupLeaderApplicationStatus, UserRole
from app.schemas.common import UTCDateTime, normalize_optional_text

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PASSWORD_HAS_LETTER = re.compile(r"[A-Za-z]")
_PASSWORD_HAS_DIGIT = re.compile(r"\d")


class ContactFieldsMixin(BaseModel):
    facebook_contact: str | None = None
    discord_contact: str | None = None
    line_contact: str | None = None

    @field_validator("facebook_contact", "discord_contact", "line_contact", mode="before")
    @classmethod
    def _normalize_contacts(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class RegisterRequest(ContactFieldsMixin):
    email: str
    password: str = Field(min_length=8, max_length=72)
    password_confirmation: str
    nickname: str

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str) -> str:
        trimmed = value.strip().lower()
        if not _EMAIL_PATTERN.match(trimmed):
            raise ValueError("請輸入有效的 Email。")
        return trimmed

    @field_validator("nickname")
    @classmethod
    def _validate_nickname(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("暱稱不可為空。")
        return trimmed

    @field_validator("password")
    @classmethod
    def _validate_password(cls, value: str) -> str:
        if not _PASSWORD_HAS_LETTER.search(value) or not _PASSWORD_HAS_DIGIT.search(value):
            raise ValueError("密碼至少需包含一個英文字母及一個數字。")
        return value

    @model_validator(mode="after")
    def _validate_passwords_match(self) -> "RegisterRequest":
        if self.password != self.password_confirmation:
            raise ValueError("密碼與密碼確認不一致。")
        return self

    @model_validator(mode="after")
    def _validate_contact_required(self) -> "RegisterRequest":
        if not (self.facebook_contact or self.discord_contact or self.line_contact):
            raise ValueError("至少需要提供一項聯絡方式。")
        return self


class RegisterResponse(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    avatar_url: str | None
    created_at: UTCDateTime


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class GroupLeaderSessionSummary(BaseModel):
    id: uuid.UUID
    display_name: str | None
    is_profile_complete: bool


class PermissionsSummary(BaseModel):
    is_admin: bool
    has_group_leader_profile: bool
    can_manage_group_buys: bool


class CurrentSessionResponse(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    avatar_url: str | None
    role: UserRole
    group_leader: GroupLeaderSessionSummary | None
    permissions: PermissionsSummary


class LatestApplicationSummary(BaseModel):
    id: uuid.UUID
    status: GroupLeaderApplicationStatus
    created_at: UTCDateTime
    reviewed_at: UTCDateTime | None


class GroupLeaderProfileSummary(BaseModel):
    id: uuid.UUID
    display_name: str | None
    is_profile_complete: bool


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    nickname: str
    avatar_url: str | None
    facebook_contact: str | None
    discord_contact: str | None
    line_contact: str | None
    role: UserRole
    created_at: UTCDateTime
    latest_group_leader_application: LatestApplicationSummary | None
    group_leader_profile: GroupLeaderProfileSummary | None


class UpdateProfileRequest(BaseModel):
    nickname: str | None = None
    avatar_url: str | None = None

    @field_validator("nickname")
    @classmethod
    def _validate_nickname(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("暱稱不可為空。")
        return trimmed

    @model_validator(mode="after")
    def _validate_at_least_one_field(self) -> "UpdateProfileRequest":
        if self.nickname is None and self.avatar_url is None:
            raise ValueError("至少需要提供一個欄位。")
        return self


class UpdateContactsRequest(ContactFieldsMixin):
    pass
