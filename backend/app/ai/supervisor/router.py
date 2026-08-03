"""
SupplySense — LangGraph Supervisor Router
Analyzes user question and returns structured intent classification & agent routing decision.
"""

import logging
from typing import List

from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.supervisor.prompt import SUPERVISOR_ROUTER_PROMPT
from backend.app.ai.supervisor.schemas import (
    IntentClassification,
    IntentCategory,
    AgentType,
)
from backend.app.ai.supervisor.state import SupervisorState

logger = logging.getLogger(__name__)


@traceable(name="supervisor_classify_intent")
async def classify_intent_and_route(user_question: str) -> IntentClassification:
    """
    Invokes the LLM with structured output to classify user intent
    and select the required target agents.

    Args:
        user_question: Natural language query from user.

    Returns:
        IntentClassification: Structured intent, explanation, and selected_agents list.
    """
    try:
        llm = get_llm()
        structured_llm = llm.with_structured_output(IntentClassification)

        messages = [
            SystemMessage(content=SUPERVISOR_ROUTER_PROMPT),
            HumanMessage(content=f"User Query: {user_question}"),
        ]

        result: IntentClassification = await structured_llm.ainvoke(messages)
        logger.info(
            f"Intent classified as '{result.primary_intent}' with agents: "
            f"{[a.value for a in result.selected_agents]}"
        )
        return result

    except Exception as e:
        logger.error(f"Intent classification failed: {e}. Falling back to default routing.", exc_info=True)
        # Fallback routing based on keywords if LLM classification fails
        return _keyword_fallback_routing(user_question)


def _keyword_fallback_routing(user_question: str) -> IntentClassification:
    """Fallback keyword-based router if LLM classification fails."""
    q_lower = user_question.lower()
    selected: List[AgentType] = []

    if any(k in q_lower for k in ["inventory", "stock", "reorder", "dead stock", "warehouse"]):
        selected.append(AgentType.INVENTORY)
    if any(k in q_lower for k in ["shipment", "delivery", "carrier", "delay", "eta", "tracking"]):
        selected.append(AgentType.SHIPMENT)
    if any(k in q_lower for k in ["supplier", "vendor", "lead time", "procurement risk", "quality"]):
        selected.append(AgentType.SUPPLIER)
    if any(k in q_lower for k in ["forecast", "demand", "sales", "trending", "seasonal"]):
        selected.append(AgentType.FORECAST)
    if any(k in q_lower for k in ["risk", "critical", "out of stock", "shortage"]):
        selected.append(AgentType.RISK)
    if any(k in q_lower for k in ["executive", "report", "summary", "c-suite", "overview"]):
        selected.append(AgentType.EXECUTIVE)
    if any(k in q_lower for k in ["policy", "sop", "guideline", "rule", "audit", "contract"]):
        selected.append(AgentType.RAG)

    if not selected:
        # Default fallback to Inventory if completely unclassified
        selected = [AgentType.INVENTORY]

    intent_cat = IntentCategory.HYBRID if len(selected) > 1 else IntentCategory.INVENTORY

    return IntentClassification(
        primary_intent=intent_cat,
        explanation="Fallback keyword routing executed due to classification exception.",
        selected_agents=selected,
        requires_parallel_execution=len(selected) > 1,
        requires_sequential_synthesis=AgentType.RISK in selected or AgentType.EXECUTIVE in selected,
    )


async def router_node(state: SupervisorState) -> dict:
    """
    LangGraph node function for intent classification and routing decision.
    """
    user_question = state.get("user_question", "")
    logger.info(f"Executing router_node for query: {user_question}")

    classification = await classify_intent_and_route(user_question)
    selected_agent_names = [a.value for a in classification.selected_agents]

    return {
        "intent": classification.primary_intent.value,
        "intent_explanation": classification.explanation,
        "selected_agents": selected_agent_names,
        "nodes_executed": ["router_node"],
    }
