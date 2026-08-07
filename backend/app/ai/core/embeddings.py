"""
SupplySense -- AI Core Embeddings Bridge
=========================================

Thin wrapper that delegates to the production Embedding Factory at
``backend.app.ai.embeddings.embedding_factory``.

Kept for backward compatibility with code that imports from
``backend.app.ai.core``.
"""

from langchain_core.embeddings import Embeddings

from backend.app.ai.embeddings.embedding_factory import (
    get_embeddings,
    EmbeddingFactory,
)


def create_embeddings_instance(
    model: str | None = None,
) -> Embeddings:
    """
    Factory wrapper for creating embedding model instances.

    Delegates to the singleton ``EmbeddingFactory`` which selects the
    correct provider based on ``settings.EMBEDDING_PROVIDER``.
    """
    return get_embeddings(model=model)


__all__ = ["create_embeddings_instance", "get_embeddings", "EmbeddingFactory"]
