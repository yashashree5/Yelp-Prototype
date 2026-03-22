from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    try:
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "city": current_user.city,
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
    name: str = None,
    email: str = None,
    phone: str = None,
    city: str = None,
    country: str = None,
    gender: str = None,
    about_me: str = None,
    languages: str = None,
    profile_pic: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if name is not None: current_user.name = name
        if email is not None:
            existing = db.query(User).filter(User.email == email, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            current_user.email = email
        if phone is not None: current_user.phone = phone
        if city is not None: current_user.city = city
        if country is not None: current_user.country = country
        if gender is not None: current_user.gender = gender
        if about_me is not None: current_user.about_me = about_me
        if languages is not None: current_user.languages = languages
        if profile_pic is not None: current_user.profile_pic = profile_pic

        db.commit()
        db.refresh(current_user)
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "city": current_user.city,
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
    current_user: User = Depends(get_current_user)
):
    try:
        reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
        restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()
        return {
            "reviews": reviews,
            "restaurants_added": restaurants
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch history")