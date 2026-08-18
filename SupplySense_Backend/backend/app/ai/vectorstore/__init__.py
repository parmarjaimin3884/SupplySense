"""
SupplySense -- Vector Store Package
Centralised Qdrant client creation and vector operations.

Usage::

    from backend.app.ai.vectorstore import get_client, get_vectorstore
    client = get_client()                 # raw QdrantClient
    vs     = get_vectorstore()            # LangChain QdrantVectorStore
"""

from backend.app.ai.vectorstore.qdrant_client import (  # noqa: F401
    get_client,
    get_vectorstore,
    QdrantManager,
)

__all__ = ["get_client", "get_vectorstore", "QdrantManager"]
