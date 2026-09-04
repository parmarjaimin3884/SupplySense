"""
SupplySense — Core Application Settings
Pydantic-Settings configuration module for managing application,
database, security, and AI provider environment variables.
"""

from typing import Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # General App Config
    APP_NAME: str = "SupplySense"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Live Cloud Demo Simulation Config
    ENABLE_LIVE_ERP_SIMULATOR: bool = False
    SIMULATION_INTERVAL_SECONDS: float = 6.0

    # Security Config
    SECRET_KEY: str = "supplysense-dev-super-secret-key-change-in-production-32bytes!"
    JWT_SECRET_KEY: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Database Config (Neon PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/supplysense"

    # AI Provider Config
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.6-flash"

    # LLM Tuning Parameters
    LLM_TEMPERATURE: float = 0.0
    LLM_MAX_TOKENS: Optional[int] = None
    LLM_TIMEOUT: int = 120
    LLM_RETRY_COUNT: int = 3

    # Observability Config (LangSmith)
    LANGSMITH_API_KEY: Optional[str] = None
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_PROJECT: str = "SupplySense-Enterprise"

    # Vector Database Config (Qdrant)
    VECTORSTORE_PROVIDER: str = "qdrant"
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "supplysense_knowledge"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_GRPC_PORT: int = 6334
    QDRANT_PATH: Optional[str] = None
    QDRANT_TIMEOUT: int = 60
    QDRANT_PREFER_GRPC: bool = False

    # Embeddings Config
    EMBEDDING_PROVIDER: str = "huggingface"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    HUGGINGFACE_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_BATCH_SIZE: int = 64
    EMBEDDING_DEVICE: Optional[str] = None

    @model_validator(mode="after")
    def validate_production_security(self):
        if self.ENVIRONMENT.lower() == "production":
            secret = self.JWT_SECRET_KEY or self.SECRET_KEY
            if len(secret) < 32 or "change" in secret.lower() or "dev-" in secret.lower():
                raise ValueError("A strong JWT_SECRET_KEY or SECRET_KEY is required in production.")
            if self.DEBUG:
                raise ValueError("DEBUG must be False in production.")
            if "localhost" in self.DATABASE_URL or "127.0.0.1" in self.DATABASE_URL:
                raise ValueError("DATABASE_URL must be explicitly configured in production.")
        return self


# Singleton instance
settings = Settings()
