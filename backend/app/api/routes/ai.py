"""
SupplySense — HTTP API Route for Manager Assistant AI Query Handling
======================================================================

Exposes the existing Manager Assistant & LangGraph Multi-Agent Supervisor over HTTP.
Provides request validation, correlation ID propagation, error mapping, and OpenAPI specs.
"""

import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import JSONResponse

from backend.app.config.settings import settings
from backend.app.utils.logger import logger
from backend.app.ai.supervisor import SupplySenseSupervisor, SupervisorResponse
from backend.app.api.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIChatErrorResponse,
    AIChatErrorDetail,
)

from backend.app.ai.core.exceptions import (
    AIError,
    AgentError,
    AgentExecutionError,
    ToolError,
    ToolExecutionError,
    LLMError,
    LLMTimeoutError,
    LLMRateLimitError,
    RAGError,
    RoutingError,
)

router = APIRouter(prefix="/ai", tags=["AI Manager Assistant"])


def get_supervisor() -> SupplySenseSupervisor:
    """Dependency provider for SupplySenseSupervisor instance."""
    return SupplySenseSupervisor()


@router.post(
    "/chat",
    response_model=AIChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Supply Chain Query to AI Manager Assistant",
    description=(
        "Processes a natural-language manager query through the SupplySense AI Assistant. "
        "Automatically routes direct operational queries to database tools, complex analytical "
        "queries to specialized agents, and policy questions to the RAG knowledge retriever."
    ),
    responses={
        200: {
            "description": "Successful AI query response.",
            "model": AIChatResponse,
        },
        400: {
            "description": "Bad Request / Routing error.",
            "model": AIChatErrorResponse,
        },
        422: {
            "description": "Validation Error (empty or invalid message input).",
        },
        500: {
            "description": "Internal AI execution or tool failure.",
            "model": AIChatErrorResponse,
        },
        503: {
            "description": "AI, Vector DB, or LLM Service Unavailable.",
            "model": AIChatErrorResponse,
        },
        504: {
            "description": "LLM Service Timeout.",
            "model": AIChatErrorResponse,
        },
    },
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "examples": {
                        "direct_operational_query": {
                            "summary": "Direct Tool Operational Lookup",
                            "value": {
                                "message": "Give me MacBook quantity"
                            },
                        },
                        "agent_analytical_query": {
                            "summary": "Multi-Agent Stockout Risk Analysis",
                            "value": {
                                "message": "Which products have the highest stockout risk?"
                            },
                        },
                        "rag_policy_query": {
                            "summary": "RAG SOP Knowledge Query",
                            "value": {
                                "message": "What is our emergency procurement process?"
                            },
                        },
                    }
                }
            }
        }
    },
)
async def chat(
    payload: AIChatRequest = Body(...),
    supervisor: SupplySenseSupervisor = Depends(get_supervisor),
) -> AIChatResponse:
    """
    Executes a manager natural-language query through the LangGraph Supervisor.
    """
    # 1. Resolve Correlation Request ID
    req_id = payload.request_id or str(uuid.uuid4())
    logger.info(
        f"AIChat request received | request_id={req_id} query='{payload.message}' "
        f"conversation_id={payload.conversation_id} user_id={payload.user_id}"
    )

    try:
        # 2. Invoke existing Supervisor entrypoint
        supervisor_response: SupervisorResponse = await supervisor.run(
            user_question=payload.message
        )

        logger.info(
            f"AIChat request processed | request_id={req_id} status={supervisor_response.status} "
            f"query_type={supervisor_response.query_type} confidence={supervisor_response.confidence}"
        )

        # 3. Convert to HTTP API response
        return AIChatResponse.from_supervisor_response(
            response=supervisor_response,
            request_id=req_id,
        )

    except LLMTimeoutError as e:
        logger.error(f"AIChat LLM Timeout | request_id={req_id} err={e.message}")
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="LLM_TIMEOUT",
                    message="The AI language model service timed out while processing the request.",
                ),
            ).model_dump(),
        )

    except LLMRateLimitError as e:
        logger.error(f"AIChat LLM Rate Limit | request_id={req_id} err={e.message}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="LLM_RATE_LIMIT",
                    message="AI service rate limit exceeded. Please retry after a brief delay.",
                ),
            ).model_dump(),
        )

    except (LLMError, RAGError) as e:
        logger.error(f"AIChat Service Error | request_id={req_id} err={e.message}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="AI_SERVICE_UNAVAILABLE",
                    message="The AI knowledge or reasoning service is temporarily unavailable.",
                ),
            ).model_dump(),
        )

    except (AgentExecutionError, ToolExecutionError, ToolError, AgentError) as e:
        logger.error(f"AIChat Execution Error | request_id={req_id} err={e.message}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="AI_EXECUTION_ERROR",
                    message="An error occurred while executing the AI decision workflow.",
                ),
            ).model_dump(),
        )

    except RoutingError as e:
        logger.warning(f"AIChat Routing Error | request_id={req_id} err={e.message}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="ROUTING_ERROR",
                    message="Could not route or process the specified query intent.",
                ),
            ).model_dump(),
        )

    except AIError as e:
        logger.error(f"AIChat Base AI Error | request_id={req_id} err={e.message}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="AI_SYSTEM_ERROR",
                    message="An AI system error occurred.",
                ),
            ).model_dump(),
        )

    except Exception as e:
        # Catch-all: Ensure zero secret leakage (passwords, API keys, stack traces)
        logger.critical(f"AIChat Unhandled Exception | request_id={req_id} err={str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=AIChatErrorResponse(
                status="error",
                request_id=req_id,
                error=AIChatErrorDetail(
                    code="INTERNAL_SERVER_ERROR",
                    message="An unexpected internal server error occurred while processing the AI query.",
                ),
            ).model_dump(),
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Lightweight AI Service Health Check",
    description="Returns configuration and availability status of AI components without executing LLM calls.",
)
async def ai_health() -> Dict[str, Any]:
    """Lightweight AI health check endpoint."""
    return {
        "status": "online",
        "service": "SupplySense Intelligent Manager Assistant",
        "llm_provider": settings.LLM_PROVIDER,
        "llm_model": settings.GROQ_MODEL,
        "vector_store": settings.VECTORSTORE_PROVIDER,
        "qdrant_collection": settings.QDRANT_COLLECTION,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "embedding_model": settings.HUGGINGFACE_EMBEDDING_MODEL,
    }
