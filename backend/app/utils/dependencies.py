from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.jwt import verify_token
from app.models.user import User
from app.models.owner import RestaurantOwner

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_auth(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = int(payload.get("sub"))
    role = payload.get("role")
    if role == "user":
        user = db.query(User).filter(User.id == user_id).first()
    elif role == "owner":
        user = db.query(RestaurantOwner).filter(RestaurantOwner.id == user_id).first()
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