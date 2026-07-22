import uuid

from pydantic import BaseModel

from app.models.enums import ContactPlatform, OrderStatus, PaymentMethod
from app.schemas.common import Money, UTCDateTime
from app.schemas.order import CancellationRequestSummary, OrderItemDetail


class GroupLeaderOrderListItem(BaseModel):
    id: uuid.UUID
    order_number: str
    member_nickname: str
    group_buy_id: uuid.UUID
    activity_name: str
    status: OrderStatus
    product_total_amount: Money
    has_pending_cancellation: bool
    created_at: UTCDateTime


class MemberContactSnapshot(BaseModel):
    facebook: str | None
    discord: str | None
    line: str | None


class GroupLeaderOrderDetailResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    rejection_reason: str | None
    product_total_amount: Money
    member_nickname: str
    member_contacts: MemberContactSnapshot
    activity_name: str
    payment_method: PaymentMethod
    payment_method_note: str | None
    requires_second_payment: bool
    includes_full_gift: bool
    rules: str
    contact_platform: ContactPlatform
    contact_value: str
    items: list[OrderItemDetail]
    pending_cancellation_request: CancellationRequestSummary | None
    cancellation_requests: list[CancellationRequestSummary]
    available_actions: list[str]
    created_at: UTCDateTime
    updated_at: UTCDateTime


class RejectOrderRequest(BaseModel):
    reason: str


class ProcessCancellationRequest(BaseModel):
    response_note: str | None = None
