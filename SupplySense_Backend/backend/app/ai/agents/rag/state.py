"""
SupplySense - Enterprise RAG Knowledge Agent State
Maintains context throughout the agent's execution lifecycle.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.ai.agents.rag.schemas import RAGResponse


class ExecutionMetadata(BaseModel):
    """Observability metrics captured during a single agent run."""
    duration_ms: float = 0.0
    tokens_used: int = 0
    documents_retrieved: int = 0
    retrieval_method: Optional[str] = None


class RAGAgentState(BaseModel):
    """
    State object for the Enterprise RAG Knowledge Agent.
    Tracks the full lifecycle from user question through document
    retrieval to the final grounded answer.
    """
    user_question: str = Field(
        description="The original user query."
    )
    conversation_history: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Past interactions for multi-turn context."
    )
    detected_intent: Optional[str] = Field(
        default=None,
        description="Classified intent - e.g., 'policy_lookup', 'sop_query', 'contract_query'."
    )
    retrieved_chunks: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Raw document chunks from the vector store."
    )
    context_text: str = Field(
        default="",
        description="Formatted context string passed to the LLM."
    )
    confidence_score: float = Field(
        default=0.0,
        description="Confidence in the answer."
    )
    final_response: Optional[RAGResponse] = Field(
        default=None,
        description="The final structured Pydantic response."
    )
    execution_metadata: ExecutionMetadata = Field(
        default_factory=ExecutionMetadata
    )
    error: Optional[str] = Field(
        default=None,
        description="Error captured during execution for graceful degradation."
    )

    def record_retrieval(
        self, chunks: List[Dict[str, Any]], method: str
    ) -> None:
        """Record a retrieval operation for observability."""
        self.retrieved_chunks = chunks
        self.execution_metadata.documents_retrieved = len(chunks)
        self.execution_metadata.retrieval_method = method
