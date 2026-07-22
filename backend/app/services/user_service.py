from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.enums import UserRole
from app.models.user import AppUser
from app.repositories import group_leader_repository, user_repository
from app.schemas.common import normalize_optional_text
from app.schemas.user import (
    CurrentSessionResponse,
    GroupLeaderProfileSummary,
    GroupLeaderSessionSummary,
    LatestApplicationSummary,
    PermissionsSummary,
    UpdateContactsRequest,
    UpdateProfileRequest,
    UserProfileResponse,
)
from app.services.group_leader_service import is_profile_complete


def build_current_session(db: Session, user: AppUser) -> CurrentSessionResponse:
    profile = group_leader_repository.get_profile_by_user_id(db, user.id)
    complete = is_profile_complete(profile)

    group_leader = None
    if profile is not None:
        group_leader = GroupLeaderSessionSummary(
            id=profile.id, display_name=profile.display_name, is_profile_complete=complete
        )

    return CurrentSessionResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        avatar_url=user.avatar_url,
        role=user.role,
        group_leader=group_leader,
        permissions=PermissionsSummary(
            is_admin=user.role == UserRole.ADMIN,
            has_group_leader_profile=profile is not None,
            can_manage_group_buys=complete,
        ),
    )


def get_profile(db: Session, user: AppUser) -> UserProfileResponse:
    profile = group_leader_repository.get_profile_by_user_id(db, user.id)
    latest_application = group_leader_repository.get_latest_application_by_user_id(db, user.id)

    latest_application_summary = None
    if latest_application is not None:
        latest_application_summary = LatestApplicationSummary(
            id=latest_application.id,
            status=latest_application.status,
            created_at=latest_application.created_at,
            reviewed_at=latest_application.reviewed_at,
        )

    profile_summary = None
    if profile is not None:
        profile_summary = GroupLeaderProfileSummary(
            id=profile.id,
            display_name=profile.display_name,
            is_profile_complete=is_profile_complete(profile),
        )

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        avatar_url=user.avatar_url,
        facebook_contact=user.facebook_contact,
        discord_contact=user.discord_contact,
        line_contact=user.line_contact,
        role=user.role,
        created_at=user.created_at,
        latest_group_leader_application=latest_application_summary,
        group_leader_profile=profile_summary,
    )


def update_profile(db: Session, user: AppUser, payload: UpdateProfileRequest) -> AppUser:
    """依 Business Rules §7.1：只能修改暱稱與頭像，不可修改 Email／Role。"""
    if payload.nickname is not None:
        user.nickname = payload.nickname
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(user)
    return user


def update_contacts(db: Session, user: AppUser, payload: UpdateContactsRequest) -> AppUser:
    """依 Business Rules §7.2：更新後至少保留一項私人聯絡方式。"""
    provided = payload.model_fields_set
    facebook = payload.facebook_contact if "facebook_contact" in provided else user.facebook_contact
    discord = payload.discord_contact if "discord_contact" in provided else user.discord_contact
    line = payload.line_contact if "line_contact" in provided else user.line_contact

    facebook = normalize_optional_text(facebook)
    discord = normalize_optional_text(discord)
    line = normalize_optional_text(line)

    if not (facebook or discord or line):
        raise AppError(422, "CONTACT_REQUIRED", "至少需要保留一項聯絡方式。")

    user.facebook_contact = facebook
    user.discord_contact = discord
    user.line_contact = line
    db.commit()
    db.refresh(user)
    return user
