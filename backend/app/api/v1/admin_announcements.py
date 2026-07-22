import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin_user, get_db
from app.core.responses import envelope, paginated_envelope
from app.models.user import AppUser
from app.schemas.admin_announcement import (
    CreatePlatformAnnouncementRequest,
    UpdatePlatformAnnouncementRequest,
)
from app.services import admin_announcement_service as service

router = APIRouter(prefix="/admin/announcements", tags=["admin-announcements"])


@router.get("")
def get_announcements(
    keyword: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    _admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    items, total = service.get_announcements(db, keyword, pagination.page, pagination.page_size)
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: CreatePlatformAnnouncementRequest,
    admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    result = service.create_announcement(db, admin, payload)
    return envelope(result.model_dump(mode="json"))


@router.get("/{announcement_id}")
def get_announcement_detail(
    announcement_id: uuid.UUID,
    _admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    result = service.get_announcement_detail(db, announcement_id)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{announcement_id}")
def update_announcement(
    announcement_id: uuid.UUID,
    payload: UpdatePlatformAnnouncementRequest,
    _admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    result = service.update_announcement(db, announcement_id, payload)
    return envelope(result.model_dump(mode="json"))


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: uuid.UUID,
    _admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> None:
    service.delete_announcement(db, announcement_id)
