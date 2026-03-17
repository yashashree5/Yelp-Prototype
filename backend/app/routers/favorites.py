from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.favorite import Favorite
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/favorites", tags=["Favorites"])

# Add favorite
@router.post("/{restaurant_id}")
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    fav = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)

    db.add(fav)
    db.commit()

    return {"message": "Added to favorites"}

# List favorites
@router.get("/")
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).all()

# Remove favorite
@router.delete("/{restaurant_id}")
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    db.delete(fav)
    db.commit()

    return {"message": "Removed from favorites"}