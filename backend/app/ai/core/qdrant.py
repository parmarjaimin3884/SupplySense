"""
SupplySense — AI Core Qdrant Vector Store Placeholder
Delegates vector store connection instantiation to backend.app.ai.agents.rag.retriever.get_vectorstore.
"""

from backend.app.ai.agents.rag.retriever import get_vectorstore as _get_vectorstore


def create_vectorstore_instance():
    """
    Factory wrapper function for creating Qdrant vector store instances.
    """
    return _get_vectorstore()
