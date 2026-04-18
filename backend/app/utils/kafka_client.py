import json
import os
from typing import Any

from kafka import KafkaConsumer, KafkaProducer


KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")


def create_producer() -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        retries=5,
    )


def publish_event(topic: str, payload: dict[str, Any]) -> None:
    producer = create_producer()
    try:
        producer.send(topic, payload).get(timeout=10)
    finally:
        producer.flush()
        producer.close()


def create_consumer(topics: list[str], group_id: str) -> KafkaConsumer:
    return KafkaConsumer(
        *topics,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=group_id,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda value: json.loads(value.decode("utf-8")),
    )

