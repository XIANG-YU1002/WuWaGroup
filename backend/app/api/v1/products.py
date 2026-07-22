import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user_optional, get_db
from app.core.responses import envelope, paginated_envelope
from app.models.user import AppUser
from app.schemas.group_buy import GroupBuySortOption
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/{product_id}")
def get_product_detail(
    product_id: uuid.UUID,
    current_user: AppUser | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
) -> dict:
    result = product_service.get_product_detail(db, product_id, current_user)
    return envelope(result.model_dump(mode="json"))


@router.get("/{product_id}/group-buys")
def get_product_group_buys(
    product_id: uuid.UUID,
    sort: GroupBuySortOption = Query(GroupBuySortOption.NEWEST),
    available_only: bool = Query(False),
    cash_on_delivery_only: bool = Query(False),
    requires_second_payment: bool | None = Query(None),
    includes_full_gift: bool | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = product_service.get_product_group_buys(
        db,
        product_id,
        sort=sort.value,
        available_only=available_only,
        cash_on_delivery_only=cash_on_delivery_only,
        requires_second_payment=requires_second_payment,
        includes_full_gift=includes_full_gift,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )
