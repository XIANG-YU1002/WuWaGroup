import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.enums import ActivityStatus
from app.repositories import activity_repository
from app.schemas.activity import ActivityDetailResponse, ActivityListItem, ActivityProductCard


def list_activities(
    db: Session, status: ActivityStatus | None, page: int, page_size: int
) -> tuple[list[ActivityListItem], int]:
    activities, total = activity_repository.list_activities(db, status, page, page_size)
    items = [ActivityListItem.model_validate(a, from_attributes=True) for a in activities]
    return items, total


def get_activity_detail(db: Session, activity_id: uuid.UUID) -> ActivityDetailResponse:
    activity = activity_repository.get_by_id(db, activity_id)
    if activity is None:
        raise AppError(404, "ACTIVITY_NOT_FOUND", "找不到指定的活動。")
    return ActivityDetailResponse.model_validate(activity, from_attributes=True)


def get_activity_products(db: Session, activity_id: uuid.UUID) -> list[ActivityProductCard]:
    activity = activity_repository.get_by_id(db, activity_id)
    if activity is None:
        raise AppError(404, "ACTIVITY_NOT_FOUND", "找不到指定的活動。")

    products = activity_repository.list_active_products_by_activity(db, activity_id)
    return [ActivityProductCard.model_validate(p, from_attributes=True) for p in products]
