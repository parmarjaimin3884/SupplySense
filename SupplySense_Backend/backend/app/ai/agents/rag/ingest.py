"""
SupplySense — Enterprise RAG Knowledge Document Ingestion Pipeline
====================================================================

Discovers, extracts, chunks, embeds, and indexes internal company policy and SOP PDF
documents from the ``knowledge_base/`` directory into the Qdrant vector database.

Design & Architectural Principles:
  1. Reuses centralised ``backend.app.ai.embeddings.get_embeddings()`` factory.
  2. Reuses centralised ``backend.app.ai.vectorstore.QdrantManager``.
  3. Preserves document and chunk metadata (Document ID, Title, Version, Department, Page, Section).
  4. Generates deterministic UUID5 point IDs for idempotent re-indexing without duplicates.
  5. Supports ``--reset`` flag to recreate/clear collection when needed.
  6. Emits structured Loguru logs and CLI summary tables.

Usage:
    python -m backend.app.ai.agents.rag.ingest [--reset] [--knowledge-dir DIR]
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from pypdf import PdfReader

from backend.app.config.settings import settings
from backend.app.utils.logger import logger
from backend.app.ai.embeddings import get_embeddings
from backend.app.ai.vectorstore import QdrantManager


# =====================================================================
# Known Document Metadata Configuration
# =====================================================================

DOCUMENT_METADATA_REGISTRY: Dict[str, Dict[str, str]] = {
    "procurement_policy.pdf": {
        "document_id": "SSE-PROC-POL-001",
        "title": "SupplySense Electronics Procurement Policy",
        "version": "1.0",
        "department": "Procurement Department",
        "category": "Policy",
        "owner": "Procurement Department",
    },
    "warehouse_sop.pdf": {
        "document_id": "SSE-WH-SOP-001",
        "title": "Warehouse Operations Standard Operating Procedure",
        "version": "1.0",
        "department": "Logistics & Warehouse Operations",
        "category": "SOP",
        "owner": "Logistics & Warehouse Operations",
    },
    "inventory_policy.pdf": {
        "document_id": "SSE-INV-POL-001",
        "title": "Inventory Management and Control Policy",
        "version": "1.0",
        "department": "Inventory Management Department",
        "category": "Policy",
        "owner": "Inventory Management Department",
    },
    "supplier_policy.pdf": {
        "document_id": "SSE-SUP-POL-001",
        "title": "Supplier Management and Performance Policy",
        "version": "1.0",
        "department": "Vendor Management & Quality Assurance",
        "category": "Policy",
        "owner": "Vendor Management & Quality Assurance",
    },
    "purchase_order_sop.pdf": {
        "document_id": "SSE-PO-SOP-001",
        "title": "Purchase Order Lifecycle Standard Operating Procedure",
        "version": "1.0",
        "department": "Procurement Operations & ERP Administration",
        "category": "SOP",
        "owner": "Procurement Operations",
    },
    "emergency_procurement.pdf": {
        "document_id": "SSE-EMG-POL-001",
        "title": "Emergency Procurement Policy",
        "version": "1.0",
        "department": "Executive Risk & Supply Chain Continuity Committee",
        "category": "Policy",
        "owner": "Executive Committee",
    },
}


# =====================================================================
# PDF Extractor & Metadata Parser
# =====================================================================

class DocumentPage:
    """Represents a single extracted PDF page with text and metadata."""

    def __init__(
        self,
        document_id: str,
        document_name: str,
        source_file: str,
        page_number: int,
        raw_text: str,
        version: str,
        department: str,
        category: str,
    ) -> None:
        self.document_id = document_id
        self.document_name = document_name
        self.source_file = source_file
        self.page_number = page_number
        self.raw_text = raw_text
        self.version = version
        self.department = department
        self.category = category


def parse_pdf_document(file_path: Path) -> Tuple[Dict[str, str], List[DocumentPage]]:
    """
    Extracts text page-by-page from a PDF file using pypdf.
    Resolves known document metadata and parses page text.
    """
    filename = file_path.name.lower()
    meta = DOCUMENT_METADATA_REGISTRY.get(filename, {
        "document_id": f"SSE-DOC-{hashlib.md5(filename.encode()).hexdigest()[:6].upper()}",
        "title": file_path.stem.replace("_", " ").title(),
        "version": "1.0",
        "department": "General Operations",
        "category": "Document",
        "owner": "SupplySense Operations",
    })

    reader = PdfReader(str(file_path))
    pages: List[DocumentPage] = []

    for idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        # Clean control characters while preserving formatting structure
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text).strip()

        if text:
            pages.append(DocumentPage(
                document_id=meta["document_id"],
                document_name=meta["title"],
                source_file=file_path.name,
                page_number=idx,
                raw_text=text,
                version=meta["version"],
                department=meta["department"],
                category=meta["category"],
            ))

    return meta, pages


# =====================================================================
# Section-Aware Text Chunking
# =====================================================================

def parse_section_headers(text: str) -> List[Tuple[str, str, int]]:
    """
    Extracts section numbers and section titles from document text lines.
    Returns list of tuples: (section_number, section_title, char_position)
    """
    section_pattern = re.compile(
        r"^(?:Section\s+)?(\d+(?:\.\d+)*)[:\.]?\s+([A-Za-z0-9\s&,\-–—\(\)/]+)$",
        re.MULTILINE
    )
    matches = []
    for match in section_pattern.finditer(text):
        sec_num = match.group(1).strip()
        sec_title = match.group(2).strip()
        if len(sec_title) > 2 and len(sec_title) < 80:
            matches.append((sec_num, sec_title, match.start()))
    return matches



def chunk_document_pages(
    pages: List[DocumentPage],
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> List[Dict[str, Any]]:
    """
    Splits document page text into production chunks while maintaining metadata traceability.
    Attaches document_id, page_number, section, section_title, and chunk_index to every payload.
    """
    chunks: List[Dict[str, Any]] = []

    for page in pages:
        text = page.raw_text
        if not text:
            continue

        sections = parse_section_headers(text)
        current_section = "General"
        current_section_title = page.document_name

        # Calculate character chunks using sliding window with paragraph awareness
        paragraphs = text.split("\n\n")
        current_chunk_paragraphs: List[str] = []
        current_chunk_len = 0
        chunk_idx_in_page = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Update section context if paragraph starts with section header
            for sec_num, sec_title, _ in sections:
                if para.startswith(f"{sec_num}.") or para.startswith(f"{sec_num} "):
                    current_section = sec_num
                    current_section_title = sec_title
                    break

            para_len = len(para)

            if current_chunk_len + para_len > chunk_size and current_chunk_paragraphs:
                # Flush existing paragraph buffer into a chunk
                chunk_text = "\n\n".join(current_chunk_paragraphs).strip()
                chunks.append(_create_chunk_payload(
                    page=page,
                    chunk_text=chunk_text,
                    section=current_section,
                    section_title=current_section_title,
                    chunk_idx_in_page=chunk_idx_in_page,
                ))
                chunk_idx_in_page += 1

                # Keep overlap paragraphs for context continuity
                overlap_text = ""
                overlap_paras = []
                for p in reversed(current_chunk_paragraphs):
                    if len(overlap_text) + len(p) <= chunk_overlap:
                        overlap_paras.insert(0, p)
                        overlap_text += p
                    else:
                        break

                current_chunk_paragraphs = overlap_paras
                current_chunk_len = sum(len(p) for p in current_chunk_paragraphs)

            current_chunk_paragraphs.append(para)
            current_chunk_len += para_len

        # Flush any remaining text in page
        if current_chunk_paragraphs:
            chunk_text = "\n\n".join(current_chunk_paragraphs).strip()
            chunks.append(_create_chunk_payload(
                page=page,
                chunk_text=chunk_text,
                section=current_section,
                section_title=current_section_title,
                chunk_idx_in_page=chunk_idx_in_page,
            ))

    return chunks


def _create_chunk_payload(
    page: DocumentPage,
    chunk_text: str,
    section: str,
    section_title: str,
    chunk_idx_in_page: int,
) -> Dict[str, Any]:
    """Helper to construct standard chunk payload dictionary."""
    meta = {
        "document_id": page.document_id,
        "document_name": page.document_name,
        "source": page.source_file,
        "source_file": page.source_file,
        "page": page.page_number,
        "page_number": page.page_number,
        "section": section,
        "section_title": section_title,
        "version": page.version,
        "department": page.department,
        "category": page.category,
        "company": "SupplySense Electronics Pvt. Ltd.",
        "chunk_index": chunk_idx_in_page,
    }
    return {
        **meta,
        "content": chunk_text,
        "page_content": chunk_text,
        "metadata": meta,
    }



def generate_deterministic_point_id(document_id: str, page_number: int, chunk_index: int) -> str:
    """
    Generates a deterministic UUID5 point ID.
    Ensures idempotent upserts into Qdrant without creating duplicate points.
    """
    unique_key = f"{document_id}_p{page_number}_c{chunk_index}"
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_key))


# =====================================================================
# Document Ingestion Engine
# =====================================================================

class DocumentIngestionPipeline:
    """
    Production Document Ingestion Pipeline for SupplySense Knowledge Base.
    Converts PDF documents into embedded Qdrant vector points.
    """

    def __init__(
        self,
        collection_name: Optional[str] = None,
        chunk_size: int = 800,
        chunk_overlap: int = 150,
    ) -> None:
        self.collection_name = collection_name or settings.QDRANT_COLLECTION
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Re-use centralized QdrantManager and Embedding Factory
        self.manager = QdrantManager()
        self.embeddings = get_embeddings()

    def run(
        self,
        knowledge_dir: Path,
        reset: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes full ingestion pipeline for all PDFs in knowledge_dir.

        Args:
            knowledge_dir: Directory path containing policy PDF files.
            reset: If True, deletes and recreates the Qdrant collection first.

        Returns:
            Dict containing ingestion statistics and results summary.
        """
        start_time = time.time()
        logger.info(
            "Starting Document Ingestion Pipeline | dir={dir}  reset={rst}  collection={col}",
            dir=str(knowledge_dir),
            rst=reset,
            col=self.collection_name,
        )

        if not knowledge_dir.exists():
            raise FileNotFoundError(f"Knowledge base directory not found: {knowledge_dir}")

        pdf_files = sorted(list(knowledge_dir.glob("*.pdf")))
        if not pdf_files:
            logger.warning(f"No PDF files found in {knowledge_dir}")
            return {
                "status": "warning",
                "message": "No PDF files found",
                "documents_processed": 0,
            }

        # Step 1: Manage Collection Setup
        if reset:
            logger.info(f"Resetting collection '{self.collection_name}'...")
            self.manager.delete_collection(self.collection_name)

        # Detect embedding vector dimension dynamically
        sample_vec = self.embeddings.embed_query("SupplySense test dimension vector")
        vector_dim = len(sample_vec)

        self.manager.create_collection(
            collection=self.collection_name,
            vector_size=vector_dim,
            distance="COSINE",
            if_not_exists=True,
        )

        # Step 2: Extract, Chunk, and Index Documents
        total_pages = 0
        total_chunks = 0
        total_vectors = 0
        processed_docs = 0
        failed_docs = 0
        doc_summaries: List[Dict[str, Any]] = []

        for idx, pdf_file in enumerate(pdf_files, start=1):
            doc_start = time.time()
            doc_name = pdf_file.name
            logger.info(f"[{idx}/{len(pdf_files)}] Processing document: {doc_name}...")

            try:
                # Extract text page-by-page
                meta, pages = parse_pdf_document(pdf_file)
                if not pages:
                    logger.warning(f"Skipping empty PDF: {doc_name}")
                    failed_docs += 1
                    doc_summaries.append({
                        "filename": doc_name,
                        "document_id": meta["document_id"],
                        "pages": 0,
                        "chunks": 0,
                        "status": "EMPTY_OR_UNREADABLE",
                    })
                    continue

                # Generate section-aware chunks
                chunks = chunk_document_pages(
                    pages=pages,
                    chunk_size=self.chunk_size,
                    chunk_overlap=self.chunk_overlap,
                )

                if not chunks:
                    logger.warning(f"No chunks generated for {doc_name}")
                    failed_docs += 1
                    continue

                # Prepare texts, payloads, and deterministic point IDs
                texts = [c["content"] for c in chunks]
                payloads = chunks
                point_ids = [
                    generate_deterministic_point_id(
                        document_id=c["document_id"],
                        page_number=c["page_number"],
                        chunk_index=c["chunk_index"],
                    )
                    for c in chunks
                ]

                # Generate embeddings via Embedding Factory
                logger.debug(f"Embedding {len(texts)} chunks for {doc_name}...")
                vectors = self.embeddings.embed_documents(texts)

                # Upsert into Qdrant via QdrantManager
                self.manager.upsert_vectors(
                    collection=self.collection_name,
                    vectors=vectors,
                    payloads=payloads,
                    ids=point_ids,
                )

                doc_duration = time.time() - doc_start
                pages_count = len(pages)
                chunks_count = len(chunks)

                total_pages += pages_count
                total_chunks += chunks_count
                total_vectors += len(vectors)
                processed_docs += 1

                logger.info(
                    "Document indexed | doc={doc}  id={id}  pages={p}  chunks={c}  latency={t:.2f}s",
                    doc=doc_name,
                    id=meta["document_id"],
                    p=pages_count,
                    c=chunks_count,
                    t=doc_duration,
                )

                doc_summaries.append({
                    "filename": doc_name,
                    "document_id": meta["document_id"],
                    "title": meta["title"],
                    "pages": pages_count,
                    "chunks": chunks_count,
                    "duration_s": round(doc_duration, 2),
                    "status": "SUCCESS",
                })

            except Exception as exc:
                failed_docs += 1
                logger.error(f"Failed to ingest document '{doc_name}': {exc}", exc_info=True)
                doc_summaries.append({
                    "filename": doc_name,
                    "document_id": "UNKNOWN",
                    "pages": 0,
                    "chunks": 0,
                    "status": f"FAILED ({exc})",
                })

        total_duration = time.time() - start_time

        # Retrieve final point count from Qdrant
        collection_info = self.manager.get_collection(self.collection_name)
        qdrant_point_count = collection_info.get("points_count", 0)

        summary = {
            "status": "success" if failed_docs == 0 else "partial_success",
            "collection": self.collection_name,
            "vector_dimension": vector_dim,
            "documents_discovered": len(pdf_files),
            "documents_processed": processed_docs,
            "documents_failed": failed_docs,
            "total_pages": total_pages,
            "total_chunks": total_chunks,
            "total_vectors_stored": total_vectors,
            "qdrant_points_count": qdrant_point_count,
            "duration_seconds": round(total_duration, 2),
            "doc_summaries": doc_summaries,
        }

        logger.info(
            "Ingestion completed | docs={d}/{t}  pages={p}  chunks={c}  qdrant_pts={pts}  time={sec:.2f}s",
            d=processed_docs,
            t=len(pdf_files),
            p=total_pages,
            c=total_chunks,
            pts=qdrant_point_count,
            sec=total_duration,
        )

        return summary


