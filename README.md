# Kubernetes Deployment Guide

## Apply manifests in order

```bash
kubectl apply -f k8s/config.yml
kubectl apply -f k8s/mongo.yml
kubectl apply -f k8s/kafka.yml
kubectl apply -f k8s/services.yml
```

## Build Docker images first (local cluster / minikube)

```bash
# From the repo root
docker build -f backend/Dockerfile.user              -t yelp-backend-user:latest              ./backend
docker build -f backend/Dockerfile.owner             -t yelp-backend-owner:latest             ./backend
docker build -f backend/Dockerfile.restaurant        -t yelp-backend-restaurant:latest        ./backend
docker build -f backend/Dockerfile.review            -t yelp-backend-review:latest            ./backend
docker build -f backend/Dockerfile.review-worker     -t yelp-backend-review-worker:latest     ./backend
docker build -f backend/Dockerfile.restaurant-worker -t yelp-backend-restaurant-worker:latest ./backend
docker build -f backend/Dockerfile.user-worker       -t yelp-backend-user-worker:latest       ./backend
docker build -f frontend/Dockerfile                  -t yelp-frontend:latest                  ./frontend
```

For AWS ECR, tag and push each image to your ECR repository and update the `image:` fields in `services.yml`.

## Services & Ports

| Service             | Port  | Role                              |
|---------------------|-------|-----------------------------------|
| user-service        | 8001  | User auth & profiles              |
| owner-service       | 8002  | Restaurant owner management       |
| restaurant-service  | 8003  | Restaurant CRUD & search          |
| review-service      | 8004  | Review CRUD + async Kafka events  |
| review-worker       | —     | Kafka consumer: review topics     |
| restaurant-worker   | —     | Kafka consumer: restaurant topics |
| user-worker         | —     | Kafka consumer: user topics       |
| frontend            | 80    | React app (Nginx)                 |
| mongo               | 27017 | MongoDB                           |
| kafka               | 9092  | Kafka broker                      |
| zookeeper           | 2181  | Kafka coordinator                 |

## Kafka Topics

| Topic               | Producer           | Consumer          |
|---------------------|--------------------|-------------------|
| review.created      | review-service     | review-worker     |
| review.updated      | review-service     | review-worker     |
| review.deleted      | review-service     | review-worker     |
| restaurant.created  | restaurant-service | restaurant-worker |
| restaurant.updated  | restaurant-service | restaurant-worker |
| restaurant.claimed  | restaurant-service | restaurant-worker |
| user.created        | user-service       | user-worker       |
| user.updated        | user-service       | user-worker       |

## Verify pods are running

```bash
kubectl get pods
kubectl get services
kubectl logs deployment/review-worker
kubectl logs deployment/restaurant-worker
kubectl logs deployment/user-worker
```
