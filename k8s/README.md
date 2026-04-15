Apply these manifests in order:

```bash
kubectl apply -f k8s/config.yml
kubectl apply -f k8s/kafka.yml
kubectl apply -f k8s/mongo.yml
kubectl apply -f k8s/services.yml
```

Images

- The `k8s/services.yml` manifests reference local image tags:
  - `yelp-backend-user:latest`
  - `yelp-backend-owner:latest`
  - `yelp-backend-restaurant:latest`
  - `yelp-backend-review:latest`
- Build them locally first, or push them to a registry and update the `image:` fields.

Kafka

- Kafka is deployed via `k8s/kafka.yml` (single broker + zookeeper) and is reachable in-cluster at `kafka:9092`.
- Backend services receive `KAFKA_BOOTSTRAP_SERVERS` from `k8s/config.yml`.

