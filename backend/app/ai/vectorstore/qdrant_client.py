"""
SupplySense -- Production Qdrant Vector Store Client
=====================================================================

Centralised manager for all communication with the Qdrant vector
database across the SupplySense platform.

Guarantees
----------
* **Single entry-point** -- every component obtains the client via
  ``get_client()`` and the LangChain vector store via
  ``get_vectorstore()``.
* **Connection-mode agnostic** -- supports Qdrant Cloud (URL + key),
  Docker / local server (host + port), and file-based persistence
  (path) with zero code changes.
* **Singleton lifecycle** -- one ``QdrantManager`` and one underlying
  ``QdrantClient`` are reused across the application.
* **Collection management** -- validates, creates, and introspects
  collections automatically.
* **Observable** -- all connection, search, and error events are
  emitted through the project-wide Loguru logger.

Usage
-----
::

    from backend.app.ai.vectorstore import get_client, get_vectorstore

    client = get_client()           # raw qdrant_client.QdrantClient
    vs     = get_vectorstore()      # LangChain QdrantVectorStore
"""

from __future__ import annotations

import threading
import time
import uuid
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence, Union

from pydantic import BaseModel, Field, field_validator
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from backend.app.config.settings import settings
from backend.app.utils.logger import logger

# =====================================================================
# Lazy imports  (deferred so module loads even without qdrant-client)
# =====================================================================

from qdrant_client import QdrantClient
from qdrant_client import models as qmodels


# =====================================================================
# Connection Mode
# =====================================================================


class QdrantConnectionMode(str, Enum):
    """How the manager connects to Qdrant."""

    CLOUD = "cloud"      # QDRANT_URL + QDRANT_API_KEY
    SERVER = "server"    # host + port (Docker / local binary)
    LOCAL = "local"      # file-system path (embedded mode)


# =====================================================================
# Configuration Schema
# =====================================================================


