from fastapi import FastAPI
from app.database import engine, Base
import app.models
from app.routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Yelp Backend")

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Yelp Backend is running!"}