import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin_user, get_db
from app.core.responses import envelope, paginated_envelope
from app.services import admin_group_leader_service as service

router = APIRouter(
    prefix="/admin/group-leaders",
    tags=["admin-group-leaders"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("")
def get_group_leaders(
    keyword: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = service.get_group_leaders(db, keyword, pagination.page, pagination.page_size)
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.get("/{group_leader_id}")
def get_group_leader_detail(group_leader_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.get_group_leader_detail(db, group_leader_id)
    return envelope(result.model_dump(mode="json"))
