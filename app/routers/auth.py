from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.owner import RestaurantOwner
from app.schemas.user import UserSignup, UserLogin, Token
from app.schemas.owner import OwnerSignup, OwnerLogin
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# User Signup
@router.post("/user/signup", response_model=Token)
def user_signup(data: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": "user"})
    return {"access_token": token, "token_type": "bearer"}

# User Login
@router.post("/user/login", response_model=Token)
def user_login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": "user"})
    return {"access_token": token, "token_type": "bearer"}

# Owner Signup
@router.post("/owner/signup", response_model=Token)
def owner_signup(data: OwnerSignup, db: Session = Depends(get_db)):
    existing = db.query(RestaurantOwner).filter(RestaurantOwner.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    owner = RestaurantOwner(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        restaurant_location=data.restaurant_location
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    token = create_access_token({"sub": str(owner.id), "role": "owner"})
    return {"access_token": token, "token_type": "bearer"}

# Owner Login
@router.post("/owner/login", response_model=Token)
def owner_login(data: OwnerLogin, db: Session = Depends(get_db)):
    owner = db.query(RestaurantOwner).filter(RestaurantOwner.email == data.email).first()
    if not owner or not verify_password(data.password, owner.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(owner.id), "role": "owner"})
    return {"access_token": token, "token_type": "bearer"}