from langchain_core.language_models.chat_models import BaseChatModel
from backend.app.ai.agents.shipment.schemas import ShipmentAnalysisResponse

def get_structuring_chain(llm: BaseChatModel):
    """
    Returns a runnable chain that strictly forces the LLM to output
    the data matching the ShipmentAnalysisResponse Pydantic schema.
    """
    structured_llm = llm.with_structured_output(ShipmentAnalysisResponse)
    
    # We can wrap it in a simple prompt mapping if needed, or return the bound LLM directly.
    return structured_llm
