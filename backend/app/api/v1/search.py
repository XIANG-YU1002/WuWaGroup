import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_db
from app.core.responses import envelope, paginated_envelope
from app.services import search_service

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def global_search_preview(
    q: str | None = Query(None),
    limit_per_type: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
) -> dict:
    result = search_service.global_search_preview(db, q, limit_per_type)
    return envelope(result.model_dump(mode="json"))


@router.get("/activities")
def search_activities(
    q: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = search_service.search_activities(db, q, pagination.page, pagination.page_size)
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.get("/products")
def search_products(
    q: str | None = Query(None),
    character_id: uuid.UUID | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = search_service.search_products(
        db, q, character_id, pagination.page, pagination.page_size
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.get("/characters")
def search_characters(
    q: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = search_service.search_characters(db, q, pagination.page, pagination.page_size)
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )
