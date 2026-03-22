from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.favorite import Favorite
from app.models.restaurant import Restaurant
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/{restaurant_id}")
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        existing = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == restaurant_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Already in favorites")

        fav = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
        db.add(fav)
        db.commit()
        return {"message": "Added to favorites"}
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add favorite")

@router.get("/")
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch favorites")

@router.delete("/{restaurant_id}")
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        fav = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == restaurant_id
        ).first()
        if not fav:
            raise HTTPException(status_code=404, detail="Favorite not found")

        db.delete(fav)
        db.commit()
        return {"message": "Removed from favorites"}
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove favorite")