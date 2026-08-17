"""
SupplySense — Database Configuration Foundation
SQLAlchemy 2.0 Async engine, sessionmaker, and declarative base setup
configured for Neon PostgreSQL.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
    AsyncEngine,
)
from sqlalchemy.orm import DeclarativeBase

from backend.app.config.settings import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.0 models."""
    pass


# Convert postgresql:// to postgresql+asyncpg:// if needed
import re
db_url = settings.DATABASE_URL
needs_ssl = "sslmode=require" in db_url or "ssl=true" in db_url

if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

if "?sslmode=" in db_url or "&sslmode=" in db_url:
    db_url = re.sub(r'[\?&]sslmode=[^&]+', '', db_url)

connect_args = {"ssl": True} if needs_ssl else {}

# Async Engine Creation
async_engine: AsyncEngine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
)

# Async Session Factory
async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency provider for obtaining an async database session.
    Suitable for FastAPI dependency injection.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
