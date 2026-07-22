from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.responses import envelope
from app.models.user import AppUser
from app.schemas.user import UpdateContactsRequest, UpdateProfileRequest
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_my_profile(
    current_user: AppUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    profile = user_service.get_profile(db, current_user)
    return envelope(profile.model_dump(mode="json"))


@router.patch("/me")
def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    user_service.update_profile(db, current_user, payload)
    profile = user_service.get_profile(db, current_user)
    return envelope(profile.model_dump(mode="json"))


@router.patch("/me/contacts")
def update_my_contacts(
    payload: UpdateContactsRequest,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    user_service.update_contacts(db, current_user, payload)
    profile = user_service.get_profile(db, current_user)
    return envelope(profile.model_dump(mode="json"))
