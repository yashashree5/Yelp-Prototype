import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import db, sanitize_document, utc_now
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.utils.dependencies import get_current_reviewer
from app.utils.kafka_client import publish_event

router = APIRouter(prefix="/reviews/async", tags=["Reviews Async"])


def _to_iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    if isinstance(dt, str):
        return dt
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def _queue_event(topic: str, payload: dict) -> str:
    event_id = uuid.uuid4().hex
    payload["event_id"] = event_id
    payload["queued_at"] = datetime.now(timezone.utc).isoformat()

    db.review_events.insert_one({
        "event_id": event_id,
        "topic": topic,
        "status": "queued",
        "payload": json.dumps(payload),
        "created_by_user_id": payload.get("user_id"),
        "restaurant_id": payload.get("restaurant_id"),
        "rating": payload.get("rating"),
        "created_at": utc_now(),
        "updated_at": utc_now(),
        "result": None,
        "error": None,
    })
    publish_event(topic, payload)
    return event_id


@router.post("/create")
def queue_create_review(
    data: ReviewCreate,
    current_user: dict = Depends(get_current_reviewer),
):
    restaurant = sanitize_document(db.restaurants.find_one({"id": data.restaurant_id}))
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    payload = {
        "operation": "create",
        "user_id": current_user["id"],
        "restaurant_id": data.restaurant_id,
        "rating": data.rating,
        "comment": data.comment,
        "photos": data.photos,
    }
    event_id = _queue_event("review.created", payload)
    return {"event_id": event_id, "topic": "review.created", "status": "queued"}


@router.put("/update/{review_id}")
def queue_update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: dict = Depends(get_current_reviewer),
):
    review = sanitize_document(db.reviews.find_one({"id": review_id}))
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this review")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    payload = {
        "operation": "update",
        "review_id": review_id,
        "user_id": current_user["id"],
        "restaurant_id": review["restaurant_id"],
        "rating": data.rating,
        "comment": data.comment,
        "photos": data.photos,
    }
    event_id = _queue_event("review.updated", payload)
    return {"event_id": event_id, "topic": "review.updated", "status": "queued"}


@router.delete("/delete/{review_id}")
def queue_delete_review(
    review_id: int,
    current_user: dict = Depends(get_current_reviewer),
):
    review = sanitize_document(db.reviews.find_one({"id": review_id}))
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    payload = {
        "operation": "delete",
        "review_id": review_id,
        "user_id": current_user["id"],
        "restaurant_id": review["restaurant_id"],
        "rating": review["rating"],
    }
    event_id = _queue_event("review.deleted", payload)
    return {"event_id": event_id, "topic": "review.deleted", "status": "queued"}


@router.get("/events/{event_id}")
def get_review_event_status(event_id: str):
    event = sanitize_document(db.review_events.find_one({"event_id": event_id}))
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    result_payload = None
    if event.get("result"):
        try:
            result_payload = json.loads(event["result"])
        except (json.JSONDecodeError, TypeError):
            result_payload = {"raw": event["result"]}

    return {
        "event_id": event["event_id"],
        "topic": event["topic"],
        "status": event["status"],
        "error": event.get("error"),
        "result": result_payload,
        "created_at": _to_iso(event.get("created_at")),
        "updated_at": _to_iso(event.get("updated_at")),
    }
