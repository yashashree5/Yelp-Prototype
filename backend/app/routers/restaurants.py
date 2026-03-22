from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.restaurant import Restaurant
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

# Create restaurant
@router.post("/")
def create_restaurant(
    name: str,
    cuisine: str = None,
    address: str = None,
    city: str = None,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = Restaurant(
        name=name,
        cuisine=cuisine,
        address=address,
        city=city,
        description=description,
        owner_id=current_user.id
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
    name: str = None,
    cuisine: str = None,
    address: str = None,
    city: str = None,
    description: str = None,
    hours: str = None,
    amenities: str = None,
    pricing_tier: int = None,
    contact: str = None,
    photos: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if name is not None: restaurant.name = name
    if cuisine is not None: restaurant.cuisine = cuisine
    if address is not None: restaurant.address = address
    if city is not None: restaurant.city = city
    if description is not None: restaurant.description = description
    if hours is not None: restaurant.hours = hours
    if amenities is not None: restaurant.amenities = amenities
    if pricing_tier is not None: restaurant.pricing_tier = pricing_tier
    if contact is not None: restaurant.contact = contact
    if photos is not None: restaurant.photos = photos

    db.commit()
    db.refresh(restaurant)
    return restaurant