# =====================================================================
# CLI Entry Point & Validation Searches
# =====================================================================

def run_validation_queries(pipeline: DocumentIngestionPipeline) -> None:
    """Runs test similarity queries against indexed Qdrant collection."""
    print("\n" + "=" * 60)
    print("RUNNING VALIDATION SEARCH CHECKS")
    print("=" * 60)

    from backend.app.ai.agents.rag.retriever import get_vectorstore

    test_queries = [
        ("What is the emergency procurement process?", "emergency_procurement.pdf"),
        ("What is the definition of dead stock?", "inventory_policy.pdf"),
        ("How are suppliers evaluated?", "supplier_policy.pdf"),
    ]

    try:
        vectorstore = get_vectorstore()

        for q, expected_doc in test_queries:
            print(f"\nQuery: '{q}'")
            print(f"Expected Source: {expected_doc}")

            results = vectorstore.similarity_search_with_relevance_scores(query=q, k=2)

            if not results:
                print("❌ Result: No vectors retrieved!")
                continue

            top_doc = results[0][0] if isinstance(results[0], tuple) else results[0]
            metadata = getattr(top_doc, "metadata", {})
            source_doc = metadata.get("source_file", metadata.get("source", "Unknown"))
            doc_id = metadata.get("document_id", "Unknown")
            page_num = metadata.get("page_number", metadata.get("page", 1))
            content_snippet = getattr(top_doc, "page_content", "")[:120].replace("\n", " ").encode("ascii", "ignore").decode("ascii")


            status = "[MATCH]" if source_doc == expected_doc else "[DIFFERENT SOURCE]"
            print(f"Retrieved: {source_doc} (ID: {doc_id}, Page: {page_num}) [{status}]")
            print(f"Snippet: \"{content_snippet}...\"")
    except Exception as exc:
        print(f"Validation query search check failed: {exc}")



