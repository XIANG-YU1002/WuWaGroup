from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.responses import envelope
from app.models.user import AppUser
from app.schemas.user import (
    CurrentSessionResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.services import auth_service, user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    user = auth_service.register(db, payload)
    response = RegisterResponse.model_validate(user, from_attributes=True)
    return envelope(response.model_dump(mode="json"))


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    access_token, expires_in = auth_service.login(db, payload)
    response = LoginResponse(access_token=access_token, expires_in=expires_in)
    return envelope(response.model_dump(mode="json"))


@router.get("/me")
def get_current_session(
    current_user: AppUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    response: CurrentSessionResponse = user_service.build_current_session(db, current_user)
    return envelope(response.model_dump(mode="json"))
