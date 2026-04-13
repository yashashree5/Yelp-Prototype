from fastapi import APIRouter, Depends, HTTPException
from app.database import create_with_increment, db, sanitize_document, utc_now
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate
from app.utils.dependencies import get_current_auth, get_current_owner
router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

# Create restaurant
@router.post("/")
def create_restaurant(
    data: RestaurantCreate,
    token_data = Depends(get_current_auth)
):
    owner_id = None
    created_by_user_id = None
    if token_data["role"] == "owner":
        owner_id = token_data["principal"]["id"]
    elif token_data["role"] == "user":
        created_by_user_id = token_data["principal"]["id"]

    restaurant = create_with_increment(
        "restaurants",
        {
            "name": data.name,
            "cuisine": data.cuisine,
            "address": data.address,
            "city": data.city,
            "description": data.description,
            "amenities": data.amenities,
            "hours": data.hours,
            "pricing_tier": data.pricing_tier,
            "contact": data.contact,
            "photos": data.photos,
            "average_rating": 0.0,
            "review_count": 0,
            "owner_id": owner_id,
            "created_by_user_id": created_by_user_id,
            "created_at": utc_now(),
        },
    )
    return restaurant

# Get all restaurants with keyword search
@router.get("/")
def get_restaurants(
    name: str = None,
    cuisine: str = None,
    city: str = None,
    keyword: str = None,
    search: str = None
):
    filters = []
    if name:
        filters.append({"name": {"$regex": name, "$options": "i"}})
    if cuisine:
        filters.append({"cuisine": {"$regex": cuisine, "$options": "i"}})
    if city:
        filters.append({"city": {"$regex": city, "$options": "i"}})
    if search:
        filters.append(
            {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"cuisine": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"amenities": {"$regex": search, "$options": "i"}},
                    {"city": {"$regex": search, "$options": "i"}},
                ]
            }
        )
    if keyword:
        filters.append(
            {
                "$or": [
                    {"description": {"$regex": keyword, "$options": "i"}},
                    {"amenities": {"$regex": keyword, "$options": "i"}},
                    {"name": {"$regex": keyword, "$options": "i"}},
                ]
            }
        )

    query = {"$and": filters} if filters else {}
    return [sanitize_document(r) for r in db.restaurants.find(query).sort("id", 1)]

# Get unclaimed restaurants (available for owners to claim)
@router.get("/unclaimed")
def get_unclaimed_restaurants():
    return [sanitize_document(r) for r in db.restaurants.find({"owner_id": None}).sort("id", 1)]

# Get single restaurant
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int):
    restaurant = sanitize_document(db.restaurants.find_one({"id": restaurant_id}))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

# Update restaurant
@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    data: RestaurantUpdate,
    current_owner: dict = Depends(get_current_owner)
):
    restaurant = sanitize_document(db.restaurants.find_one({"id": restaurant_id}))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.get("owner_id") is None:
        raise HTTPException(status_code=403, detail="Restaurant must be claimed before updating")
    if restaurant.get("owner_id") != current_owner["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this restaurant")

    updates = {}
    if data.name is not None:
        updates["name"] = data.name
    if data.cuisine is not None:
        updates["cuisine"] = data.cuisine
    if data.address is not None:
        updates["address"] = data.address
    if data.city is not None:
        updates["city"] = data.city
    if data.description is not None:
        updates["description"] = data.description
    if data.hours is not None:
        updates["hours"] = data.hours
    if data.amenities is not None:
        updates["amenities"] = data.amenities
    if data.pricing_tier is not None:
        updates["pricing_tier"] = data.pricing_tier
    if data.contact is not None:
        updates["contact"] = data.contact
    if data.photos is not None:
        updates["photos"] = data.photos

    if updates:
        db.restaurants.update_one({"id": restaurant_id}, {"$set": updates})
    return sanitize_document(db.restaurants.find_one({"id": restaurant_id}))


# Claim a restaurant (owner claims an existing unowned listing)
@router.post("/{restaurant_id}/claim")
def claim_restaurant(
    restaurant_id: int,
    current_owner: dict = Depends(get_current_owner)
):
    try:
        restaurant = sanitize_document(db.restaurants.find_one({"id": restaurant_id}))
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        if restaurant.get("owner_id") is not None and restaurant["owner_id"] != current_owner["id"]:
            raise HTTPException(status_code=400, detail="Restaurant already claimed by another owner")
        if restaurant.get("owner_id") == current_owner["id"]:
            return {"message": "You already own this restaurant", "restaurant_id": restaurant["id"]}

        db.restaurants.update_one({"id": restaurant_id}, {"$set": {"owner_id": current_owner["id"]}})
        return {"message": "Restaurant claimed successfully", "restaurant_id": restaurant["id"]}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Claim failed: {str(e)}")