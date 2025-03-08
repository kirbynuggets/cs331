"""Main FastAPI application."""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import engine, Base
from core import models
from routes import items, search
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/checked successfully.")
    except Exception as e:
        print(f"Error during database initialization: {e}")
        raise

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(items.router)
app.include_router(search.router)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="localhost",
        port=8000,
        # ssl_keyfile="../../key.pem",  # Replace with your actual paths
        # ssl_certfile="../../cert.pem",
    )
