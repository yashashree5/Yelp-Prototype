from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.owner import RestaurantOwner
from app.schemas.user import UserSignup, UserLogin, Token
from app.schemas.owner import OwnerSignup, OwnerLogin
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/user/signup", response_model=Token)
def user_signup(data: UserSignup, db: Session = Depends(get_db)):
    try:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        try:
            token = create_access_token({"sub": str(user.id), "role": "user"})
        except Exception:
            token = ""
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.")

@router.post("/user/login", response_model=Token)
def user_login(data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": str(user.id), "role": "user"})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")

@router.post("/token", response_model=Token, tags=["Authentication"])
def swagger_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2-compatible login for Swagger Authorize button. Use email as username."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        owner = db.query(RestaurantOwner).filter(RestaurantOwner.email == form_data.username).first()
        if not owner or not verify_password(form_data.password, owner.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": str(owner.id), "role": "owner"})
        return {"access_token": token, "token_type": "bearer"}
    token = create_access_token({"sub": str(user.id), "role": "user"})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/owner/signup", response_model=Token)
def owner_signup(data: OwnerSignup, db: Session = Depends(get_db)):
    try:
        existing = db.query(RestaurantOwner).filter(RestaurantOwner.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        owner = RestaurantOwner(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password),
            restaurant_location=data.restaurant_location
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
        try:
            token = create_access_token({"sub": str(owner.id), "role": "owner"})
        except Exception:
            token = ""
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.")

@router.post("/owner/login", response_model=Token)
def owner_login(data: OwnerLogin, db: Session = Depends(get_db)):
    try:
        owner = db.query(RestaurantOwner).filter(RestaurantOwner.email == data.email).first()
        if not owner or not verify_password(data.password, owner.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": str(owner.id), "role": "owner"})
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")