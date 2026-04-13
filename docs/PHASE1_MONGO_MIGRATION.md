# Phase 1 - MongoDB Migration Completion Guide

This document captures the completed backend migration scope for Phase 1 and the run/verify steps Andrew can use for sign-off.

## Completed in code

- Replaced SQLAlchemy DB session usage in all active FastAPI routes with MongoDB collection access.
- Added centralized MongoDB connection and index initialization.
- Added auto-increment style integer IDs using a `counters` collection to preserve existing API contracts.
- Added bcrypt-safe password handling in migration path.
- Added Mongo-backed `sessions` storage with TTL expiry index.
- Refactored auth dependency to require valid JWT and active session document.
- Added MySQL -> Mongo migration script with per-collection source/insert count summary.
- Replaced SQL-based seed script with Mongo seed script.

## Files changed for Phase 1

- `backend/app/database.py`
- `backend/app/main.py`
- `backend/app/utils/dependencies.py`
- `backend/app/routers/auth.py`
- `backend/app/routers/users.py`
- `backend/app/routers/restaurants.py`
- `backend/app/routers/reviews.py`
- `backend/app/routers/favorites.py`
- `backend/app/routers/preferences.py`
- `backend/app/routers/chatbot.py`
- `backend/migrate_mysql_to_mongo.py`
- `backend/seed_real_data.py`
- `backend/requirements.txt`

## Environment variables required

Set these in your backend environment:

- `MONGODB_URI` (example: `mongodb://localhost:27017`)
- `MONGODB_DB` (example: `yelp_prototype`)
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL` (required only when running `migrate_mysql_to_mongo.py`)

## Runbook

### 1. Install backend dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Migrate MySQL data to MongoDB

```powershell
python migrate_mysql_to_mongo.py
```

Expected output includes a migration summary per collection:

- users
- restaurant_owners
- restaurants
- reviews
- favorites (or mapped from favourites)
- photos
- sessions
- activity_logs

### 3. Optional: seed Mongo demo data

```powershell
python seed_real_data.py
```

### 4. Start backend

```powershell
uvicorn app.main:app --reload --port 8000
```

## End-to-end checks for Lab 1 parity

Run these checks before Yashashree sign-off:

1. User signup/login works and creates a session doc.
2. Owner signup/login works and creates a session doc.
3. Expired sessions are removed by TTL and rejected by protected routes.
4. Restaurant create/list/search/get/update/claim works.
5. Review create/list/update/delete works and updates restaurant rating/count.
6. Favorites add/list/remove works.
7. Preferences get/update works.
8. User profile and owner profile endpoints work.
9. History and owner dashboard endpoints return expected data.
10. AI assistant endpoint responds and recommendations are DB-backed.

## Sign-off artifacts for Phase 1

Capture these for handoff:

- Screenshot or logs of migration summary counts.
- Screenshot of `sessions` collection TTL index and sample session docs.
- API smoke test results for core flows above.
- Note any known issues blocking Phase 2.
