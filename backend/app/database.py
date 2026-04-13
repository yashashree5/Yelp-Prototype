import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import ASCENDING, DESCENDING, MongoClient, ReturnDocument
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from pymongo.errors import OperationFailure

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "yelp_prototype")

client = MongoClient(MONGODB_URI)
db: Database = client[MONGODB_DB]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_indexes() -> None:
    try:
        db.users.create_index([("id", ASCENDING)], unique=True)
        db.users.create_index([("email", ASCENDING)], unique=True)

        db.restaurant_owners.create_index([("id", ASCENDING)], unique=True)
        db.restaurant_owners.create_index([("email", ASCENDING)], unique=True)

        db.restaurants.create_index([("id", ASCENDING)], unique=True)
        db.restaurants.create_index([("name", ASCENDING)])
        db.restaurants.create_index([("city", ASCENDING)])
        db.restaurants.create_index([("cuisine", ASCENDING)])

        db.reviews.create_index([("id", ASCENDING)], unique=True)
        db.reviews.create_index([("restaurant_id", ASCENDING), ("created_at", DESCENDING)])
        db.reviews.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

        db.favorites.create_index([("id", ASCENDING)], unique=True)
        db.favorites.create_index([("user_id", ASCENDING), ("restaurant_id", ASCENDING)], unique=True)

        db.user_preferences.create_index([("user_id", ASCENDING)], unique=True)

        db.sessions.create_index([("token", ASCENDING)], unique=True)
        db.sessions.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    except OperationFailure as exc:
        if exc.code == 13:
            raise RuntimeError(
                "MongoDB rejected index creation (Unauthorized). Set MONGODB_URI with valid credentials "
                "and grant a role with createIndex and readWrite on the target database."
            ) from exc
        raise


def get_next_id(counter_name: str) -> int:
    counter = db.counters.find_one_and_update(
        {"_id": counter_name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(counter["value"])


def sanitize_document(doc: dict | None) -> dict | None:
    if not doc:
        return None
    clean = dict(doc)
    clean.pop("_id", None)
    return clean


def create_with_increment(collection_name: str, payload: dict) -> dict:
    collection = db[collection_name]
    payload = dict(payload)
    payload["id"] = get_next_id(collection_name)
    collection.insert_one(payload)
    return payload


__all__ = [
    "DuplicateKeyError",
    "create_with_increment",
    "db",
    "ensure_indexes",
    "get_next_id",
    "sanitize_document",
    "utc_now",
]