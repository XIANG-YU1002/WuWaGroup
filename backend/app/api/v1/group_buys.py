import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.responses import envelope
from app.services import group_buy_service

router = APIRouter(tags=["group-buys"])


@router.get("/group-buys/{group_buy_id}")
def get_group_buy_detail(group_buy_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = group_buy_service.get_group_buy_detail(db, group_buy_id)
    return envelope(result.model_dump(mode="json"))


@router.get("/group-buys/{group_buy_id}/rules")
def get_group_buy_rules(group_buy_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = group_buy_service.get_group_buy_rules(db, group_buy_id)
    return envelope(result.model_dump(mode="json"))


@router.get("/group-buys/{group_buy_id}/announcements")
def get_group_buy_announcements(group_buy_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    items = group_buy_service.get_group_buy_public_announcements(db, group_buy_id)
    return envelope([i.model_dump(mode="json") for i in items])


@router.get("/group-buy-products/{group_buy_product_id}/availability")
def get_group_buy_product_availability(
    group_buy_product_id: uuid.UUID, db: Session = Depends(get_db)
) -> dict:
    result = group_buy_service.get_group_buy_product_availability(db, group_buy_product_id)
    return envelope(result.model_dump(mode="json"))
