from fastapi import APIRouter, Depends, HTTPException, Body
from app.database import db, sanitize_document
from app.utils.dependencies import get_current_reviewer

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("/")
def get_preferences(
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        prefs = sanitize_document(db.user_preferences.find_one({"user_id": current_user["id"]}))
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
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        updates = {
            "cuisines": data.get("cuisines"),
            "price_range": data.get("price_range"),
            "location": data.get("location"),
            "dietary_needs": data.get("dietary_needs"),
            "ambiance": data.get("ambiance"),
            "sort_by": data.get("sort_by"),
        }
        db.user_preferences.update_one(
            {"user_id": current_user["id"]},
            {"$set": updates, "$setOnInsert": {"user_id": current_user["id"]}},
            upsert=True,
        )
        return sanitize_document(db.user_preferences.find_one({"user_id": current_user["id"]}))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update preferences")