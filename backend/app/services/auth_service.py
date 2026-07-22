from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import AppUser
from app.repositories import user_repository
from app.schemas.user import LoginRequest, RegisterRequest


def register(db: Session, payload: RegisterRequest) -> AppUser:
    """依 Business Rules §6：Email 不可重複、密碼安全雜湊、註冊後不自動登入。"""
    if user_repository.get_by_email(db, payload.email) is not None:
        raise AppError(409, "EMAIL_ALREADY_EXISTS", "此 Email 已被註冊。")

    user = AppUser(
        email=payload.email,
        password_hash=hash_password(payload.password),
        nickname=payload.nickname,
        facebook_contact=payload.facebook_contact,
        discord_contact=payload.discord_contact,
        line_contact=payload.line_contact,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, payload: LoginRequest) -> tuple[str, int]:
    """依 Business Rules §6.3/§6.5：登入失敗不得透露 Email 是否存在，成功回傳 Access Token。"""
    user = user_repository.get_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError(401, "AUTH_INVALID_CREDENTIALS", "Email 或密碼錯誤。")

    return create_access_token(user.id)
