"""
SupplySense — Fast Intent Router & Manager Assistant Router
============================================================

Classifies manager queries into the appropriate execution path using the
minimum amount of AI processing necessary:

    1. Fast Deterministic Engine (0ms LLM overhead, instant tool/RAG/hybrid detection)
    2. Structured LLM Router (fallback for complex multi-domain queries)

Execution Modes Supported:
    - DIRECT_TOOL: Simple factual queries routed directly to existing tools
    - AGENT: Complex analysis/reasoning queries routed to specialized agents
    - RAG: Company policy/SOP queries routed to Qdrant + Groq LLM
    - UNSUPPORTED_HYBRID: Queries combining PostgreSQL DB + Qdrant policy
    - UNKNOWN: Low-confidence or ambiguous queries requesting clarification
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple

from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.supervisor.schemas import (
    RouterDecision,
    ExecutionMode,
    RouterIntent,
    AgentType,
    IntentCategory,
    IntentClassification,
)
from backend.app.ai.supervisor.state import SupervisorState

logger = logging.getLogger(__name__)

# Minimum confidence threshold for routing without requesting clarification
CONFIDENCE_THRESHOLD = 0.60


# ---------------------------------------------------------------------------
# Level 1: Deterministic Engine (Fast Path - Zero LLM Latency)
# ---------------------------------------------------------------------------

def _deterministic_route(query: str) -> Optional[RouterDecision]:
    """
    Evaluates natural language query using fast regex and keyword patterns.
    Returns a RouterDecision if a definitive match is found, or None to fall back to LLM.
    """
    q_clean = query.strip()
    q_lower = re.sub(r"[.\?!;,]+$", "", q_clean.lower()).strip()

    # -----------------------------------------------------------------------
    # 1. UNSUPPORTED HYBRID CHECK
    # Checks if query combines operational DB entities/actions AND policy/SOP keywords
    # -----------------------------------------------------------------------
    has_policy_kw = any(k in q_lower for k in [
        "policy", "sop", "guideline", "rule", "procurement policy",
        "receiving procedure", "audit procedure", "contract", "terms"
    ])
    has_operational_kw = any(k in q_lower for k in [
        "macbook", "laptop", "iphone", "product", "inventory", "stock",
        "shipment", "delivery", "supplier", "reorder", "purchase order", "po"
    ])
    is_hybrid_question = ("according to" in q_lower or "based on" in q_lower or "comply" in q_lower) and has_policy_kw and has_operational_kw

    if is_hybrid_question or (has_policy_kw and ("should i reorder" in q_lower or "order" in q_lower) and has_operational_kw):
        logger.info(f"Deterministic router matched UNSUPPORTED_HYBRID for query: '{q_clean}'")
        return RouterDecision(
            query_type=ExecutionMode.UNSUPPORTED_HYBRID,
            intent=RouterIntent.UNSUPPORTED_HYBRID.value,
            explanation="Query requires both operational data and company policy knowledge. Hybrid reasoning is not enabled yet.",
            confidence=1.0,
        )

    # -----------------------------------------------------------------------
    # 2. AMBIGUOUS / UNKNOWN CHECK
    # Queries that are too vague to route confidently
    # -----------------------------------------------------------------------
    if q_lower in ["tell me something", "show me performance", "hi", "hello", "test", "help", "status"] or q_lower.startswith("tell me something"):
        logger.info(f"Deterministic router matched UNKNOWN/AMBIGUOUS for query: '{q_clean}'")
        return RouterDecision(
            query_type=ExecutionMode.UNKNOWN,
            intent=RouterIntent.UNKNOWN.value,
            explanation="Query is vague or ambiguous. Clarification is required.",
            confidence=0.4,
        )


    # -----------------------------------------------------------------------
    # 3. DIRECT TOOL LOOKUP PATTERNS (Simple operational queries)
    # -----------------------------------------------------------------------

    # A. Product quantity / stock lookup (e.g. "Give me MacBook quantity", "How many laptops are available?", "What is current stock of iPhone 15?")
    qty_patterns = [
        r"give me (?:the )?([a-zA-Z0-9\s\-]+?) (?:quantity|stock|count|available)",
        r"how many ([a-zA-Z0-9\s\-]+?) (?:are |is )?(?:available|in stock|on hand)",
        r"what is (?:the )?(?:current )?stock of ([a-zA-Z0-9\s\-]+)",
        r"quantity of ([a-zA-Z0-9\s\-]+)",
        r"current stock of ([a-zA-Z0-9\s\-]+)",
    ]

    for pat in qty_patterns:
        match = re.search(pat, q_lower)
        if match:
            entity = match.group(1).strip()
            # Clean entity stop words
            entity = re.sub(r"\b(there|left|products|units|items)\b", "", entity).strip()
            if entity:
                logger.info(f"Deterministic router matched DIRECT_TOOL (product stock) for '{entity}' in query: '{q_clean}'")
                return RouterDecision(
                    query_type=ExecutionMode.DIRECT_TOOL,
                    intent=RouterIntent.INVENTORY_LOOKUP.value,
                    tool="search_products",
                    entities={"product": entity, "operation": "current_quantity"},
                    explanation=f"Direct product inventory lookup for '{entity}'.",
                    confidence=0.99,
                )

    # B. Pending purchase orders count (e.g. "How many purchase orders are pending?")
    if any(k in q_lower for k in ["purchase orders are pending", "pending purchase orders", "pending pos", "how many pending pos"]):
        logger.info(f"Deterministic router matched DIRECT_TOOL (pending POs) for query: '{q_clean}'")
        return RouterDecision(
            query_type=ExecutionMode.DIRECT_TOOL,
            intent=RouterIntent.PURCHASE_ORDER_LOOKUP.value,
            tool="get_pending_purchase_orders",
            entities={"status": "Pending"},
            explanation="Direct lookup for pending purchase orders.",
            confidence=0.99,
        )

    # C. Active / Pending shipments count (e.g. "How many active shipments are there?", "How many pending shipments?")
    if any(k in q_lower for k in ["active shipments", "pending shipments", "shipments are active", "shipments in transit"]):
        logger.info(f"Deterministic router matched DIRECT_TOOL (pending shipments) for query: '{q_clean}'")
        return RouterDecision(
            query_type=ExecutionMode.DIRECT_TOOL,
            intent=RouterIntent.SHIPMENT_LOOKUP.value,
            tool="get_pending_shipments",
            entities={"status": "Pending/In Transit"},
            explanation="Direct lookup for active shipments.",
            confidence=0.99,
        )

    # D. Products in Warehouse (e.g. "How many products are in Warehouse A?")
    wh_match = re.search(r"products (?:are )?in warehouse\s+([a-zA-Z0-9\s\-]+)", q_lower) or re.search(r"warehouse\s+([a-zA-Z0-9\s\-]+)\s+inventory", q_lower)
    if wh_match:
        wh_name = wh_match.group(1).strip()
        logger.info(f"Deterministic router matched DIRECT_TOOL (warehouse inventory) for '{wh_name}' in query: '{q_clean}'")
        return RouterDecision(
            query_type=ExecutionMode.DIRECT_TOOL,
            intent=RouterIntent.WAREHOUSE_LOOKUP.value,
            tool="get_warehouse_inventory",
            entities={"warehouse": wh_name},
            explanation=f"Direct warehouse inventory lookup for '{wh_name}'.",
            confidence=0.98,
        )

    # E. Dashboard summary metrics (e.g. "How many total products?", "How many total warehouses?", "How many total suppliers?")
    if q_lower in ["how many products are there?", "total product count", "dashboard metrics", "how many suppliers are there?"]:
        return RouterDecision(
            query_type=ExecutionMode.DIRECT_TOOL,
            intent="analytics_lookup",
            tool="get_dashboard_metrics",
            explanation="Direct dashboard summary lookup.",
            confidence=0.99,
        )

    # -----------------------------------------------------------------------
    # 4. RAG KNOWLEDGE QUERY PATTERNS (Pure policy/procedure/SOP questions)
    # -----------------------------------------------------------------------
    rag_patterns = [
        "procurement policy", "receiving procedure", "emergency procurement",
        "payment terms", "audit procedure", "warehouse receiving", "return policy",
        "safety manual", "supplier guidelines", "compliance policy"
    ]
    if any(p in q_lower for p in rag_patterns) or (q_lower.startswith("what is our ") and any(k in q_lower for k in ["policy", "procedure", "sop", "guideline", "terms"])):
        logger.info(f"Deterministic router matched RAG for query: '{q_clean}'")
        return RouterDecision(
            query_type=ExecutionMode.RAG,
            intent=RouterIntent.KNOWLEDGE_QUERY.value,
            agent="rag",
            selected_agents=[AgentType.RAG],
            explanation="Company document knowledge query routed to RAG Knowledge Agent.",
            confidence=0.98,
        )

    # No deterministic match found -> fall back to LLM classifier
    return None


# ---------------------------------------------------------------------------
# Level 2: Structured LLM Classifier (Fallback for Complex/Ambiguous Queries)
# ---------------------------------------------------------------------------

ROUTER_SYSTEM_PROMPT = """You are the Fast Intent Router for SupplySense, an Enterprise Supply Chain Decision Support System.

