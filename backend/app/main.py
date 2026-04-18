from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models
from app.routers import auth, users, restaurants, reviews, review_events, favorites, preferences, chatbot

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Yelp Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(reviews.router)
app.include_router(review_events.router)
app.include_router(favorites.router)
app.include_router(preferences.router)
app.include_router(chatbot.router)

@app.get("/")
def root():
    return {"message": "Yelp Backend is running!"}