import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_db
from app.core.responses import envelope, paginated_envelope
from app.models.enums import ActivityStatus
from app.services import activity_service

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("")
def list_activities(
    status: ActivityStatus | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = activity_service.list_activities(
        db, status, pagination.page, pagination.page_size
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.get("/{activity_id}")
def get_activity_detail(activity_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = activity_service.get_activity_detail(db, activity_id)
    return envelope(result.model_dump(mode="json"))


@router.get("/{activity_id}/products")
def get_activity_products(activity_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    items = activity_service.get_activity_products(db, activity_id)
    return envelope([i.model_dump(mode="json") for i in items])