class QdrantConfig(BaseModel):
    """Validated, immutable snapshot of all Qdrant-related settings."""

    mode: QdrantConnectionMode = Field(
        description="Resolved connection mode.",
    )
    url: Optional[str] = Field(default=None)
    api_key: Optional[str] = Field(default=None)
    host: str = Field(default="localhost")
    port: int = Field(default=6333, gt=0, le=65535)
    grpc_port: int = Field(default=6334, gt=0, le=65535)
    path: Optional[str] = Field(default=None)
    collection: str = Field(description="Default collection name.")
    timeout: int = Field(default=60, gt=0)
    prefer_grpc: bool = Field(default=False)

    model_config = {"frozen": True}

    @field_validator("mode", mode="before")
    @classmethod
    def _normalise_mode(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip().lower()
        return value


# =====================================================================
# Custom Exceptions
# =====================================================================


class QdrantManagerError(Exception):
    """Base exception for all Qdrant manager errors."""


class QdrantConnectionError(QdrantManagerError):
    """Raised when the Qdrant server is unreachable."""


class CollectionNotFoundError(QdrantManagerError):
    """Raised when a referenced collection does not exist."""


class CollectionAlreadyExistsError(QdrantManagerError):
    """Raised when trying to create a collection that already exists."""


class InvalidEmbeddingSizeError(QdrantManagerError):
    """Raised when vectors have the wrong dimensionality."""


class QdrantHealthCheckError(QdrantManagerError):
    """Raised when a runtime health-check fails."""


# =====================================================================
# Qdrant Manager  (Thread-safe Singleton)
# =====================================================================


class QdrantManager:
    """
    Production-grade, thread-safe Singleton manager for Qdrant.

    Responsibilities
    ----------------
    * Creates and holds a single ``QdrantClient`` instance.
    * Provides collection CRUD and vector CRUD operations.
    * Provides similarity search, MMR-ready search, and metadata
      filtering.
    * Exposes a ``get_vectorstore()`` helper that returns a LangChain
      ``QdrantVectorStore`` wired to the singleton client.
    """

    _instance: Optional["QdrantManager"] = None
    _lock: threading.Lock = threading.Lock()
    _initialised: bool = False

    # -- Singleton constructor ----------------------------------------

    def __new__(cls) -> "QdrantManager":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if self._initialised:
            return
        with self._lock:
            if self._initialised:
                return

            self._config: QdrantConfig = self._build_config()
            self._client: QdrantClient = self._create_client(self._config)

            logger.info(
                "QdrantManager initialised | mode={mode}  "
                "collection={col}  timeout={t}s",
                mode=self._config.mode.value,
                col=self._config.collection,
                t=self._config.timeout,
            )

            self._initialised = True

    # =================================================================
    # Public API -- Client & Vector Store
    # =================================================================

    def get_client(self) -> QdrantClient:
        """Return the raw ``QdrantClient`` instance."""
        return self._client

    def get_vectorstore(
        self,
        *,
        collection: Optional[str] = None,
    ):
        """
        Return a LangChain ``QdrantVectorStore`` backed by the
        singleton client and the centralised embedding factory.

        Parameters
        ----------
        collection
            Override the default collection name.
        """
        from langchain_qdrant import QdrantVectorStore
        from backend.app.ai.embeddings import get_embeddings

        effective_collection = collection or self._config.collection
        embeddings = get_embeddings()

        logger.debug(
            "Building QdrantVectorStore | collection={col}",
            col=effective_collection,
        )
        return QdrantVectorStore(
            client=self._client,
            collection_name=effective_collection,
            embedding=embeddings,
        )

    def get_config(self) -> QdrantConfig:
        """Return a frozen copy of the resolved configuration."""
        return self._config

    # =================================================================
    # Health & Diagnostics
    # =================================================================

    async def health_check(self) -> Dict[str, Any]:
        """
        Verify the Qdrant server is reachable and the default
        collection is accessible.

        Returns
        -------
        dict
            ``{"status": "healthy", "mode": ..., "collections": [...]}``

        Raises
        ------
        QdrantHealthCheckError
            If the server is unreachable.
        """
        try:
            start = time.perf_counter()
            collections_resp = self._client.get_collections()
            elapsed_ms = (time.perf_counter() - start) * 1000

            collection_names = [
                c.name for c in collections_resp.collections
            ]

            result: Dict[str, Any] = {
                "status": "healthy",
                "mode": self._config.mode.value,
                "default_collection": self._config.collection,
                "collection_exists": (
                    self._config.collection in collection_names
                ),
                "collections": collection_names,
                "latency_ms": round(elapsed_ms, 2),
            }
            logger.info(
                "Qdrant health-check passed | mode={mode}  "
                "latency={lat}ms  collections={n}",
                mode=self._config.mode.value,
                lat=round(elapsed_ms, 2),
                n=len(collection_names),
            )
            return result

        except Exception as exc:
            logger.error(
                "Qdrant health-check FAILED | error={err}",
                err=str(exc),
            )
            raise QdrantHealthCheckError(
                f"Qdrant health-check failed: {exc}"
            ) from exc

    # =================================================================
    # Collection Management
    # =================================================================

    def collection_exists(
        self,
        collection: Optional[str] = None,
    ) -> bool:
        """
        Check whether a collection exists in Qdrant.

        Parameters
        ----------
        collection
            Collection name.  Defaults to ``settings.QDRANT_COLLECTION``.
        """
        name = collection or self._config.collection
        try:
            exists = self._client.collection_exists(name)
            logger.debug(
                "Collection exists check | name={name}  exists={ex}",
                name=name,
                ex=exists,
            )
            return exists
        except Exception as exc:
            logger.error(
                "Collection exists check failed | name={name}  error={err}",
                name=name,
                err=str(exc),
            )
            raise QdrantConnectionError(
                f"Failed to check collection '{name}': {exc}"
            ) from exc

    def create_collection(
        self,
        collection: Optional[str] = None,
        *,
        vector_size: int = 384,
        distance: str = "COSINE",
        on_disk: bool = False,
        if_not_exists: bool = True,
    ) -> Dict[str, Any]:
        """
        Create a new Qdrant collection.

        Parameters
        ----------
        collection
            Collection name.  Defaults to ``settings.QDRANT_COLLECTION``.
        vector_size
            Dimensionality of the vectors.
        distance
            Distance metric: ``'COSINE'``, ``'EUCLID'``, ``'DOT'``.
        on_disk
            If True, stores vectors on disk (saves RAM for large sets).
        if_not_exists
            If True, skips creation when the collection already exists.

        Returns
        -------
        dict
            ``{"collection": ..., "created": True/False, ...}``
        """
        name = collection or self._config.collection

        if if_not_exists and self.collection_exists(name):
            logger.info(
                "Collection already exists, skipping creation | "
                "name={name}",
                name=name,
            )
            return {
                "collection": name,
                "created": False,
                "reason": "already_exists",
            }

        distance_map = {
            "COSINE": qmodels.Distance.COSINE,
            "EUCLID": qmodels.Distance.EUCLID,
            "DOT": qmodels.Distance.DOT,
            "MANHATTAN": qmodels.Distance.MANHATTAN,
        }
        dist = distance_map.get(distance.upper())
        if dist is None:
            raise ValueError(
                f"Unsupported distance metric '{distance}'. "
                f"Choose from: {list(distance_map.keys())}"
            )

        try:
            self._client.create_collection(
                collection_name=name,
                vectors_config=qmodels.VectorParams(
                    size=vector_size,
                    distance=dist,
                    on_disk=on_disk,
                ),
            )
            logger.info(
                "Collection created | name={name}  size={sz}  "
                "distance={dist}",
                name=name,
                sz=vector_size,
                dist=distance,
            )
            return {
                "collection": name,
                "created": True,
                "vector_size": vector_size,
                "distance": distance,
            }
        except Exception as exc:
            logger.error(
                "Collection creation failed | name={name}  error={err}",
                name=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Failed to create collection '{name}': {exc}"
            ) from exc

    def delete_collection(
        self,
        collection: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Delete a Qdrant collection.

        Parameters
        ----------
        collection
            Collection name.  Defaults to ``settings.QDRANT_COLLECTION``.

        Returns
        -------
        dict
            ``{"collection": ..., "deleted": True/False}``
        """
        name = collection or self._config.collection

        if not self.collection_exists(name):
            logger.warning(
                "Collection does not exist, nothing to delete | "
                "name={name}",
                name=name,
            )
            return {"collection": name, "deleted": False, "reason": "not_found"}

        try:
            self._client.delete_collection(name)
            logger.info("Collection deleted | name={name}", name=name)
            return {"collection": name, "deleted": True}
        except Exception as exc:
            logger.error(
                "Collection deletion failed | name={name}  error={err}",
                name=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Failed to delete collection '{name}': {exc}"
            ) from exc

    def get_collection(
        self,
        collection: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Retrieve metadata and statistics for a collection.

        Parameters
        ----------
        collection
            Collection name.  Defaults to ``settings.QDRANT_COLLECTION``.

        Returns
        -------
        dict
            Collection info including point count, vector params, etc.
        """
        name = collection or self._config.collection

        if not self.collection_exists(name):
            raise CollectionNotFoundError(
                f"Collection '{name}' does not exist."
            )

        try:
            info = self._client.get_collection(name)
            result: Dict[str, Any] = {
                "collection": name,
                "status": str(info.status),
                "points_count": info.points_count,
                "vectors_count": info.vectors_count,
                "segments_count": info.segments_count,
                "config": {
                    "params": str(info.config.params) if info.config else None,
                },
            }
            logger.info(
                "Collection info retrieved | name={name}  "
                "points={pts}",
                name=name,
                pts=info.points_count,
            )
            return result
        except CollectionNotFoundError:
            raise
        except Exception as exc:
            logger.error(
                "Get collection info failed | name={name}  error={err}",
                name=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Failed to get collection '{name}': {exc}"
            ) from exc

    # =================================================================
    # Vector Operations -- Insert / Upsert / Delete
    # =================================================================

    def upsert_vectors(
        self,
        *,
        vectors: List[List[float]],
        payloads: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None,
        collection: Optional[str] = None,
        batch_size: int = 100,
    ) -> Dict[str, Any]:
        """
        Upsert vectors with optional payloads (metadata) into a
        collection.

        Parameters
        ----------
        vectors
            List of embedding vectors.
        payloads
            Optional list of metadata dicts (one per vector).
        ids
            Optional list of point IDs.  Auto-generated UUIDs if None.
        collection
            Target collection name.
        batch_size
            Number of points per upsert batch.

        Returns
        -------
        dict
            ``{"upserted": <count>, "collection": ...}``
        """
        name = collection or self._config.collection
        total = len(vectors)

        if ids is None:
            ids = [str(uuid.uuid4()) for _ in range(total)]
        if payloads is None:
            payloads = [{} for _ in range(total)]

        if len(ids) != total or len(payloads) != total:
            raise ValueError(
                f"Length mismatch: vectors={total}, ids={len(ids)}, "
                f"payloads={len(payloads)}"
            )

        upserted = 0
        try:
            for i in range(0, total, batch_size):
                batch_ids = ids[i : i + batch_size]
                batch_vectors = vectors[i : i + batch_size]
                batch_payloads = payloads[i : i + batch_size]

                points = [
                    qmodels.PointStruct(
                        id=pid,
                        vector=vec,
                        payload=pay,
                    )
                    for pid, vec, pay in zip(
                        batch_ids, batch_vectors, batch_payloads
                    )
                ]

                self._client.upsert(
                    collection_name=name,
                    points=points,
                    wait=True,
                )
                upserted += len(points)

            logger.info(
                "Vectors upserted | collection={col}  count={n}",
                col=name,
                n=upserted,
            )
            return {"collection": name, "upserted": upserted}

        except Exception as exc:
            logger.error(
                "Upsert failed | collection={col}  upserted_so_far={n}  "
                "error={err}",
                col=name,
                n=upserted,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Upsert failed on collection '{name}': {exc}"
            ) from exc

    def insert_documents(
        self,
        *,
        texts: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        collection: Optional[str] = None,
        batch_size: int = 64,
    ) -> Dict[str, Any]:
        """
        Embed texts via the centralised Embedding Factory and insert
        them into Qdrant.

        This is the high-level convenience method for document
        ingestion pipelines.

        Parameters
        ----------
        texts
            List of text strings to embed and store.
        metadatas
            Optional per-document metadata dicts.
        collection
            Target collection name.
        batch_size
            Number of documents per embedding / upsert batch.

        Returns
        -------
        dict
            ``{"inserted": <count>, "collection": ...}``
        """
        from backend.app.ai.embeddings import get_embeddings

        name = collection or self._config.collection
        embeddings_model = get_embeddings()

        total = len(texts)
        if metadatas is None:
            metadatas = [{} for _ in range(total)]

        # Ensure each payload carries the original text content
        for i, meta in enumerate(metadatas):
            meta.setdefault("content", texts[i])

        inserted = 0
        try:
            for i in range(0, total, batch_size):
                batch_texts = texts[i : i + batch_size]
                batch_metas = metadatas[i : i + batch_size]

                start = time.perf_counter()
                batch_vectors = embeddings_model.embed_documents(batch_texts)
                embed_ms = (time.perf_counter() - start) * 1000

                logger.debug(
                    "Batch embedded | docs={n}  latency={lat}ms",
                    n=len(batch_texts),
                    lat=round(embed_ms, 1),
                )

                batch_ids = [str(uuid.uuid4()) for _ in batch_texts]

                points = [
                    qmodels.PointStruct(
                        id=pid,
                        vector=vec,
                        payload=pay,
                    )
                    for pid, vec, pay in zip(
                        batch_ids, batch_vectors, batch_metas
                    )
                ]

                self._client.upsert(
                    collection_name=name,
                    points=points,
                    wait=True,
                )
                inserted += len(points)

            logger.info(
                "Documents inserted | collection={col}  count={n}",
                col=name,
                n=inserted,
            )
            return {"collection": name, "inserted": inserted}

        except Exception as exc:
            logger.error(
                "Document insertion failed | collection={col}  "
                "inserted_so_far={n}  error={err}",
                col=name,
                n=inserted,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Document insertion failed on '{name}': {exc}"
            ) from exc

    def delete_vectors(
        self,
        *,
        ids: Optional[List[str]] = None,
        filter_conditions: Optional[Dict[str, Any]] = None,
        collection: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Delete points by IDs or by metadata filter.

        Parameters
        ----------
        ids
            List of point IDs to delete.
        filter_conditions
            Qdrant filter dict for metadata-based deletion.
        collection
            Target collection name.

        Returns
        -------
        dict
            ``{"collection": ..., "deleted_by": "ids" | "filter"}``
        """
        name = collection or self._config.collection

        if ids is None and filter_conditions is None:
            raise ValueError(
                "Provide either 'ids' or 'filter_conditions' for deletion."
            )

        try:
            if ids:
                self._client.delete(
                    collection_name=name,
                    points_selector=qmodels.PointIdsList(points=ids),
                    wait=True,
                )
                logger.info(
                    "Points deleted by IDs | collection={col}  count={n}",
                    col=name,
                    n=len(ids),
                )
                return {
                    "collection": name,
                    "deleted_by": "ids",
                    "count": len(ids),
                }
            else:
                qdrant_filter = self._build_filter(filter_conditions)  # type: ignore[arg-type]
                self._client.delete(
                    collection_name=name,
                    points_selector=qmodels.FilterSelector(
                        filter=qdrant_filter,
                    ),
                    wait=True,
                )
                logger.info(
                    "Points deleted by filter | collection={col}  "
                    "filter={f}",
                    col=name,
                    f=filter_conditions,
                )
                return {
                    "collection": name,
                    "deleted_by": "filter",
                    "filter": filter_conditions,
                }
        except Exception as exc:
            logger.error(
                "Delete failed | collection={col}  error={err}",
                col=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Delete failed on collection '{name}': {exc}"
            ) from exc

    # =================================================================
    # Search Operations
    # =================================================================

    def search(
        self,
        *,
        query_vector: List[float],
        collection: Optional[str] = None,
        top_k: int = 5,
        score_threshold: Optional[float] = None,
        filter_conditions: Optional[Dict[str, Any]] = None,
        with_payload: bool = True,
        with_vectors: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search using raw vectors.

        Parameters
        ----------
        query_vector
            The query embedding vector.
        collection
            Target collection name.
        top_k
            Number of results to return.
        score_threshold
            Minimum similarity score.  Results below are discarded.
        filter_conditions
            Metadata filter dict (key-value equality matching).
        with_payload
            Include metadata payloads in results.
        with_vectors
            Include the stored vectors in results.

        Returns
        -------
        list[dict]
            List of ``{"id", "score", "payload", "vector"}``.
        """
        name = collection or self._config.collection

        qdrant_filter = None
        if filter_conditions:
            qdrant_filter = self._build_filter(filter_conditions)

        try:
            start = time.perf_counter()
            results = self._client.query_points(
                collection_name=name,
                query=query_vector,
                limit=top_k,
                query_filter=qdrant_filter,
                score_threshold=score_threshold,
                with_payload=with_payload,
                with_vectors=with_vectors,
            )
            elapsed_ms = (time.perf_counter() - start) * 1000

            formatted = self._format_search_results(results.points)

            logger.debug(
                "Vector search completed | collection={col}  "
                "top_k={k}  results={n}  latency={lat}ms",
                col=name,
                k=top_k,
                n=len(formatted),
                lat=round(elapsed_ms, 2),
            )
            return formatted

        except Exception as exc:
            logger.error(
                "Vector search failed | collection={col}  error={err}",
                col=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Search failed on collection '{name}': {exc}"
            ) from exc

    def similarity_search(
        self,
        *,
        query: str,
        collection: Optional[str] = None,
        top_k: int = 5,
        score_threshold: Optional[float] = None,
        filter_conditions: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        High-level similarity search: embeds the query text, then
        searches Qdrant.

        Parameters
        ----------
        query
            Natural-language query string.
        collection
            Target collection name.
        top_k
            Number of results to return.
        score_threshold
            Minimum similarity score.
        filter_conditions
            Metadata filter dict.

        Returns
        -------
        list[dict]
            Formatted results with ``content``, ``source``, ``score``.
        """
        from backend.app.ai.embeddings import get_embeddings

        embeddings_model = get_embeddings()

        start = time.perf_counter()
        query_vector = embeddings_model.embed_query(query)
        embed_ms = (time.perf_counter() - start) * 1000

        logger.debug(
            "Query embedded | latency={lat}ms  dims={d}",
            lat=round(embed_ms, 1),
            d=len(query_vector),
        )

        return self.search(
            query_vector=query_vector,
            collection=collection,
            top_k=top_k,
            score_threshold=score_threshold,
            filter_conditions=filter_conditions,
        )

    def mmr_search(
        self,
        *,
        query: str,
        collection: Optional[str] = None,
        top_k: int = 5,
        fetch_k: int = 20,
        lambda_mult: float = 0.5,
        filter_conditions: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Maximum Marginal Relevance search via the LangChain vector
        store integration.

        Balances relevance and diversity to eliminate redundant
        document chunks.

        Parameters
        ----------
        query
            Natural-language query string.
        collection
            Target collection name.
        top_k
            Number of documents to return.
        fetch_k
            Number of candidates to evaluate during MMR re-ranking.
        lambda_mult
            Diversity factor (0 = max diversity, 1 = max relevance).
        filter_conditions
            Metadata filter dict.

        Returns
        -------
        list[dict]
            Formatted results with ``content``, ``source``, ``score``.
        """
        name = collection or self._config.collection

        try:
            vs = self.get_vectorstore(collection=name)

            kwargs: Dict[str, Any] = {
                "query": query,
                "k": top_k,
                "fetch_k": fetch_k,
                "lambda_mult": lambda_mult,
            }
            if filter_conditions:
                kwargs["filter"] = self._build_filter(filter_conditions)

            start = time.perf_counter()
            results = vs.max_marginal_relevance_search(**kwargs)
            elapsed_ms = (time.perf_counter() - start) * 1000

            formatted = [
                {
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "Unknown"),
                    "page": doc.metadata.get("page"),
                    "category": doc.metadata.get("category"),
                    "score": None,
                }
                for doc in results
            ]

            logger.debug(
                "MMR search completed | collection={col}  "
                "top_k={k}  results={n}  latency={lat}ms",
                col=name,
                k=top_k,
                n=len(formatted),
                lat=round(elapsed_ms, 2),
            )
            return formatted

        except Exception as exc:
            logger.error(
                "MMR search failed | collection={col}  error={err}",
                col=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"MMR search failed on collection '{name}': {exc}"
            ) from exc

    def scroll_points(
        self,
        *,
        collection: Optional[str] = None,
        limit: int = 100,
        offset: Optional[str] = None,
        filter_conditions: Optional[Dict[str, Any]] = None,
        with_payload: bool = True,
        with_vectors: bool = False,
    ) -> Dict[str, Any]:
        """
        Scroll through all points in a collection (paginated).

        Parameters
        ----------
        collection
            Target collection name.
        limit
            Page size.
        offset
            Pagination offset (point ID from previous page).
        filter_conditions
            Metadata filter dict.
        with_payload
            Include payloads.
        with_vectors
            Include vectors.

        Returns
        -------
        dict
            ``{"points": [...], "next_offset": ... | None}``
        """
        name = collection or self._config.collection

        qdrant_filter = None
        if filter_conditions:
            qdrant_filter = self._build_filter(filter_conditions)

        try:
            points, next_offset = self._client.scroll(
                collection_name=name,
                limit=limit,
                offset=offset,
                scroll_filter=qdrant_filter,
                with_payload=with_payload,
                with_vectors=with_vectors,
            )

            formatted = [
                {
                    "id": str(p.id),
                    "payload": dict(p.payload) if p.payload else {},
                    "vector": list(p.vector) if with_vectors and p.vector else None,
                }
                for p in points
            ]

            logger.debug(
                "Scroll completed | collection={col}  "
                "returned={n}  has_next={hn}",
                col=name,
                n=len(formatted),
                hn=next_offset is not None,
            )
            return {
                "points": formatted,
                "next_offset": str(next_offset) if next_offset else None,
            }

        except Exception as exc:
            logger.error(
                "Scroll failed | collection={col}  error={err}",
                col=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Scroll failed on collection '{name}': {exc}"
            ) from exc

    def count_points(
        self,
        *,
        collection: Optional[str] = None,
        filter_conditions: Optional[Dict[str, Any]] = None,
        exact: bool = True,
    ) -> int:
        """
        Count points in a collection, optionally filtered.

        Parameters
        ----------
        collection
            Target collection name.
        filter_conditions
            Metadata filter dict.
        exact
            If True, returns exact count (slower for very large
            collections).

        Returns
        -------
        int
            Number of points.
        """
        name = collection or self._config.collection

        qdrant_filter = None
        if filter_conditions:
            qdrant_filter = self._build_filter(filter_conditions)

        try:
            result = self._client.count(
                collection_name=name,
                count_filter=qdrant_filter,
                exact=exact,
            )
            logger.debug(
                "Point count | collection={col}  count={n}",
                col=name,
                n=result.count,
            )
            return result.count
        except Exception as exc:
            logger.error(
                "Count failed | collection={col}  error={err}",
                col=name,
                err=str(exc),
            )
            raise QdrantManagerError(
                f"Count failed on collection '{name}': {exc}"
            ) from exc

    # =================================================================
    # Singleton Reset (testing only)
    # =================================================================

    @classmethod
    def reset(cls) -> None:
        """Tear down the singleton.  **Only for testing / hot-reload.**"""
        with cls._lock:
            if cls._instance is not None:
                try:
                    cls._instance._client.close()
                except Exception:
                    pass
            cls._instance = None
            cls._initialised = False
            logger.info("QdrantManager singleton has been reset.")

    # =================================================================
    # Private Helpers
    # =================================================================

    @staticmethod
    def _build_config() -> QdrantConfig:
        """Read ``settings`` and produce a validated ``QdrantConfig``."""

        url = settings.QDRANT_URL
        path = settings.QDRANT_PATH

        # Determine connection mode
        if url and url.strip():
            mode = QdrantConnectionMode.CLOUD
        elif path and path.strip():
            mode = QdrantConnectionMode.LOCAL
        else:
            mode = QdrantConnectionMode.SERVER

        return QdrantConfig(
            mode=mode,
            url=url,
            api_key=settings.QDRANT_API_KEY,
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
            grpc_port=settings.QDRANT_GRPC_PORT,
            path=path,
            collection=settings.QDRANT_COLLECTION,
            timeout=settings.QDRANT_TIMEOUT,
            prefer_grpc=settings.QDRANT_PREFER_GRPC,
        )

    @classmethod
    def _create_client(cls, config: QdrantConfig) -> QdrantClient:
        """
        Create a ``QdrantClient`` with retry logic for transient
        connection failures.
        """

        @retry(
            reraise=True,
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=15),
            retry=retry_if_exception_type(
                (ConnectionError, TimeoutError, OSError)
            ),
            before_sleep=before_sleep_log(logger, "WARNING"),  # type: ignore[arg-type]
        )
        def _connect() -> QdrantClient:
            if config.mode == QdrantConnectionMode.CLOUD:
                logger.info(
                    "Connecting to Qdrant Cloud | url={url}",
                    url=config.url,
                )
                return QdrantClient(
                    url=config.url,
                    api_key=config.api_key,
                    timeout=config.timeout,
                    prefer_grpc=config.prefer_grpc,
                )
            elif config.mode == QdrantConnectionMode.LOCAL:
                logger.info(
                    "Connecting to Qdrant (local file) | path={path}",
                    path=config.path,
                )
                return QdrantClient(
                    path=config.path,
                    timeout=config.timeout,
                )
            else:
                logger.info(
                    "Connecting to Qdrant Server | "
                    "host={host}  port={port}",
                    host=config.host,
                    port=config.port,
                )
                return QdrantClient(
                    host=config.host,
                    port=config.port,
                    grpc_port=config.grpc_port,
                    timeout=config.timeout,
                    prefer_grpc=config.prefer_grpc,
                )

        try:
            return _connect()
        except Exception as exc:
            logger.critical(
                "Qdrant connection FAILED after retries | "
                "mode={mode}  error={err}",
                mode=config.mode.value,
                err=str(exc),
            )
            raise QdrantConnectionError(
                f"Failed to connect to Qdrant ({config.mode.value}): {exc}"
            ) from exc

    @staticmethod
    def _build_filter(
        conditions: Dict[str, Any],
    ) -> qmodels.Filter:
        """
        Build a ``qdrant_client.models.Filter`` from a simple
        key-value dict.

        Supports
        --------
        * Exact match: ``{"key": "value"}``
        * List match (any): ``{"key": ["val1", "val2"]}``

        For more complex filters, callers can construct
        ``qmodels.Filter`` directly.
        """
        must_conditions: list[qmodels.FieldCondition] = []

        for key, value in conditions.items():
            if isinstance(value, list):
                # Match any value in the list
                for v in value:
                    must_conditions.append(
                        qmodels.FieldCondition(
                            key=key,
                            match=qmodels.MatchValue(value=v),
                        )
                    )
            else:
                must_conditions.append(
                    qmodels.FieldCondition(
                        key=key,
                        match=qmodels.MatchValue(value=value),
                    )
                )

        return qmodels.Filter(must=must_conditions)

    @staticmethod
    def _format_search_results(
        points: Sequence[Any],
    ) -> List[Dict[str, Any]]:
        """
        Normalise raw Qdrant ``ScoredPoint`` objects into plain dicts.
        """
        results: List[Dict[str, Any]] = []
        for point in points:
            payload = dict(point.payload) if point.payload else {}
            results.append({
                "id": str(point.id),
                "score": float(point.score) if hasattr(point, "score") and point.score is not None else None,
                "content": payload.get("content", ""),
                "source": payload.get("source", "Unknown"),
                "page": payload.get("page"),
                "category": payload.get("category"),
                "payload": payload,
            })
        return results


# =====================================================================
# Module-level convenience functions  (the public API)
# =====================================================================

_manager: Optional[QdrantManager] = None
_module_lock = threading.Lock()


def _get_manager() -> QdrantManager:
    """Lazy-init the singleton manager."""
    global _manager
    if _manager is None:
        with _module_lock:
            if _manager is None:
                _manager = QdrantManager()
    return _manager


def get_client() -> QdrantClient:
    """
    Return the singleton ``QdrantClient``.

    Usage::

        from backend.app.ai.vectorstore import get_client
        client = get_client()
    """
    return _get_manager().get_client()


def get_vectorstore(
    *,
    collection: Optional[str] = None,
):
    """
    Return a LangChain ``QdrantVectorStore`` backed by the singleton
    client.

    Usage::

        from backend.app.ai.vectorstore import get_vectorstore
        vs = get_vectorstore()
    """
    return _get_manager().get_vectorstore(collection=collection)
