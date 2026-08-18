"""
SupplySense - Enterprise RAG Knowledge Agent Retriever
Configures Qdrant vector store connection and provides document retrieval methods
(similarity search, MMR, metadata filtering).

Supported Vector Stores:
    - Qdrant (Primary choice)
    - ChromaDB (Local fallback)

Uses environment variables for all configuration.
Uses Groq for LLM and HuggingFace/FastEmbed/FakeEmbeddings for embeddings.
"""

import os
import logging
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embedding Factory (delegated to centralised factory)
# ---------------------------------------------------------------------------

def get_embeddings():
    """
    Returns the embedding model via the centralised Embedding Factory.

    This function is kept for backward compatibility with existing imports.
    Internally delegates to ``backend.app.ai.embeddings.get_embeddings``.
    """
    from backend.app.ai.embeddings import get_embeddings as _factory_get_embeddings
    return _factory_get_embeddings()


# ---------------------------------------------------------------------------
# Vector Store Factory (delegated to centralised Qdrant Manager)
# ---------------------------------------------------------------------------

def get_vectorstore():
    """
    Returns the vector store instance via the centralised Qdrant Manager.

    This function is kept for backward compatibility with existing imports.
    Internally delegates to ``backend.app.ai.vectorstore.get_vectorstore``.
    """
    from backend.app.ai.vectorstore import get_vectorstore as _factory_get_vs
    return _factory_get_vs()


# ---------------------------------------------------------------------------
# Retrieval Functions
# ---------------------------------------------------------------------------

async def retrieve_documents_similarity(
    query: str,
    k: int = 5,
    filter_metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve documents using similarity search from Qdrant / vector store.

    Args:
        query: User search query string.
        k: Number of top documents to retrieve.
        filter_metadata: Optional metadata filter dictionary.

    Returns:
        List of formatted document dictionaries with content, source, page, category, and relevance score.
    """
    try:
        vectorstore = get_vectorstore()

        if filter_metadata:
            results = vectorstore.similarity_search_with_relevance_scores(
                query, k=k, filter=filter_metadata
            )
        else:
            results = vectorstore.similarity_search_with_relevance_scores(
                query, k=k
            )

        return _format_results(results)

    except Exception as e:
        logger.error(f"Similarity search failed: {e}", exc_info=True)
        return []


async def retrieve_documents_mmr(
    query: str,
    k: int = 5,
    fetch_k: int = 20,
    lambda_mult: float = 0.5,
    filter_metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve documents using Maximum Marginal Relevance (MMR) search.
    Balances relevance and diversity to eliminate redundant document chunks.

    Args:
        query: User search query string.
        k: Number of documents to return.
        fetch_k: Number of candidates to evaluate during MMR re-ranking.
        lambda_mult: Diversity factor (0 = max diversity, 1 = max relevance).
        filter_metadata: Optional metadata filter dictionary.

    Returns:
        List of formatted document dictionaries.
    """
    try:
        vectorstore = get_vectorstore()

        kwargs = {
            "query": query,
            "k": k,
            "fetch_k": fetch_k,
            "lambda_mult": lambda_mult,
        }
        if filter_metadata:
            kwargs["filter"] = filter_metadata

        results = vectorstore.max_marginal_relevance_search(**kwargs)

        return [
            {
                "content": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page"),
                "category": doc.metadata.get("category"),
                "relevance_score": None,
            }
            for doc in results
        ]

    except Exception as e:
        logger.error(f"MMR search failed: {e}", exc_info=True)
        return []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _format_results(results: List) -> List[Dict[str, Any]]:
    """Format vector store output into standardized document dicts."""
    formatted = []
    for item in results:
        if isinstance(item, tuple) and len(item) == 2:
            doc, score = item
            formatted.append({
                "content": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page"),
                "category": doc.metadata.get("category"),
                "relevance_score": float(score) if score is not None else None,
            })
        else:
            doc = item
            formatted.append({
                "content": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page"),
                "category": doc.metadata.get("category"),
                "relevance_score": None,
            })
    return formatted
