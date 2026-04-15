# Phase 1 Completion Report: MongoDB Migration
**Status:** ✅ **PASS**  

---

## Executive Summary

Phase 1 of the Yelp Prototype Lab 1 assignment has been **successfully completed**. All critical backend flows have been migrated from SQLAlchemy/MySQL to PyMongo/MongoDB, with full compliance to security requirements (bcrypt password hashing) and session management (TTL-based expiration). End-to-end validation confirms 22/22 critical flows are operational.

---

## Phase 1 Requirements Checklist

### ✅ 1. Database Migration: MySQL → MongoDB
- **Goal:** Migrate all data from MySQL to MongoDB while preserving integrity and relationships.
- **Outcome:**
  - **users:** 2 documents migrated ✓
  - **restaurant_owners:** 1 document migrated ✓
  - **restaurants:** 16 documents migrated ✓
  - **reviews:** 33 documents migrated ✓
  - **favorites:** 1 document migrated ✓
  - **photos:** 0 documents (no legacy data)
  - **sessions:** 0 documents (new collection, created on-demand)
  - **activity_logs:** 0 documents (not yet used)
- **Migration Script:** `backend/migrate_mysql_to_mongo.py` (executed successfully)
- **Verification:** All counts verified; bcrypt password hashes confirmed.

### ✅ 2. Password Security: Bcrypt Hashing
- **Goal:** Implement bcrypt password encryption for user accounts (legacy and new).
- **Implementation:**
  - **Module:** `backend/app/utils/hashing.py` (passlib + bcrypt)
  - **Password Functions:**
    - `hash_password(plain_text: str) -> str` — generates bcrypt $2b$12$ hashes
    - `verify_password(plain: str, hashed: str) -> bool` — validates passwords
  - **Migration:** All 2 existing user passwords re-hashed to bcrypt during migration (verification confirms $2b$ prefix)
  - **New Signups:** All subsequent registrations use bcrypt encryption
  - **Sample Hashes:**
    ```
    john.doe@example.com: $2b$12$[...]  ✓
    owner@sanjose.com:    $2b$12$[...]  ✓
    ```

### ✅ 3. Session Management: MongoDB TTL Expiration
- **Goal:** Implement session storage with automatic TTL-based cleanup.
- **Implementation:**
  - **Collection:** `sessions` (MongoDB TTL-enabled)
  - **Document Structure:**
    ```json
    {
      "_id": ObjectId(),
      "id": <auto_increment>,
      "token": "<jwt_token>",
      "user_id": <user_id>,
      "role": "user|owner",
      "created_at": <utc_datetime>,
      "expires_at": <utc_datetime>,
      "updated_at": <utc_datetime>
    }
    ```
  - **TTL Index:** Created on `expires_at` field with `expireAfterSeconds=0`
    - MongoDB automatically deletes expired documents at `expires_at` timestamp
    - Verified: Index exists and has correct configuration
  - **Session Lifecycle:**
    1. User/owner logs in → `auth.py` calls `_create_session()`
    2. `_create_session()` writes document to `db.sessions` with `expires_at = now() + TTL_SECONDS`
    3. Session token stored in user's response
    4. On protected endpoint access, `dependencies.py` validates:
       - JWT signature valid ✓
       - Session document exists ✓
       - `expires_at > current_time` ✓
    5. Expired documents automatically deleted by MongoDB (no manual cleanup needed)

### ✅ 4. FastAPI Route Refactoring: SQLAlchemy → PyMongo
- **Goal:** Migrate all 7 route modules from SQLAlchemy ORM to PyMongo document operations.
- **Refactored Routes:**

  | Route Module | Endpoints | Status | Notes |
  |---|---|---|---|
  | `auth.py` | /user/signup, /user/login, /owner/signup, /owner/login | ✅ | Session creation, JWT tokens |
  | `users.py` | /users/me, /users/{id}, /users/owner/me, /users/history, /users/owner/dashboard | ✅ | Profile CRUD, history aggregation |
  | `restaurants.py` | POST/GET/PUT restaurants, claim, search | ✅ | Create with auto-increment, regex search, claim flow |
  | `reviews.py` | POST/PUT/GET/DELETE reviews, rating recalculation | ✅ | Rating recalc on create/update/delete |
  | `favorites.py` | POST/GET/DELETE favorites | ✅ | Unique compound index, join with restaurants |
  | `preferences.py` | GET/PUT user preferences | ✅ | Upsert pattern with $setOnInsert |
  | `chatbot.py` | GET chatbot recommendations | ✅ | Restaurant query & sanitization |

