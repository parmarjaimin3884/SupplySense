"""
SupplySense -- Production Embedding Factory
=====================================================================

Centralised factory for creating and managing embedding model instances
across the entire SupplySense platform (RAG, vector search, document
ingestion).

Guarantees
----------
* **Single entry-point** -- every component obtains embeddings via
  ``get_embeddings()``.
* **Provider-agnostic** -- switching from HuggingFace -> OpenAI requires
  only an env-var change (``EMBEDDING_PROVIDER=openai``).
* **Singleton lifecycle** -- one ``EmbeddingFactory`` instance and one
  underlying model are reused across the application.
* **Hardware-aware** -- automatically detects CUDA / MPS GPUs for local
  models with a graceful CPU fallback.
* **Extensible** -- adding a new provider (Voyage AI, Cohere, etc.)
  requires only a new ``_create_<provider>`` method and a registry entry.
* **Observable** -- all initialisation, timing, and failure events are
  emitted through the project-wide Loguru logger.

Usage
-----
::

    from backend.app.ai.embeddings import get_embeddings

    embeddings = get_embeddings()                          # default
    embeddings = get_embeddings(model="all-MiniLM-L6-v2")  # override
"""

from __future__ import annotations

import threading
import time
from enum import Enum
from typing import Any, Dict, List, Optional

from langchain_core.embeddings import Embeddings
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
# Provider Registry
# =====================================================================


class EmbeddingProvider(str, Enum):
    """
    Supported embedding provider identifiers.

    Values are **lower-case slugs** that match the
    ``EMBEDDING_PROVIDER`` environment variable.
    """

    HUGGINGFACE = "huggingface"
    OPENAI = "openai"
    # -- Future providers (uncomment when ready) ----------------------
    # VOYAGE = "voyage"
    # COHERE = "cohere"
    # FASTEMBED = "fastembed"
    # OLLAMA = "ollama"


# =====================================================================
# Configuration Schema
# =====================================================================


class EmbeddingConfig(BaseModel):
    """
    Validated, immutable snapshot of all embedding-related settings.

    Sourced from ``settings.py`` at factory boot time.
    """

    provider: EmbeddingProvider = Field(
        description="Active embedding provider slug.",
    )
    model: str = Field(
        description="Model identifier for the active provider.",
    )
    batch_size: int = Field(
        default=64,
        gt=0,
        le=2048,
        description="Max texts per embedding batch call.",
    )
    device: Optional[str] = Field(
        default=None,
        description=(
            "Compute device for local models: 'cuda', 'mps', 'cpu', "
            "or None for auto-detect."
        ),
    )
    api_key: Optional[str] = Field(
        default=None,
        description="API key for cloud embedding providers.",
    )

    model_config = {"frozen": True}

    # -- Validators ---------------------------------------------------

    @field_validator("provider", mode="before")
    @classmethod
    def _normalise_provider(cls, value: str) -> str:
        """Accept any casing (e.g. ``HuggingFace``, ``OPENAI``)."""
        if isinstance(value, str):
            return value.strip().lower()
        return value


# =====================================================================
# Custom Exceptions
# =====================================================================


class EmbeddingFactoryError(Exception):
    """Base exception for all Embedding Factory errors."""


class UnsupportedEmbeddingProviderError(EmbeddingFactoryError):
    """Raised when the provider is not in the registry."""


class ModelDownloadError(EmbeddingFactoryError):
    """Raised when a local model fails to download."""


class DeviceError(EmbeddingFactoryError):
    """Raised when the requested compute device is unavailable."""


class EmbeddingInitialisationError(EmbeddingFactoryError):
    """Raised when the embedding model fails to initialise after retries."""


class EmbeddingHealthCheckError(EmbeddingFactoryError):
    """Raised when a runtime health-check fails."""


# =====================================================================
# Hardware Detection Helpers
# =====================================================================


