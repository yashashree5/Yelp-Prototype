from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.preferences import UserPreferences
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/preferences", tags=["Preferences"])

# Get preferences
@router.get("/")
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    return prefs

# Update preferences
@router.put("/")
def update_preferences(
    cuisines: str = None,
    price_range: str = None,
    location: str = None,
    dietary_needs: str = None,
    ambiance: str = None,
    sort_by: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

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