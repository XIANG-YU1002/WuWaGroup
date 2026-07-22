import uuid

from pydantic import BaseModel

from app.models.enums import ContactPlatform, PaymentMethod
from app.schemas.common import Money, UTCDateTime
from app.schemas.group_leader import GroupLeaderSummary


class FollowListActivityRef(BaseModel):
    id: uuid.UUID
    name: str


class FollowListGroupBuySummary(BaseModel):
    id: uuid.UUID
    group_leader: GroupLeaderSummary
    activity: FollowListActivityRef
    payment_method: PaymentMethod
    payment_method_note: str | None
    requires_second_payment: bool
    includes_full_gift: bool
    deadline_at: UTCDateTime
    rules: str
    contact_platform: ContactPlatform
    contact_value: str
    effective_status: str
    is_available: bool


class FollowListProductRef(BaseModel):
    id: uuid.UUID
    name: str
    primary_image_url: str


class FollowListItemResponse(BaseModel):
    id: uuid.UUID
    group_buy_product_id: uuid.UUID
    product: FollowListProductRef
    unit_price: Money
    quantity: int
    estimated_subtotal: Money
    is_available: bool


class FollowListResponse(BaseModel):
    id: uuid.UUID
    group_buy: FollowListGroupBuySummary
    items: list[FollowListItemResponse]
    estimated_product_total: Money
    is_submittable: bool
    invalid_reasons: list[str]
    created_at: UTCDateTime
    updated_at: UTCDateTime


class AddFollowListItemRequest(BaseModel):
    group_buy_product_id: uuid.UUID
    quantity: int
    replace_existing: bool = False


class UpdateFollowListItemQuantityRequest(BaseModel):
    quantity: int


class UpdateFollowListItemResponse(BaseModel):
    id: uuid.UUID
    quantity: int
    unit_price: Money
    estimated_subtotal: Money
    estimated_product_total: Money
