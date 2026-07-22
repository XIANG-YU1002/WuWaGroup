import uuid

from pydantic import BaseModel

from app.models.enums import ActivityStatus, ContactPlatform, Currency, PaymentMethod
from app.schemas.common import Money, UTCDateTime
from app.schemas.group_leader import GroupLeaderSummary


class ProductActivitySummary(BaseModel):
    id: uuid.UUID
    name: str
    status: ActivityStatus
    has_full_gift: bool


class ProductImageItem(BaseModel):
    id: uuid.UUID
    image_url: str
    sort_order: int


class CharacterSummary(BaseModel):
    id: uuid.UUID
    name: str


class ProductDetailResponse(BaseModel):
    id: uuid.UUID
    name: str
    official_price: Money | None
    official_currency: Currency | None
    primary_image_url: str
    is_active: bool
    activity: ProductActivitySummary
    images: list[ProductImageItem]
    characters: list[CharacterSummary]
    is_favorited: bool


class ProductGroupBuyListItem(BaseModel):
    id: uuid.UUID
    group_buy_product_id: uuid.UUID
    group_leader: GroupLeaderSummary
    unit_price: Money
    payment_method: PaymentMethod
    payment_method_note: str | None
    requires_second_payment: bool
    includes_full_gift: bool
    deadline_at: UTCDateTime
    contact_platform: ContactPlatform
    effective_status: str
    is_available: bool
    available_quantity: int
    created_at: UTCDateTime
