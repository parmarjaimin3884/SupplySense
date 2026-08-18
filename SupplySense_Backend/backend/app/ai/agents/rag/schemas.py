"""
SupplySense - Enterprise RAG Knowledge Agent Schemas
Pydantic models for structured RAG output.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RetrievedDocument(BaseModel):
    """
    A single document chunk retrieved from the vector store.
    """
    content: str = Field(
        description="The text content of the retrieved document chunk."
    )
    source: Optional[str] = Field(
        default=None,
        description="Source file or document name (e.g., 'Procurement Policy v2.1')."
    )
    page: Optional[int] = Field(
        default=None,
        description="Page number if available."
    )
    category: Optional[str] = Field(
        default=None,
        description="Document category (e.g., 'Policy', 'SOP', 'Contract', 'Guidelines')."
    )
    relevance_score: Optional[float] = Field(
        default=None,
        description="Similarity/relevance score from the vector search."
    )


class RAGResponse(BaseModel):
    """
    Top-level structured output returned by the RAG Knowledge Agent.
    """
    summary: str = Field(
        description="A concise one-line summary of the answer."
    )
    answer: str = Field(
        description="The detailed answer based ONLY on retrieved documents. "
                    "Must cite sources inline."
    )
    sources: List[str] = Field(
        default_factory=list,
        description="List of source document names or references used to generate the answer."
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0 based on the relevance "
                    "and completeness of retrieved documents.",
        ge=0.0,
        le=1.0,
    )
    retrieved_documents: List[RetrievedDocument] = Field(
        default_factory=list,
        description="The raw documents retrieved from the knowledge base."
    )
