from typing import List, Optional
from pydantic import BaseModel, Field

class ShipmentAnalysisResponse(BaseModel):
    """
    Structured output for the Shipment Monitoring Agent.
    """
    summary: str = Field(
        description="A clear, high-level summary of the shipment health and risks based on the user's question."
    )
    shipment_status: str = Field(
        description="Overall status label. Examples: 'Healthy', 'Moderate Risk', 'Critical Delays'."
    )
    critical_shipments: List[str] = Field(
        description="List of specific shipment IDs or descriptions that require immediate attention."
    )
    delayed_shipments: List[str] = Field(
        description="List of delayed shipments and their delay durations."
    )
    supplier_risk: List[str] = Field(
        description="List of risks associated with specific suppliers (e.g., repeatedly misses ETA)."
    )
    warehouse_risk: List[str] = Field(
        description="List of risks associated with warehouses (e.g., receiving bottlenecks, capacity limits)."
    )
    recommendations: List[str] = Field(
        description="Actionable business recommendations (e.g., 'Escalate Supplier ABC', 'Create emergency PO')."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0 based on data completeness.",
        ge=0.0,
        le=1.0
    )
