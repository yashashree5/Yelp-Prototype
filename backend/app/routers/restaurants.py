from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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

# Get all restaurants
@router.get("/")
def get_restaurants(
    db: Session = Depends(get_db),
    name: str = None,
    cuisine: str = None,
    city: str = None
):

    query = db.query(Restaurant)

    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))

    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))

    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))

    return query.all()

# Get single restaurant
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

# Update restaurant
@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    name: str = None,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if name:
        restaurant.name = name

    if description:
        restaurant.description = description

    db.commit()
    db.refresh(restaurant)

    return restaurant