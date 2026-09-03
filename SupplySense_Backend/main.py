"""
SupplySense — Enterprise AI Supply Chain Decision Support System
FastAPI Application Foundation
==================================================================
"""

import sys
import uuid
import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

from contextlib import asynccontextmanager
from backend.app.config.settings import settings
from backend.app.utils.logger import logger
from backend.app.api.v1 import api_v1_router
from backend.app.schemas.common import ErrorResponse, ErrorDetail
from backend.app.services.erp_simulator import start_simulation, stop_simulation


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENABLE_LIVE_ERP_SIMULATOR:
        logger.info(f"Auto-starting Live Cloud ERP Stream Simulator (Interval: {settings.SIMULATION_INTERVAL_SECONDS}s)")
        start_simulation(interval_seconds=settings.SIMULATION_INTERVAL_SECONDS)
    yield
    stop_simulation()


# Initialize FastAPI App Foundation
app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI-powered Supply Chain Decision Support System",
    version="1.0.0",
    debug=settings.DEBUG,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Correlation ID & Performance Middleware
@app.middleware("http")
async def add_correlation_id_and_timing(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = req_id
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time_ms = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Process-Time-MS"] = f"{process_time_ms:.2f}"
    return response


# Register API v1 Aggregated Routers
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", status_code=status.HTTP_200_OK, tags=["System Health"])
async def root():
    """Root system health check endpoint."""
    return {
        "status": "online",
        "system": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER,
        "vector_store": settings.VECTORSTORE_PROVIDER,
    }


@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
async def health_check():
    """Detailed system health check endpoint."""
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
