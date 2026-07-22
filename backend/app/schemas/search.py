import uuid

from pydantic import BaseModel

from app.models.enums import ActivityStatus


class SearchActivityItem(BaseModel):
    id: uuid.UUID
    name: str
    image_url: str
    status: ActivityStatus


class SearchProductActivityRef(BaseModel):
    id: uuid.UUID
    name: str


class SearchProductItem(BaseModel):
    id: uuid.UUID
    name: str
    primary_image_url: str
    activity: SearchProductActivityRef


class SearchCharacterItem(BaseModel):
    id: uuid.UUID
    name: str
    related_product_count: int


class ActivitySearchSection(BaseModel):
    items: list[SearchActivityItem]
    total_count: int
    has_more: bool


class ProductSearchSection(BaseModel):
    items: list[SearchProductItem]
    total_count: int
    has_more: bool


class CharacterSearchSection(BaseModel):
    items: list[SearchCharacterItem]
    total_count: int
    has_more: bool


class GlobalSearchResponse(BaseModel):
    activities: ActivitySearchSection
    products: ProductSearchSection
    characters: CharacterSearchSection
