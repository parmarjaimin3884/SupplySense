"""
SupplySense — LangGraph Supervisor Nodes
Individual node functions for executing all 7 agents within the LangGraph StateGraph.

Agents invoked:
1. InventoryAgent
2. ShipmentAgent
3. SupplierAgent
4. ForecastAgent
5. RAGAgent
6. RiskAgent (Synthesizes outputs from operational agents)
7. ExecutiveAgent (Synthesizes outputs from operational + risk agents)
"""

import logging
import asyncio
from typing import Dict, Any

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

from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.supervisor.state import SupervisorState

# Import agent classes
from backend.app.ai.agents.inventory import InventoryAgent
from backend.app.ai.agents.shipment import ShipmentAgent
from backend.app.ai.agents.supplier import SupplierAgent
from backend.app.ai.agents.forecast import ForecastAgent
from backend.app.ai.agents.risk import RiskAgent
from backend.app.ai.agents.executive import ExecutiveAgent
from backend.app.ai.agents.rag import RAGAgent

logger = logging.getLogger(__name__)


def _serialize_response(resp: Any) -> Dict[str, Any]:
    """Helper to convert Pydantic models or dicts to plain dicts."""
    if resp is None:
        return {}
    if hasattr(resp, "model_dump"):
        return resp.model_dump()
    if hasattr(resp, "dict"):
        return resp.dict()
    if isinstance(resp, dict):
        return resp
    return {"raw": str(resp)}


# ---------------------------------------------------------------------------
# Node 1: Inventory Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_inventory")
async def inventory_node(state: SupervisorState) -> dict:
    """Invokes InventoryAgent if selected."""
    question = state.get("user_question", "")
    logger.info("Executing inventory_node...")

    try:
        agent = InventoryAgent(llm=get_llm())
        output = await agent.analyze(question)
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"inventory": serialized},
            "nodes_executed": ["inventory_node"],
        }
    except Exception as e:
        logger.error(f"Inventory node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "inventory": {
                    "summary": "Inventory analysis encountered an error.",
                    "risks": [str(e)],
                    "recommendations": ["Retry inventory query."],
                    "inventory_status": "Error",
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["inventory_node"],
        }


# ---------------------------------------------------------------------------
# Node 2: Shipment Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_shipment")
async def shipment_node(state: SupervisorState) -> dict:
    """Invokes ShipmentAgent if selected."""
    question = state.get("user_question", "")
    logger.info("Executing shipment_node...")

    try:
        agent = ShipmentAgent()
        output = await agent.analyze(question)
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"shipment": serialized},
            "nodes_executed": ["shipment_node"],
        }
    except Exception as e:
        logger.error(f"Shipment node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "shipment": {
                    "summary": "Shipment analysis encountered an error.",
                    "shipment_status": "Error",
                    "critical_shipments": [],
                    "delayed_shipments": [],
                    "supplier_risk": [str(e)],
                    "warehouse_risk": [],
                    "recommendations": ["Retry shipment query."],
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["shipment_node"],
        }


# ---------------------------------------------------------------------------
# Node 3: Supplier Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_supplier")
async def supplier_node(state: SupervisorState) -> dict:
    """Invokes SupplierAgent if selected."""
    question = state.get("user_question", "")
    logger.info("Executing supplier_node...")

    try:
        agent = SupplierAgent()
        output = await agent.analyze(question)
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"supplier": serialized},
            "nodes_executed": ["supplier_node"],
        }
    except Exception as e:
        logger.error(f"Supplier node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "supplier": {
                    "summary": "Supplier analysis encountered an error.",
                    "supplier_health": [],
                    "best_suppliers": [],
                    "risky_suppliers": [],
                    "risk_assessments": [],
                    "recommendations": [{"action": "Retry query", "rationale": str(e), "priority": "High"}],
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["supplier_node"],
        }


# ---------------------------------------------------------------------------
# Node 4: Forecast Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_forecast")
async def forecast_node(state: SupervisorState) -> dict:
    """Invokes ForecastAgent if selected."""
    question = state.get("user_question", "")
    logger.info("Executing forecast_node...")

    try:
        agent = ForecastAgent()
        output = await agent.analyze(question)
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"forecast": serialized},
            "nodes_executed": ["forecast_node"],
        }
    except Exception as e:
        logger.error(f"Forecast node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "forecast": {
                    "summary": "Forecast analysis encountered an error.",
                    "forecast": [],
                    "predicted_demand": "Error",
                    "high_demand_products": [],
                    "low_demand_products": [],
                    "recommendations": [{"action": "Retry query", "rationale": str(e), "priority": "High"}],
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["forecast_node"],
        }


