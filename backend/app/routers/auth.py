from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.database import DuplicateKeyError, create_with_increment, db, utc_now
from app.schemas.user import UserSignup, UserLogin, Token
from app.schemas.owner import OwnerSignup, OwnerLogin
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _create_session(token: str, principal_id: int, role: str) -> None:
    expires_at = utc_now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    db.sessions.insert_one(
        {
            "token": token,
            "user_id": principal_id,
            "role": role,
            "created_at": utc_now(),
            "expires_at": expires_at,
        }
    )


def _signup_common(collection_name: str, payload: dict, role: str) -> dict:
    try:
        payload["hashed_password"] = hash_password(payload.pop("password"))
        payload["is_active"] = True
        payload["created_at"] = utc_now()
        principal = create_with_increment(collection_name, payload)
        token = create_access_token({"sub": str(principal["id"]), "role": role})
        _create_session(token, principal["id"], role)
        return {"access_token": token, "token_type": "bearer"}
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email already registered")

@router.post("/user/signup", response_model=Token)
def user_signup(data: UserSignup):
    try:
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        return _signup_common("users", data.model_dump(), "user")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.")

@router.post("/user/login", response_model=Token)
def user_login(data: UserLogin):
    try:
        user = db.users.find_one({"email": data.email})
        if not user or not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": str(user["id"]), "role": "user"})
        db.sessions.delete_many({"user_id": user["id"], "role": "user"})
        _create_session(token, user["id"], "user")
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")

@router.post("/token", response_model=Token, tags=["Authentication"])
def swagger_login(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2-compatible login for Swagger Authorize button. Use email as username."""
    user = db.users.find_one({"email": form_data.username})
    if user and verify_password(form_data.password, user["hashed_password"]):
        token = create_access_token({"sub": str(user["id"]), "role": "user"})
        db.sessions.delete_many({"user_id": user["id"], "role": "user"})
        _create_session(token, user["id"], "user")
        return {"access_token": token, "token_type": "bearer"}

    owner = db.restaurant_owners.find_one({"email": form_data.username})
    if owner and verify_password(form_data.password, owner["hashed_password"]):
        token = create_access_token({"sub": str(owner["id"]), "role": "owner"})
        db.sessions.delete_many({"user_id": owner["id"], "role": "owner"})
        _create_session(token, owner["id"], "owner")
        return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.post("/owner/signup", response_model=Token)
def owner_signup(data: OwnerSignup):
    try:
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        return _signup_common("restaurant_owners", data.model_dump(), "owner")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.")

@router.post("/owner/login", response_model=Token)
def owner_login(data: OwnerLogin):
    try:
        owner = db.restaurant_owners.find_one({"email": data.email})
        if not owner or not verify_password(data.password, owner["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": str(owner["id"]), "role": "owner"})
        db.sessions.delete_many({"user_id": owner["id"], "role": "owner"})
        _create_session(token, owner["id"], "owner")
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")