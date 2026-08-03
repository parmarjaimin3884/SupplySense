"""
SupplySense - Enterprise RAG Knowledge Agent Utils
Utility functions for formatting retrieved documents into context,
computing retrieval confidence, and selecting retrieval strategy.
"""

from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def format_retrieved_context(chunks: List[Dict[str, Any]]) -> str:
    """
    Format retrieved document chunks into a structured context string
    for LLM consumption.

    Each chunk is numbered and includes source metadata for citation.
    """
    if not chunks:
        return (
            "[NO DOCUMENTS RETRIEVED]\n"
            "No relevant documents were found in the knowledge base for this query."
        )

    lines = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.get("source", "Unknown Source")
        page = chunk.get("page")
        category = chunk.get("category", "")
        content = chunk.get("content", "")
        score = chunk.get("relevance_score")

        header = f"--- Document {i} ---"
        meta_parts = [f"Source: {source}"]
        if page is not None:
            meta_parts.append(f"Page: {page}")
        if category:
            meta_parts.append(f"Category: {category}")
        if score is not None:
            meta_parts.append(f"Relevance: {score:.3f}")

        lines.append(header)
        lines.append(" | ".join(meta_parts))
        lines.append(content.strip())
        lines.append("")

    return "\n".join(lines)


def compute_retrieval_confidence(chunks: List[Dict[str, Any]]) -> float:
    """
    Compute a confidence score based on the quality of retrieved documents.

    Factors:
        - Number of documents retrieved (more = higher base)
        - Average relevance score if available
        - Whether sources are diverse

    Returns:
        A float between 0.0 and 1.0.
    """
    if not chunks:
        return 0.0

    # Base confidence from document count (max 5 docs = 0.5)
    count_score = min(len(chunks) / 5.0, 1.0) * 0.5

    # Relevance score component
    scores = [
        c.get("relevance_score")
        for c in chunks
        if c.get("relevance_score") is not None
    ]
    if scores:
        avg_relevance = sum(scores) / len(scores)
        relevance_score = avg_relevance * 0.5
    else:
        # No scores available (e.g., MMR) — assume moderate relevance
        relevance_score = 0.25

    composite = count_score + relevance_score
    return round(min(max(composite, 0.0), 1.0), 2)


def extract_unique_sources(chunks: List[Dict[str, Any]]) -> List[str]:
    """
    Extract a deduplicated list of source document names from retrieved chunks.
    """
    seen = set()
    sources = []
    for chunk in chunks:
        source = chunk.get("source", "Unknown")
        if source not in seen:
            seen.add(source)
            sources.append(source)
    return sources


def select_retrieval_strategy(query: str) -> str:
    """
    Heuristically select the best retrieval strategy based on query characteristics.

    Returns:
        'similarity' for specific factual queries.
        'mmr' for broader exploratory queries.
    """
    # Broad/exploratory keywords suggest MMR for diversity
    broad_indicators = [
        "explain", "describe", "overview", "summarize", "compare",
        "differences", "types of", "list all", "what are the",
        "how does", "tell me about",
    ]

    query_lower = query.lower()
    for indicator in broad_indicators:
        if indicator in query_lower:
            return "mmr"

    # Default to similarity for specific factual lookups
    return "similarity"
