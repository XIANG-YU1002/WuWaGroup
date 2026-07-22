from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.enums import GroupBuyStatus, OrderStatus
from app.models.group_leader import GroupLeaderProfile
from app.repositories import cancellation_repository, group_buy_repository, group_leader_repository, order_repository
from app.schemas.group_leader_profile import (
    DashboardCard,
    DashboardResponse,
    GroupLeaderProfileOwnerResponse,
    UpdateDefaultRulesRequest,
    UpdateGroupLeaderProfileRequest,
)
from app.services.group_leader_service import is_profile_complete


def _to_response(profile: GroupLeaderProfile) -> GroupLeaderProfileOwnerResponse:
    return GroupLeaderProfileOwnerResponse(
        id=profile.id,
        display_name=profile.display_name,
        introduction=profile.introduction,
        default_rules=profile.default_rules,
        facebook_url=profile.facebook_url,
        discord_contact=profile.discord_contact,
        line_contact=profile.line_contact,
        is_profile_complete=is_profile_complete(profile),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


def get_profile(profile: GroupLeaderProfile) -> GroupLeaderProfileOwnerResponse:
    return _to_response(profile)


def update_profile(
    db: Session, profile: GroupLeaderProfile, payload: UpdateGroupLeaderProfileRequest
) -> GroupLeaderProfileOwnerResponse:
    """依 Business Rules §9.2/§9.3：名稱設定後不可修改，聯絡方式至少保留一項。"""
    provided = payload.model_fields_set

    if "display_name" in provided and payload.display_name is not None:
        if profile.display_name is not None:
            raise AppError(409, "GROUP_LEADER_DISPLAY_NAME_IMMUTABLE", "團主名稱設定後不可修改。")
        if group_leader_repository.display_name_taken(db, payload.display_name, profile.id):
            raise AppError(
                409, "GROUP_LEADER_DISPLAY_NAME_UNAVAILABLE", "此團主名稱已被使用。"
            )
        profile.display_name = payload.display_name

    if "introduction" in provided:
        profile.introduction = payload.introduction

    facebook = payload.facebook_url if "facebook_url" in provided else profile.facebook_url
    discord = payload.discord_contact if "discord_contact" in provided else profile.discord_contact
    line = payload.line_contact if "line_contact" in provided else profile.line_contact

    if not (facebook or discord or line):
        raise AppError(422, "CONTACT_REQUIRED", "至少需要保留一項公開聯絡方式。")

    profile.facebook_url = facebook
    profile.discord_contact = discord
    profile.line_contact = line

    db.commit()
    db.refresh(profile)
    return _to_response(profile)


def update_default_rules(
    db: Session, profile: GroupLeaderProfile, payload: UpdateDefaultRulesRequest
) -> GroupLeaderProfileOwnerResponse:
    """依 Business Rules §9.4：只影響未來預填內容，不修改既有開團團規。"""
    profile.default_rules = payload.default_rules
    db.commit()
    db.refresh(profile)
    return _to_response(profile)


def get_dashboard(db: Session, profile: GroupLeaderProfile) -> DashboardResponse:
    """依 API Design §22.4：只回傳簡化統計與可點擊篩選條件。"""
    open_group_buys = group_buy_repository.count_by_group_leader_and_status(
        db, profile.id, GroupBuyStatus.OPEN
    )
    pending_confirmation_orders = order_repository.count_for_leader_by_status(
        db, profile.id, OrderStatus.PENDING_CONFIRMATION
    )
    pending_payment_orders = order_repository.count_for_leader_by_status(
        db, profile.id, OrderStatus.PENDING_PAYMENT
    )
    pending_cancellation_requests = cancellation_repository.count_pending_for_leader(db, profile.id)

    return DashboardResponse(
        cards=[
            DashboardCard(
                key="open_group_buys",
                label="進行中開團",
                count=open_group_buys,
                target_url="/group-leader/group-buys?status=open",
            ),
            DashboardCard(
                key="pending_confirmation_orders",
                label="待確認訂單",
                count=pending_confirmation_orders,
                target_url="/group-leader/orders?status=pending_confirmation",
            ),
            DashboardCard(
                key="pending_payment_orders",
                label="待付款訂單",
                count=pending_payment_orders,
                target_url="/group-leader/orders?status=pending_payment",
            ),
            DashboardCard(
                key="pending_cancellation_requests",
                label="待處理取消申請",
                count=pending_cancellation_requests,
                target_url="/group-leader/orders?has_pending_cancellation=true",
            ),
        ]
    )
