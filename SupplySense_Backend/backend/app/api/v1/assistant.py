"""
SupplySense — AI Assistant API v1 Router with Upstash Redis Caching
===================================================================
Endpoints for non-streaming and streaming natural language queries over the Multi-Agent Supervisor.
"""

import time
import json
import hashlib
import asyncio
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import StreamingResponse

from backend.app.config.settings import settings
from backend.app.utils.logger import logger
from backend.app.schemas.assistant import AIChatRequest, AIChatResponse, AIHealthResponse, StreamChunkResponse
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import get_supervisor, get_current_user
from backend.app.ai.supervisor import SupplySenseSupervisor, SupervisorResponse
from backend.app.core.redis import get_cache, set_cache

router = APIRouter(prefix="/ai", tags=["AI Manager Assistant"])


@router.get(
    "/health",
    response_model=BaseResponse[AIHealthResponse],
    status_code=status.HTTP_200_OK,
    summary="AI Component Health Check",
    description="Returns configuration status of active LLM, vector store, and collections.",
)
async def ai_health() -> BaseResponse[AIHealthResponse]:
    """Lightweight AI health check endpoint."""
    health_data = AIHealthResponse(
        status="online",
        llm_provider=settings.LLM_PROVIDER,
        llm_model=settings.GROQ_MODEL if settings.LLM_PROVIDER == "groq" else settings.OPENAI_MODEL,
        vector_store=settings.VECTORSTORE_PROVIDER,
        qdrant_collection=settings.QDRANT_COLLECTION,
    )
    return BaseResponse(success=True, message="AI Assistant operational.", data=health_data)


@router.post(
    "/chat",
    response_model=AIChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit Supply Chain Query to AI Manager Assistant",
    description="Executes a natural-language manager query through the LangGraph Supervisor with Redis 0ms caching.",
)
async def chat(
    payload: AIChatRequest = Body(...),
    supervisor: SupplySenseSupervisor = Depends(get_supervisor),
) -> AIChatResponse:
    """Executes natural language manager query through LangGraph Supervisor with Redis acceleration."""
    start_t = time.time()
    
    # 1. Normalize query and generate Redis cache key
    norm_query = payload.query.strip().lower()
    query_hash = hashlib.md5(norm_query.encode("utf-8")).hexdigest()
    cache_key = f"supplysense:ai:cache:{query_hash}"

    # 2. Check Cloud Redis Cache (0ms Instant Return)
    cached_res = await get_cache(cache_key)
    if cached_res:
        cached_res["execution_time_ms"] = 2.0
        return AIChatResponse(**cached_res)

    try:
        sup_response: SupervisorResponse = await supervisor.run(user_question=payload.query)
        duration_ms = (time.time() - start_t) * 1000

        findings_list = [f.model_dump() if hasattr(f, "model_dump") else dict(f) for f in sup_response.findings]
        recs_list = [r.model_dump() if hasattr(r, "model_dump") else dict(r) for r in sup_response.recommendations]

        ai_response = AIChatResponse(
            success=sup_response.status == "success",
            query=sup_response.query,
            response=sup_response.answer,
            execution_mode=sup_response.query_type,
            intent=str(sup_response.intent),
            sources=sup_response.citations_and_sources or [],
            selected_agents=sup_response.selected_agents or [],
            findings=findings_list,
            recommendations=recs_list,
            confidence=sup_response.confidence,
            execution_time_ms=round(duration_ms, 2)
        )

        # 3. Store AI Response in Cloud Redis with 10-minute TTL
        await set_cache(cache_key, ai_response.model_dump(), ttl_seconds=600)

        return ai_response
    except Exception as e:
        logger.error(f"AI Chat error: {e}", exc_info=True)
        import re
        err_msg = str(e)
        sanitized_msg = re.sub(r"://[^@]+@", "://***:***@", err_msg)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="AI execution error occurred. Please try again later.")


@router.post(
    "/stream",
    summary="Stream AI Assistant Response (Server-Sent Events)",
    description="Streams real-time token and agent node execution events.",
)
async def stream_chat(
    payload: AIChatRequest = Body(...),
    supervisor: SupplySenseSupervisor = Depends(get_supervisor),
):
    """SSE Streaming endpoint for AI Assistant manager responses."""
    async def event_generator():
        yield f"data: {json.dumps({'chunk_type': 'node_start', 'content': 'Router classifying intent...', 'agent_name': 'router'})}\n\n"
        await asyncio.sleep(0.05)
        
        try:
            sup_response: SupervisorResponse = await supervisor.run(user_question=payload.query)
            for agent in sup_response.selected_agents:
                yield f"data: {json.dumps({'chunk_type': 'node_start', 'content': f'Executing {agent} node...', 'agent_name': agent})}\n\n"
                await asyncio.sleep(0.02)
                
            yield f"data: {json.dumps({'chunk_type': 'token', 'content': sup_response.answer, 'agent_name': 'supervisor'})}\n\n"
            yield f"data: {json.dumps({'chunk_type': 'done', 'content': '[COMPLETE]', 'agent_name': 'supervisor'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'chunk_type': 'error', 'content': str(exc), 'agent_name': 'error'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