def _detect_device(requested: Optional[str] = None) -> str:
    """
    Resolve the compute device for local embedding models.

    Priority
    --------
    1. Explicit ``requested`` value (``'cuda'``, ``'mps'``, ``'cpu'``).
    2. CUDA if ``torch.cuda.is_available()``.
    3. MPS  if ``torch.backends.mps.is_available()`` (Apple Silicon).
    4. CPU  fallback.
    """
    if requested and requested.lower() != "auto":
        logger.info("Embedding device explicitly set to '{device}'", device=requested)
        return requested.lower()

    try:
        import torch  # type: ignore[import-untyped]

        if torch.cuda.is_available():
            device_name = torch.cuda.get_device_name(0)
            logger.info(
                "CUDA GPU detected for embeddings | device={name}",
                name=device_name,
            )
            return "cuda"

        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            logger.info("Apple MPS detected for embeddings")
            return "mps"

    except ImportError:
        logger.debug("PyTorch not installed -- defaulting to CPU for embeddings")

    logger.info("Using CPU for embedding computation")
    return "cpu"


# =====================================================================
# Embedding Factory  (Thread-safe Singleton)
# =====================================================================


class EmbeddingFactory:
    """
    Production-grade, thread-safe Singleton factory for embedding models.

    Architecture
    ------------
    * **Provider map**: ``EmbeddingProvider`` -> ``_create_*`` class method.
    * **Singleton**: enforced via ``__new__`` + a threading lock.
    * **Retry-on-init**: transient failures during model download or API
      auth are retried with exponential back-off via ``tenacity``.
    * **Instance cache**: keyed by ``(provider, model, device)`` so that
      multiple callers sharing the same config receive the same object.
    """

    _instance: Optional["EmbeddingFactory"] = None
    _lock: threading.Lock = threading.Lock()
    _initialised: bool = False

    # -- Singleton constructor ----------------------------------------

    def __new__(cls) -> "EmbeddingFactory":
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

            self._config: EmbeddingConfig = self._build_config()
            self._cache: Dict[str, Embeddings] = {}
            self._device: str = _detect_device(self._config.device)

            logger.info(
                "EmbeddingFactory initialised | provider={provider}  "
                "model={model}  device={device}  batch_size={bs}",
                provider=self._config.provider.value,
                model=self._config.model,
                device=self._device,
                bs=self._config.batch_size,
            )

            self._initialised = True

    # -- Public API ---------------------------------------------------

    def get_embeddings(
        self,
        *,
        model: Optional[str] = None,
    ) -> Embeddings:
        """
        Return an ``Embeddings`` instance for the active provider.

        Parameters
        ----------
        model
            Override the default model for *this* call.

        Returns
        -------
        Embeddings
            A ready-to-use LangChain embeddings object.
        """
        effective_model = model or self._config.model

        cache_key = (
            f"{self._config.provider.value}::{effective_model}"
            f"::dev={self._device}"
        )

        if cache_key not in self._cache:
            emb = self._create_embeddings(
                provider=self._config.provider,
                model=effective_model,
                device=self._device,
                batch_size=self._config.batch_size,
                api_key=self._config.api_key,
            )
            self._cache[cache_key] = emb
            logger.debug(
                "Embedding instance created and cached | key={key}",
                key=cache_key,
            )

        return self._cache[cache_key]

    def get_model_name(self) -> str:
        """Return the active model identifier."""
        return self._config.model

    def get_provider(self) -> str:
        """Return the active provider slug."""
        return self._config.provider.value

    def get_device(self) -> str:
        """Return the resolved compute device."""
        return self._device

    def get_config(self) -> EmbeddingConfig:
        """Return a frozen copy of the resolved configuration."""
        return self._config

    async def health_check(self) -> Dict[str, Any]:
        """
        Embed a short test sentence and verify the model is operational.

        Returns
        -------
        dict
            ``{"status": "healthy", "provider": ..., "model": ...,
            "dimensions": ..., "latency_ms": ...}``

        Raises
        ------
        EmbeddingHealthCheckError
            If the model fails to produce an embedding.
        """
        test_text = "SupplySense embedding health check"
        try:
            emb = self.get_embeddings()
            start = time.perf_counter()
            vectors = emb.embed_documents([test_text])
            elapsed_ms = (time.perf_counter() - start) * 1000

            if not vectors or not vectors[0]:
                raise EmbeddingHealthCheckError("Model returned empty vectors.")

            dimensions = len(vectors[0])

            result: Dict[str, Any] = {
                "status": "healthy",
                "provider": self._config.provider.value,
                "model": self._config.model,
                "device": self._device,
                "dimensions": dimensions,
                "latency_ms": round(elapsed_ms, 2),
            }
            logger.info(
                "Embedding health-check passed | provider={provider}  "
                "model={model}  dims={dims}  latency={lat}ms",
                provider=self._config.provider.value,
                model=self._config.model,
                dims=dimensions,
                lat=round(elapsed_ms, 2),
            )
            return result

        except EmbeddingHealthCheckError:
            raise
        except Exception as exc:
            logger.error(
                "Embedding health-check FAILED | provider={provider}  "
                "error={err}",
                provider=self._config.provider.value,
                err=str(exc),
            )
            raise EmbeddingHealthCheckError(
                f"Health-check failed for provider "
                f"'{self._config.provider.value}': {exc}"
            ) from exc

    def validate_model(self) -> Dict[str, Any]:
        """
        Validate configuration without performing inference.

        Returns
        -------
        dict
            Validation report with ``"valid"`` boolean and diagnostics.
        """
        issues: list[str] = []

        # Provider check
        try:
            EmbeddingProvider(self._config.provider)
        except ValueError:
            issues.append(
                f"Unsupported EMBEDDING_PROVIDER: "
                f"'{self._config.provider}'"
            )

        # Model name check
        if not self._config.model or not self._config.model.strip():
            issues.append("Embedding model name is empty or blank.")

        # API key check for cloud providers
        _cloud_providers = {
            EmbeddingProvider.OPENAI.value,
            # EmbeddingProvider.VOYAGE.value,
            # EmbeddingProvider.COHERE.value,
        }
        if (
            self._config.provider.value in _cloud_providers
            and not self._config.api_key
        ):
            issues.append(
                f"Missing API key for cloud embedding provider "
                f"'{self._config.provider.value}'."
            )

        result: Dict[str, Any] = {
            "valid": len(issues) == 0,
            "provider": self._config.provider.value,
            "model": self._config.model,
            "device": self._device,
            "batch_size": self._config.batch_size,
            "issues": issues,
        }

        if issues:
            for issue in issues:
                logger.warning("Embedding config issue | {issue}", issue=issue)
        else:
            logger.info(
                "Embedding config validated | provider={provider}  "
                "model={model}",
                provider=self._config.provider.value,
                model=self._config.model,
            )

        return result

    @classmethod
    def reset(cls) -> None:
        """
        Tear down the singleton.  **Only for testing / hot-reload.**
        """
        with cls._lock:
            if cls._instance is not None:
                cls._instance._cache.clear()
            cls._instance = None
            cls._initialised = False
            logger.info("EmbeddingFactory singleton has been reset.")

    # -- Private helpers ----------------------------------------------

    @staticmethod
    def _build_config() -> EmbeddingConfig:
        """
        Read ``settings`` and produce a validated ``EmbeddingConfig``.
        """
        provider_raw = settings.EMBEDDING_PROVIDER.strip().lower()

        # Resolve model per provider
        _model_map: Dict[str, str] = {
            EmbeddingProvider.HUGGINGFACE.value: (
                settings.HUGGINGFACE_EMBEDDING_MODEL
                or settings.EMBEDDING_MODEL
            ),
            EmbeddingProvider.OPENAI.value: (
                settings.OPENAI_EMBEDDING_MODEL
                or settings.EMBEDDING_MODEL
            ),
            # -- Future providers -----------------------------------------
            # EmbeddingProvider.VOYAGE.value: settings.VOYAGE_EMBEDDING_MODEL,
            # EmbeddingProvider.COHERE.value: settings.COHERE_EMBEDDING_MODEL,
        }

        # Resolve API key per provider
        _key_map: Dict[str, Optional[str]] = {
            EmbeddingProvider.HUGGINGFACE.value: None,  # local -- no key
            EmbeddingProvider.OPENAI.value: settings.OPENAI_API_KEY,
            # -- Future providers -----------------------------------------
            # EmbeddingProvider.VOYAGE.value: settings.VOYAGE_API_KEY,
            # EmbeddingProvider.COHERE.value: settings.COHERE_API_KEY,
        }

        # Validate provider
        try:
            provider_enum = EmbeddingProvider(provider_raw)
        except ValueError:
            supported = ", ".join(p.value for p in EmbeddingProvider)
            raise UnsupportedEmbeddingProviderError(
                f"EMBEDDING_PROVIDER='{provider_raw}' is not supported. "
                f"Choose from: [{supported}]"
            )

        model = _model_map.get(provider_enum.value, settings.EMBEDDING_MODEL)
        api_key = _key_map.get(provider_enum.value)

        return EmbeddingConfig(
            provider=provider_enum,
            model=model,
            batch_size=settings.EMBEDDING_BATCH_SIZE,
            device=settings.EMBEDDING_DEVICE,
            api_key=api_key,
        )

    # -- Provider creation dispatch -----------------------------------

    @classmethod
    def _create_embeddings(
        cls,
        *,
        provider: EmbeddingProvider,
        model: str,
        device: str,
        batch_size: int,
        api_key: Optional[str],
    ) -> Embeddings:
        """
        Dispatch embedding creation to the correct provider-specific
        factory method with automatic retry logic.
        """
        _provider_factories = {
            EmbeddingProvider.HUGGINGFACE: cls._create_huggingface,
            EmbeddingProvider.OPENAI: cls._create_openai,
            # -- Future providers -----------------------------------------
            # EmbeddingProvider.VOYAGE: cls._create_voyage,
            # EmbeddingProvider.COHERE: cls._create_cohere,
            # EmbeddingProvider.FASTEMBED: cls._create_fastembed,
            # EmbeddingProvider.OLLAMA: cls._create_ollama,
        }

        factory_fn = _provider_factories.get(provider)
        if factory_fn is None:
            raise UnsupportedEmbeddingProviderError(
                f"No factory registered for embedding provider "
                f"'{provider.value}'."
            )

        @retry(
            reraise=True,
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=30),
            retry=retry_if_exception_type(
                (ConnectionError, TimeoutError, OSError)
            ),
            before_sleep=before_sleep_log(logger, "WARNING"),  # type: ignore[arg-type]
        )
        def _create_with_retry() -> Embeddings:
            logger.debug(
                "Creating embedding model | provider={provider}  "
                "model={model}  device={device}",
                provider=provider.value,
                model=model,
                device=device,
            )
            return factory_fn(
                model=model,
                device=device,
                batch_size=batch_size,
                api_key=api_key,
            )

        try:
            start = time.perf_counter()
            result = _create_with_retry()
            elapsed = (time.perf_counter() - start) * 1000
            logger.info(
                "Embedding model loaded in {elapsed}ms | "
                "provider={provider}  model={model}",
                elapsed=round(elapsed, 1),
                provider=provider.value,
                model=model,
            )
            return result

        except Exception as exc:
            logger.critical(
                "Embedding creation FAILED | provider={provider}  "
                "model={model}  error={err}",
                provider=provider.value,
                model=model,
                err=str(exc),
            )
            raise EmbeddingInitialisationError(
                f"Failed to create embeddings (provider='{provider.value}', "
                f"model='{model}'): {exc}"
            ) from exc

    # -- Individual provider factories --------------------------------

    @staticmethod
    def _create_huggingface(
        *,
        model: str,
        device: str,
        batch_size: int,
        api_key: Optional[str],
    ) -> Embeddings:
        """
        Create a HuggingFace sentence-transformers embedding instance.

        Tries ``langchain_huggingface`` first, then falls back to
        ``langchain_community``.  Handles GPU memory errors gracefully
        by retrying on CPU.
        """
        model_kwargs: Dict[str, Any] = {"device": device}
        encode_kwargs: Dict[str, Any] = {
            "batch_size": batch_size,
            "normalize_embeddings": True,
        }

        # -- Attempt 1: langchain_huggingface (preferred) -------------
        try:
            from langchain_huggingface import HuggingFaceEmbeddings

            logger.info(
                "Loading HuggingFace embeddings (langchain_huggingface) | "
                "model={model}  device={device}  batch={bs}",
                model=model,
                device=device,
                bs=batch_size,
            )
            return HuggingFaceEmbeddings(
                model_name=model,
                model_kwargs=model_kwargs,
                encode_kwargs=encode_kwargs,
            )
        except ImportError:
            logger.debug(
                "langchain_huggingface not installed, trying "
                "langchain_community"
            )
        except (RuntimeError, MemoryError) as exc:
            # GPU OOM -- retry on CPU
            if device != "cpu":
                logger.warning(
                    "GPU embedding load failed ({err}), retrying on CPU",
                    err=str(exc),
                )
                model_kwargs["device"] = "cpu"
                from langchain_huggingface import HuggingFaceEmbeddings

                return HuggingFaceEmbeddings(
                    model_name=model,
                    model_kwargs=model_kwargs,
                    encode_kwargs=encode_kwargs,
                )
            raise

        # -- Attempt 2: langchain_community ---------------------------
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings

            logger.info(
                "Loading HuggingFace embeddings (langchain_community) | "
                "model={model}  device={device}",
                model=model,
                device=device,
            )
            return HuggingFaceEmbeddings(
                model_name=model,
                model_kwargs=model_kwargs,
                encode_kwargs=encode_kwargs,
            )
        except ImportError:
            logger.debug("langchain_community HuggingFaceEmbeddings unavailable")
        except (RuntimeError, MemoryError) as exc:
            if device != "cpu":
                logger.warning(
                    "GPU embedding load failed ({err}), retrying on CPU",
                    err=str(exc),
                )
                model_kwargs["device"] = "cpu"
                from langchain_community.embeddings import HuggingFaceEmbeddings

                return HuggingFaceEmbeddings(
                    model_name=model,
                    model_kwargs=model_kwargs,
                    encode_kwargs=encode_kwargs,
                )
            raise

        # -- Attempt 3: FastEmbed fallback ----------------------------
        try:
            from langchain_community.embeddings import FastEmbedEmbeddings

            logger.warning(
                "Falling back to FastEmbed embeddings (model selection "
                "may differ)"
            )
            return FastEmbedEmbeddings()
        except ImportError:
            pass

        # -- Attempt 4: FakeEmbeddings for dev environments -----------
        from langchain_community.embeddings import FakeEmbeddings

        logger.warning(
            "No local embedding packages installed.  Using "
            "FakeEmbeddings (size=384) for development only."
        )
        return FakeEmbeddings(size=384)

    @staticmethod
    def _create_openai(
        *,
        model: str,
        device: str,
        batch_size: int,
        api_key: Optional[str],
    ) -> Embeddings:
        """Create an OpenAI embedding instance."""
        from langchain_openai import OpenAIEmbeddings

        kwargs: Dict[str, Any] = {
            "model": model,
            "chunk_size": batch_size,
        }
        if api_key:
            kwargs["openai_api_key"] = api_key

        logger.info(
            "OpenAI embeddings ready | model={model}  batch={bs}",
            model=model,
            bs=batch_size,
        )
        return OpenAIEmbeddings(**kwargs)

    # -- Template: Voyage AI ------------------------------------------
    #
    # @staticmethod
    # def _create_voyage(
    #     *,
    #     model: str,
    #     device: str,
    #     batch_size: int,
    #     api_key: Optional[str],
    # ) -> Embeddings:
    #     from langchain_voyageai import VoyageAIEmbeddings
    #
    #     kwargs: Dict[str, Any] = {"model": model, "batch_size": batch_size}
    #     if api_key:
    #         kwargs["voyage_api_key"] = api_key
    #     return VoyageAIEmbeddings(**kwargs)

    # -- Template: Cohere ---------------------------------------------
    #
    # @staticmethod
    # def _create_cohere(
    #     *,
    #     model: str,
    #     device: str,
    #     batch_size: int,
    #     api_key: Optional[str],
    # ) -> Embeddings:
    #     from langchain_cohere import CohereEmbeddings
    #
    #     kwargs: Dict[str, Any] = {"model": model}
    #     if api_key:
    #         kwargs["cohere_api_key"] = api_key
    #     return CohereEmbeddings(**kwargs)

    # -- Template: Ollama (local) -------------------------------------
    #
    # @staticmethod
    # def _create_ollama(
    #     *,
    #     model: str,
    #     device: str,
    #     batch_size: int,
    #     api_key: Optional[str],
    # ) -> Embeddings:
    #     from langchain_ollama import OllamaEmbeddings
    #
    #     return OllamaEmbeddings(model=model)


# =====================================================================
# Module-level convenience function  (the public API)
# =====================================================================

_factory: Optional[EmbeddingFactory] = None
_module_lock = threading.Lock()


def get_embeddings(
    *,
    model: Optional[str] = None,
) -> Embeddings:
    """
    Module-level convenience function.

    All components call this instead of touching ``EmbeddingFactory``
    directly::

        from backend.app.ai.embeddings import get_embeddings
        embeddings = get_embeddings()
        embeddings = get_embeddings(model="all-MiniLM-L6-v2")

    Thread-safe.  First call boots the singleton factory.
    """
    global _factory

    if _factory is None:
        with _module_lock:
            if _factory is None:
                _factory = EmbeddingFactory()

    return _factory.get_embeddings(model=model)
