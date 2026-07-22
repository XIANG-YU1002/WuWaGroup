import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.enums import GroupBuyStatus
from app.repositories import (
    activity_repository,
    group_buy_repository,
    group_leader_repository,
    user_repository,
)
from app.schemas.admin_group_leader import (
    GroupLeaderAdminCurrentGroupBuy,
    GroupLeaderAdminDetailResponse,
    GroupLeaderAdminListItem,
)
from app.schemas.admin_user import UserAdminRef
from app.schemas.group_leader import PublicContacts
from app.services.group_leader_service import is_profile_complete


def get_group_leaders(
    db: Session, keyword: str | None, page: int, page_size: int
) -> tuple[list[GroupLeaderAdminListItem], int]:
    """依需求追蹤矩陣衝突解法 #4：Project Spec 擴充的唯讀團主列表。"""
    rows, total = group_leader_repository.list_profiles_admin(
        db, keyword=keyword, page=page, page_size=page_size
    )
    items = []
    for profile, user in rows:
        statistics = group_leader_repository.get_public_statistics(db, profile.id)
        items.append(
            GroupLeaderAdminListItem(
                id=profile.id,
                display_name=profile.display_name,
                is_profile_complete=is_profile_complete(profile),
                user=UserAdminRef.model_validate(user, from_attributes=True),
                group_buy_count=statistics["group_buy_count"],
                completed_order_count=statistics["completed_order_count"],
                created_at=profile.created_at,
            )
        )
    return items, total


def get_group_leader_detail(
    db: Session, group_leader_profile_id: uuid.UUID
) -> GroupLeaderAdminDetailResponse:
    profile = group_leader_repository.get_profile_by_id(db, group_leader_profile_id)
    if profile is None:
        raise AppError(404, "GROUP_LEADER_PROFILE_NOT_FOUND", "找不到指定的團主。")

    user = user_repository.get_by_id(db, profile.user_id)
    statistics = group_leader_repository.get_public_statistics(db, profile.id)

    current_group_buys = [
        GroupLeaderAdminCurrentGroupBuy(
            id=group_buy.id,
            activity_name=activity_repository.get_by_id(db, group_buy.activity_id).name,
            status=group_buy.status,
            deadline_at=group_buy.deadline_at,
        )
        for group_buy in group_buy_repository.list_by_group_leader(
            db, profile.id, GroupBuyStatus.OPEN
        )
    ]

    return GroupLeaderAdminDetailResponse(
        id=profile.id,
        display_name=profile.display_name,
        introduction=profile.introduction,
        default_rules=profile.default_rules,
        public_contacts=PublicContacts(
            facebook=profile.facebook_url,
            discord=profile.discord_contact,
            line=profile.line_contact,
        ),
        is_profile_complete=is_profile_complete(profile),
        user=UserAdminRef.model_validate(user, from_attributes=True),
        group_buy_count=statistics["group_buy_count"],
        completed_order_count=statistics["completed_order_count"],
        current_group_buys=current_group_buys,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )
