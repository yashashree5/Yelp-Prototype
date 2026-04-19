# Yelp Prototype — Lab 1 & Lab 2

A full-stack Yelp-style restaurant discovery and review platform built with React, FastAPI, MongoDB, Kafka, and Docker/Kubernetes.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Lab 1 — Running Locally](#lab-1--running-locally)
- [Lab 2 — Running with Docker Compose](#lab-2--running-with-docker-compose)
- [Lab 2 — Kubernetes Deployment](#lab-2--kubernetes-deployment)
- [Services & Ports](#services--ports)
- [Kafka Topics](#kafka-topics)
- [MongoDB Collections](#mongodb-collections)
- [API Documentation](#api-documentation)
- [Default Test Credentials](#default-test-credentials)
- [Environment Variables](#environment-variables)

---

## Project Overview

This application supports two personas:

**User (Reviewer)**
- Sign up / Login with JWT authentication
- Search and discover restaurants by name, cuisine, city, or keyword
- View restaurant details, ratings, and reviews
- Write, edit, and delete own reviews
- Mark restaurants as favourites
- View history of reviews and restaurants added
- Set AI assistant preferences (cuisine, price range, dietary needs, ambiance)
- Chat with an AI assistant for personalised restaurant recommendations

**Restaurant Owner**
- Sign up / Login
- Claim and manage restaurant listings
- View all reviews for owned restaurants
- View analytics dashboard

---

## Tech Stack

### Lab 1
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Bootstrap |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | MongoDB (via PyMongo) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| AI Chatbot | LangChain, Groq, Tavily |
| Maps | React Leaflet |

### Lab 2 Additions
| Layer | Technology |
|---|---|
| Containerisation | Docker, Docker Compose |
| Orchestration | Kubernetes (kubectl / minikube / AWS EKS) |
| Messaging | Apache Kafka (Confluent), Zookeeper |
| State Management | Redux Toolkit, React Redux |
| Performance Testing | Apache JMeter |
| Cloud | AWS (ECR + EKS) |

---

## Architecture

```
Browser
  │
  ▼
Nginx (port 5173)          ← React frontend + reverse proxy
  │
  ├──/auth/         →  User Service     (8001)
  ├──/users/        →  User Service     (8001)
  ├──/preferences/  →  User Service     (8001)
  ├──/favorites/    →  User Service     (8001)
  ├──/ai-assistant/ →  User Service     (8001)
  ├──/restaurants/  →  Restaurant Service (8003)
  ├──/reviews/      →  Review Service   (8004)
  └──/reviews/async →  Review Service   (8004) → Kafka → Review Worker

Kafka Topics (Producer → Consumer)
  review.created      Review Service → Review Worker
  review.updated      Review Service → Review Worker
  review.deleted      Review Service → Review Worker
  restaurant.created  Restaurant Service → Restaurant Worker
  restaurant.updated  Restaurant Service → Restaurant Worker
  restaurant.claimed  Restaurant Service → Restaurant Worker
  user.created        User Service → User Worker
  user.updated        User Service → User Worker

MongoDB (yelp_prototype)
  users, restaurant_owners, restaurants, reviews,
  favorites, user_preferences, sessions, review_events, counters
```

---

## Project Structure

```
Yelp-Prototype/
├── docker-compose.yml          # Full stack local setup
├── .env                        # Environment variables (do not commit)
├── README.md
│
├── backend/
│   ├── requirements.txt
│   ├── seed_real_data.py       # Seeds 15 San Jose restaurants
│   ├── migrate_mysql_to_mongo.py
│   ├── Dockerfile.user
│   ├── Dockerfile.owner
│   ├── Dockerfile.restaurant
│   ├── Dockerfile.review
│   ├── Dockerfile.review-worker
│   ├── Dockerfile.restaurant-worker
│   ├── Dockerfile.user-worker
│   └── app/
│       ├── database.py         # MongoDB connection + indexes
│       ├── main.py             # Monolith entry (dev only)
│       ├── routers/            # FastAPI route handlers
│       ├── schemas/            # Pydantic request/response models
│       ├── service_apps/       # Per-service FastAPI apps
│       ├── utils/              # JWT, hashing, Kafka client
│       └── workers/            # Kafka consumer workers
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # Reverse proxy config
│   ├── package.json
│   └── src/
│       ├── api/axios.js        # Axios instance
│       ├── components/         # NavBar, ChatWidget, RestaurantCard, etc.
│       ├── pages/              # All page components
│       └── store/              # Redux store (Lab 2)
│
└── k8s/
    ├── config.yml              # ConfigMap + Secret
    ├── mongo.yml               # MongoDB deployment
    ├── kafka.yml               # Kafka + Zookeeper deployment
    └── services.yml            # All backend service deployments
```

---

## Lab 1 — Running Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB running locally on port 27017

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export MONGODB_URI=mongodb://localhost:27017
export MONGODB_DB=yelp_prototype
export SECRET_KEY=your_secret_key
export ALGORITHM=HS256
export ACCESS_TOKEN_EXPIRE_MINUTES=30

# Run
uvicorn app.main:app --reload --port 8000
```

### Seed the database

```bash
cd backend
MONGODB_URI=mongodb://localhost:27017 MONGODB_DB=yelp_prototype PYTHONPATH=. python seed_real_data.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Lab 2 — Running with Docker Compose

### Prerequisites
- Docker Desktop installed and running

### Step 1 — Create `.env` file at repo root

```env
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MONGODB_URI=mongodb://mongo:27017
MONGODB_DB=yelp_prototype
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
```

### Step 2 — Start all services

```bash
docker-compose up -d --build
```

Wait ~60 seconds for Kafka to become healthy.

### Step 3 — Seed the database

```bash
docker cp backend/seed_real_data.py yelp-prototype-user-service-1:/app/seed_real_data.py
docker exec yelp-prototype-user-service-1 python seed_real_data.py
```

### Step 4 — Open the app

```
http://localhost:5173
```

### Verify all services are running

```bash
docker-compose ps
```

Expected output — all 11 services `Up`:
```
yelp-prototype-frontend-1
yelp-prototype-kafka-1
yelp-prototype-mongo-1
yelp-prototype-owner-service-1
yelp-prototype-restaurant-service-1
yelp-prototype-restaurant-worker-1
yelp-prototype-review-service-1
yelp-prototype-review-worker-1
yelp-prototype-user-service-1
yelp-prototype-user-worker-1
yelp-prototype-zookeeper-1
```

### Verify Kafka topics

```bash
docker exec yelp-prototype-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list
```

### Watch Kafka processing (test end-to-end)

```bash
docker-compose logs -f review-worker
```

Then submit a review in the UI — you will see:
```
INFO:review-worker:review.created: review_id=X restaurant_id=X
INFO:review-worker:Processed event abc123 topic=review.created
```

### Stop everything

```bash
docker-compose down
```

---

## Lab 2 — Kubernetes Deployment

### Prerequisites
- `kubectl` installed
- Minikube (local) or AWS EKS cluster

### Local (Minikube)

```bash
# Start minikube
minikube start

# Point Docker to minikube's registry
eval $(minikube docker-env)

# Build all images
docker build -f backend/Dockerfile.user              -t yelp-backend-user:latest              ./backend
docker build -f backend/Dockerfile.owner             -t yelp-backend-owner:latest             ./backend
docker build -f backend/Dockerfile.restaurant        -t yelp-backend-restaurant:latest        ./backend
docker build -f backend/Dockerfile.review            -t yelp-backend-review:latest            ./backend
docker build -f backend/Dockerfile.review-worker     -t yelp-backend-review-worker:latest     ./backend
docker build -f backend/Dockerfile.restaurant-worker -t yelp-backend-restaurant-worker:latest ./backend
docker build -f backend/Dockerfile.user-worker       -t yelp-backend-user-worker:latest       ./backend
docker build -f frontend/Dockerfile                  -t yelp-frontend:latest                  ./frontend

# Apply manifests in order
kubectl apply -f k8s/config.yml
kubectl apply -f k8s/mongo.yml
kubectl apply -f k8s/kafka.yml
kubectl apply -f k8s/services.yml

# Verify all pods running
kubectl get pods
kubectl get services
```

### AWS (ECR + EKS)

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push each image
docker tag yelp-backend-user:latest <account>.dkr.ecr.us-east-1.amazonaws.com/yelp-backend-user:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/yelp-backend-user:latest
# Repeat for all images

# Update image: fields in k8s/services.yml to ECR URLs, then apply
kubectl apply -f k8s/config.yml
kubectl apply -f k8s/mongo.yml
kubectl apply -f k8s/kafka.yml
kubectl apply -f k8s/services.yml
```

---

## Services & Ports

| Service | Port | Description |
|---|---|---|
| Frontend (Nginx) | 5173 | React app + API reverse proxy |
| User Service | 8001 | Auth, profiles, preferences, favourites, AI chatbot |
| Owner Service | 8002 | Owner auth, restaurant management |
| Restaurant Service | 8003 | Restaurant CRUD and search |
| Review Service | 8004 | Review CRUD + async Kafka endpoints |
| Review Worker | — | Kafka consumer for review topics |
| Restaurant Worker | — | Kafka consumer for restaurant topics |
| User Worker | — | Kafka consumer for user topics |
| MongoDB | 27017 | Primary database |
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordinator |

---

## Kafka Topics

| Topic | Producer | Consumer |
|---|---|---|
| review.created | Review Service | Review Worker |
| review.updated | Review Service | Review Worker |
| review.deleted | Review Service | Review Worker |
| restaurant.created | Restaurant Service | Restaurant Worker |
| restaurant.updated | Restaurant Service | Restaurant Worker |
| restaurant.claimed | Restaurant Service | Restaurant Worker |
| user.created | User Service | User Worker |
| user.updated | User Service | User Worker |

---

## MongoDB Collections

| Collection | Description |
|---|---|
| users | User accounts and profiles |
| restaurant_owners | Owner accounts |
| restaurants | Restaurant listings |
| reviews | User reviews |
| favorites | User favourite restaurants |
| user_preferences | AI assistant preferences per user |
| sessions | JWT sessions with TTL expiry |
| review_events | Kafka event tracking (status: queued/processing/completed/failed) |
| counters | Auto-increment ID counters |

---

## API Documentation

Swagger UI is available at:

| Service | Swagger URL |
|---|---|
| User Service | http://localhost:8001/docs |
| Owner Service | http://localhost:8002/docs |
| Restaurant Service | http://localhost:8003/docs |
| Review Service | http://localhost:8004/docs |

---

## Default Test Credentials

After running the seed script:

| Role | Email | Password |
|---|---|---|
| User | john.doe@example.com | password123 |
| Owner | owner@sanjose.com | password123 |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| SECRET_KEY | JWT signing secret | — (required) |
| ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiry | 30 |
| MONGODB_URI | MongoDB connection string | mongodb://mongo:27017 |
| MONGODB_DB | Database name | yelp_prototype |
| KAFKA_BOOTSTRAP_SERVERS | Kafka broker address | kafka:9092 |

---

## Notes

- Do not commit `venv/`, `__pycache__/`, `.env`, or `node_modules/`
- The seed script can be re-run safely — it clears existing data first
- If MongoDB has stale data after a restart, re-run the seed script
- Kafka workers retry connecting up to 10 times (5s delay) before failing
