from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.responses import envelope
from app.models.user import AppUser
from app.schemas.upload import UploadImageResponse
from app.services import upload_service

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form(...),
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    raw = await file.read()
    result = upload_service.save_image(
        current_user,
        category,
        raw=raw,
        content_type=file.content_type,
        filename=file.filename,
    )
    response = UploadImageResponse(**result)
    return envelope(response.model_dump(mode="json"))
