from typing import List, Optional
from pydantic import BaseModel, Field

class InventoryAnalysisResponse(BaseModel):
    """
    Structured output for the Inventory Agent's analysis and recommendations.
    """
    summary: str = Field(
        description="A clear, high-level summary of the inventory situation based on the user's question."
    )
    risks: List[str] = Field(
        description="A list of specific business risks identified (e.g., potential stockouts, capital tied up in dead stock)."
    )
    recommendations: List[str] = Field(
        description="Actionable business recommendations (e.g., 'Transfer 50 units from WH-1 to WH-2', 'Mark product X for clearance')."
    )
    inventory_status: str = Field(
        description="A short label describing the overall status. Examples: 'Healthy', 'Critical Shortage', 'Severe Overstock', 'Imbalanced'."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0 based on the completeness of the retrieved data.",
        ge=0.0,
        le=1.0
    )
