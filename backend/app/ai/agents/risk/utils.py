"""
SupplySense — Risk Analysis Agent Utils
Utility functions for formatting upstream agent outputs into
a structured context prompt for the Risk Analysis Agent.

This agent does NOT use LangChain tools. Instead it receives
validated Pydantic outputs from 4 upstream agents and formats them
into a rich analysis prompt.
"""

from typing import Optional, Dict, Any

from backend.app.ai.agents.inventory.schemas import InventoryAnalysisResponse
from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse
from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse
from backend.app.ai.agents.forecast.schemas import ForecastAnalysisResponse


def _serialize_agent_output(output: Any) -> Dict[str, Any]:
    """
    Safely serialize a Pydantic model or dict to a dict.
    Handles both Pydantic v1 and v2 serialization.
    """
    if output is None:
        return {}
    if hasattr(output, "model_dump"):
        return output.model_dump()
    if hasattr(output, "dict"):
        return output.dict()
    if isinstance(output, dict):
        return output
    return {}


def format_inventory_context(
    output: Optional[InventoryAnalysisResponse],
) -> str:
    """Format the Inventory Agent's findings into a readable context block."""
    if output is None:
        return (
            "## INVENTORY AGENT\n"
            "Status: NOT AVAILABLE — The Inventory Agent did not provide analysis.\n"
            "Impact: Inventory risk cannot be assessed.\n"
        )

    data = _serialize_agent_output(output)
    lines = [
        "## INVENTORY AGENT",
        f"Status: {data.get('inventory_status', 'Unknown')}",
        f"Confidence: {data.get('confidence', 0.0)}",
        f"Summary: {data.get('summary', 'No summary available.')}",
    ]

    risks = data.get("risks", [])
    if risks:
        lines.append("Identified Risks:")
        for r in risks:
            lines.append(f"  - {r}")

    recommendations = data.get("recommendations", [])
    if recommendations:
        lines.append("Recommendations:")
        for rec in recommendations:
            lines.append(f"  - {rec}")

    return "\n".join(lines)


def format_shipment_context(
    output: Optional[ShipmentAnalysisResponse],
) -> str:
    """Format the Shipment Agent's findings into a readable context block."""
    if output is None:
        return (
            "## SHIPMENT AGENT\n"
            "Status: NOT AVAILABLE — The Shipment Agent did not provide analysis.\n"
            "Impact: Shipment and logistics risk cannot be assessed.\n"
        )

    data = _serialize_agent_output(output)
    lines = [
        "## SHIPMENT AGENT",
        f"Status: {data.get('shipment_status', 'Unknown')}",
        f"Confidence: {data.get('confidence', 0.0)}",
        f"Summary: {data.get('summary', 'No summary available.')}",
    ]

    critical = data.get("critical_shipments", [])
    if critical:
        lines.append("Critical Shipments:")
        for s in critical:
            lines.append(f"  - {s}")

    delayed = data.get("delayed_shipments", [])
    if delayed:
        lines.append("Delayed Shipments:")
        for s in delayed:
            lines.append(f"  - {s}")

    supplier_risk = data.get("supplier_risk", [])
    if supplier_risk:
        lines.append("Supplier-Related Shipment Risks:")
        for r in supplier_risk:
            lines.append(f"  - {r}")

    warehouse_risk = data.get("warehouse_risk", [])
    if warehouse_risk:
        lines.append("Warehouse-Related Shipment Risks:")
        for r in warehouse_risk:
            lines.append(f"  - {r}")

    recommendations = data.get("recommendations", [])
    if recommendations:
        lines.append("Recommendations:")
        for rec in recommendations:
            lines.append(f"  - {rec}")

    return "\n".join(lines)


def format_supplier_context(
    output: Optional[SupplierAnalysisResponse],
) -> str:
    """Format the Supplier Agent's findings into a readable context block."""
    if output is None:
        return (
            "## SUPPLIER INTELLIGENCE AGENT\n"
            "Status: NOT AVAILABLE — The Supplier Agent did not provide analysis.\n"
            "Impact: Supplier and procurement risk cannot be assessed.\n"
        )

    data = _serialize_agent_output(output)
    lines = [
        "## SUPPLIER INTELLIGENCE AGENT",
        f"Confidence: {data.get('confidence', 0.0)}",
        f"Summary: {data.get('summary', 'No summary available.')}",
    ]

    best = data.get("best_suppliers", [])
    if best:
        lines.append(f"Best Suppliers: {', '.join(best)}")

    risky = data.get("risky_suppliers", [])
    if risky:
        lines.append(f"Risky Suppliers: {', '.join(risky)}")

    health = data.get("supplier_health", [])
    if health:
        lines.append("Supplier Health Details:")
        for h in health:
            name = h.get("company_name", "Unknown")
            verdict = h.get("health_verdict", "Unknown")
            rel = h.get("reliability_score")
            qual = h.get("quality_score")
            delay = h.get("average_delay_days")
            detail = f"  - {name}: {verdict}"
            if rel is not None:
                detail += f" | Reliability: {rel}"
            if qual is not None:
                detail += f" | Quality: {qual}"
            if delay is not None:
                detail += f" | Avg Delay: {delay}d"
            lines.append(detail)

    risk_assessments = data.get("risk_assessments", [])
    if risk_assessments:
        lines.append("Risk Assessments:")
        for ra in risk_assessments:
            lines.append(
                f"  - [{ra.get('severity', '?')}] {ra.get('supplier_name', '?')}: "
                f"{ra.get('description', 'No detail.')}"
            )

    recommendations = data.get("recommendations", [])
    if recommendations:
        lines.append("Recommendations:")
        for rec in recommendations:
            if isinstance(rec, dict):
                lines.append(
                    f"  - [{rec.get('priority', '?')}] {rec.get('action', '?')}: "
                    f"{rec.get('rationale', '')}"
                )
            else:
                lines.append(f"  - {rec}")

    return "\n".join(lines)


