import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import CancellationStatus
from app.models.group_buy import GroupBuy
from app.models.order import CancellationRequest, GroupOrder


def get_by_id(
    db: Session, request_id: uuid.UUID, *, for_update: bool = False
) -> CancellationRequest | None:
    stmt = select(CancellationRequest).where(CancellationRequest.id == request_id)
    if for_update:
        stmt = stmt.with_for_update()
    return db.execute(stmt).scalar_one_or_none()


def get_pending_by_order_id(db: Session, order_id: uuid.UUID) -> CancellationRequest | None:
    stmt = select(CancellationRequest).where(
        CancellationRequest.order_id == order_id,
        CancellationRequest.status == CancellationStatus.PENDING,
    )
    return db.execute(stmt).scalar_one_or_none()


def list_by_order_id(db: Session, order_id: uuid.UUID) -> list[CancellationRequest]:
    stmt = (
        select(CancellationRequest)
        .where(CancellationRequest.order_id == order_id)
        .order_by(CancellationRequest.created_at.desc())
    )
    return db.execute(stmt).scalars().all()


def create(db: Session, order_id: uuid.UUID, reason: str | None) -> CancellationRequest:
    request = CancellationRequest(order_id=order_id, reason=reason)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def count_pending_for_leader(db: Session, group_leader_profile_id: uuid.UUID) -> int:
    stmt = (
        select(func.count())
        .select_from(CancellationRequest)
        .join(GroupOrder, GroupOrder.id == CancellationRequest.order_id)
        .join(GroupBuy, GroupBuy.id == GroupOrder.group_buy_id)
        .where(
            GroupBuy.group_leader_profile_id == group_leader_profile_id,
            CancellationRequest.status == CancellationStatus.PENDING,
        )
    )
    return db.execute(stmt).scalar_one()
