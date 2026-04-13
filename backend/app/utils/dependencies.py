from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.database import db, sanitize_document, utc_now
from app.utils.jwt import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_auth(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    session_doc = db.sessions.find_one({"token": token})
    expires_at = session_doc.get("expires_at") if session_doc else None
    if not session_doc or not expires_at or expires_at <= utc_now():
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    user_id = int(payload.get("sub"))
    role = payload.get("role")
    if role == "user":
        user = sanitize_document(db.users.find_one({"id": user_id}))
    elif role == "owner":
        user = sanitize_document(db.restaurant_owners.find_one({"id": user_id}))
    else:
        raise HTTPException(status_code=401, detail="Invalid role")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"role": role, "principal": user}

def get_current_user(token_data = Depends(get_current_auth)):
    return token_data["principal"]

def get_current_reviewer(token_data = Depends(get_current_auth)):
    if token_data["role"] != "user":
        raise HTTPException(status_code=403, detail="User role required")
    return token_data["principal"]

def get_current_owner(token_data = Depends(get_current_auth)):
    if token_data["role"] != "owner":
        raise HTTPException(status_code=403, detail="Owner role required")
    return token_data["principal"]