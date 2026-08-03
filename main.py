"""
SupplySense — Enterprise AI Supply Chain Decision Support System
FastAPI Application Foundation
"""

import sys
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

# Compatibility polyfill for environment's langchain 1.x agent imports
try:
    import langchain.agents
    import langchain_classic.agents
    if not hasattr(langchain.agents, "AgentExecutor"):
        setattr(langchain.agents, "AgentExecutor", langchain_classic.agents.AgentExecutor)
    if not hasattr(langchain.agents, "create_tool_calling_agent"):
        setattr(langchain.agents, "create_tool_calling_agent", langchain_classic.agents.create_tool_calling_agent)
except Exception:
    pass

from backend.app.config.settings import settings
from backend.app.utils.logger import logger

# Initialize FastAPI App Foundation
app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI-powered Supply Chain Decision Support System",
    version="1.0.0",
    debug=settings.DEBUG,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", status_code=status.HTTP_200_OK, tags=["System Health"])
async def root():
    """Root health check endpoint."""
    return {
        "status": "online",
        "system": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER,
        "vector_store": settings.VECTORSTORE_PROVIDER,
    }


@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.APP_NAME} server on {settings.HOST}:{settings.PORT}...")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
