"""
SupplySense — LangGraph Supervisor Module
"""

# Compatibility polyfill for environment's langchain 1.x agent imports
import sys
try:
    import langchain.agents
    import langchain_classic.agents
    if not hasattr(langchain.agents, "AgentExecutor"):
        setattr(langchain.agents, "AgentExecutor", langchain_classic.agents.AgentExecutor)
    if not hasattr(langchain.agents, "create_tool_calling_agent"):
        setattr(langchain.agents, "create_tool_calling_agent", langchain_classic.agents.create_tool_calling_agent)
except Exception:
    pass

from backend.app.ai.supervisor.graph import (
    SupplySenseSupervisor,
    supervisor_graph_app,
    run_supervisor,
)
from backend.app.ai.supervisor.schemas import (
    SupervisorResponse,
    IntentClassification,
    IntentCategory,
    AgentType,
    MergedFinding,
    MergedRecommendation,
)
from backend.app.ai.supervisor.state import SupervisorState

__all__ = [
    "SupplySenseSupervisor",
    "supervisor_graph_app",
    "run_supervisor",
    "SupervisorResponse",
    "SupervisorState",
    "IntentClassification",
    "IntentCategory",
    "AgentType",
    "MergedFinding",
    "MergedRecommendation",
]
