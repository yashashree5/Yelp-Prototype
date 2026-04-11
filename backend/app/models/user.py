from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(2), nullable=True)
    country = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    about_me = Column(String(500), nullable=True)
    languages = Column(String(200), nullable=True)
    profile_pic = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())