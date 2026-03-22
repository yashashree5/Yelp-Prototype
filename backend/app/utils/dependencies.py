from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.jwt import verify_token
from app.models.user import User
from app.models.owner import RestaurantOwner

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    return user