Your job is to determine the LEAST EXPENSIVE and FASTEST execution path for a manager's query.

EXECUTION MODES:
1. `direct_tool`: Simple factual database lookups (e.g. quantity of X, pending shipments count, warehouse item count).
2. `agent`: Questions requiring domain reasoning, stockout risk evaluation, supplier health scoring, demand forecasting, or executive summaries.
3. `rag`: Questions about company documents, SOPs, procurement policies, payment terms, or compliance guidelines.
4. `unsupported_hybrid`: Questions requiring BOTH operational DB facts AND company policy document retrieval in a single query.
5. `unknown`: Vague, ambiguous, or unclassifiable queries requiring clarification.

SUPPORTED AGENTS (for `agent` mode):
- `inventory`: Stockout risk, low stock analysis, reorder levels, dead stock.
- `shipment`: Shipment delays, carrier performance, logistics issues.
- `supplier`: Supplier health, supplier risk ranking, lead times.
- `forecast`: Demand forecasting, sales trends, seasonal predictions.
- `risk`: Enterprise operational risk synthesis (cross-domain risks).
- `executive`: Comprehensive C-suite executive report (ONLY if explicitly requested).

RULES:
- Select the MINIMUM required execution mode and agents.
- DO NOT select `executive` unless the user explicitly asks for an executive summary or C-suite report.
- Set `confidence` between 0.0 and 1.0.
"""


@traceable(name="fast_route_query")
async def fast_route_query(user_question: str) -> Tuple[RouterDecision, int]:
    """
    Routes user query using the Fast Intent Router hierarchy:
        Level 1: Deterministic Engine (0 LLM calls, ~0ms latency)
        Level 2: Structured LLM Router (if ambiguous/complex)

    Returns:
        Tuple[RouterDecision, int]: (Router decision, number of LLM calls executed)
    """
    # 1. Try Level 1 Deterministic Fast Path
    deterministic_decision = _deterministic_route(user_question)
    if deterministic_decision is not None:
        return deterministic_decision, 0  # 0 LLM calls

    # 2. Level 2: Structured LLM Router for complex/ambiguous queries
    logger.info(f"Deterministic router passed. Invoking LLM Router for: '{user_question}'")
    try:
        llm = get_llm()
        structured_llm = llm.with_structured_output(RouterDecision)

        messages = [
            SystemMessage(content=ROUTER_SYSTEM_PROMPT),
            HumanMessage(content=f"Manager Query: {user_question}"),
        ]

        decision: RouterDecision = await structured_llm.ainvoke(messages)

        # Enforce confidence threshold
        if decision.confidence < CONFIDENCE_THRESHOLD:
            decision.query_type = ExecutionMode.UNKNOWN
            decision.intent = RouterIntent.UNKNOWN.value
            decision.explanation = f"Low router confidence ({decision.confidence:.2f} < {CONFIDENCE_THRESHOLD}). Clarification requested."

        logger.info(
            f"LLM Router output: mode={decision.query_type} | "
            f"intent={decision.intent} | agents={[a.value for a in decision.selected_agents]} | "
            f"confidence={decision.confidence:.2f}"
        )
        return decision, 1  # 1 LLM call

    except Exception as e:
        logger.error(f"LLM Router classification failed: {e}. Falling back to default inventory agent.", exc_info=True)
        return RouterDecision(
            query_type=ExecutionMode.AGENT,
            intent=RouterIntent.INVENTORY_ANALYSIS.value,
            agent="inventory",
            selected_agents=[AgentType.INVENTORY],
            explanation=f"Fallback to Inventory Agent due to router exception: {e}",
            confidence=0.5,
        ), 1


# ---------------------------------------------------------------------------
# LangGraph Router Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_router_node")
async def router_node(state: SupervisorState) -> dict:
    """
    LangGraph node function for intent classification and execution path routing.
    """
    user_question = state.get("user_question", "")
    logger.info(f"Executing router_node for query: '{user_question}'")

    decision, llm_calls = await fast_route_query(user_question)
    selected_agent_names = [a.value for a in decision.selected_agents]

    # Map legacy primary_intent for backwards compatibility
    legacy_intent = decision.intent
    if legacy_intent == "inventory_analysis" or legacy_intent == "inventory_lookup":
        legacy_intent = "Inventory"
    elif legacy_intent == "shipment_analysis" or legacy_intent == "shipment_lookup":
        legacy_intent = "Shipment"
    elif legacy_intent == "supplier_analysis" or legacy_intent == "supplier_lookup":
        legacy_intent = "Supplier"
    elif legacy_intent == "forecast":
        legacy_intent = "Forecast"
    elif legacy_intent == "risk_analysis":
        legacy_intent = "Risk"
    elif legacy_intent == "executive_summary":
        legacy_intent = "Executive Summary"
    elif legacy_intent == "knowledge_query":
        legacy_intent = "Knowledge"
    elif decision.query_type == ExecutionMode.UNSUPPORTED_HYBRID:
        legacy_intent = "Hybrid"

    return {
        "query_type": decision.query_type.value,
        "intent": legacy_intent,
        "intent_explanation": decision.explanation,
        "selected_agents": selected_agent_names,
        "target_tool": decision.tool,
        "tool_parameters": decision.entities,
        "confidence": decision.confidence,
        "nodes_executed": ["router_node"],
        "llm_calls_made": llm_calls,
    }


# Backwards compatibility helper
async def classify_intent_and_route(user_question: str) -> IntentClassification:
    """Legacy helper function maintained for backward compatibility."""
    decision, _ = await fast_route_query(user_question)
    cat = IntentCategory.INVENTORY
    for c in IntentCategory:
        if c.value.lower() in decision.intent.lower():
            cat = c
            break

    return IntentClassification(
        primary_intent=cat,
        explanation=decision.explanation,
        selected_agents=decision.selected_agents or [AgentType.INVENTORY],
        requires_parallel_execution=decision.requires_parallel_execution,
        requires_sequential_synthesis=decision.requires_sequential_synthesis,
    )
