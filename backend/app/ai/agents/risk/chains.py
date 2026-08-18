"""
SupplySense — Risk Analysis Agent Chains
Provides the structuring chain that converts free-text risk analysis
into a validated Pydantic schema.
"""

from langchain_core.language_models.chat_models import BaseChatModel
from backend.app.ai.agents.risk.schemas import RiskAnalysisResponse


def get_structuring_chain(llm: BaseChatModel):
    """
    Returns a runnable chain that strictly forces the LLM to output
    data matching the RiskAnalysisResponse Pydantic schema.
    Uses LangChain's `with_structured_output` for guaranteed schema compliance.
    """
    structured_llm = llm.with_structured_output(RiskAnalysisResponse)
    return structured_llm
