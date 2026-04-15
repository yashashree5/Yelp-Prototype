from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import restaurants


def create_app() -> FastAPI:
    app = FastAPI(title="Yelp Restaurant Service")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(restaurants.router)

    @app.get("/")
    def root():
        return {"service": "restaurant", "status": "ok"}

    return app


app = create_app()

