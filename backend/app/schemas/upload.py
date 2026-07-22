from pydantic import BaseModel


class UploadImageResponse(BaseModel):
    url: str
    category: str
    content_type: str
    size: int
