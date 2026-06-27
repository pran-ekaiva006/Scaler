from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
import app.models  # Import models to register them with Base.metadata
from app.routers import collections, folders, requests, environments, proxy, history
from app.seed import check_and_seed

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — creates DB tables on boot, seeds if empty."""
    await init_db()
    await check_and_seed()
    yield


app = FastAPI(
    title="Postman Clone API",
    description="Proxy-based HTTP client backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collections.router)
app.include_router(folders.router)
app.include_router(requests.router)
app.include_router(environments.router)
app.include_router(proxy.router)
app.include_router(history.router)

@app.get("/api/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}
