from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from app.config import get_settings

settings = get_settings()

if settings.TURSO_DATABASE_URL and settings.TURSO_AUTH_TOKEN:
    # Turso production
    # Strip "libsql://" prefix to get hostname, and use sqlite+aiolibsql
    hostname = settings.TURSO_DATABASE_URL.replace("libsql://", "")
    engine = create_async_engine(
        f"sqlite+aiolibsql://{hostname}?secure=true",
        connect_args={"auth_token": settings.TURSO_AUTH_TOKEN},
        poolclass=NullPool,
        echo=False,
    )
else:
    # Local development
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},  # Required for SQLite
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db():
    """FastAPI dependency — yields an async DB session, closes on teardown."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables. Called once on app startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
