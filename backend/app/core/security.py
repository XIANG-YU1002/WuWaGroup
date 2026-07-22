import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _pwd_context.verify(password, password_hash)


def create_access_token(user_id: uuid.UUID) -> tuple[str, int]:
    expire_seconds = settings.access_token_expire_minutes * 60
    expire_at = datetime.now(timezone.utc) + timedelta(seconds=expire_seconds)
    payload = {"sub": str(user_id), "exp": expire_at}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, expire_seconds


class TokenExpiredError(Exception):
    pass


class TokenInvalidError(Exception):
    pass


def decode_access_token(token: str) -> uuid.UUID:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise TokenExpiredError() from exc
    except JWTError as exc:
        raise TokenInvalidError() from exc

    subject = payload.get("sub")
    if subject is None:
        raise TokenInvalidError()

    try:
        return uuid.UUID(subject)
    except ValueError as exc:
        raise TokenInvalidError() from exc