def format_forecast_context(
    output: Optional[ForecastAnalysisResponse],
) -> str:
    """Format the Forecast Agent's findings into a readable context block."""
    if output is None:
        return (
            "## DEMAND FORECAST AGENT\n"
            "Status: NOT AVAILABLE — The Forecast Agent did not provide analysis.\n"
            "Impact: Demand and future procurement risk cannot be assessed.\n"
        )

    data = _serialize_agent_output(output)
    lines = [
        "## DEMAND FORECAST AGENT",
        f"Overall Demand Outlook: {data.get('predicted_demand', 'Unknown')}",
        f"Confidence: {data.get('confidence', 0.0)}",
        f"Summary: {data.get('summary', 'No summary available.')}",
    ]

    high = data.get("high_demand_products", [])
    if high:
        lines.append(f"High Demand Products: {', '.join(high)}")

    low = data.get("low_demand_products", [])
    if low:
        lines.append(f"Low Demand Products: {', '.join(low)}")

    forecasts = data.get("forecast", [])
    if forecasts:
        lines.append("Product Forecasts:")
        for f in forecasts:
            name = f.get("product_name", "Unknown")
            pred = f.get("predicted_demand", "?")
            units = f.get("estimated_units")
            period = f.get("forecast_period", "")
            detail = f"  - {name}: {pred}"
            if units is not None:
                detail += f" (~{units} units)"
            if period:
                detail += f" [{period}]"
            lines.append(detail)

    recommendations = data.get("recommendations", [])
    if recommendations:
        lines.append("Recommendations:")
        for rec in recommendations:
            if isinstance(rec, dict):
                lines.append(
                    f"  - [{rec.get('priority', '?')}] {rec.get('action', '?')}: "
                    f"{rec.get('rationale', '')}"
                )
            else:
                lines.append(f"  - {rec}")

    return "\n".join(lines)


def build_risk_analysis_prompt(
    user_question: str,
    inventory_output: Optional[InventoryAnalysisResponse] = None,
    shipment_output: Optional[ShipmentAnalysisResponse] = None,
    supplier_output: Optional[SupplierAnalysisResponse] = None,
    forecast_output: Optional[ForecastAnalysisResponse] = None,
) -> str:
    """
    Build the complete analysis prompt by combining the user question
    with formatted outputs from all 4 upstream agents.

    Returns a single string ready to be passed to the LLM.
    """
    agents_available = sum(
        1 for o in [inventory_output, shipment_output, supplier_output, forecast_output]
        if o is not None
    )

    sections = [
        f"# OPERATIONAL RISK ANALYSIS REQUEST\n",
        f"User Question: {user_question}\n",
        f"Upstream Agents Reporting: {agents_available}/4\n",
        "=" * 60,
        "",
        format_inventory_context(inventory_output),
        "",
        "=" * 60,
        "",
        format_shipment_context(shipment_output),
        "",
        "=" * 60,
        "",
        format_supplier_context(supplier_output),
        "",
        "=" * 60,
        "",
        format_forecast_context(forecast_output),
        "",
        "=" * 60,
        "",
        "# INSTRUCTIONS",
        "",
        "Based on ALL the above agent findings, produce a comprehensive "
        "enterprise-level operational risk assessment. Cross-correlate risks "
        "across domains. Rank priority actions by urgency. Assign risk IDs. "
        "Set confidence based on data completeness "
        f"({agents_available}/4 agents reported).",
    ]

    return "\n".join(sections)


def compute_data_confidence(
    inventory_output: Optional[Any] = None,
    shipment_output: Optional[Any] = None,
    supplier_output: Optional[Any] = None,
    forecast_output: Optional[Any] = None,
) -> float:
    """
    Compute a baseline confidence score based on how many upstream agents
    provided data and their individual confidence scores.

    Returns a float between 0.0 and 1.0.
    """
    agents = [inventory_output, shipment_output, supplier_output, forecast_output]
    available = [a for a in agents if a is not None]

    if not available:
        return 0.0

    # Base confidence from agent availability (each agent = 25% of total)
    availability_score = len(available) / 4.0

    # Average upstream confidence
    confidences = []
    for a in available:
        data = _serialize_agent_output(a)
        conf = data.get("confidence", 0.5)
        confidences.append(conf)

    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.5

    # Composite: 60% availability + 40% average upstream confidence
    composite = (0.6 * availability_score) + (0.4 * avg_confidence)
    return round(min(max(composite, 0.0), 1.0), 2)
