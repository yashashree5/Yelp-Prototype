from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import ensure_indexes
from app.routers import reviews, review_events


def create_app() -> FastAPI:
    app = FastAPI(title="Yelp Review Service")

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

    app.include_router(reviews.router)
    app.include_router(review_events.router)

    @app.get("/")
    def root():
        return {"service": "review", "status": "ok"}

    return app


app = create_app()
