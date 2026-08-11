"""
SupplySense — RAG Document Ingestion Pipeline Test Suite
=========================================================

Tests PDF discovery, text extraction, metadata mapping, section-aware chunking,
deterministic point UUID generation, Qdrant indexing, and RAG Agent retrieval.
"""

import os
import pytest
from pathlib import Path

from backend.app.ai.agents.rag.ingest import (
    DOCUMENT_METADATA_REGISTRY,
    DocumentIngestionPipeline,
    parse_pdf_document,
    parse_section_headers,
    chunk_document_pages,
    generate_deterministic_point_id,
)
from backend.app.ai.agents.rag.retriever import retrieve_documents_similarity
from backend.app.ai.agents.rag.agent import RAGAgent
from backend.app.ai.vectorstore import QdrantManager


@pytest.fixture(scope="module")
def knowledge_dir():
    return Path(os.getcwd()) / "knowledge_base"


@pytest.fixture(scope="module", autouse=True)
def ingested_qdrant_collection(knowledge_dir):
    """Ensure Qdrant collection is populated before running integration tests."""
    pipeline = DocumentIngestionPipeline(chunk_size=800, chunk_overlap=150)
    summary = pipeline.run(knowledge_dir=knowledge_dir, reset=False)
    return summary


class TestPDFDiscoveryAndMetadata:
    """Verify PDF document discovery and metadata configuration."""

    def test_all_six_pdfs_exist(self, knowledge_dir):
        assert knowledge_dir.exists()
        pdf_files = list(knowledge_dir.glob("*.pdf"))
        filenames = [f.name.lower() for f in pdf_files]

        expected_files = [
            "emergency_procurement.pdf",
            "inventory_policy.pdf",
            "procurement_policy.pdf",
            "purchase_order_sop.pdf",
            "supplier_policy.pdf",
            "warehouse_sop.pdf",
        ]
        for expected in expected_files:
            assert expected in filenames, f"Missing expected PDF file: {expected}"

    def test_document_metadata_registry_coverage(self):
        expected_ids = {
            "emergency_procurement.pdf": "SSE-EMG-POL-001",
            "inventory_policy.pdf": "SSE-INV-POL-001",
            "procurement_policy.pdf": "SSE-PROC-POL-001",
            "purchase_order_sop.pdf": "SSE-PO-SOP-001",
            "supplier_policy.pdf": "SSE-SUP-POL-001",
            "warehouse_sop.pdf": "SSE-WH-SOP-001",
        }
        for filename, doc_id in expected_ids.items():
            assert filename in DOCUMENT_METADATA_REGISTRY
            assert DOCUMENT_METADATA_REGISTRY[filename]["document_id"] == doc_id


class TestPDFParsingAndChunking:
    """Verify page text extraction and section-aware chunking."""

    def test_parse_pdf_document_procurement(self, knowledge_dir):
        pdf_path = knowledge_dir / "procurement_policy.pdf"
        meta, pages = parse_pdf_document(pdf_path)

        assert meta["document_id"] == "SSE-PROC-POL-001"
        assert len(pages) > 0
        assert "SupplySense" in pages[0].raw_text

    def test_section_header_parsing(self):
        sample_text = (
            "1. Purpose\nThis policy establishes rules.\n\n"
            "2. Scope\nApplies to all employees.\n\n"
            "4. Procurement Governance & Approval Matrix\nDetails below."
        )
        sections = parse_section_headers(sample_text)
        assert len(sections) >= 2

    def test_chunking_preserves_metadata(self, knowledge_dir):
        pdf_path = knowledge_dir / "inventory_policy.pdf"
        _, pages = parse_pdf_document(pdf_path)
        chunks = chunk_document_pages(pages, chunk_size=800, chunk_overlap=150)

        assert len(chunks) > 0
        for chunk in chunks:
            assert "document_id" in chunk
            assert chunk["document_id"] == "SSE-INV-POL-001"
            assert "page_number" in chunk
            assert "content" in chunk
            assert "company" in chunk
            assert chunk["company"] == "SupplySense Electronics Pvt. Ltd."

    def test_deterministic_id_generation(self):
        id1 = generate_deterministic_point_id("SSE-PROC-POL-001", 1, 0)
        id2 = generate_deterministic_point_id("SSE-PROC-POL-001", 1, 0)
        id3 = generate_deterministic_point_id("SSE-PROC-POL-001", 1, 1)

        assert id1 == id2, "Deterministic IDs for identical parameters must match"
        assert id1 != id3, "IDs for different chunk indexes must be distinct"


class TestIngestionExecutionAndQdrantIndexing:
    """Verify pipeline execution, Qdrant indexing, and retrieval integration."""

    def test_pipeline_run_indexes_all_documents(self, knowledge_dir):
        pipeline = DocumentIngestionPipeline(chunk_size=800, chunk_overlap=150)
        summary = pipeline.run(knowledge_dir=knowledge_dir, reset=False)

        assert summary["status"] == "success"
        assert summary["documents_processed"] == 6
        assert summary["total_chunks"] >= 6
        assert summary["qdrant_points_count"] >= 6

    def test_idempotence_no_duplicate_vectors(self, knowledge_dir):
        pipeline = DocumentIngestionPipeline(chunk_size=800, chunk_overlap=150)
        summary1 = pipeline.run(knowledge_dir=knowledge_dir, reset=False)
        pts1 = summary1["qdrant_points_count"]

        # Run ingestion a second time
        summary2 = pipeline.run(knowledge_dir=knowledge_dir, reset=False)
        pts2 = summary2["qdrant_points_count"]

        assert pts1 == pts2, f"Re-running ingestion changed point count from {pts1} to {pts2}"

    @pytest.mark.asyncio
    async def test_retriever_returns_indexed_documents(self):
        docs = await retrieve_documents_similarity("What is the emergency procurement process?", k=2)
        assert isinstance(docs, list)
        assert len(docs) > 0

    @pytest.mark.asyncio
    async def test_rag_agent_analyzes_query(self):
        agent = RAGAgent()
        response = await agent.analyze("What is the definition of dead stock?")

        assert response is not None
        assert response.answer is not None
