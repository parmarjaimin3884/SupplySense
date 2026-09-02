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
import re
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
        await asyncio.sleep(0.05)  # Minimal offset to prevent microsecond collision
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
        await asyncio.sleep(0.1)  # Minimal offset to prevent microsecond collision
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
        await asyncio.sleep(0.15)  # Minimal offset to prevent microsecond collision
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
        from backend.app.ai.tools import product, inventory, shipment, purchase_order, warehouse, analytics, supplier, fulfillment, transfers

        answer_text = ""
        raw_data = None
        used_tool_name = target_tool or "search_products"

        # 1. Product Quantity / Stock Search
        if target_tool in ["search_products", "get_inventory", "get_product_inventory"] or "product" in params:
            prod_name = params.get("product")
            wh_filter = params.get("warehouse")

            # Extract warehouse filter from question if present (e.g. "in Surat Warehouse")
            if not wh_filter:
                wh_match = re.search(r"in\s+([a-zA-Z0-9\s\-]+?)\s+(?:warehouse|store|branch)", question, re.IGNORECASE)
                if wh_match:
                    wh_filter = wh_match.group(1).strip()

            # If no product entity extracted or equals full question, derive from question text
            if not prod_name or prod_name == question:
                clean_kw = question
                if wh_filter:
                    clean_kw = re.sub(r"(?i)in\s+" + re.escape(wh_filter) + r"\s*(?:warehouse|store|branch)?", "", clean_kw)
                clean_kw = re.sub(r"(?i)\b(how many|what is|the|current|stock of|quantity of|available|in stock|on hand|in|are there|is there|units of|count|items|products|warehouse)\b", "", clean_kw)
                clean_kw = re.sub(r"[^\w\s\-]", "", clean_kw)
                clean_kw = re.sub(r"\s+", " ", clean_kw).strip()
                prod_name = clean_kw if clean_kw else question

            # Always strip warehouse references from prod_name (router may include them)
            if wh_filter and prod_name:
                prod_name = re.sub(r"(?i)\s+in\s+" + re.escape(wh_filter) + r"\s*(?:warehouse|store|branch)?", "", prod_name)
                prod_name = re.sub(r"(?i)\s*(?:warehouse|store|branch)\s*$", "", prod_name)
                prod_name = prod_name.strip()


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
                    if wh_filter:
                        matched_items = [
                            item for item in inv_items
                            if item.get("warehouse_name") and (wh_filter.lower() in item.get("warehouse_name").lower() or item.get("warehouse_name").lower() in wh_filter.lower())
                        ]
                        if matched_items:
                            inv_items = matched_items
                    else:
                        # Prioritize Surat Central Warehouse
                        surat_items = [
                            item for item in inv_items
                            if item.get("warehouse_name") and "surat" in item.get("warehouse_name").lower()
                        ]
                        if surat_items:
                            inv_items = surat_items

                    total_qty = sum(item.get("available_quantity", 0) for item in inv_items)
                    total_on_hand = sum(item.get("quantity_on_hand", 0) for item in inv_items)
                    
                    if inv_items:
                        wh_disp = inv_items[0].get("warehouse_name", "Surat")
                        answer_text = f"In {wh_disp} Warehouse, {p_name} (SKU: {first_p.get('sku')}) currently has {total_qty} units available ({total_on_hand} units on hand)."
                    else:
                        answer_text = f"{p_name} quantity is {total_qty} units available in Surat."
                else:
                    answer_text = f"Found product {p_name} (SKU: {first_p.get('sku')}), but no active inventory records were found in Surat Central Warehouse."
            else:
                answer_text = f"No product matching '{prod_name}' was found in the Surat inventory database."
                used_tool_name = "search_products"

        # 2. Pending Purchase Orders
        elif target_tool == "get_pending_purchase_orders":
            po_res = await purchase_order.get_pending_purchase_orders()
            raw_data = po_res
            if po_res.get("success") and isinstance(po_res.get("data"), list):
                count = len(po_res["data"])
                answer_text = f"There are currently {count} pending purchase orders for Surat Central Warehouse."
            else:
                answer_text = "Unable to retrieve pending purchase orders at this time."

        # 3. Pending/Active Shipments
        elif target_tool == "get_pending_shipments":
            ship_res = await shipment.get_pending_shipments()
            raw_data = ship_res
            if ship_res.get("success") and isinstance(ship_res.get("data"), list):
                count = len(ship_res["data"])
                answer_text = f"There are currently {count} active/pending shipments destined for Surat Central Warehouse."
            else:
                answer_text = "Unable to retrieve active shipments at this time."

        # 4. Warehouse capacity lookup
        elif target_tool in ["get_warehouse_capacity", "get_available_capacity"] or state.get("intent") in ["warehouse_capacity_lookup", "Warehouse"]:
            wh_name = params.get("warehouse", "")
            if not wh_name or wh_name.lower() in ["our", "the", "current", "main", "warehouse", "central", "our warehouse", "the warehouse", "current warehouse"]:
                wh_match = re.search(r"capacity (?:of|for) (?:the )?([a-zA-Z0-9\s\-]+?)(?:\s+warehouse)?", question, re.IGNORECASE) \
                    or re.search(r"([a-zA-Z0-9\s\-]+?) warehouse (?:capacity|total capacity|max capacity)", question, re.IGNORECASE) \
                    or re.search(r"warehouse\s+([a-zA-Z0-9\s\-]+)", question, re.IGNORECASE)
                if wh_match:
                    extracted = wh_match.group(1).strip()
                    if extracted.lower() not in ["our", "the", "current", "main", "warehouse", "central"]:
                        wh_name = re.sub(r"[^\w\s\-]", "", extracted).strip()
                    else:
                        wh_name = ""

            wh_res = await warehouse.get_all_warehouses()
            raw_data = wh_res
            matched_wh = None
            if wh_res.get("success") and wh_res.get("data"):
                # 1. Match specific warehouse if requested
                if wh_name:
                    q = wh_name.lower().strip()
                    for w in wh_res["data"]:
                        w_name = (w.get("name") or "").lower()
                        w_code = (w.get("warehouse_code") or "").lower()
                        if q == w_name or q == w_code or q in w_name or w_name in q or w_code in q or q in w_code:
                            matched_wh = w
                            break

                # 2. If no match or general query, default directly to Surat (WH-SUR)
                if not matched_wh:
                    matched_wh = next(
                        (w for w in wh_res["data"] if "surat" in (w.get("name") or "").lower() or "sur" in (w.get("warehouse_code") or "").lower()),
                        wh_res["data"][0] if wh_res["data"] else None
                    )

            if matched_wh:
                capacity = matched_wh.get("capacity", "N/A")
                utilization = matched_wh.get("current_utilization")
                util_text = f" (Current utilization: {utilization}%)" if utilization is not None else ""
                answer_text = f"The capacity of {matched_wh['name']} is {capacity} units.{util_text}"
                used_tool_name = "get_warehouse_capacity"
            else:
                answer_text = f"No warehouse matching '{wh_name}' was found in the database." if wh_name else "No data available."

        # 5. Warehouse inventory & KPI lookup
        elif target_tool in ["get_warehouse_inventory", "get_warehouse", "get_warehouse_kpi", "warehouse_kpi_tool"]:
            wh_name = params.get("warehouse", "")
            if not wh_name or wh_name.lower() in ["our", "the", "current", "main", "warehouse", "central", "our warehouse", "the warehouse", "current warehouse"]:
                wh_match = re.search(r"for\s+([a-zA-Z0-9\s\-]+)", question, re.IGNORECASE) or re.search(r"warehouse\s+([a-zA-Z0-9\s\-]+)", question, re.IGNORECASE)
                if wh_match:
                    extracted = wh_match.group(1).strip()
                    if extracted.lower() not in ["our", "the", "current", "main", "warehouse", "central"]:
                        wh_name = re.sub(r"[^\w\s\-]", "", extracted).strip()
                    else:
                        wh_name = ""

            wh_res = await warehouse.get_all_warehouses()
            raw_data = wh_res
            matched_wh = None
            if wh_res.get("success") and wh_res.get("data"):
                # 1. Match specific warehouse if requested
                if wh_name:
                    q = wh_name.lower().strip()
                    for w in wh_res["data"]:
                        w_name = (w.get("name") or "").lower()
                        w_code = (w.get("warehouse_code") or "").lower()
                        if q == w_name or q == w_code or q in w_name or w_name in q or w_code in q or q in w_code:
                            matched_wh = w
                            break

                # 2. If no match or general query, default directly to Surat (WH-SUR)
                if not matched_wh:
                    matched_wh = next(
                        (w for w in wh_res["data"] if "surat" in (w.get("name") or "").lower() or "sur" in (w.get("warehouse_code") or "").lower()),
                        wh_res["data"][0] if wh_res["data"] else None
                    )

            if matched_wh:
                w_inv = await warehouse.get_warehouse_inventory(warehouse_id=matched_wh["id"])
                items = w_inv.get("data", []) if (w_inv.get("success") and isinstance(w_inv.get("data"), list)) else []
                count = len(items)
                total_units = sum(item.get("available_quantity", 0) for item in items)
                capacity = matched_wh.get("capacity", "N/A")
                util = matched_wh.get("current_utilization")
                util_str = f" (Utilization: {util}%)" if util is not None else ""
                answer_text = f"{matched_wh['name']} currently contains {count} active SKU inventory records ({total_units} available units) with a total facility capacity of {capacity} units{util_str}."
                used_tool_name = "get_warehouse_inventory"
        # 6. Low Stock & Reorder Point Lookup
        elif target_tool in ["get_low_stock_products", "low_stock_products", "low_stock"]:
            low_res = await inventory.get_low_stock_products()
            raw_data = low_res
            if low_res.get("success") and isinstance(low_res.get("data"), list):
                items = low_res["data"]
                if items:
                    lines = [
                        f"• {it['product_name']} (SKU: {it['sku']}): {it['available_quantity']} units available (Reorder threshold: {it['reorder_level']} units)"
                        for it in items[:6]
                    ]
                    answer_text = f"Identified {len(items)} products currently at or below their safety reorder threshold:\n" + "\n".join(lines)
                else:
                    answer_text = "All products in Surat Central Warehouse are currently above their reorder point. Inventory is healthy."
            else:
                answer_text = "Unable to retrieve reorder stock data at this time."

        # 7. Out of Stock Lookup
        elif target_tool in ["get_out_of_stock_products", "out_of_stock"]:
            oos_res = await inventory.get_out_of_stock_products()
            raw_data = oos_res
            if oos_res.get("success") and isinstance(oos_res.get("data"), list):
                items = oos_res["data"]
                if items:
                    lines = [f"• {it['product_name']} (SKU: {it['sku']}): 0 units available" for it in items[:6]]
                    answer_text = f"Found {len(items)} depleted / out-of-stock products in Surat Central:\n" + "\n".join(lines)
                else:
                    answer_text = "There are currently zero out-of-stock products in Surat Central Warehouse."
            else:
                answer_text = "Unable to retrieve stockout data at this time."

        # 8. High-Risk Suppliers
        elif target_tool in ["get_risky_suppliers", "risky_suppliers"]:
            sup_res = await supplier.get_risky_suppliers(limit=5)
            raw_data = sup_res
            if sup_res.get("success") and isinstance(sup_res.get("data"), list):
                sups = sup_res["data"]
                if sups:
                    lines = [
                        f"• {s['company_name']}: Reliability {s.get('reliability_score', 'N/A')}% (Risk Rating: {s.get('risk_rating', 'High')})"
                        for s in sups[:5]
                    ]
                    answer_text = f"Found {len(sups)} high-risk suppliers with low reliability scores:\n" + "\n".join(lines)
                else:
                    answer_text = "All active suppliers are currently meeting reliability thresholds."
            else:
                answer_text = "Unable to retrieve supplier risk scores at this time."

        # 9. Dead Stock / Non-moving items
        elif target_tool in ["get_dead_stock_products", "get_overstocked_products", "dead_stock"]:
            dead_res = await inventory.get_dead_stock_products()
            raw_data = dead_res
            if dead_res.get("success") and isinstance(dead_res.get("data"), list):
                items = dead_res["data"]
                if items:
                    lines = [f"• {it['product_name']} (SKU: {it['sku']}): {it.get('available_quantity', 0)} units non-moving" for it in items[:5]]
                    answer_text = f"Found {len(items)} slow-moving/dead stock items:\n" + "\n".join(lines)
                else:
                    answer_text = "No dead stock identified in Surat Central Warehouse."
            else:
                answer_text = "Unable to retrieve dead stock records at this time."

        # 10. Order Fulfillment & Multi-Warehouse Routing
        elif target_tool in ["find_best_fulfillment_warehouse", "fulfillment_routing"] or state.get("intent") == "fulfillment_routing":
            # Extract quantity
            qty_match = re.search(r"\b(\d+)\s*(?:units|items|pieces|x)?\b", question)
            qty = int(qty_match.group(1)) if qty_match else 1

            # Extract destination city
            known_cities = ["pune", "mumbai", "delhi", "ahmedabad", "surat", "bangalore", "bengaluru", "chennai", "hyderabad", "kolkata", "jaipur", "goa", "noida", "gurgaon", "chandigarh", "lucknow", "mysore", "coimbatore", "kochi", "rajkot"]
            dest_city = None
            q_low = question.lower()
            for city in known_cities:
                if re.search(r"\b" + city + r"\b", q_low):
                    dest_city = city.title()
                    break

            if not dest_city:
                dest_match = re.search(r"(?:for a customer in|for delivery to|destination\s+is|to|in|for)\s+([a-zA-Z]+)(?:\s+customer|\s+store|\s+branch|\s*\?|$)", question, re.IGNORECASE)
                if dest_match:
                    cand = dest_match.group(1).strip()
                    if cand.lower() not in ["our", "the", "a", "an", "this", "order", "warehouse", "customer", "store", "product"]:
                        dest_city = cand.title()

            # Extract product keyword
            prod_name = ""
            p_match = re.search(r"(?:order of|order for|units of|items of)\s+([a-zA-Z0-9\s\-]+?)(?:\s+for|\s+to|\s+in|\s+with|\s*\?|$)", question, re.IGNORECASE)
            if not p_match:
                p_match = re.search(r"\b\d+\s+([a-zA-Z0-9\s\-]+?)(?:\s+for|\s+to|\s+in|\s+with|\s*\?|$)", question, re.IGNORECASE)

            if p_match:
                prod_name = p_match.group(1).strip()

            if not prod_name or prod_name.lower() in ["units", "items", "this", "product", "goods", "pieces"]:
                prod_clean = re.sub(r"(?i)\b(which warehouse should fulfill|where should we fulfill|best warehouse to fulfill|which warehouse should ship|where to ship this order|fulfill this order|fulfill an order|where should i ship|fulfill order|this order|order of|order for|order|units of|items of|pieces of|customer in|a customer in|delivery to|for|to|in|\d+)\b", "", question)
                if dest_city:
                    prod_clean = re.sub(r"(?i)\b" + re.escape(dest_city) + r"\b", "", prod_clean)
                prod_name = re.sub(r"[^\w\s\-]", "", prod_clean).strip()

            # Clean leading digits or stop words from prod_name
            prod_name = re.sub(r"^\d+\s*", "", prod_name).strip()
            prod_name = re.sub(r"^(?:an|a|the|our|this)\s+", "", prod_name, flags=re.IGNORECASE).strip()

            # Clean product name (e.g. MacBooks -> MacBook)
            if prod_name.lower().endswith("s") and not prod_name.lower().endswith("ss"):
                prod_name = prod_name[:-1]

            if not prod_name:
                prod_name = "MacBook Pro"

            ful_res = await fulfillment.find_best_fulfillment_warehouse(
                product_name_or_sku=prod_name,
                quantity=qty,
                destination_city=dest_city
            )
            raw_data = ful_res
            if ful_res.get("success") and ful_res.get("data"):
                f_data = ful_res["data"]
                rec = f_data["recommended_warehouse"]
                wh_options = f_data.get("all_warehouse_options", [])
                lines = [
                    f"• {w['warehouse_name']} ({w['warehouse_code']}): {w['available_quantity']} available | {w['warehouse_utilization_pct']:.1f}% capacity | {w['estimated_transit_days']}d transit"
                    for w in wh_options
                ]
                answer_text = (
                    f"**Recommended Fulfillment Warehouse:** {rec['warehouse_name']} ({rec['warehouse_code']})\n\n"
                    f"**Reasoning:** {rec['warehouse_name']} has **{rec['available_quantity']} units available** "
                    f"of {f_data['product_name']} with capacity utilization at {rec['warehouse_utilization_pct']:.1f}%. "
                    f"Estimated delivery time: **{rec['estimated_transit_days']} day(s)**.\n\n"
                    f"**All Regional Depot Inventory:**\n" + "\n".join(lines)
                )
                used_tool_name = "find_best_fulfillment_warehouse"
        # 11. Inter-Depot Stock Transfer & Network Rebalancing
        elif target_tool in ["recommend_stock_transfers", "stock_rebalancing"] or state.get("intent") == "stock_rebalancing":
            trf_res = await transfers.recommend_stock_transfers()
            raw_data = trf_res
            if trf_res.get("success") and trf_res.get("recommendations"):
                recs = trf_res["recommendations"]
                lines = []
                for idx, r in enumerate(recs, 1):
                    lines.append(
                        f"**{idx}. {r['product_name']} ({r['sku']})**\n"
                        f"   • **Transfer:** {r['recommended_transfer_qty']} units from **{r['from_warehouse_name']}** ({r['from_warehouse_code']}) ➔ **{r['to_warehouse_name']}** ({r['to_warehouse_code']})\n"
                        f"   • **Reason:** {r['reason']}\n"
                        f"   • **Est. Transit:** {r['estimated_transit_days']} days | **Cost Savings vs Expedited PO:** ₹{r['estimated_cost_savings']:,.2f}"
                    )
                answer_text = (
                    f"**AI Network Stock Rebalancing Recommendations ({len(recs)} Actions Identified):**\n\n"
                    + "\n\n".join(lines)
                    + "\n\n💡 *Initiating these internal transfers rebalances storage headroom and protects against stockout without incurring emergency vendor expedite fees.*"
                )
                used_tool_name = "recommend_stock_transfers"
            else:
                answer_text = "All regional warehouses currently maintain balanced safety buffers. No critical inter-depot transfers required."

        # 12. Alternate Supplier Recommendation Engine
        elif target_tool in ["get_alternate_suppliers", "alternate_supplier"] or state.get("intent") == "alternate_supplier":
            supp_name = params.get("supplier") or params.get("company_name") or question
            alt_res = await supplier.get_alternate_suppliers(supplier_name_or_id=supp_name)
            raw_data = alt_res
            if alt_res.get("success") and alt_res.get("data") and alt_res["data"].get("alternates"):
                d = alt_res["data"]
                alts = d["alternates"]
                lines = []
                for idx, a in enumerate(alts, 1):
                    lines.append(
                        f"**{idx}. {a['alternate_supplier_name']}** ({a['city']}, {a['country']})\n"
                        f"   • **Reliability Rating:** {a['reliability_score']:.1f}% (+{a['score_improvement']:.1f}% improvement)\n"
                        f"   • **Quality SLA:** {a['quality_score']:.1f}% | **Lead Time:** {a['lead_time_days']} days\n"
                        f"   • **Analysis:** {a['recommendation_reason']}"
                    )
                answer_text = (
                    f"**AI Backup Supplier Recommendations for '{d['primary_supplier']}':**\n\n"
                    + "\n\n".join(lines)
                    + "\n\n💡 *Shifting order volume to these pre-qualified backup vendors protects against lead-time delays and mitigates single-supplier risk.*"
                )
                used_tool_name = "get_alternate_suppliers"
            else:
                answer_text = f"No qualified backup suppliers found for '{supp_name}'."

        # 13. Demand Spike & Statistical Anomaly Detector (Z >= 2.5)
        elif target_tool in ["detect_demand_anomalies", "demand_anomaly"] or state.get("intent") == "demand_anomaly":
            anom_res = await analytics.detect_demand_anomalies(threshold_z=2.5)
            raw_data = anom_res
            if anom_res.get("success") and anom_res.get("data"):
                items = anom_res["data"]
                lines = []
                for idx, a in enumerate(items, 1):
                    lines.append(
                        f"**{idx}. {a['product_name']} ({a['sku']})** — *{a['warehouse_name']}*\n"
                        f"   • **Statistical Z-Score:** **Z = {a['z_score']:.2f}** ({a['severity']} ANOMALY)\n"
                        f"   • **Consumption Surge:** **{a['current_daily_sales']} units/day** (+{a['spike_percentage']:.1f}% vs 30-day mean of {a['historical_mean']:.1f})\n"
                        f"   • **Stockout Horizon:** **{a['stockout_days_remaining']} day(s) remaining** ({a['available_quantity']} available)\n"
                        f"   • **Recommended Action:** Expand safety stock buffer by **+{a['recommended_buffer_increase']} units** immediately."
                    )
                answer_text = (
                    f"**Statistical Demand Anomaly Report (Z ≥ 2.5 Threshold - {len(items)} Surges Detected):**\n\n"
                    + "\n\n".join(lines)
                    + "\n\n💡 *Statistical Z-scores greater than 2.5 indicate abnormal demand velocity exceeding 99% of historical sales variance. Immediate safety buffer expansion is recommended.*"
                )
                used_tool_name = "detect_demand_anomalies"
            else:
                answer_text = "All regional product consumption rates remain within normal statistical variance (Z < 2.5). No demand surges detected."

        # 14. Default Fallback
        else:
            answer_text = "No data available."

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

