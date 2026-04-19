import logging
import time

from app.database import db, sanitize_document, utc_now
from app.utils.kafka_client import create_consumer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("restaurant-worker")


def process_created(payload: dict) -> None:
    restaurant_id = payload.get("restaurant_id")
    restaurant = sanitize_document(db.restaurants.find_one({"id": restaurant_id}))
    if not restaurant:
        logger.warning("restaurant.created: restaurant %s not found in DB", restaurant_id)
        return
    db.restaurants.update_one({"id": restaurant_id}, {"$set": {"indexed_at": utc_now()}})
    logger.info("restaurant.created: processed restaurant_id=%s", restaurant_id)


def process_updated(payload: dict) -> None:
    restaurant_id = payload.get("restaurant_id")
    restaurant = sanitize_document(db.restaurants.find_one({"id": restaurant_id}))
    if not restaurant:
        logger.warning("restaurant.updated: restaurant %s not found", restaurant_id)
        return
    db.restaurants.update_one({"id": restaurant_id}, {"$set": {"last_updated_at": utc_now()}})
    logger.info("restaurant.updated: processed restaurant_id=%s", restaurant_id)


def process_claimed(payload: dict) -> None:
    restaurant_id = payload.get("restaurant_id")
    owner_id = payload.get("owner_id")
    restaurant = sanitize_document(db.restaurants.find_one({"id": restaurant_id}))
    if not restaurant:
        logger.warning("restaurant.claimed: restaurant %s not found", restaurant_id)
        return
    db.restaurants.update_one(
        {"id": restaurant_id},
        {"$set": {"owner_id": owner_id, "claimed_at": utc_now()}},
    )
    logger.info("restaurant.claimed: restaurant_id=%s owner_id=%s", restaurant_id, owner_id)


HANDLERS = {
    "restaurant.created": process_created,
    "restaurant.updated": process_updated,
    "restaurant.claimed": process_claimed,
}


def process_message(topic: str, payload: dict) -> None:
    handler = HANDLERS.get(topic)
    if not handler:
        logger.warning("No handler for topic: %s", topic)
        return
    try:
        handler(payload)
    except Exception as exc:
        logger.exception("Failed processing topic=%s error=%s", topic, exc)


def create_consumer_with_retry(retries: int = 10, delay: int = 5):
    for attempt in range(1, retries + 1):
        try:
            logger.info("Connecting to Kafka (attempt %d/%d)...", attempt, retries)
            consumer = create_consumer(
                topics=["restaurant.created", "restaurant.updated", "restaurant.claimed"],
                group_id="restaurant-worker-group",
            )
            logger.info("Successfully connected to Kafka!")
            return consumer
        except Exception as exc:
            logger.warning("Kafka not ready: %s. Retrying in %ds...", exc, delay)
            time.sleep(delay)
    raise RuntimeError("Could not connect to Kafka after retries")


def run() -> None:
    consumer = create_consumer_with_retry()
    logger.info("Restaurant worker started — listening to restaurant topics")
    for message in consumer:
        process_message(message.topic, message.value)


if __name__ == "__main__":
    run()
