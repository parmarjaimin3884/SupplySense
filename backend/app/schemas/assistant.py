"""
SupplySense — AI Assistant Pydantic v2 Schemas
===============================================
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator


class AIChatRequest(BaseModel):
    query: Optional[str] = Field(default=None, description="Natural language manager supply chain query.")
    message: Optional[str] = Field(default=None, description="Alternative message payload key.")
    conversation_id: Optional[str] = Field(default=None, description="Optional conversation turn ID.")
    user_id: Optional[str] = Field(default=None, description="Optional user correlation ID.")

    @model_validator(mode="before")
    @classmethod
    def resolve_query_or_message(cls, data: Any) -> Any:
        if isinstance(data, dict):
            q = data.get("query") or data.get("message")
            if not q or not str(q).strip():
                raise ValueError("Either 'query' or 'message' field must be provided and non-empty.")
            data["query"] = str(q).strip()
            data["message"] = str(q).strip()
        return data


class AIChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success: bool = Field(default=True, description="Execution success indicator.")
    query: str = Field(..., description="Original user query.")
    response: str = Field(..., description="Synthesized AI manager assistant response text.")
    execution_mode: str = Field(default="agent", description="Execution path: direct_tool, agent, rag, etc.")
    intent: Optional[str] = Field(default=None, description="Classified intent.")
    sources: List[str] = Field(default_factory=list, description="RAG document source citations.")
    selected_agents: List[str] = Field(default_factory=list, description="Agents invoked during processing.")
    findings: List[Dict[str, Any]] = Field(default_factory=list, description="Key operational findings.")
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, description="Consolidated recommendations.")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Overall confidence score.")
    execution_time_ms: float = Field(default=0.0, description="Processing latency in milliseconds.")


class AIHealthResponse(BaseModel):
    status: str = Field(default="online", description="AI Assistant status.")
    llm_provider: str = Field(..., description="Configured LLM provider.")
    llm_model: str = Field(..., description="Configured LLM model.")
    vector_store: str = Field(..., description="Configured vector store provider.")
    qdrant_collection: str = Field(..., description="Active vector collection name.")


class StreamChunkResponse(BaseModel):
    chunk_type: str = Field(description="Type: 'node_start', 'token', 'finding', 'done'.")
    content: str = Field(description="Text chunk or status payload.")
    agent_name: Optional[str] = Field(default=None, description="Active agent emitted from.")
