from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_group_leader_profile, get_current_group_leader_profile, get_db
from app.core.responses import envelope
from app.models.group_leader import GroupLeaderProfile
from app.schemas.group_leader_profile import UpdateDefaultRulesRequest, UpdateGroupLeaderProfileRequest
from app.services import group_leader_profile_service

router = APIRouter(prefix="/group-leader", tags=["group-leader-profile"])


@router.get("/profile")
def get_profile(
    profile: GroupLeaderProfile = Depends(get_current_group_leader_profile),
) -> dict:
    result = group_leader_profile_service.get_profile(profile)
    return envelope(result.model_dump(mode="json"))


@router.patch("/profile")
def update_profile(
    payload: UpdateGroupLeaderProfileRequest,
    profile: GroupLeaderProfile = Depends(get_current_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    result = group_leader_profile_service.update_profile(db, profile, payload)
    return envelope(result.model_dump(mode="json"))


@router.patch("/profile/default-rules")
def update_default_rules(
    payload: UpdateDefaultRulesRequest,
    profile: GroupLeaderProfile = Depends(get_current_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    result = group_leader_profile_service.update_default_rules(db, profile, payload)
    return envelope(result.model_dump(mode="json"))


@router.get("/dashboard")
def get_dashboard(
    profile: GroupLeaderProfile = Depends(get_current_active_group_leader_profile),
    db: Session = Depends(get_db),
) -> dict:
    result = group_leader_profile_service.get_dashboard(db, profile)
    return envelope(result.model_dump(mode="json"))
