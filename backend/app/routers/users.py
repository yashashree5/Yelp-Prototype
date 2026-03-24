from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.owner import RestaurantOwner
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.schemas.user import UserProfileUpdate
from app.schemas.owner import OwnerProfileUpdate
from app.utils.dependencies import get_current_reviewer, get_current_owner

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_reviewer)):
    try:
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "city": current_user.city,
            "state": current_user.state,
            "country": current_user.country,
            "gender": current_user.gender,
            "about_me": current_user.about_me,
            "languages": current_user.languages,
            "profile_pic": current_user.profile_pic,
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.put("/me")
def update_profile(
    data: UserProfileUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer)
):
    try:
        if data is None:
            raise HTTPException(status_code=400, detail="Invalid request body")
        if data.name is not None:
            current_user.name = data.name
        if data.email is not None:
            existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            current_user.email = data.email
        if data.phone is not None:
            current_user.phone = data.phone
        if data.city is not None:
            current_user.city = data.city
        if data.state is not None:
            normalized_state = data.state.strip().upper()
            if len(normalized_state) != 2:
                raise HTTPException(status_code=400, detail="State must be a 2-letter abbreviation")
            current_user.state = normalized_state
        if data.country is not None:
            current_user.country = data.country
        if data.gender is not None:
            current_user.gender = data.gender
        if data.about_me is not None:
            current_user.about_me = data.about_me
        if data.languages is not None:
            current_user.languages = data.languages
        if data.profile_pic is not None:
            current_user.profile_pic = data.profile_pic

        db.commit()
        db.refresh(current_user)
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "city": current_user.city,
            "state": current_user.state,
            "country": current_user.country,
            "gender": current_user.gender,
            "about_me": current_user.about_me,
            "languages": current_user.languages,
            "profile_pic": current_user.profile_pic,
        }
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/history")
def user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer)
):
    try:
        reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
        restaurants = db.query(Restaurant).filter(Restaurant.created_by_user_id == current_user.id).all()
        return {
            "reviews": reviews,
            "restaurants_added": restaurants
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch history")

@router.get("/owner/me", tags=["Owners"])
def get_owner_profile(current_owner: RestaurantOwner = Depends(get_current_owner)):
    return {
        "id": current_owner.id,
        "name": current_owner.name,
        "email": current_owner.email,
        "restaurant_location": current_owner.restaurant_location,
    }

@router.put("/owner/me", tags=["Owners"])
def update_owner_profile(
    data: OwnerProfileUpdate,
    db: Session = Depends(get_db),
    current_owner: RestaurantOwner = Depends(get_current_owner)
):
    try:
        if data.name is not None:
            current_owner.name = data.name
        if data.email is not None:
            existing = db.query(RestaurantOwner).filter(
                RestaurantOwner.email == data.email,
                RestaurantOwner.id != current_owner.id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            current_owner.email = data.email
        if data.restaurant_location is not None:
            current_owner.restaurant_location = data.restaurant_location

        db.commit()
        db.refresh(current_owner)
        return {
            "id": current_owner.id,
            "name": current_owner.name,
            "email": current_owner.email,
            "restaurant_location": current_owner.restaurant_location,
        }
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update owner profile")

@router.get("/owner/dashboard", tags=["Owners"])
def owner_dashboard(
    db: Session = Depends(get_db),
    current_owner: RestaurantOwner = Depends(get_current_owner)
):
    try:
        restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id).all()
        rest_ids = [r.id for r in restaurants]
        reviews = []
        if rest_ids:
            reviews = db.query(Review).filter(Review.restaurant_id.in_(rest_ids)).all()
        return {"restaurants": restaurants, "reviews": reviews}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch owner dashboard")