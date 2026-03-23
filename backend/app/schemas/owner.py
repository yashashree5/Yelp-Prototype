from pydantic import BaseModel, EmailStr
from typing import Optional

class OwnerSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    restaurant_location: Optional[str] = None

class OwnerLogin(BaseModel):
    email: EmailStr
    password: str

class OwnerResponse(BaseModel):
    id: int
    name: str
    email: str
    restaurant_location: Optional[str] = None

    class Config:
        from_attributes = True

class OwnerProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    restaurant_location: Optional[str] = None