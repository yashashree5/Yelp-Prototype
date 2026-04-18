import json
import logging

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.review_event import ReviewEvent
from app.utils.kafka_client import create_consumer


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("review-worker")


def recalc_restaurant_metrics(db: Session, restaurant_id: int) -> None:
    reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        return
    restaurant.review_count = len(reviews)
    restaurant.average_rating = (sum(r.rating for r in reviews) / len(reviews)) if reviews else 0


def process_create(db: Session, payload: dict) -> dict:
    review = Review(
        restaurant_id=payload["restaurant_id"],
        user_id=payload["user_id"],
        rating=payload["rating"],
        comment=payload.get("comment"),
        photos=payload.get("photos"),
    )
    db.add(review)
    db.flush()
    recalc_restaurant_metrics(db, payload["restaurant_id"])
    return {"review_id": review.id, "restaurant_id": payload["restaurant_id"]}


def process_update(db: Session, payload: dict) -> dict:
    review = db.query(Review).filter(Review.id == payload["review_id"]).first()
    if not review:
        raise ValueError("Review not found")
    if review.user_id != payload["user_id"]:
        raise PermissionError("Not authorized to update this review")
    review.rating = payload["rating"]
    review.comment = payload.get("comment")
    review.photos = payload.get("photos")
    recalc_restaurant_metrics(db, review.restaurant_id)
    return {"review_id": review.id, "restaurant_id": review.restaurant_id}


def process_delete(db: Session, payload: dict) -> dict:
    review = db.query(Review).filter(Review.id == payload["review_id"]).first()
    if not review:
        raise ValueError("Review not found")
    if review.user_id != payload["user_id"]:
        raise PermissionError("Not authorized to delete this review")
    restaurant_id = review.restaurant_id
    db.delete(review)
    db.flush()
    recalc_restaurant_metrics(db, restaurant_id)
    return {"review_id": payload["review_id"], "restaurant_id": restaurant_id}


def update_event_status(
    db: Session,
    event_id: str,
    status: str,
    result: dict | None = None,
    error: str | None = None,
) -> None:
    event_row = db.query(ReviewEvent).filter(ReviewEvent.event_id == event_id).first()
    if not event_row:
        logger.warning("No review_event row found for event_id=%s", event_id)
        return
    event_row.status = status
    if result is not None:
        event_row.result = json.dumps(result)
    if error is not None:
        event_row.error = error


def process_message(topic: str, payload: dict) -> None:
    event_id = payload.get("event_id")
    db = SessionLocal()
    try:
        update_event_status(db, event_id, "processing")
        db.flush()

        if topic == "review.created":
            result = process_create(db, payload)
        elif topic == "review.updated":
            result = process_update(db, payload)
        elif topic == "review.deleted":
            result = process_delete(db, payload)
        else:
            raise ValueError(f"Unsupported topic: {topic}")

        update_event_status(db, event_id, "completed", result=result)
        db.commit()
        logger.info("Processed event %s topic=%s", event_id, topic)
    except Exception as exc:
        db.rollback()
        try:
            update_event_status(db, event_id, "failed", error=str(exc))
            db.commit()
        except Exception:
            db.rollback()
        logger.exception("Failed processing event %s topic=%s: %s", event_id, topic, exc)
    finally:
        db.close()


def run() -> None:
    consumer = create_consumer(
        topics=["review.created", "review.updated", "review.deleted"],
        group_id="review-worker-group",
    )
    logger.info("Review worker started and listening to review topics")

    for message in consumer:
        process_message(message.topic, message.value)


if __name__ == "__main__":
    run()

