import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.repositories import group_leader_repository, user_repository
from app.schemas.admin_user import (
    UserAdminDetailResponse,
    UserAdminGroupLeaderSummary,
    UserAdminListItem,
)
from app.services.group_leader_service import is_profile_complete


def get_users(
    db: Session, keyword: str | None, page: int, page_size: int
) -> tuple[list[UserAdminListItem], int]:
    """依需求追蹤矩陣衝突解法 #3：Project Spec 擴充的唯讀會員列表。"""
    users, total = user_repository.list_users_admin(
        db, keyword=keyword, page=page, page_size=page_size
    )
    items = [
        UserAdminListItem(
            id=user.id,
            email=user.email,
            nickname=user.nickname,
            role=user.role,
            has_group_leader_profile=group_leader_repository.get_profile_by_user_id(db, user.id)
            is not None,
            created_at=user.created_at,
        )
        for user in users
    ]
    return items, total


def get_user_detail(db: Session, user_id: uuid.UUID) -> UserAdminDetailResponse:
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise AppError(404, "USER_NOT_FOUND", "找不到指定的會員。")

    profile = group_leader_repository.get_profile_by_user_id(db, user.id)
    profile_summary = None
    if profile is not None:
        profile_summary = UserAdminGroupLeaderSummary(
            id=profile.id,
            display_name=profile.display_name,
            is_profile_complete=is_profile_complete(profile),
        )

    return UserAdminDetailResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        avatar_url=user.avatar_url,
        role=user.role,
        created_at=user.created_at,
        group_leader_profile=profile_summary,
    )
