from fastapi import APIRouter, Depends, HTTPException
from app.database import DuplicateKeyError, create_with_increment, db, sanitize_document, utc_now
from app.utils.dependencies import get_current_reviewer

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/{restaurant_id}")
def add_favorite(
    restaurant_id: int,
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        restaurant = db.restaurants.find_one({"id": restaurant_id})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        create_with_increment(
            "favorites",
            {
                "user_id": current_user["id"],
                "restaurant_id": restaurant_id,
                "created_at": utc_now(),
            },
        )
        return {"message": "Added to favorites"}
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Already in favorites")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to add favorite")

@router.get("/")
def list_favorites(
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        favs = [
            sanitize_document(f)
            for f in db.favorites.find({"user_id": current_user["id"]}).sort("created_at", -1)
        ]
        result = []
        for f in favs:
            r = sanitize_document(db.restaurants.find_one({"id": f["restaurant_id"]}))
            restaurant_data = None
            if r:
                restaurant_data = {
                    "id": r.get("id"),
                    "name": r.get("name"),
                    "cuisine": r.get("cuisine"),
                    "city": r.get("city"),
                    "address": r.get("address"),
                    "average_rating": r.get("average_rating", 0),
                    "review_count": r.get("review_count", 0),
                    "description": r.get("description"),
                    "pricing_tier": r.get("pricing_tier"),
                    "photos": r.get("photos"),
                }
            result.append({
                "id": f.get("id"),
                "restaurant_id": f.get("restaurant_id"),
                "created_at": f.get("created_at").isoformat() if f.get("created_at") else None,
                "restaurant": restaurant_data
            })
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch favorites")

@router.delete("/{restaurant_id}")
def remove_favorite(
    restaurant_id: int,
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        fav = db.favorites.find_one(
            {"user_id": current_user["id"], "restaurant_id": restaurant_id}
        )
        if not fav:
            raise HTTPException(status_code=404, detail="Favorite not found")

        db.favorites.delete_one({"_id": fav["_id"]})
        return {"message": "Removed from favorites"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to remove favorite")