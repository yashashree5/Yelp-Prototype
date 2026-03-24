from typing import Optional
from pydantic import BaseModel


class ReviewCreate(BaseModel):
    restaurant_id: int
    rating: float
    comment: Optional[str] = None
    # Base64 data URL (e.g. "data:image/png;base64,...") for a single uploaded photo.
    photos: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: float
    comment: str
    # If omitted, we keep the existing photo. If provided (even null), we overwrite.
    photos: Optional[str] = None

