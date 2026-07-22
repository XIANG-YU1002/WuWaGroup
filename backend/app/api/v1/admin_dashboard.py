from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin_user, get_db
from app.core.responses import envelope, paginated_envelope
from app.services import admin_dashboard_service as service

router = APIRouter(
    prefix="/admin/dashboard", tags=["admin-dashboard"], dependencies=[Depends(get_current_admin_user)]
)


@router.get("")
def get_dashboard(db: Session = Depends(get_db)) -> dict:
    result = service.get_dashboard(db)
    return envelope(result.model_dump(mode="json"))


@router.get("/current-group-buys")
def get_current_group_buys(
    pagination: PaginationParams = Depends(), db: Session = Depends(get_db)
) -> dict:
    items, total = service.get_current_group_buys(db, pagination.page, pagination.page_size)
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )
