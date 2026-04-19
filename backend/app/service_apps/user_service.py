from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import ensure_indexes
from app.routers import auth, users, favorites, preferences, chatbot


def create_app() -> FastAPI:
    app = FastAPI(title="Yelp User Service")

    @app.on_event("startup")
    def startup():
        ensure_indexes()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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
