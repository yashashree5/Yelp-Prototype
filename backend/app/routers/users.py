from fastapi import APIRouter, Depends, HTTPException
from app.database import db, sanitize_document
from app.schemas.user import UserProfileUpdate
from app.schemas.owner import OwnerProfileUpdate
from app.utils.dependencies import get_current_reviewer, get_current_owner

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_reviewer)):
    try:
        return {
            "id": current_user.get("id"),
            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "phone": current_user.get("phone"),
            "city": current_user.get("city"),
            "state": current_user.get("state"),
            "country": current_user.get("country"),
            "gender": current_user.get("gender"),
            "about_me": current_user.get("about_me"),
            "languages": current_user.get("languages"),
            "profile_pic": current_user.get("profile_pic"),
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.put("/me")
def update_profile(
    data: UserProfileUpdate = None,
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        if data is None:
            raise HTTPException(status_code=400, detail="Invalid request body")
        updates = {}
        if data.name is not None:
            updates["name"] = data.name
        if data.email is not None:
            existing = db.users.find_one({"email": data.email, "id": {"$ne": current_user["id"]}})
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            updates["email"] = data.email
        if data.phone is not None:
            updates["phone"] = data.phone
        if data.city is not None:
            updates["city"] = data.city
        if data.state is not None:
            normalized_state = data.state.strip().upper()
            if len(normalized_state) != 2:
                raise HTTPException(status_code=400, detail="State must be a 2-letter abbreviation")
            updates["state"] = normalized_state
        if data.country is not None:
            updates["country"] = data.country
        if data.gender is not None:
            updates["gender"] = data.gender
        if data.about_me is not None:
            updates["about_me"] = data.about_me
        if data.languages is not None:
            updates["languages"] = data.languages
        if data.profile_pic is not None:
            updates["profile_pic"] = data.profile_pic

        if updates:
            db.users.update_one({"id": current_user["id"]}, {"$set": updates})
        updated_user = sanitize_document(db.users.find_one({"id": current_user["id"]}))
        return {
            "id": updated_user.get("id"),
            "name": updated_user.get("name"),
            "email": updated_user.get("email"),
            "phone": updated_user.get("phone"),
            "city": updated_user.get("city"),
            "state": updated_user.get("state"),
            "country": updated_user.get("country"),
            "gender": updated_user.get("gender"),
            "about_me": updated_user.get("about_me"),
            "languages": updated_user.get("languages"),
            "profile_pic": updated_user.get("profile_pic"),
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/history")
def user_history(
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        reviews = [sanitize_document(r) for r in db.reviews.find({"user_id": current_user["id"]})]
        restaurants = [
            sanitize_document(r)
            for r in db.restaurants.find({"created_by_user_id": current_user["id"]})
        ]
        return {
            "reviews": reviews,
            "restaurants_added": restaurants
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch history")

@router.get("/owner/me", tags=["Owners"])
def get_owner_profile(current_owner: dict = Depends(get_current_owner)):
    return {
        "id": current_owner.get("id"),
        "name": current_owner.get("name"),
        "email": current_owner.get("email"),
        "restaurant_location": current_owner.get("restaurant_location"),
    }

@router.put("/owner/me", tags=["Owners"])
def update_owner_profile(
    data: OwnerProfileUpdate,
    current_owner: dict = Depends(get_current_owner)
):
    try:
        updates = {}
        if data.name is not None:
            updates["name"] = data.name
        if data.email is not None:
            existing = db.restaurant_owners.find_one(
                {"email": data.email, "id": {"$ne": current_owner["id"]}}
            )
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            updates["email"] = data.email
        if data.restaurant_location is not None:
            updates["restaurant_location"] = data.restaurant_location

        if updates:
            db.restaurant_owners.update_one({"id": current_owner["id"]}, {"$set": updates})
        updated_owner = sanitize_document(db.restaurant_owners.find_one({"id": current_owner["id"]}))
        return {
            "id": updated_owner.get("id"),
            "name": updated_owner.get("name"),
            "email": updated_owner.get("email"),
            "restaurant_location": updated_owner.get("restaurant_location"),
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update owner profile")

@router.get("/owner/dashboard", tags=["Owners"])
def owner_dashboard(
    current_owner: dict = Depends(get_current_owner)
):
    try:
        restaurants = [sanitize_document(r) for r in db.restaurants.find({"owner_id": current_owner["id"]})]
        rest_ids = [r["id"] for r in restaurants]
        reviews = [
            sanitize_document(r)
            for r in db.reviews.find({"restaurant_id": {"$in": rest_ids}})
        ] if rest_ids else []
        return {"restaurants": restaurants, "reviews": reviews}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch owner dashboard")