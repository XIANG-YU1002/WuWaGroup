import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_active_group_leader_profile, get_db
from app.core.responses import envelope, paginated_envelope
from app.models.enums import AnnouncementAudienceScope
from app.models.group_leader import GroupLeaderProfile
from app.schemas.group_leader_announcement import CreateAnnouncementRequest, UpdateAnnouncementRequest
from app.services import group_leader_announcement_service as service

router = APIRouter(prefix="/group-leader/announcements", tags=["group-leader-announcements"])


@router.get("")
def get_my_announcements(
    audience_scope: AnnouncementAudienceScope | None = Query(None),
    group_buy_id: uuid.UUID | None = Query(None),
    is_public: bool | None = Query(None),
    pagination: PaginationParams = Depends(),
    profile: GroupLeaderProfile = Depends(get_current_active_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    items, total = service.get_my_announcements(
        db,
        profile,
        audience_scope=audience_scope,
        group_buy_id=group_buy_id,
        is_public=is_public,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: CreateAnnouncementRequest,
    profile: GroupLeaderProfile = Depends(get_current_active_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    result = service.create_announcement(db, profile, payload)
    return envelope(result.model_dump(mode="json"))


@router.get("/{announcement_id}")
def get_my_announcement_detail(
    announcement_id: uuid.UUID,
    profile: GroupLeaderProfile = Depends(get_current_active_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    result = service.get_my_announcement_detail(db, profile, announcement_id)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{announcement_id}")
def update_announcement(
    announcement_id: uuid.UUID,
    payload: UpdateAnnouncementRequest,
    profile: GroupLeaderProfile = Depends(get_current_active_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    result = service.update_announcement(db, profile, announcement_id, payload)
    return envelope(result.model_dump(mode="json"))


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: uuid.UUID,
    profile: GroupLeaderProfile = Depends(get_current_active_group_leader_profile),
    db: Session = Depends(get_db),
) -> None:
    service.delete_announcement(db, profile, announcement_id)
