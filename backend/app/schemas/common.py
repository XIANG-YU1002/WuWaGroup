from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from pydantic import PlainSerializer


def _serialize_money(value: Decimal) -> str:
    return f"{value:.2f}"


def _serialize_datetime(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


Money = Annotated[Decimal, PlainSerializer(_serialize_money, return_type=str)]
UTCDateTime = Annotated[datetime, PlainSerializer(_serialize_datetime, return_type=str)]


def normalize_optional_text(value: str | None) -> str | None:
    """依 Business Rules §2.3：Trim 後空字串／純空白正規化為 None。"""
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed if trimmed else None