# ---------------------------------------------------------------------------
# Node 5: RAG Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_rag")
async def rag_node(state: SupervisorState) -> dict:
    """Invokes RAGAgent if selected."""
    question = state.get("user_question", "")
    logger.info("Executing rag_node...")

    try:
        agent = RAGAgent()
        output = await agent.analyze(question)
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"rag": serialized},
            "nodes_executed": ["rag_node"],
        }
    except Exception as e:
        logger.error(f"RAG node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "rag": {
                    "summary": "RAG Knowledge retrieval encountered an error.",
                    "answer": f"Unable to retrieve company knowledge: {str(e)}",
                    "sources": [],
                    "confidence": 0.0,
                    "retrieved_documents": [],
                }
            },
            "nodes_executed": ["rag_node"],
        }


# ---------------------------------------------------------------------------
# Node 6: Risk Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_risk")
async def risk_node(state: SupervisorState) -> dict:
    """
    Invokes RiskAgent. Passes existing operational outputs from state['agent_outputs'].
    """
    question = state.get("user_question", "")
    outputs = state.get("agent_outputs", {})
    logger.info("Executing risk_node with available agent outputs...")

    from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse
    from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse
    from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse
    from backend.app.ai.agents.forecast.schemas import ForecastAnalysisResponse

    inv_resp = InventoryAnalysisResponse(**outputs["inventory"]) if "inventory" in outputs else None
    ship_resp = ShipmentAnalysisResponse(**outputs["shipment"]) if "shipment" in outputs else None
    sup_resp = SupplierAnalysisResponse(**outputs["supplier"]) if "supplier" in outputs else None
    fc_resp = ForecastAnalysisResponse(**outputs["forecast"]) if "forecast" in outputs else None

    try:
        agent = RiskAgent()
        output = await agent.analyze(
            user_question=question,
            inventory_analysis=inv_resp,
            shipment_analysis=ship_resp,
            supplier_analysis=sup_resp,
            forecast_analysis=fc_resp,
        )
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"risk": serialized},
            "nodes_executed": ["risk_node"],
        }
    except Exception as e:
        logger.error(f"Risk node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "risk": {
                    "summary": "Risk analysis encountered an error.",
                    "overall_risk": str(e),
                    "risk_level": "Medium",
                    "critical_findings": [],
                    "affected_products": [],
                    "affected_suppliers": [],
                    "affected_warehouses": [],
                    "recommendations": [],
                    "priority_actions": [],
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["risk_node"],
        }


# ---------------------------------------------------------------------------
# Node 7: Executive Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_executive")
async def executive_node(state: SupervisorState) -> dict:
    """
    Invokes ExecutiveAgent. Passes operational + risk outputs from state['agent_outputs'].
    """
    question = state.get("user_question", "")
    outputs = state.get("agent_outputs", {})
    logger.info("Executing executive_node with available agent outputs...")

    from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse
    from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse
    from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse
    from backend.app.ai.agents.forecast.schemas import ForecastAnalysisResponse
    from backend.app.ai.agents.risk.schemas import RiskAnalysisResponse

    inv_resp = InventoryAnalysisResponse(**outputs["inventory"]) if "inventory" in outputs else None
    ship_resp = ShipmentAnalysisResponse(**outputs["shipment"]) if "shipment" in outputs else None
    sup_resp = SupplierAnalysisResponse(**outputs["supplier"]) if "supplier" in outputs else None
    fc_resp = ForecastAnalysisResponse(**outputs["forecast"]) if "forecast" in outputs else None
    risk_resp = RiskAnalysisResponse(**outputs["risk"]) if "risk" in outputs else None

    try:
        agent = ExecutiveAgent()
        output = await agent.analyze(
            user_question=question,
            inventory_analysis=inv_resp,
            shipment_analysis=ship_resp,
            supplier_analysis=sup_resp,
            forecast_analysis=fc_resp,
            risk_analysis=risk_resp,
        )
        serialized = _serialize_response(output)
        return {
            "agent_outputs": {"executive": serialized},
            "nodes_executed": ["executive_node"],
        }
    except Exception as e:
        logger.error(f"Executive node error: {e}", exc_info=True)
        return {
            "agent_outputs": {
                "executive": {
                    "executive_summary": f"Executive summary failed: {str(e)}",
                    "overall_health": "Needs Attention",
                    "todays_highlights": [],
                    "critical_issues": [],
                    "business_impact": str(e),
                    "top_risks": [],
                    "recommended_actions": [],
                    "immediate_priorities": [],
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["executive_node"],
        }
