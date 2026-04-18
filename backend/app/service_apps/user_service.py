from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models
from app.routers import auth, users, favorites, preferences, chatbot


def create_app() -> FastAPI:
    app = FastAPI(title="Yelp User Service")
    Base.metadata.create_all(bind=engine)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # User-facing endpoints (includes both user+owner auth routes for now).
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(favorites.router)
    app.include_router(preferences.router)
    app.include_router(chatbot.router)

    @app.get("/")
    def root():
        return {"service": "user", "status": "ok"}

    return app


app = create_app()

