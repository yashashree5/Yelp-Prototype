from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.owner import RestaurantOwner
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate
from app.utils.dependencies import get_current_auth, get_current_owner
router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

# Create restaurant
@router.post("/")
def create_restaurant(
    data: RestaurantCreate,
    db: Session = Depends(get_db),
    token_data = Depends(get_current_auth)
):
    owner_id = None
    created_by_user_id = None
    if token_data["role"] == "owner":
        owner_id = token_data["principal"].id
    elif token_data["role"] == "user":
        created_by_user_id = token_data["principal"].id

    restaurant = Restaurant(
        name=data.name,
        cuisine=data.cuisine,
        address=data.address,
        city=data.city,
        description=data.description,
        amenities=data.amenities,
        hours=data.hours,
        pricing_tier=data.pricing_tier,
        contact=data.contact,
        photos=data.photos,
        owner_id=owner_id,
        created_by_user_id=created_by_user_id,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant

# Get all restaurants with keyword search
@router.get("/")
def get_restaurants(
    db: Session = Depends(get_db),
    name: str = None,
    cuisine: str = None,
    city: str = None,
    keyword: str = None,
    search: str = None
):
    query = db.query(Restaurant)

    # General search across name, cuisine, description, amenities
    if search:
        query = query.filter(
            or_(
                Restaurant.name.ilike(f"%{search}%"),
                Restaurant.cuisine.ilike(f"%{search}%"),
                Restaurant.description.ilike(f"%{search}%"),
                Restaurant.amenities.ilike(f"%{search}%"),
                Restaurant.city.ilike(f"%{search}%"),
            )
        )

    # Specific filters
    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))

    # Keyword search across description and amenities
    if keyword:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{keyword}%"),
                Restaurant.amenities.ilike(f"%{keyword}%"),
                Restaurant.name.ilike(f"%{keyword}%"),
            )
        )

    return query.all()

# Get unclaimed restaurants (available for owners to claim)
@router.get("/unclaimed")
def get_unclaimed_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).filter(Restaurant.owner_id == None).all()

# Get single restaurant
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

# Update restaurant
@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    data: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_owner: RestaurantOwner = Depends(get_current_owner)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id is None:
        raise HTTPException(status_code=403, detail="Restaurant must be claimed before updating")
    if restaurant.owner_id != current_owner.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this restaurant")

    if data.name is not None: restaurant.name = data.name
    if data.cuisine is not None: restaurant.cuisine = data.cuisine
    if data.address is not None: restaurant.address = data.address
    if data.city is not None: restaurant.city = data.city
    if data.description is not None: restaurant.description = data.description
    if data.hours is not None: restaurant.hours = data.hours
    if data.amenities is not None: restaurant.amenities = data.amenities
    if data.pricing_tier is not None: restaurant.pricing_tier = data.pricing_tier
    if data.contact is not None: restaurant.contact = data.contact
    if data.photos is not None: restaurant.photos = data.photos

    db.commit()
    db.refresh(restaurant)
    return restaurant


# Claim a restaurant (owner claims an existing unowned listing)
@router.post("/{restaurant_id}/claim")
def claim_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_owner: RestaurantOwner = Depends(get_current_owner)
):
    try:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        if restaurant.owner_id is not None and restaurant.owner_id != current_owner.id:
            raise HTTPException(status_code=400, detail="Restaurant already claimed by another owner")
        if restaurant.owner_id == current_owner.id:
            return {"message": "You already own this restaurant", "restaurant_id": restaurant.id}

        restaurant.owner_id = current_owner.id
        db.commit()
        return {"message": "Restaurant claimed successfully", "restaurant_id": restaurant.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Claim failed: {str(e)}")