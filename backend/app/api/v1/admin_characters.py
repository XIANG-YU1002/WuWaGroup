import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.core.responses import envelope
from app.schemas.admin_character import CreateCharacterRequest, UpdateCharacterRequest
from app.services import admin_character_service as service

router = APIRouter(
    prefix="/admin/characters", tags=["admin-characters"], dependencies=[Depends(get_current_admin_user)]
)


@router.get("/suggestions")
def get_character_suggestions(
    q: str = Query(...), limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)
) -> dict:
    items = service.get_suggestions(db, q, limit)
    return envelope([i.model_dump(mode="json") for i in items])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_character(payload: CreateCharacterRequest, db: Session = Depends(get_db)) -> dict:
    result = service.create_character(db, payload.name)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{character_id}")
def update_character(
    character_id: uuid.UUID, payload: UpdateCharacterRequest, db: Session = Depends(get_db)
) -> dict:
    result = service.update_character(db, character_id, payload.name)
    return envelope(result.model_dump(mode="json"))


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character(character_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    service.delete_character(db, character_id)
