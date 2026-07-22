import uuid

from pydantic import BaseModel

from app.schemas.common import UTCDateTime


class FavoriteActivityRef(BaseModel):
    id: uuid.UUID
    name: str


class FavoriteProductSummary(BaseModel):
    id: uuid.UUID
    name: str
    primary_image_url: str
    is_active: bool
    activity: FavoriteActivityRef


class FavoriteItem(BaseModel):
    favorite_id: uuid.UUID
    product: FavoriteProductSummary
    created_at: UTCDateTime


class AddFavoriteResponse(BaseModel):
    product_id: uuid.UUID
    is_favorited: bool
