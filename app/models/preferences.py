from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    cuisines = Column(String(300), nullable=True)        # e.g. "Italian,Chinese"
    price_range = Column(String(20), nullable=True)      # e.g. "$$"
    location = Column(String(200), nullable=True)
    dietary_needs = Column(String(300), nullable=True)   # e.g. "vegan,halal"
    ambiance = Column(String(200), nullable=True)        # e.g. "casual,romantic"
    sort_by = Column(String(50), nullable=True)          # rating/distance/price

    user = relationship("User")