import os
import logging
from langchain_core.language_models.chat_models import BaseChatModel

logger = logging.getLogger(__name__)

def get_llm(temperature: float = 0.0) -> BaseChatModel:
    """
    LLM Factory for SupplySense.
    Configured to use Groq (ChatGroq) for all AI agents and supervisor.
    """
    from langchain_groq import ChatGroq

    api_key = os.getenv("GROQ_API_KEY")
    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    logger.info(f"Initializing Groq LLM model: {model_name}")

    if api_key:
        return ChatGroq(
            model=model_name,
            groq_api_key=api_key,
            temperature=temperature
        )

    return ChatGroq(
        model=model_name,
        temperature=temperature
    )
