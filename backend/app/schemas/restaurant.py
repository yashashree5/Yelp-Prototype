from pydantic import BaseModel
from typing import Optional


class RestaurantCreate(BaseModel):
    name: str
    cuisine: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    amenities: Optional[str] = None
    hours: Optional[str] = None
    pricing_tier: Optional[str] = None
    contact: Optional[str] = None
    photos: Optional[str] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    cuisine: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    hours: Optional[str] = None
    amenities: Optional[str] = None
    pricing_tier: Optional[str] = None
    contact: Optional[str] = None
    photos: Optional[str] = None
