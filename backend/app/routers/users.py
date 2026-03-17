from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.schemas.user import UserResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# Get current user profile
@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Update profile
@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserResponse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user

# User history (reviews + restaurants added)
@router.get("/history")
def user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()

    return {
        "reviews": reviews,
        "restaurants_added": restaurants
    }