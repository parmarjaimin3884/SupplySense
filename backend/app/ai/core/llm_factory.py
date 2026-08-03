"""
SupplySense — AI Core LLM Factory Placeholder
Delegates model instantiation to backend.app.ai.llm.get_llm.
"""

from langchain_core.language_models.chat_models import BaseChatModel
from backend.app.ai.llm import get_llm as _get_llm


def create_llm_instance(temperature: float = 0.0) -> BaseChatModel:
    """
    Factory wrapper function for creating LLM instances (Groq for dev, OpenAI for prod).
    """
    return _get_llm(temperature=temperature)
