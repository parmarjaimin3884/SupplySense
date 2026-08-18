"""
SupplySense -- Embeddings Package
Centralised embedding model creation and lifecycle management.

Usage::

    from backend.app.ai.embeddings import get_embeddings
    embeddings = get_embeddings()
"""

from backend.app.ai.embeddings.embedding_factory import (  # noqa: F401
    get_embeddings,
    EmbeddingFactory,
)

__all__ = ["get_embeddings", "EmbeddingFactory"]
