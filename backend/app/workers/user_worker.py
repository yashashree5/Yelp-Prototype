import logging
import time

from app.database import db, sanitize_document, utc_now
from app.utils.kafka_client import create_consumer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("user-worker")


def process_user_created(payload: dict) -> None:
    user_id = payload.get("user_id")
    user = sanitize_document(db.users.find_one({"id": user_id}))
    if not user:
        logger.warning("user.created: user_id=%s not found", user_id)
        return
    existing_prefs = db.user_preferences.find_one({"user_id": user_id})
    if not existing_prefs:
        db.user_preferences.insert_one({
            "user_id": user_id,
            "cuisine_preferences": [],
            "price_range": None,
            "dietary_needs": [],
            "ambiance_preferences": [],
            "sort_preference": "rating",
            "preferred_locations": [],
            "created_at": utc_now(),
        })
    logger.info("user.created: processed user_id=%s", user_id)


def process_user_updated(payload: dict) -> None:
    user_id = payload.get("user_id")
    user = sanitize_document(db.users.find_one({"id": user_id}))
    if not user:
        logger.warning("user.updated: user_id=%s not found", user_id)
        return
    db.users.update_one({"id": user_id}, {"$set": {"last_activity_at": utc_now()}})
    logger.info("user.updated: processed user_id=%s", user_id)


HANDLERS = {
    "user.created": process_user_created,
    "user.updated": process_user_updated,
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
                topics=["user.created", "user.updated"],
                group_id="user-worker-group",
            )
            logger.info("Successfully connected to Kafka!")
            return consumer
        except Exception as exc:
            logger.warning("Kafka not ready: %s. Retrying in %ds...", exc, delay)
            time.sleep(delay)
    raise RuntimeError("Could not connect to Kafka after retries")


def run() -> None:
    consumer = create_consumer_with_retry()
    logger.info("User worker started — listening to user topics")
    for message in consumer:
        process_message(message.topic, message.value)


if __name__ == "__main__":
    run()