def main() -> None:
    """CLI script runner."""
    parser = argparse.ArgumentParser(
        description="SupplySense Knowledge Base Document Ingestion Pipeline"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset/recreate Qdrant collection before indexing",
    )
    parser.add_argument(
        "--knowledge-dir",
        type=str,
        default="knowledge_base",
        help="Path to directory containing PDF documents",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=800,
        help="Chunk size in characters (default: 800)",
    )
    parser.add_argument(
        "--chunk-overlap",
        type=int,
        default=150,
        help="Chunk overlap in characters (default: 150)",
    )

    args = parser.parse_args()

    knowledge_path = Path(args.knowledge_dir)
    if not knowledge_path.is_absolute():
        knowledge_path = Path(os.getcwd()) / knowledge_path

    print("=" * 60)
    print("SUPPLYSENSE KNOWLEDGE BASE INGESTION PIPELINE")
    print("=" * 60)
    print(f"Target Directory:  {knowledge_path}")
    print(f"Qdrant Collection: {settings.QDRANT_COLLECTION}")
    print(f"Reset Mode:        {args.reset}")
    print(f"Chunk Size:        {args.chunk_size} chars")
    print(f"Chunk Overlap:     {args.chunk_overlap} chars")
    print("=" * 60 + "\n")

    pipeline = DocumentIngestionPipeline(
        collection_name=settings.QDRANT_COLLECTION,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
    )

    summary = pipeline.run(knowledge_dir=knowledge_path, reset=args.reset)

    print("\n" + "=" * 60)
    print("DOCUMENT INGESTION PROGRESS REPORT")
    print("=" * 60)

    for item in summary.get("doc_summaries", []):
        status_symbol = "[OK]" if item["status"] == "SUCCESS" else "[FAIL]"
        print(
            f"{status_symbol} [{item['filename']}] "
            f"ID: {item.get('document_id', 'N/A')} | "
            f"Pages: {item.get('pages', 0)} | "
            f"Chunks: {item.get('chunks', 0)} | "
            f"Time: {item.get('duration_s', 0)}s"
        )


    print("\n" + "=" * 60)
    print("FINAL INGESTION SUMMARY")
    print("=" * 60)
    print(f"Status:               {summary['status'].upper()}")
    print(f"Collection Name:      {summary['collection']}")
    print(f"Vector Dimension:     {summary['vector_dimension']}")
    print(f"Documents Processed:  {summary['documents_processed']} / {summary['documents_discovered']}")
    print(f"Documents Failed:     {summary['documents_failed']}")
    print(f"Total Pages:          {summary['total_pages']}")
    print(f"Total Chunks:         {summary['total_chunks']}")
    print(f"Total Vectors Stored: {summary['total_vectors_stored']}")
    print(f"Qdrant Point Count:   {summary['qdrant_points_count']}")
    print(f"Total Duration:       {summary['duration_seconds']}s")
    print("=" * 60)

    # Run post-ingestion validation search checks
    run_validation_queries(pipeline)


if __name__ == "__main__":
    main()
