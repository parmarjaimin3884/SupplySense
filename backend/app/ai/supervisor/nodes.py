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


# ---------------------------------------------------------------------------
# Node 8: Direct Tool Node (Fast Operational Database Query)
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_direct_tool")
async def direct_tool_node(state: SupervisorState) -> dict:
    """
    Executes existing database tools directly without invoking an AI Agent or LLM.
    Fastest path for simple factual queries.
    """
    question = state.get("user_question", "")
    target_tool = state.get("target_tool", "")
    params = state.get("tool_parameters", {}) or {}
    logger.info(f"Executing direct_tool_node: tool='{target_tool}' params={params}")

    try:
        from backend.app.ai.tools import product, inventory, shipment, purchase_order, warehouse, analytics, supplier

        answer_text = ""
        raw_data = None
        used_tool_name = target_tool or "search_products"

        # 1. Product Quantity / Stock Search
        if target_tool in ["search_products", "get_inventory", "get_product_inventory"] or "product" in params:
            prod_name = params.get("product", question)
            search_res = await product.search_products(keyword=prod_name)
            
            if search_res.get("success") and search_res.get("data"):
                prods = search_res["data"]
                first_p = prods[0]
                p_id = first_p["id"]
                p_name = first_p["name"]
                
                inv_res = await product.get_product_inventory(product_id=p_id)
                raw_data = inv_res
                
                if inv_res.get("success") and inv_res.get("data"):
                    inv_items = inv_res["data"]
                    total_qty = sum(item.get("available_quantity", 0) for item in inv_items)
                    total_on_hand = sum(item.get("quantity_on_hand", 0) for item in inv_items)
                    answer_text = f"{p_name} quantity is {total_qty} units available ({total_on_hand} units on hand across {len(inv_items)} warehouses)."
                else:
                    answer_text = f"Found product {p_name} (SKU: {first_p.get('sku')}), but no active inventory records were found."
            else:
                answer_text = f"No product matching '{prod_name}' was found in the inventory database."
                used_tool_name = "search_products"

        # 2. Pending Purchase Orders
        elif target_tool == "get_pending_purchase_orders":
            po_res = await purchase_order.get_pending_purchase_orders()
            raw_data = po_res
            if po_res.get("success") and isinstance(po_res.get("data"), list):
                count = len(po_res["data"])
                answer_text = f"There are currently {count} pending purchase orders."
            else:
                answer_text = "Unable to retrieve pending purchase orders at this time."

        # 3. Pending/Active Shipments
        elif target_tool == "get_pending_shipments":
            ship_res = await shipment.get_pending_shipments()
            raw_data = ship_res
            if ship_res.get("success") and isinstance(ship_res.get("data"), list):
                count = len(ship_res["data"])
                answer_text = f"There are currently {count} active/pending shipments."
            else:
                answer_text = "Unable to retrieve active shipments at this time."

        # 4. Warehouse inventory
        elif target_tool in ["get_warehouse_inventory", "get_warehouse"]:
            wh_name = params.get("warehouse", "")
            wh_res = await warehouse.get_all_warehouses()
            raw_data = wh_res
            matched_wh = None
            if wh_res.get("success") and wh_res.get("data"):
                for w in wh_res["data"]:
                    if wh_name.lower() in w.get("name", "").lower() or wh_name.lower() in w.get("warehouse_code", "").lower():
                        matched_wh = w
                        break
            if matched_wh:
                w_inv = await warehouse.get_warehouse_inventory(warehouse_id=matched_wh["id"])
                count = len(w_inv.get("data", [])) if w_inv.get("success") else 0
                answer_text = f"{matched_wh['name']} contains {count} product inventory records with capacity of {matched_wh.get('capacity', 'N/A')} units."
            else:
                answer_text = f"Warehouse matching '{wh_name}' was not found."

        # 5. Dashboard summary metrics fallback
        else:
            dash_res = await analytics.get_dashboard_metrics()
            raw_data = dash_res
            if dash_res.get("success") and dash_res.get("data"):
                d = dash_res["data"]
                answer_text = f"System metrics: {d.get('total_products', 0)} total products, {d.get('total_warehouses', 0)} warehouses, {d.get('total_suppliers', 0)} suppliers."
            else:
                answer_text = "Operational query executed successfully."

        return {
            "status": "success",
            "query_type": "direct_tool",
            "target_tool": used_tool_name,
            "agent_outputs": {
                "direct_tool": {
                    "status": "success",
                    "query_type": "direct_tool",
                    "answer": answer_text,
                    "summary": answer_text,
                    "tool_used": used_tool_name,
                    "source": "operational_database",
                    "data": raw_data,
                    "confidence": 0.99,
                }
            },
            "nodes_executed": ["direct_tool_node"],
        }

    except Exception as e:
        logger.error(f"Direct tool node error: {e}", exc_info=True)
        return {
            "status": "error",
            "query_type": "direct_tool",
            "agent_outputs": {
                "direct_tool": {
                    "status": "error",
                    "query_type": "direct_tool",
                    "answer": f"Failed to execute direct database lookup: {str(e)}",
                    "summary": "Direct tool execution error.",
                    "confidence": 0.0,
                }
            },
            "nodes_executed": ["direct_tool_node"],
        }


# ---------------------------------------------------------------------------
# Node 9: Unsupported Hybrid Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_hybrid")
async def hybrid_node(state: SupervisorState) -> dict:
    """
    Handles unsupported hybrid queries combining PostgreSQL operational DB + Qdrant policy.
    Returns structured unsupported_workflow response without calling DB or LLM.
    """
    logger.info("Executing hybrid_node (unsupported hybrid query)...")
    answer_text = "This query requires both operational data and company policy knowledge. Hybrid reasoning is not enabled yet."
    return {
        "status": "unsupported_workflow",
        "query_type": "unsupported_hybrid",
        "agent_outputs": {
            "hybrid": {
                "status": "unsupported_workflow",
                "query_type": "unsupported_hybrid",
                "answer": answer_text,
                "summary": "Hybrid reasoning is currently unsupported.",
                "confidence": 1.0,
            }
        },
        "nodes_executed": ["hybrid_node"],
    }


# ---------------------------------------------------------------------------
# Node 10: Clarification Node
# ---------------------------------------------------------------------------

@traceable(name="supervisor_node_clarification")
async def clarification_node(state: SupervisorState) -> dict:
    """
    Handles unknown or low-confidence queries by requesting clarification from manager.
    """
    logger.info("Executing clarification_node (low confidence / ambiguous query)...")
    answer_text = "I'm not sure which information you're looking for. Could you please clarify your question? For example: specify if you want supplier performance, shipment delays, inventory levels, or company policies."
    return {
        "status": "clarification_needed",
        "query_type": "unknown",
        "agent_outputs": {
            "clarification": {
                "status": "clarification_needed",
                "query_type": "unknown",
                "answer": answer_text,
                "summary": "Clarification required.",
                "confidence": 0.3,
            }
        },
        "nodes_executed": ["clarification_node"],
    }

