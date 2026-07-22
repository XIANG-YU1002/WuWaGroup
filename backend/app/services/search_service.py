import uuid

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.repositories import activity_repository, character_repository, product_repository
from app.schemas.search import (
    ActivitySearchSection,
    CharacterSearchSection,
    GlobalSearchResponse,
    ProductSearchSection,
    SearchActivityItem,
    SearchCharacterItem,
    SearchProductActivityRef,
    SearchProductItem,
)


def _require_query(q: str | None) -> str:
    trimmed = (q or "").strip()
    if not trimmed:
        raise AppError(422, "SEARCH_QUERY_REQUIRED", "請輸入搜尋文字。")
    return trimmed


def global_search_preview(db: Session, q: str | None, limit_per_type: int) -> GlobalSearchResponse:
    query = _require_query(q)

    activities, activity_total = activity_repository.search_activities(
        db, q=query, page=1, page_size=limit_per_type
    )
    products, product_total = product_repository.search_active_products(
        db, q=query, character_id=None, page=1, page_size=limit_per_type
    )
    character_rows, character_total = character_repository.search_characters(
        db, q=query, page=1, page_size=limit_per_type
    )

    activity_items = [
        SearchActivityItem.model_validate(a, from_attributes=True) for a in activities
    ]
    product_items = []
    for product in products:
        activity = activity_repository.get_by_id(db, product.activity_id)
        product_items.append(
            SearchProductItem(
                id=product.id,
                name=product.name,
                primary_image_url=product.primary_image_url,
                activity=SearchProductActivityRef.model_validate(activity, from_attributes=True),
            )
        )
    character_items = [
        SearchCharacterItem(id=character.id, name=character.name, related_product_count=count)
        for character, count in character_rows
    ]

    return GlobalSearchResponse(
        activities=ActivitySearchSection(
            items=activity_items,
            total_count=activity_total,
            has_more=activity_total > len(activity_items),
        ),
        products=ProductSearchSection(
            items=product_items,
            total_count=product_total,
            has_more=product_total > len(product_items),
        ),
        characters=CharacterSearchSection(
            items=character_items,
            total_count=character_total,
            has_more=character_total > len(character_items),
        ),
    )


def search_activities(
    db: Session, q: str | None, page: int, page_size: int
) -> tuple[list[SearchActivityItem], int]:
    query = _require_query(q)
    activities, total = activity_repository.search_activities(
        db, q=query, page=page, page_size=page_size
    )
    return [SearchActivityItem.model_validate(a, from_attributes=True) for a in activities], total


def search_products(
    db: Session, q: str | None, character_id: uuid.UUID | None, page: int, page_size: int
) -> tuple[list[SearchProductItem], int]:
    if character_id is None:
        query = _require_query(q)
    else:
        query = (q or "").strip() or None

    products, total = product_repository.search_active_products(
        db, q=query, character_id=character_id, page=page, page_size=page_size
    )
    items = []
    for product in products:
        activity = activity_repository.get_by_id(db, product.activity_id)
        items.append(
            SearchProductItem(
                id=product.id,
                name=product.name,
                primary_image_url=product.primary_image_url,
                activity=SearchProductActivityRef.model_validate(activity, from_attributes=True),
            )
        )
    return items, total


def search_characters(
    db: Session, q: str | None, page: int, page_size: int
) -> tuple[list[SearchCharacterItem], int]:
    query = _require_query(q)
    rows, total = character_repository.search_characters(
        db, q=query, page=page, page_size=page_size
    )
    items = [
        SearchCharacterItem(id=character.id, name=character.name, related_product_count=count)
        for character, count in rows
    ]
    return items, total
