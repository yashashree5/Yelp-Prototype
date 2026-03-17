from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import Review
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# Create review
@router.post("/")
def create_review(
    restaurant_id: int,
    rating: float,
    comment: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = Review(
        rating=rating,
        comment=comment,
        restaurant_id=restaurant_id,
        user_id=current_user.id
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review

# List restaurant reviews
@router.get("/restaurant/{restaurant_id}")
def get_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.restaurant_id == restaurant_id).all()

# Update review
@router.put("/{review_id}")
def update_review(
    review_id: int,
    rating: float,
    comment: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = db.query(Review).filter(Review.id == review_id).first()

    if review.user_id != current_user.id:
        return {"error": "Not allowed"}

    review.rating = rating
    review.comment = comment

    db.commit()
    db.refresh(review)

    return review

# Delete review
@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = db.query(Review).filter(Review.id == review_id).first()

    if review.user_id != current_user.id:
        return {"error": "Not allowed"}

    db.delete(review)
    db.commit()

    return {"message": "Review deleted"}