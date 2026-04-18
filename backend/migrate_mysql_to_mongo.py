import os
from typing import Any

from dotenv import load_dotenv
from sqlalchemy import MetaData, Table, create_engine, inspect, select

from app.database import db, ensure_indexes
from app.utils.hashing import hash_password

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required for migration")

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)
metadata = MetaData()


def normalize_password(value: str | None) -> str | None:
    if not value:
        return value
    if value.startswith("$2a$") or value.startswith("$2b$") or value.startswith("$2y$"):
        return value
    return hash_password(value)


def load_table(table_name: str) -> list[dict[str, Any]]:
    if table_name not in inspector.get_table_names():
        return []
    table = Table(table_name, metadata, autoload_with=engine)
    with engine.connect() as conn:
        rows = conn.execute(select(table)).mappings().all()
    return [dict(row) for row in rows]


def clear_target_collections() -> None:
    targets = [
        "users",
        "restaurant_owners",
        "restaurants",
        "reviews",
        "favorites",
        "photos",
        "sessions",
        "activity_logs",
    ]
    for collection in targets:
        db[collection].delete_many({})


def write_collection(collection: str, docs: list[dict[str, Any]]) -> tuple[int, int]:
    source_count = len(docs)
    if not docs:
        return source_count, 0

    cleaned: list[dict[str, Any]] = []
    for doc in docs:
        item = {k: v for k, v in doc.items()}
        if collection in {"users", "restaurant_owners"}:
            item["hashed_password"] = normalize_password(item.get("hashed_password"))
        cleaned.append(item)

    db[collection].insert_many(cleaned)
    return source_count, len(cleaned)


def backfill_counter(collection: str) -> None:
    max_doc = db[collection].find_one(sort=[("id", -1)])
    max_id = int(max_doc.get("id", 0)) if max_doc else 0
    db.counters.update_one(
        {"_id": collection},
        {"$set": {"value": max_id}},
        upsert=True,
    )


def migrate() -> None:
    if not os.getenv("MONGODB_URI"):
        raise RuntimeError(
            "MONGODB_URI is not set. Configure backend/.env with Mongo credentials before running migration."
        )
    if not os.getenv("MONGODB_DB"):
        raise RuntimeError(
            "MONGODB_DB is not set. Configure backend/.env with the target Mongo database name."
        )

    ensure_indexes()
    clear_target_collections()

    source_map = {
        "users": "users",
        "restaurant_owners": "restaurant_owners",
        "restaurants": "restaurants",
        "reviews": "reviews",
        "favorites": "favorites",
        "photos": "photos",
        "sessions": "sessions",
        "activity_logs": "activity_logs",
    }

    if "favourites" in inspector.get_table_names() and "favorites" not in inspector.get_table_names():
        source_map["favorites"] = "favourites"

    summary: list[tuple[str, int, int]] = []
    for target_collection, source_table in source_map.items():
        docs = load_table(source_table)
        source_count, inserted_count = write_collection(target_collection, docs)
        summary.append((target_collection, source_count, inserted_count))

    for name in ["users", "restaurant_owners", "restaurants", "reviews", "favorites", "photos"]:
        backfill_counter(name)

    print("Migration summary:")
    mismatch = False
    for collection, source_count, inserted_count in summary:
        status = "OK" if source_count == inserted_count else "MISMATCH"
        if status != "OK":
            mismatch = True
        print(f"- {collection}: source={source_count}, inserted={inserted_count}, status={status}")

    if mismatch:
        print("Completed with mismatches. Review table mappings and constraints.")
    else:
        print("Migration completed successfully.")


if __name__ == "__main__":
    migrate()
