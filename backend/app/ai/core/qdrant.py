"""
SupplySense -- AI Core Qdrant Bridge
=====================================

Thin wrapper that delegates to the production Qdrant Manager at
``backend.app.ai.vectorstore.qdrant_client``.

Kept for backward compatibility with code that imports from
``backend.app.ai.core``.
"""

from backend.app.ai.vectorstore.qdrant_client import (
    get_client,
    get_vectorstore,
    QdrantManager,
)


def create_vectorstore_instance(collection: str | None = None):
    """
    Factory wrapper for creating Qdrant vector store instances.

    Delegates to the singleton ``QdrantManager``.
    """
    return get_vectorstore(collection=collection)


__all__ = [
    "create_vectorstore_instance",
    "get_client",
    "get_vectorstore",
    "QdrantManager",
]
