"""
SupplySense — AI Core LLM Factory Bridge
=========================================

Thin wrapper that delegates to the production LLM Factory at
``backend.app.ai.llm.llm_factory``.

Kept for backward compatibility with code that imports from
``backend.app.ai.core``.
"""

from langchain_core.language_models.chat_models import BaseChatModel

from backend.app.ai.llm.llm_factory import get_llm, LLMFactory


def create_llm_instance(
    temperature: float = 0.0,
    model: str | None = None,
) -> BaseChatModel:
    """
    Factory wrapper for creating LLM instances.

    Delegates to the singleton ``LLMFactory`` which selects the
    correct provider (Groq / OpenAI / …) based on ``settings.LLM_PROVIDER``.
    """
    return get_llm(temperature=temperature, model=model)


__all__ = ["create_llm_instance", "get_llm", "LLMFactory"]
