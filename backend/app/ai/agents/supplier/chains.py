"""
SupplySense — Supplier Intelligence Agent Chains
Provides the structuring chain that converts free-text analysis
into a validated Pydantic schema.
"""

from langchain_core.language_models.chat_models import BaseChatModel
from backend.app.ai.agents.supplier.schemas import SupplierAnalysisResponse


def get_structuring_chain(llm: BaseChatModel):
    """
    Returns a runnable chain that strictly forces the LLM to output
    data matching the SupplierAnalysisResponse Pydantic schema.
    Uses LangChain's `with_structured_output` for guaranteed schema compliance.
    """
    structured_llm = llm.with_structured_output(SupplierAnalysisResponse)
    return structured_llm
