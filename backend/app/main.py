from fastapi import FastAPI
from app.database import engine, Base
import app.models
from app.routers import auth, users, restaurants, reviews, favorites, preferences

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Yelp Backend")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
app.include_router(preferences.router)

@app.get("/")
def root():
    return {"message": "Yelp Backend is running!"}