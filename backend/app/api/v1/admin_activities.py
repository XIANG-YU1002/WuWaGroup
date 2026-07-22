import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin_user, get_db
from app.core.responses import envelope, paginated_envelope
from app.models.enums import ActivityStatus
from app.schemas.admin_activity import CreateActivityRequest, UpdateActivityRequest
from app.services import admin_activity_service as service

router = APIRouter(
    prefix="/admin/activities", tags=["admin-activities"], dependencies=[Depends(get_current_admin_user)]
)


@router.get("")
def get_activities(
    status_filter: ActivityStatus | None = Query(None, alias="status"),
    keyword: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = service.get_activities(
        db, status_filter, keyword, pagination.page, pagination.page_size
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_activity(payload: CreateActivityRequest, db: Session = Depends(get_db)) -> dict:
    result = service.create_activity(db, payload)
    return envelope(result.model_dump(mode="json"))


@router.get("/{activity_id}")
def get_activity_detail(activity_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.get_activity_detail(db, activity_id)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{activity_id}")
def update_activity(
    activity_id: uuid.UUID, payload: UpdateActivityRequest, db: Session = Depends(get_db)
) -> dict:
    result = service.update_activity(db, activity_id, payload)
    return envelope(result.model_dump(mode="json"))


@router.post("/{activity_id}/end")
def end_activity(activity_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.end_activity(db, activity_id)
    return envelope(result.model_dump(mode="json"))


@router.post("/{activity_id}/reopen")
def reopen_activity(activity_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.reopen_activity(db, activity_id)
    return envelope(result.model_dump(mode="json"))
