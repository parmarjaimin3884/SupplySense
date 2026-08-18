"""
SupplySense — LLM Package
Centralised LLM creation and lifecycle management.

Usage:
    from backend.app.ai.llm import get_llm
    llm = get_llm()                          # default settings
    llm = get_llm(temperature=0.7)           # override temperature
"""

from backend.app.ai.llm.llm_factory import get_llm, LLMFactory  # noqa: F401

__all__ = ["get_llm", "LLMFactory"]
