from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.utils.dependencies import get_current_reviewer
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer)
):
    try:
        restaurant = db.query(Restaurant).filter(Restaurant.id == data.restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        review = Review(
            rating=data.rating,
            comment=data.comment,
            restaurant_id=data.restaurant_id,
            user_id=current_user.id
        )
        if data.photos is not None:
            review.photos = data.photos
        db.add(review)

        # Update restaurant average rating
        db.commit()
        db.refresh(review)

        all_reviews = db.query(Review).filter(Review.restaurant_id == data.restaurant_id).all()
        restaurant.average_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        restaurant.review_count = len(all_reviews)
        db.commit()

        return review
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create review")

@router.get("/restaurant/{restaurant_id}", response_model=list[ReviewResponse])
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

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer)
):
    try:
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this review")
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        review.rating = data.rating
        review.comment = data.comment
        if data.photos is not None:
            review.photos = data.photos
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
    current_user: User = Depends(get_current_reviewer)
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