from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    cuisine = Column(String(100), nullable=True)
    address = Column(String(300), nullable=True)
    city = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    hours = Column(String(300), nullable=True)
    contact = Column(String(100), nullable=True)
    photos = Column(String(500), nullable=True)
    pricing_tier = Column(String(10), nullable=True)  # $, $$, $$$, $$$$
    amenities = Column(String(300), nullable=True)
    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("restaurant_owners.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    reviews = relationship("Review", back_populates="restaurant")