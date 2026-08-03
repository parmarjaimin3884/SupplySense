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
# Embedding Factory
# ---------------------------------------------------------------------------

def get_embeddings():
    """
    Returns the embedding model based on environment configuration.
    Defaults to HuggingFace or FastEmbed embeddings. Falls back gracefully.

    Environment Variables:
        EMBEDDING_PROVIDER: 'huggingface', 'fastembed', or 'fake'
        HUGGINGFACE_EMBEDDING_MODEL: HF model name (default: 'all-MiniLM-L6-v2')
    """
    # 1. Try langchain_huggingface
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        model = os.getenv("HUGGINGFACE_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        logger.info(f"Using HuggingFace embeddings: {model}")
        return HuggingFaceEmbeddings(model_name=model)
    except Exception as e:
        logger.debug(f"langchain_huggingface not available: {e}")

    # 2. Try langchain_community HuggingFaceEmbeddings
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        model = os.getenv("HUGGINGFACE_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        return HuggingFaceEmbeddings(model_name=model)
    except Exception as e:
        logger.debug(f"langchain_community HuggingFaceEmbeddings not available: {e}")

    # 3. Try FastEmbed
    try:
        from langchain_community.embeddings import FastEmbedEmbeddings
        logger.info("Using FastEmbed embeddings...")
        return FastEmbedEmbeddings()
    except Exception as e:
        logger.debug(f"FastEmbed embeddings not available: {e}")

    # 4. Fallback: FakeEmbeddings for development when local ML models aren't installed
    try:
        from langchain_community.embeddings import FakeEmbeddings
        logger.warning("Local embedding packages not installed. Using FakeEmbeddings (size=384) for local development.")
        return FakeEmbeddings(size=384)
    except Exception as e:
        logger.error(f"Failed to load any embedding provider: {e}")
        raise RuntimeError("No embedding provider available.")


# ---------------------------------------------------------------------------
# Vector Store Factory (Qdrant Primary)
# ---------------------------------------------------------------------------

def get_vectorstore():
    """
    Returns the vector store instance based on environment configuration.
    Qdrant is the primary vector store for SupplySense.

    Environment Variables for Qdrant:
        VECTORSTORE_PROVIDER: 'qdrant' (default) or 'chroma'
        QDRANT_URL: Qdrant cloud URL or server URL (e.g., 'https://xyz.qdrant.tech')
        QDRANT_API_KEY: Qdrant API key for cloud authentication
        QDRANT_COLLECTION: Collection name (default: 'supplysense_knowledge')
        QDRANT_HOST: Qdrant server host (default: 'localhost')
        QDRANT_PORT: Qdrant server gRPC/HTTP port (default: 6333)
        QDRANT_PATH: Optional local persistence path for file-based Qdrant
    """
    provider = os.getenv("VECTORSTORE_PROVIDER", "qdrant").lower()
    embeddings = get_embeddings()
    collection_name = os.getenv("QDRANT_COLLECTION", os.getenv("CHROMA_COLLECTION", "supplysense_knowledge"))

    if provider == "qdrant":
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        host = os.getenv("QDRANT_HOST", "localhost")
        port = int(os.getenv("QDRANT_PORT", "6333"))
        path = os.getenv("QDRANT_PATH")

        # Try langchain_qdrant integration
        try:
            from langchain_qdrant import QdrantVectorStore
            from qdrant_client import QdrantClient

            logger.info(f"Initializing QdrantVectorStore for collection '{collection_name}'...")

            if url:
                client = QdrantClient(url=url, api_key=api_key)
            elif path:
                client = QdrantClient(path=path)
            else:
                client = QdrantClient(host=host, port=port)

            return QdrantVectorStore(
                client=client,
                collection_name=collection_name,
                embedding=embeddings,
            )

        except ImportError:
            logger.warning(
                "langchain_qdrant or qdrant-client not installed. "
                "Falling back to ChromaDB vector store if available."
            )
            provider = "chroma"

    if provider == "chroma":
        try:
            from langchain_chroma import Chroma
        except ImportError:
            try:
                from langchain_community.vectorstores import Chroma
            except ImportError:
                raise RuntimeError(
                    "Neither Qdrant (langchain_qdrant / qdrant-client) nor ChromaDB "
                    "are available. Please install qdrant-client & langchain-qdrant."
                )

        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        logger.info(f"Using ChromaDB fallback: collection={collection_name}, persist_dir={persist_dir}")
        return Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=persist_dir,
        )

    raise RuntimeError(f"Unsupported vector store provider: '{provider}'")


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
