"""
SupplySense — Shared AI Core: State Models
============================================

Reusable state models for individual agent executions.

Design Principles
-----------------
* **Does NOT replace** the existing ``SupervisorState`` TypedDict in
  ``supervisor/state.py``.  That state drives the LangGraph ``StateGraph``
  and must remain a ``TypedDict`` with reducer annotations.
* Provides ``BaseAgentState`` — a Pydantic model consolidating the
  duplicated per-agent state fields (``user_question``, ``tool_outputs``,
  ``error``, ``execution_metadata``, etc.) found in all 6+ agent state
  classes.
* Provides ``BaseExecutionMetadata`` — the common denominator of the
  per-agent ``ExecutionMetadata`` models duplicated across shipment,
  supplier, forecast, risk, executive, and RAG agent states.
* Domain agents can *subclass* ``BaseAgentState`` to add their own
  domain-specific fields while inheriting common infrastructure.

Compatibility Notes
-------------------
* The existing ``SupervisorState`` remains the single source of truth for
  LangGraph graph execution.  ``BaseAgentState`` is for *internal* agent
  lifecycle tracking — it is created and consumed entirely within an
  agent's ``analyze()`` / ``execute()`` method.
* ``BaseAgentState`` is **serialisable** and can be logged, traced, or
  returned as part of execution metadata.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared Execution Metadata
# ---------------------------------------------------------------------------

class BaseExecutionMetadata(BaseModel):
    """
    Common execution metrics captured during a single agent run.

    This consolidates the ``ExecutionMetadata`` Pydantic model that was
    independently defined in 6 agent state modules.

    Attributes:
        duration_ms: Total execution time in milliseconds.
        tokens_used: Approximate token usage (if tracked).
        tools_called: Number of tool invocations made.
        agents_received: Number of upstream agent outputs received
                         (relevant for synthesis agents like Risk / Executive).
        retrieval_method: Vector retrieval strategy used (RAG agent).
        documents_retrieved: Number of documents retrieved (RAG agent).
    """
    duration_ms: float = 0.0
    tokens_used: int = 0
    tools_called: int = 0
    agents_received: int = 0
    retrieval_method: Optional[str] = None
    documents_retrieved: int = 0


# ---------------------------------------------------------------------------
# Shared Agent State
# ---------------------------------------------------------------------------

class BaseAgentState(BaseModel):
    """
    Common state fields shared across all SupplySense agent state objects.

    Consolidates the duplicated fields found in ``InventoryAgentState``,
    ``ShipmentState``, ``SupplierAgentState``, ``ForecastAgentState``,
    ``RiskAgentState``, ``ExecutiveAgentState``, and ``RAGAgentState``.

    Domain agents can subclass this to add domain-specific fields::

        class InventoryAgentState(BaseAgentState):
            inventory_status: str = ""
            # ... other inventory-specific fields

    Attributes:
        user_question: The original user query.
        conversation_history: Past interactions for multi-turn context.
        detected_intent: Classified intent of the user's question.
        selected_tools: Tool names the agent decided to invoke.
        tool_outputs: Raw data returned from each tool invocation.
        confidence_score: Overall confidence in the analysis.
        final_response: The final Pydantic response object (stored as Any
                        to allow domain-specific types).
        execution_metadata: Shared execution metrics.
        error: Error message captured for graceful degradation.
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
        description="Classified intent of the user's question."
    )
    selected_tools: List[str] = Field(
        default_factory=list,
        description="Tool names the agent decided to invoke."
    )
    tool_outputs: Dict[str, Any] = Field(
        default_factory=dict,
        description="Raw data returned from each tool invocation."
    )
    confidence_score: float = Field(
        default=0.0,
        description="Overall confidence in the analysis."
    )
    # Stored as Any so that domain agents can assign their own response type.
    final_response: Optional[Any] = Field(
        default=None,
        description="The final structured Pydantic response."
    )
    execution_metadata: BaseExecutionMetadata = Field(
        default_factory=BaseExecutionMetadata
    )
    error: Optional[str] = Field(
        default=None,
        description="Error captured during execution for graceful degradation."
    )

    def record_tool_call(self, tool_name: str, output: Any) -> None:
        """
        Record a tool invocation and its output for observability.

        This consolidates the identical ``record_tool_call`` /
        ``add_tool_output`` methods that exist in inventory, shipment,
        supplier, and forecast agent states.

        Args:
            tool_name: The name of the tool that was called.
            output: The raw output returned by the tool.
        """
        self.selected_tools.append(tool_name)
        self.tool_outputs[tool_name] = output
        self.execution_metadata.tools_called += 1

    def record_agent_input(self, agent_name: str, output: Dict[str, Any]) -> None:
        """
        Record an upstream agent's structured output.

        Used by synthesis agents (Risk, Executive) that consume outputs
        from operational agents rather than calling database tools.

        Args:
            agent_name: Name of the upstream agent.
            output: The serialised response from the upstream agent.
        """
        self.tool_outputs[agent_name] = output
        self.execution_metadata.agents_received += 1

    def record_retrieval(
        self, chunks: List[Dict[str, Any]], method: str
    ) -> None:
        """
        Record a vector retrieval operation (used by RAG agents).

        Args:
            chunks: The retrieved document chunks.
            method: Retrieval strategy used ('similarity' or 'mmr').
        """
        self.tool_outputs["retrieved_chunks"] = chunks
        self.execution_metadata.documents_retrieved = len(chunks)
        self.execution_metadata.retrieval_method = method
