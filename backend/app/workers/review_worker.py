import json
import logging
import time

from app.database import db, sanitize_document, utc_now
from app.utils.kafka_client import create_consumer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("review-worker")


def recalc_restaurant_metrics(restaurant_id: int) -> None:
    reviews = list(db.reviews.find({"restaurant_id": restaurant_id}))
    count = len(reviews)
    avg = (sum(r["rating"] for r in reviews) / count) if count else 0.0
    db.restaurants.update_one(
        {"id": restaurant_id},
        {"$set": {"review_count": count, "average_rating": round(avg, 2)}},
    )


def process_create(payload: dict) -> dict:
    from app.database import get_next_id
    review_id = get_next_id("reviews")
    review = {
        "id": review_id,
        "restaurant_id": payload["restaurant_id"],
        "user_id": payload["user_id"],
        "rating": payload["rating"],
        "comment": payload.get("comment"),
        "photos": payload.get("photos"),
        "created_at": utc_now(),
    }
    db.reviews.insert_one(review)
    recalc_restaurant_metrics(payload["restaurant_id"])
    logger.info("review.created: review_id=%s restaurant_id=%s", review_id, payload["restaurant_id"])
    return {"review_id": review_id, "restaurant_id": payload["restaurant_id"]}


def process_update(payload: dict) -> dict:
    review = sanitize_document(db.reviews.find_one({"id": payload["review_id"]}))
    if not review:
        raise ValueError("Review not found")
    if review["user_id"] != payload["user_id"]:
        raise PermissionError("Not authorized to update this review")
    db.reviews.update_one(
        {"id": payload["review_id"]},
        {"$set": {
            "rating": payload["rating"],
            "comment": payload.get("comment"),
            "photos": payload.get("photos"),
            "updated_at": utc_now(),
        }},
    )
    recalc_restaurant_metrics(review["restaurant_id"])
    logger.info("review.updated: review_id=%s", payload["review_id"])
    return {"review_id": payload["review_id"], "restaurant_id": review["restaurant_id"]}


def process_delete(payload: dict) -> dict:
    review = sanitize_document(db.reviews.find_one({"id": payload["review_id"]}))
    if not review:
        raise ValueError("Review not found")
    if review["user_id"] != payload["user_id"]:
        raise PermissionError("Not authorized to delete this review")
    restaurant_id = review["restaurant_id"]
    db.reviews.delete_one({"id": payload["review_id"]})
    recalc_restaurant_metrics(restaurant_id)
    logger.info("review.deleted: review_id=%s", payload["review_id"])
    return {"review_id": payload["review_id"], "restaurant_id": restaurant_id}


def update_event_status(event_id: str, status: str, result: dict = None, error: str = None) -> None:
    update = {"status": status}
    if result is not None:
        update["result"] = json.dumps(result)
    if error is not None:
        update["error"] = error
    db.review_events.update_one({"event_id": event_id}, {"$set": update})


def process_message(topic: str, payload: dict) -> None:
    event_id = payload.get("event_id")
    try:
        update_event_status(event_id, "processing")
        if topic == "review.created":
            result = process_create(payload)
        elif topic == "review.updated":
            result = process_update(payload)
        elif topic == "review.deleted":
            result = process_delete(payload)
        else:
            raise ValueError(f"Unsupported topic: {topic}")
        update_event_status(event_id, "completed", result=result)
        logger.info("Processed event %s topic=%s", event_id, topic)
    except Exception as exc:
        update_event_status(event_id, "failed", error=str(exc))
        logger.exception("Failed event %s topic=%s: %s", event_id, topic, exc)


def create_consumer_with_retry(retries: int = 10, delay: int = 5):
    """Retry connecting to Kafka until it's ready."""
    for attempt in range(1, retries + 1):
        try:
            logger.info("Connecting to Kafka (attempt %d/%d)...", attempt, retries)
            consumer = create_consumer(
                topics=["review.created", "review.updated", "review.deleted"],
                group_id="review-worker-group",
            )
            logger.info("Successfully connected to Kafka!")
            return consumer
        except Exception as exc:
            logger.warning("Kafka not ready yet: %s. Retrying in %ds...", exc, delay)
            time.sleep(delay)
    raise RuntimeError("Could not connect to Kafka after multiple retries")


def run() -> None:
    consumer = create_consumer_with_retry()
    logger.info("Review worker started — listening to review topics")
    for message in consumer:
        process_message(message.topic, message.value)


if __name__ == "__main__":
    run()