- **Key Patterns Implemented:**
  - **Document Creation:** `create_with_increment()` generates sequential IDs
  - **Queries:** `db[collection].find()`, `find_one()`, `update_one()` with `$set` operator
  - **Responses:** `sanitize_document()` removes MongoDB `_id`, returns clean JSON
  - **Indexes:** 13 indexes configured (see below)

### ✅ 5. MongoDB Indexes
- **Goal:** Ensure query performance and enforce constraints.
- **Indexes Configured:**
  1. `users.email` (unique)
  2. `restaurant_owners.email` (unique)
  3. `restaurants.id` (unique)
  4. `restaurants.owner_id`
  5. `restaurants.created_by_user_id`
  6. `reviews.id` (unique)
  7. `reviews.restaurant_id`
  8. `reviews.user_id`
  9. `favorites.id` (unique)
  10. `favorites.user_id, restaurant_id` (unique compound)
  11. `photos.id` (unique)
  12. `sessions.token` (unique)
  13. `sessions.expires_at` (TTL index, expireAfterSeconds=0)

---

## Technical Implementation Details

### Database Layer
- **File:** `backend/app/database.py`
- **Key Functions:**
  - `ensure_indexes()` — creates all 13 indexes on app startup
  - `get_next_id(collection_name)` — increments ID counter atomically
  - `create_with_increment()` — wrapper for document creation with auto-ID
  - `sanitize_document()` — removes MongoDB internal `_id` field
  - `utc_now()` — returns naive UTC datetime (compatible with PyMongo)
  - Automatic connection to `mongodb://localhost:27017` via `.env` config

### Authentication & Dependencies
- **File:** `backend/app/utils/dependencies.py`
- **Session Validation Flow:**
  ```python
  get_current_auth(token) →
    1. Decode JWT → extract user_id, role
    2. Query db.sessions.find_one({"token": token})
    3. Check session_doc.expires_at <= utc_now()
    4. Load principal from db.users or db.restaurant_owners
    5. Return {"principal": {...}, "role": "user|owner"}
  ```
- **Fix Applied:** Changed `utc_now()` from timezone-aware to naive datetime to match PyMongo's naive datetime returns from MongoDB.

### Data Types & Document Structures
- **Auto-Increment IDs:** Integer field `id` in each document (e.g., user `id`, restaurant `id`)
- **Timestamps:** Naive UTC datetimes (Python `datetime.utcnow()`)
- **Passwords:** Bcrypt hashes stored in `hashed_password` field
- **Ratings:** Float values, recalculated after each review create/update/delete

### Error Handling
- **DuplicateKeyError:** Caught when adding duplicate favorites (unique compound index)
- **HTTPException:** Raised for 404 (not found), 400 (bad request), 500 (server errors)
- **Validation:** Request bodies validated via Pydantic schemas

---

## Phase 1 Backend Validation Test Results

**Test Suite:** `backend/backend_validation.py` (22 critical tests)

### Test Results: ✅ **22/22 PASS**

| # | Test | Status | Notes |
|---|---|---|---|
| 1 | Root endpoint health check | ✅ PASS | Returns `{"message": "..."}` |
| 2 | User login | ✅ PASS | Creates session, returns JWT |
| 3 | Owner login | ✅ PASS | Creates session, returns JWT |
| 4 | Session doc created for user | ✅ PASS | Verified in db.sessions |
| 5 | Session TTL index exists | ✅ PASS | Verified `expireAfterSeconds=0` |
| 6 | Get user profile | ✅ PASS | Protected endpoint, requires token |
| 7 | Get owner profile | ✅ PASS | Protected endpoint, requires token |
| 8 | Restaurant search by city | ✅ PASS | Public endpoint, regex filtering |
| 9 | Create restaurant as user | ✅ PASS | User-created restaurant, id auto-assigned |
| 10 | Claim restaurant as owner | ✅ PASS | Owner claims unowned restaurant |
| 11 | Update claimed restaurant | ✅ PASS | Owner updates description |
| 12 | Create review | ✅ PASS | User creates review, triggers rating recalc |
| 13 | Update review | ✅ PASS | User updates review, recalc average_rating |
| 14 | List reviews for restaurant | ✅ PASS | Retrieves all reviews with sanitized docs |
| 15 | Add favorite | ✅ PASS | User adds restaurant to favorites |
| 16 | List favorites includes test restaurant | ✅ PASS | Favorites query returns joined data |
| 17 | Remove favorite | ✅ PASS | User removes from favorites |
| 18 | Update preferences | ✅ PASS | User sets cuisine/price preferences |
| 19 | Get preferences | ✅ PASS | Retrieves user preferences |
| 20 | User history | ✅ PASS | Lists user's reviews & favorites |
| 21 | Owner dashboard | ✅ PASS | Lists owner's restaurants |
| 22 | Delete review & verify stats update | ✅ PASS | Review deleted, restaurant rating recalculated |

