from fastapi import APIRouter, Depends, HTTPException
from app.database import create_with_increment, db, sanitize_document, utc_now
from app.utils.dependencies import get_current_reviewer
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def _update_restaurant_rating(restaurant_id: int) -> None:
    all_reviews = [sanitize_document(r) for r in db.reviews.find({"restaurant_id": restaurant_id})]
    review_count = len(all_reviews)
    average_rating = (sum(r["rating"] for r in all_reviews) / review_count) if review_count else 0
    db.restaurants.update_one(
        {"id": restaurant_id},
        {"$set": {"average_rating": average_rating, "review_count": review_count}},
    )


@router.post("/", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        restaurant = db.restaurants.find_one({"id": data.restaurant_id})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        review = create_with_increment(
            "reviews",
            {
                "rating": data.rating,
                "comment": data.comment,
                "restaurant_id": data.restaurant_id,
                "user_id": current_user["id"],
                "photos": data.photos,
                "created_at": utc_now(),
                "updated_at": None,
            },
        )
        _update_restaurant_rating(data.restaurant_id)

        return review
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create review")

@router.get("/restaurant/{restaurant_id}", response_model=list[ReviewResponse])
def get_reviews(restaurant_id: int):
    try:
        restaurant = db.restaurants.find_one({"id": restaurant_id})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return [
            sanitize_document(r)
            for r in db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1)
        ]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch reviews")

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        review = sanitize_document(db.reviews.find_one({"id": review_id}))
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to edit this review")
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        updates = {
            "rating": data.rating,
            "comment": data.comment,
            "updated_at": utc_now(),
        }
        if data.photos is not None:
            updates["photos"] = data.photos
        db.reviews.update_one({"id": review_id}, {"$set": updates})
        updated_review = sanitize_document(db.reviews.find_one({"id": review_id}))

        _update_restaurant_rating(updated_review["restaurant_id"])

        return updated_review
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update review")

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    current_user: dict = Depends(get_current_reviewer)
):
    try:
        review = sanitize_document(db.reviews.find_one({"id": review_id}))
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        if review["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this review")

        restaurant_id = review["restaurant_id"]
        db.reviews.delete_one({"id": review_id})
        _update_restaurant_rating(restaurant_id)

        return {"message": "Review deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete review")