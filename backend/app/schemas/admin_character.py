import uuid

from pydantic import BaseModel, field_validator


class CharacterSuggestion(BaseModel):
    id: uuid.UUID
    name: str
    related_product_count: int


class CreateCharacterRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("角色名稱不可為空白。")
        return trimmed


class UpdateCharacterRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("角色名稱不可為空白。")
        return trimmed


class CharacterAdminResponse(BaseModel):
    id: uuid.UUID
    name: str
    related_product_count: int
