import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin_user, get_db
from app.core.responses import envelope, paginated_envelope
from app.schemas.admin_product import (
    AddProductImageRequest,
    CreateProductRequest,
    ReorderProductImagesRequest,
    UpdateProductImageRequest,
    UpdateProductRequest,
)
from app.services import admin_product_service as service

router = APIRouter(
    prefix="/admin/products", tags=["admin-products"], dependencies=[Depends(get_current_admin_user)]
)


@router.get("")
def get_products(
    activity_id: uuid.UUID | None = Query(None),
    is_active: bool | None = Query(None),
    character_id: uuid.UUID | None = Query(None),
    keyword: str | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    items, total = service.get_products(
        db,
        activity_id=activity_id,
        is_active=is_active,
        character_id=character_id,
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return paginated_envelope(
        [i.model_dump(mode="json") for i in items], pagination.page, pagination.page_size, total
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_product(payload: CreateProductRequest, db: Session = Depends(get_db)) -> dict:
    result = service.create_product(db, payload)
    return envelope(result.model_dump(mode="json"))


@router.get("/{product_id}")
def get_product_detail(product_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.get_product_detail(db, product_id)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{product_id}")
def update_product(
    product_id: uuid.UUID, payload: UpdateProductRequest, db: Session = Depends(get_db)
) -> dict:
    result = service.update_product(db, product_id, payload)
    return envelope(result.model_dump(mode="json"))


@router.post("/{product_id}/deactivate")
def deactivate_product(product_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.deactivate_product(db, product_id)
    return envelope(result.model_dump(mode="json"))


@router.post("/{product_id}/reactivate")
def reactivate_product(product_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.reactivate_product(db, product_id)
    return envelope(result.model_dump(mode="json"))


@router.post("/{product_id}/images", status_code=status.HTTP_201_CREATED)
def add_image(
    product_id: uuid.UUID, payload: AddProductImageRequest, db: Session = Depends(get_db)
) -> dict:
    result = service.add_image(db, product_id, payload.image_url)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{product_id}/images/reorder")
def reorder_images(
    product_id: uuid.UUID, payload: ReorderProductImagesRequest, db: Session = Depends(get_db)
) -> dict:
    result = service.reorder_images(db, product_id, payload.ordered_image_ids)
    return envelope(result.model_dump(mode="json"))


@router.patch("/{product_id}/images/{image_id}")
def update_image(
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    payload: UpdateProductImageRequest,
    db: Session = Depends(get_db),
) -> dict:
    result = service.update_image(db, product_id, image_id, payload.image_url)
    return envelope(result.model_dump(mode="json"))


@router.delete("/{product_id}/images/{image_id}")
def delete_image(product_id: uuid.UUID, image_id: uuid.UUID, db: Session = Depends(get_db)) -> dict:
    result = service.delete_image(db, product_id, image_id)
    return envelope(result.model_dump(mode="json"))
