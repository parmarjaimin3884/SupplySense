"""
SupplySense — AI Core Embeddings Placeholder
Delegates embedding model instantiation to backend.app.ai.agents.rag.retriever.get_embeddings.
"""

from backend.app.ai.agents.rag.retriever import get_embeddings as _get_embeddings


def create_embeddings_instance():
    """
    Factory wrapper function for creating embedding model instances.
    """
    return _get_embeddings()
