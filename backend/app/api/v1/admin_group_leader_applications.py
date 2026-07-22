import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin_user, get_db
from app.core.responses import envelope, paginated_envelope
from app.models.enums import GroupLeaderApplicationStatus
from app.models.user import AppUser
from app.services import admin_group_leader_application_service as service

router = APIRouter(prefix="/admin/group-leader-applications", tags=["admin-group-leader-applications"])


@router.get("")
def get_applications(
    status_filter: GroupLeaderApplicationStatus | None = Query(None, alias="status"),
    keyword: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    _admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    items, total = service.get_applications(
        db,
        status=status_filter,
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.get("/{application_id}")
def get_application_detail(
    application_id: uuid.UUID,
    _admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    result = service.get_application_detail(db, application_id)
    return envelope(result.model_dump(mode="json"))


@router.post("/{application_id}/approve")
def approve_application(
    application_id: uuid.UUID,
    admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    result = service.approve_application(db, admin, application_id)
    return envelope(result.model_dump(mode="json"))


@router.post("/{application_id}/reject")
def reject_application(
    application_id: uuid.UUID,
    admin: AppUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    result = service.reject_application(db, admin, application_id)
    return envelope(result.model_dump(mode="json"))
