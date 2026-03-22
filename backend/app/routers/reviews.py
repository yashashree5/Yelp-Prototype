from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/")
def create_review(
    restaurant_id: int,
    rating: float,
    comment: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        review = Review(
            rating=rating,
            comment=comment,
            restaurant_id=restaurant_id,
            user_id=current_user.id
        )
        db.add(review)

        # Update restaurant average rating
        db.commit()
        db.refresh(review)

        all_reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
        restaurant.average_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        restaurant.review_count = len(all_reviews)
        db.commit()

        return review
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create review")

@router.get("/restaurant/{restaurant_id}")
def get_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    try:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch reviews")

@router.put("/{review_id}")
def update_review(
    review_id: int,
    rating: float,
    comment: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this review")
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        review.rating = rating
        review.comment = comment
        db.commit()
        db.refresh(review)

        # Update restaurant average rating
        all_reviews = db.query(Review).filter(Review.restaurant_id == review.restaurant_id).all()
        restaurant = db.query(Restaurant).filter(Restaurant.id == review.restaurant_id).first()
        if restaurant:
            restaurant.average_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
            db.commit()

        return review
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update review")

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this review")

        restaurant_id = review.restaurant_id
        db.delete(review)
        db.commit()

        # Update restaurant average rating
        all_reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if restaurant:
            restaurant.average_rating = sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else 0
            restaurant.review_count = len(all_reviews)
            db.commit()

        return {"message": "Review deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete review")