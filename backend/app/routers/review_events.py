import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.review_event import ReviewEvent
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.utils.dependencies import get_current_reviewer
from app.utils.kafka_client import publish_event

router = APIRouter(prefix="/reviews/async", tags=["Reviews Async"])


def _to_iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


@router.post("/create")
def queue_create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    event_id = uuid.uuid4().hex
    payload = {
        "event_id": event_id,
        "operation": "create",
        "user_id": current_user.id,
        "restaurant_id": data.restaurant_id,
        "rating": data.rating,
        "comment": data.comment,
        "photos": data.photos,
        "queued_at": datetime.now(timezone.utc).isoformat(),
    }

    event_row = ReviewEvent(
        event_id=event_id,
        topic="review.created",
        status="queued",
        payload=json.dumps(payload),
        created_by_user_id=current_user.id,
        restaurant_id=data.restaurant_id,
        rating=data.rating,
    )
    db.add(event_row)
    db.commit()

    publish_event("review.created", payload)
    return {"event_id": event_id, "topic": "review.created", "status": "queued"}


@router.put("/update/{review_id}")
def queue_update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this review")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    event_id = uuid.uuid4().hex
    payload = {
        "event_id": event_id,
        "operation": "update",
        "review_id": review_id,
        "user_id": current_user.id,
        "restaurant_id": review.restaurant_id,
        "rating": data.rating,
        "comment": data.comment,
        "photos": data.photos,
        "queued_at": datetime.now(timezone.utc).isoformat(),
    }

    event_row = ReviewEvent(
        event_id=event_id,
        topic="review.updated",
        status="queued",
        payload=json.dumps(payload),
        created_by_user_id=current_user.id,
        restaurant_id=review.restaurant_id,
        rating=data.rating,
    )
    db.add(event_row)
    db.commit()

    publish_event("review.updated", payload)
    return {"event_id": event_id, "topic": "review.updated", "status": "queued"}


@router.delete("/delete/{review_id}")
def queue_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    event_id = uuid.uuid4().hex
    payload = {
        "event_id": event_id,
        "operation": "delete",
        "review_id": review_id,
        "user_id": current_user.id,
        "restaurant_id": review.restaurant_id,
        "queued_at": datetime.now(timezone.utc).isoformat(),
    }

    event_row = ReviewEvent(
        event_id=event_id,
        topic="review.deleted",
        status="queued",
        payload=json.dumps(payload),
        created_by_user_id=current_user.id,
        restaurant_id=review.restaurant_id,
        rating=review.rating,
    )
    db.add(event_row)
    db.commit()

    publish_event("review.deleted", payload)
    return {"event_id": event_id, "topic": "review.deleted", "status": "queued"}


@router.get("/events/{event_id}")
def get_review_event_status(event_id: str, db: Session = Depends(get_db)):
    event = db.query(ReviewEvent).filter(ReviewEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    result_payload = None
    if event.result:
        try:
            result_payload = json.loads(event.result)
        except json.JSONDecodeError:
            result_payload = {"raw": event.result}

    return {
        "event_id": event.event_id,
        "topic": event.topic,
        "status": event.status,
        "error": event.error,
        "result": result_payload,
        "created_at": _to_iso(event.created_at),
        "updated_at": _to_iso(event.updated_at),
    }

