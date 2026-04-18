import json
import sys
import urllib.error
import urllib.parse
import urllib.request

from app.database import db

BASE_URL = "http://127.0.0.1:8000"


def request_json(method: str, path: str, data=None, token: str | None = None):
    url = f"{BASE_URL}{path}"
    body = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        body = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        try:
            payload = json.loads(raw) if raw else {"detail": exc.reason}
        except Exception:
            payload = {"detail": raw or exc.reason}
        return exc.code, payload


def assert_ok(condition: bool, label: str, details: str = ""):
    if condition:
        print(f"PASS: {label}")
        return True
    print(f"FAIL: {label}{' | ' + details if details else ''}")
    return False


def main():
    failures = 0

    # 1) Root health check
    status, payload = request_json("GET", "/")
    if not assert_ok(status == 200 and payload.get("message"), "Root endpoint"):
        failures += 1

    # 2) Login flows
    status, user_login = request_json("POST", "/auth/user/login", {"email": "john.doe@example.com", "password": "password123"})
    user_token = user_login.get("access_token") if isinstance(user_login, dict) else None
    if not assert_ok(status == 200 and user_token, "User login", str(user_login)):
        failures += 1

    status, owner_login = request_json("POST", "/auth/owner/login", {"email": "owner@sanjose.com", "password": "password123"})
    owner_token = owner_login.get("access_token") if isinstance(owner_login, dict) else None
    if not assert_ok(status == 200 and owner_token, "Owner login", str(owner_login)):
        failures += 1

    # 3) Session + TTL index checks
    session_doc = db.sessions.find_one({"token": user_token}) if user_token else None
    if not assert_ok(session_doc is not None, "Session doc created for user"):
        failures += 1

    indexes = list(db.sessions.list_indexes())
    ttl_ok = any(idx.get("key", {}).get("expires_at") == 1 and idx.get("expireAfterSeconds") == 0 for idx in indexes)
    if not assert_ok(ttl_ok, "Session TTL index exists"):
        failures += 1

    # 4) Protected profile endpoints
    status, _ = request_json("GET", "/users/me", token=user_token)
    if not assert_ok(status == 200, "Get user profile"):
        failures += 1

    status, _ = request_json("GET", "/users/owner/me", token=owner_token)
    if not assert_ok(status == 200, "Get owner profile"):
        failures += 1

    # 5) Restaurant search/list
    status, restaurants = request_json("GET", "/restaurants/?city=San%20Jose")
    if not assert_ok(status == 200 and isinstance(restaurants, list), "Restaurant search by city"):
        failures += 1

    # 6) Create/claim/update restaurant
    create_payload = {
        "name": "Test Restaurant",
        "cuisine": "American",
        "address": "123 Test St",
        "city": "San Jose",
        "description": "Created by validation test",
        "amenities": "wifi",
        "hours": "9-5",
        "pricing_tier": "$$",
        "contact": "1234567890",
        "photos": None,
    }
    status, created_restaurant = request_json("POST", "/restaurants/", create_payload, token=user_token)
    test_restaurant_id = created_restaurant.get("id") if isinstance(created_restaurant, dict) else None
    if not assert_ok(status == 200 and test_restaurant_id, "Create restaurant as user", str(created_restaurant)):
        failures += 1

    status, claim_result = request_json("POST", f"/restaurants/{test_restaurant_id}/claim", token=owner_token)
    if not assert_ok(status == 200 and claim_result.get("restaurant_id") == test_restaurant_id, "Claim restaurant as owner", str(claim_result)):
        failures += 1

    status, updated_restaurant = request_json(
        "PUT",
        f"/restaurants/{test_restaurant_id}",
        {"description": "Updated by validation test owner"},
        token=owner_token,
    )
    if not assert_ok(status == 200 and updated_restaurant.get("description") == "Updated by validation test owner", "Update claimed restaurant"):
        failures += 1

    # 7) Reviews create/update/list/delete
    status, created_review = request_json(
        "POST",
        "/reviews/",
        {"restaurant_id": test_restaurant_id, "rating": 5, "comment": "Great test review", "photos": None},
        token=user_token,
    )
    review_id = created_review.get("id") if isinstance(created_review, dict) else None
    if not assert_ok(status == 200 and review_id, "Create review", str(created_review)):
        failures += 1

    status, updated_review = request_json(
        "PUT",
        f"/reviews/{review_id}",
        {"rating": 4, "comment": "Updated test review", "photos": None},
        token=user_token,
    )
    if not assert_ok(status == 200 and updated_review.get("rating") == 4, "Update review", str(updated_review)):
        failures += 1

    status, review_list = request_json("GET", f"/reviews/restaurant/{test_restaurant_id}")
    contains_review = isinstance(review_list, list) and any(r.get("id") == review_id for r in review_list)
    if not assert_ok(status == 200 and contains_review, "List reviews for restaurant"):
        failures += 1

    # 8) Favorites add/list/remove
    status, fav_add = request_json("POST", f"/favorites/{test_restaurant_id}", token=user_token)
    if not assert_ok(status == 200, "Add favorite", str(fav_add)):
        failures += 1

    status, fav_list = request_json("GET", "/favorites/", token=user_token)
    fav_exists = isinstance(fav_list, list) and any(f.get("restaurant_id") == test_restaurant_id for f in fav_list)
    if not assert_ok(status == 200 and fav_exists, "List favorites includes test restaurant"):
        failures += 1

    status, fav_remove = request_json("DELETE", f"/favorites/{test_restaurant_id}", token=user_token)
    if not assert_ok(status == 200, "Remove favorite", str(fav_remove)):
        failures += 1

    # 9) Preferences get/update
    pref_payload = {
        "cuisines": "Italian,American",
        "price_range": "$$",
        "location": "San Jose",
        "dietary_needs": "",
        "ambiance": "casual",
        "sort_by": "rating",
    }
    status, _ = request_json("PUT", "/preferences/", pref_payload, token=user_token)
    if not assert_ok(status == 200, "Update preferences"):
        failures += 1

    status, prefs = request_json("GET", "/preferences/", token=user_token)
    if not assert_ok(status == 200 and prefs.get("price_range") == "$$", "Get preferences"):
        failures += 1

    # 10) History and owner dashboard
    status, history = request_json("GET", "/users/history", token=user_token)
    if not assert_ok(status == 200 and isinstance(history, dict), "User history"):
        failures += 1

    status, dashboard = request_json("GET", "/users/owner/dashboard", token=owner_token)
    if not assert_ok(status == 200 and isinstance(dashboard, dict), "Owner dashboard"):
        failures += 1

    status, _ = request_json("DELETE", f"/reviews/{review_id}", token=user_token)
    if not assert_ok(status == 200, "Delete review"):
        failures += 1

    status, rest_after_delete = request_json("GET", f"/restaurants/{test_restaurant_id}")
    if not assert_ok(status == 200 and rest_after_delete.get("review_count") == 0, "Restaurant stats updated after review delete"):
        failures += 1

    print("\nSummary:")
    if failures:
        print(f"Lab 1 backend validation FAILED with {failures} failing checks.")
        sys.exit(1)
    print("Lab 1 backend validation PASSED. All critical Lab 1 backend flows are working with MongoDB.")


if __name__ == "__main__":
    main()
