import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.product import Character
from app.repositories import character_repository
from app.schemas.admin_character import CharacterAdminResponse, CharacterSuggestion


def _load_character_or_404(db: Session, character_id: uuid.UUID) -> Character:
    character = character_repository.get_by_id(db, character_id)
    if character is None:
        raise AppError(404, "CHARACTER_NOT_FOUND", "找不到指定的角色。")
    return character


def get_suggestions(db: Session, q: str, limit: int) -> list[CharacterSuggestion]:
    rows = character_repository.get_suggestions(db, q=q, limit=limit)
    return [
        CharacterSuggestion(id=character.id, name=character.name, related_product_count=count)
        for character, count in rows
    ]


def create_character(db: Session, name: str) -> CharacterAdminResponse:
    """依 Business Rules §12.4：名稱大小寫不敏感且不可重複。"""
    if character_repository.name_taken(db, name):
        raise AppError(409, "CHARACTER_NAME_ALREADY_EXISTS", "此角色名稱已存在。")
    character = character_repository.create(db, name)
    db.commit()
    db.refresh(character)
    return CharacterAdminResponse(id=character.id, name=character.name, related_product_count=0)


def update_character(db: Session, character_id: uuid.UUID, name: str) -> CharacterAdminResponse:
    character = _load_character_or_404(db, character_id)
    if character_repository.name_taken(db, name, character.id):
        raise AppError(409, "CHARACTER_NAME_ALREADY_EXISTS", "此角色名稱已存在。")
    character_repository.update_name(db, character, name)
    db.commit()
    count = character_repository.get_related_product_count(db, character.id)
    return CharacterAdminResponse(id=character.id, name=character.name, related_product_count=count)


def delete_character(db: Session, character_id: uuid.UUID) -> None:
    """依 Business Rules §12.5：已有商品關聯的角色不可刪除。"""
    character = _load_character_or_404(db, character_id)
    if character_repository.get_related_product_count(db, character.id) > 0:
        raise AppError(409, "CHARACTER_HAS_PRODUCT_RELATIONS", "此角色仍有商品關聯，無法刪除。")
    character_repository.delete(db, character)
    db.commit()