---

## Migration Artifacts

### 1. Migration Script Execution Log
```
Migration completed successfully!
users:              2 source, 2 inserted ✓
restaurant_owners:  1 source, 1 inserted ✓
restaurants:       16 source, 16 inserted ✓
reviews:           33 source, 33 inserted ✓
favorites:          1 source, 1 inserted ✓
photos:             0 source, 0 inserted ✓
sessions:           0 source, 0 inserted ✓
activity_logs:      0 source, 0 inserted ✓
```

### 2. Password Verification
- All user passwords contain `$2b$` bcrypt prefix ✓
- migrate_mysql_to_mongo.py verified all hashes during migration ✓

### 3. TTL Index Configuration
```
Index Name: expires_at_1
Key: expires_at (ascending)
expireAfterSeconds: 0
Version: 2
```

### 4. Session Lifecycle Proof
- Login → Session doc created in db.sessions ✓
- Session contains: token, user_id, role, expires_at ✓
- Protected endpoints validate session exists and non-expired ✓

---

## Files Modified/Created

### New Files
- `backend/migrate_mysql_to_mongo.py` — One-time migration script
- `backend/backend_validation.py` — Comprehensive validation test suite

### Modified Files
- `backend/app/database.py` — MongoDB client, indexes, helpers
- `backend/app/main.py` — Calls `ensure_indexes()` on startup
- `backend/app/routers/auth.py` — Session creation, JWT
- `backend/app/routers/users.py` — Profile CRUD via PyMongo
- `backend/app/routers/restaurants.py` — Restaurant ops, claim flow
- `backend/app/routers/reviews.py` — Reviews with auto-rating recalc
- `backend/app/routers/favorites.py` — Favorites with unique checks
- `backend/app/routers/preferences.py` — User preferences upsert
- `backend/app/routers/chatbot.py` — Recommendation queries
- `backend/app/utils/dependencies.py` — Session validation (datetime fix)
- `backend/requirements.txt` — Added pymongo, motor (async support ready)

---

## Known Issues & Resolutions

### Issue 1: Timezone-Aware vs Naive Datetime Comparison
**Problem:** Protected endpoints returned 500 errors: `TypeError: can't compare offset-naive and offset-aware datetimes`  
**Root Cause:** PyMongo returns naive datetimes from MongoDB; code was comparing against timezone-aware `datetime.now(timezone.utc)`  
**Resolution:** Changed `database.py` `utc_now()` to return `datetime.utcnow()` (naive UTC)  
**Status:** ✅ Fixed & Validated

### Issue 2: Create Endpoints Not Sanitizing Response
**Problem:** Restaurant/review creation returned raw Mongo documents with `_id` field  
**Root Cause:** `create_with_increment()` returns unsanitized payload; responses not wrapped with `sanitize_document()`  
**Resolution:** Updated restaurants.py and reviews.py create endpoints to return `sanitize_document(restaurant/review)`  
**Status:** ✅ Fixed & Validated

---

## Configuration

### Environment Variables
- `MONGODB_URI` = `mongodb://localhost:27017`
- `MONGODB_DB` = `yelp_prototype`
- `JWT_SECRET_KEY` = (set in .env)
- `JWT_ALGORITHM` = `HS256`
- `JWT_EXPIRATION_MINUTES` = 60
- `SESSION_TTL_SECONDS` = 3600

### Python Environment
- Python 3.12.6
- FastAPI 0.135.1
- PyMongo 4.15.3
- uvicorn 0.41.0
- passlib + bcrypt (password hashing)

---

## Sign-Off & Next Steps

### Phase 1 Status: ✅ **COMPLETE**
All 22 critical Lab 1 backend flows validated and operational on MongoDB.

### Deliverables
- ✅ Data migrated from MySQL to MongoDB (verified counts)
- ✅ Bcrypt password hashing implemented (all passwords secured)
- ✅ TTL-based session management configured (automatic cleanup)
- ✅ All FastAPI routes refactored to PyMongo (7 route modules)
- ✅ End-to-end validation test: 22/22 PASS
- ✅ This completion report

### Phase 2 Considerations
- Frontend integration testing (API contracts confirmed)
- Advanced query optimization (aggregation pipelines if needed)
- Async operations (motor library ready; not required for Phase 1)
- Additional seed data if needed for testing

---
