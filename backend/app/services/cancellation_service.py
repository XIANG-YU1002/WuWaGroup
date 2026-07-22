import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.enums import OrderStatus
from app.models.user import AppUser
from app.repositories import cancellation_repository, order_repository
from app.schemas.common import normalize_optional_text
from app.schemas.order import CancellationRequestSummary

_CANCELLABLE_STATUSES = {
    OrderStatus.PENDING_CONFIRMATION,
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
}


def create_cancellation_request(
    db: Session, user: AppUser, order_id: uuid.UUID, reason: str | None
) -> CancellationRequestSummary:
    """依 Business Rules §22.1/§22.4：僅允許可取消狀態，且同一訂單同時最多一筆待處理申請。"""
    order = order_repository.get_by_id(db, order_id)
    if order is None or order.user_id != user.id:
        raise AppError(404, "ORDER_NOT_FOUND", "找不到指定的訂單。")

    if order.status not in _CANCELLABLE_STATUSES:
        raise AppError(409, "CANCELLATION_NOT_ALLOWED", "目前訂單狀態不可申請取消。")

    if cancellation_repository.get_pending_by_order_id(db, order.id) is not None:
        raise AppError(409, "CANCELLATION_REQUEST_PENDING", "已有待處理的取消申請。")

    request = cancellation_repository.create(db, order.id, normalize_optional_text(reason))

    return CancellationRequestSummary(
        id=request.id,
        order_id=request.order_id,
        reason=request.reason,
        status=request.status,
        response_note=request.response_note,
        processed_at=request.processed_at,
        created_at=request.created_at,
    )
