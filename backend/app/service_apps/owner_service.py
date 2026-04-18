from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models
from app.routers import auth, users, restaurants


def create_app() -> FastAPI:
    app = FastAPI(title="Yelp Owner Service")
    Base.metadata.create_all(bind=engine)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Owner flows live across auth + users(/owner/*) + some restaurant management.
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(restaurants.router)

    @app.get("/")
    def root():
        return {"service": "owner", "status": "ok"}

    return app


app = create_app()

