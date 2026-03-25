from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ReviewCreate(BaseModel):
    restaurant_id: int
    rating: float
    comment: Optional[str] = None
    photos: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: float
    comment: str
    photos: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    restaurant_id: int
    user_id: int
    rating: float
    comment: Optional[str] = None
    photos: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

