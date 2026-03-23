from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.preferences import UserPreferences
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("/")
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
        if not prefs:
            return {
                "cuisines": None, "price_range": None,
                "location": None, "dietary_needs": None,
                "ambiance": None, "sort_by": None
            }
        return prefs
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch preferences")

@router.put("/")
def update_preferences(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        cuisines = data.get("cuisines")
        price_range = data.get("price_range")
        location = data.get("location")
        dietary_needs = data.get("dietary_needs")
        ambiance = data.get("ambiance")
        sort_by = data.get("sort_by")

        prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()

        if not prefs:
            prefs = UserPreferences(user_id=current_user.id)
            db.add(prefs)

        prefs.cuisines = cuisines
        prefs.price_range = price_range
        prefs.location = location
        prefs.dietary_needs = dietary_needs
        prefs.ambiance = ambiance
        prefs.sort_by = sort_by

        db.commit()
        db.refresh(prefs)
        return prefs
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update preferences")