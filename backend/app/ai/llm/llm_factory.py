"""
SupplySense — Production LLM Factory
=====================================================================

Centralised factory for creating and managing Large Language Model
instances across the entire SupplySense multi-agent platform.

Guarantees
----------
* **Single entry-point** — every agent obtains its LLM via ``get_llm()``.
* **Provider-agnostic** — switching from Groq → OpenAI requires only an
  env-var change (``LLM_PROVIDER=openai``).  Zero agent code changes.
* **Singleton lifecycle** — one ``LLMFactory`` instance is reused across
  the application, avoiding redundant connections.
* **Extensible** — adding a new provider (Anthropic, Gemini, Ollama,
  Azure OpenAI) requires only a new ``_create_<provider>`` classmethod
  and a mapping entry.
* **Observable** — all initialisation, retry, and failure events are
  emitted through the project-wide Loguru logger.

Usage
-----
::

    from backend.app.ai.llm import get_llm

    llm = get_llm()                      # use default settings
    llm = get_llm(temperature=0.7)       # per-call override
    llm = get_llm(model="gpt-4.1")       # per-call model override
"""

from __future__ import annotations

import threading
from enum import Enum
from typing import Any, Dict, Optional

from langchain_core.language_models.chat_models import BaseChatModel
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


class LLMProvider(str, Enum):
    """
    Supported LLM provider identifiers.

    Values are **lower-case slugs** that match the ``LLM_PROVIDER``
    environment variable.
    """

    GROQ = "groq"
    OPENAI = "openai"
    # ── Future providers (uncomment when ready) ──────────────────────
    # ANTHROPIC = "anthropic"
    # GEMINI = "gemini"
    # OLLAMA = "ollama"
    # AZURE_OPENAI = "azure_openai"


# =====================================================================
# Configuration Schema
# =====================================================================


class LLMConfig(BaseModel):
    """
    Validated, immutable snapshot of all LLM-related settings.

    Sourced from ``settings.py`` at factory boot time and used
    throughout the singleton's lifetime.
    """

    provider: LLMProvider = Field(
        description="Active LLM provider slug (e.g. 'groq', 'openai').",
    )
    model: str = Field(
        description="Model identifier for the active provider.",
    )
    temperature: float = Field(
        default=0.0,
        ge=0.0,
        le=2.0,
        description="Sampling temperature for generation.",
    )
    max_tokens: Optional[int] = Field(
        default=None,
        description="Maximum number of tokens to generate.  None = provider default.",
    )
    timeout: int = Field(
        default=120,
        gt=0,
        description="HTTP request timeout in seconds.",
    )
    retry_count: int = Field(
        default=3,
        ge=0,
        le=10,
        description="Number of automatic retries on transient failures.",
    )
    api_key: Optional[str] = Field(
        default=None,
        description="Provider API key (resolved per-provider).",
    )

    model_config = {"frozen": True}

    # ── Validators ──────────────────────────────────────────────────

    @field_validator("provider", mode="before")
    @classmethod
    def _normalise_provider(cls, value: str) -> str:
        """Accept any casing (e.g. ``Groq``, ``OPENAI``)."""
        if isinstance(value, str):
            return value.strip().lower()
        return value


# =====================================================================
# Custom Exceptions
# =====================================================================


class LLMFactoryError(Exception):
    """Base exception for all LLM Factory errors."""


class UnsupportedProviderError(LLMFactoryError):
    """Raised when ``LLM_PROVIDER`` does not match a registered provider."""


class MissingAPIKeyError(LLMFactoryError):
    """Raised when the required API key for the active provider is absent."""


class LLMInitialisationError(LLMFactoryError):
    """Raised when the LLM instance fails to initialise after all retries."""


class LLMHealthCheckError(LLMFactoryError):
    """Raised when a runtime health-check call fails."""


# =====================================================================
# LLM Factory  (Thread-safe Singleton)
# =====================================================================


class LLMFactory:
    """
    Production-grade, thread-safe Singleton factory for LLM instances.

    Architecture
    ------------
    * **Provider map**: a dict mapping ``LLMProvider`` → ``_create_*``
      class method.  Adding a provider = adding one method + one entry.
    * **Singleton**: enforced via ``__new__`` + a threading lock so that
      even concurrent ``import`` chains share one factory instance.
    * **Retry-on-init**: transient network / auth errors during first
      creation are retried with exponential back-off via ``tenacity``.
    """

    _instance: Optional["LLMFactory"] = None
    _lock: threading.Lock = threading.Lock()
    _initialised: bool = False

    # ── Singleton constructor ───────────────────────────────────────

    def __new__(cls) -> "LLMFactory":
        if cls._instance is None:
            with cls._lock:
                # Double-checked locking
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if self._initialised:
            return
        with self._lock:
            if self._initialised:
                return

            self._config: LLMConfig = self._build_config()
            self._llm_cache: Dict[str, BaseChatModel] = {}

            logger.info(
                "LLMFactory initialised  | provider={provider}  model={model}  "
                "temperature={temp}  timeout={timeout}s  retries={retries}",
                provider=self._config.provider.value,
                model=self._config.model,
                temp=self._config.temperature,
                timeout=self._config.timeout,
                retries=self._config.retry_count,
            )

            self._initialised = True

    # ── Public API ──────────────────────────────────────────────────

    def get_llm(
        self,
        *,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
    ) -> BaseChatModel:
        """
        Return a ``BaseChatModel`` instance for the active provider.

        Parameters
        ----------
        temperature
            Override the default sampling temperature for *this* call.
        model
            Override the default model for *this* call.
        max_tokens
            Override the default max-token cap for *this* call.

        Returns
        -------
        BaseChatModel
            A ready-to-use LangChain chat model.

        Raises
        ------
        LLMInitialisationError
            If the model cannot be created after exhausting retries.
        """
        effective_temp = temperature if temperature is not None else self._config.temperature
        effective_model = model or self._config.model
        effective_max_tokens = max_tokens if max_tokens is not None else self._config.max_tokens

        # Cache key: unique per (provider, model, temperature, max_tokens)
        cache_key = (
            f"{self._config.provider.value}::{effective_model}"
            f"::t{effective_temp}::mt{effective_max_tokens}"
        )

        if cache_key not in self._llm_cache:
            llm = self._create_llm(
                provider=self._config.provider,
                model=effective_model,
                temperature=effective_temp,
                max_tokens=effective_max_tokens,
                api_key=self._config.api_key,
                timeout=self._config.timeout,
                retry_count=self._config.retry_count,
            )
            self._llm_cache[cache_key] = llm
            logger.debug(
                "LLM instance created and cached  | key={key}",
                key=cache_key,
            )

        return self._llm_cache[cache_key]

    def get_provider(self) -> str:
        """Return the active provider slug (e.g. ``'groq'``)."""
        return self._config.provider.value

    def get_model(self) -> str:
        """Return the active model identifier."""
        return self._config.model

    def get_config(self) -> LLMConfig:
        """Return a frozen copy of the resolved configuration."""
        return self._config

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a lightweight inference call to verify the LLM is
        reachable and the API key is valid.

        Returns
        -------
        dict
            ``{"status": "healthy", "provider": ..., "model": ..., "response": ...}``

        Raises
        ------
        LLMHealthCheckError
            If the provider fails to respond.
        """
        try:
            llm = self.get_llm()
            response = await llm.ainvoke("Respond with exactly: OK")
            content = (
                response.content
                if hasattr(response, "content")
                else str(response)
            )

            result: Dict[str, Any] = {
                "status": "healthy",
                "provider": self._config.provider.value,
                "model": self._config.model,
                "response": content[:100],
            }
            logger.info(
                "LLM health-check passed  | provider={provider}  model={model}",
                provider=self._config.provider.value,
                model=self._config.model,
            )
            return result

        except Exception as exc:
            logger.error(
                "LLM health-check FAILED  | provider={provider}  error={err}",
                provider=self._config.provider.value,
                err=str(exc),
            )
            raise LLMHealthCheckError(
                f"Health-check failed for provider "
                f"'{self._config.provider.value}': {exc}"
            ) from exc

    def validate_configuration(self) -> Dict[str, Any]:
        """
        Validate the current configuration without making a network
        call.  Useful for fail-fast checks at application startup.

        Returns
        -------
        dict
            Validation report with ``"valid"`` boolean and diagnostics.

        Raises
        ------
        MissingAPIKeyError
            If the required API key is not set.
        UnsupportedProviderError
            If the provider is not in the registry.
        """
        issues: list[str] = []

        # Provider check
        try:
            LLMProvider(self._config.provider)
        except ValueError:
            issues.append(
                f"Unsupported LLM_PROVIDER: '{self._config.provider}'"
            )

        # API-key check
        if not self._config.api_key:
            issues.append(
                f"Missing API key for provider '{self._config.provider.value}'. "
                f"Set the corresponding environment variable."
            )

        # Model name sanity
        if not self._config.model or not self._config.model.strip():
            issues.append("Model name is empty or blank.")

        result: Dict[str, Any] = {
            "valid": len(issues) == 0,
            "provider": self._config.provider.value,
            "model": self._config.model,
            "temperature": self._config.temperature,
            "max_tokens": self._config.max_tokens,
            "timeout": self._config.timeout,
            "retry_count": self._config.retry_count,
            "issues": issues,
        }

        if issues:
            for issue in issues:
                logger.warning("Configuration issue  | {issue}", issue=issue)
        else:
            logger.info(
                "Configuration validated  | provider={provider}  model={model}",
                provider=self._config.provider.value,
                model=self._config.model,
            )

        return result

    @classmethod
    def reset(cls) -> None:
        """
        Tear down the singleton.  **Only for testing / hot-reload.**

        After calling ``reset()`` the next ``LLMFactory()`` will re-read
        ``settings`` and construct a fresh instance.
        """
        with cls._lock:
            if cls._instance is not None:
                cls._instance._llm_cache.clear()
            cls._instance = None
            cls._initialised = False
            logger.info("LLMFactory singleton has been reset.")

    # ── Private helpers ─────────────────────────────────────────────

    @staticmethod
    def _build_config() -> LLMConfig:
        """
        Read ``settings`` once and produce a validated ``LLMConfig``.
        """
        provider_raw = settings.LLM_PROVIDER.strip().lower()

        # Resolve the correct API key and model per provider
        _key_map: Dict[str, Optional[str]] = {
            LLMProvider.GROQ.value: settings.GROQ_API_KEY,
            LLMProvider.OPENAI.value: settings.OPENAI_API_KEY,
            # ── Future providers ─────────────────────────────────
            # LLMProvider.ANTHROPIC.value: settings.ANTHROPIC_API_KEY,
            # LLMProvider.GEMINI.value: settings.GEMINI_API_KEY,
            # LLMProvider.OLLAMA.value: None,  # local — no key needed
            # LLMProvider.AZURE_OPENAI.value: settings.AZURE_OPENAI_API_KEY,
        }

        _model_map: Dict[str, str] = {
            LLMProvider.GROQ.value: settings.GROQ_MODEL,
            LLMProvider.OPENAI.value: settings.OPENAI_MODEL,
            # ── Future providers ─────────────────────────────────
            # LLMProvider.ANTHROPIC.value: settings.ANTHROPIC_MODEL,
            # LLMProvider.GEMINI.value: settings.GEMINI_MODEL,
            # LLMProvider.OLLAMA.value: settings.OLLAMA_MODEL,
            # LLMProvider.AZURE_OPENAI.value: settings.AZURE_OPENAI_MODEL,
        }

        # Validate provider is supported
        try:
            provider_enum = LLMProvider(provider_raw)
        except ValueError:
            supported = ", ".join(p.value for p in LLMProvider)
            raise UnsupportedProviderError(
                f"LLM_PROVIDER='{provider_raw}' is not supported.  "
                f"Choose from: [{supported}]"
            )

        api_key = _key_map.get(provider_enum.value)
        model = _model_map.get(provider_enum.value, "")

        # Validate API key presence (skip for local providers like Ollama)
        if provider_enum.value not in ("ollama",) and not api_key:
            logger.warning(
                "No API key detected for provider '{provider}'.  "
                "Set the appropriate env var (e.g. GROQ_API_KEY, OPENAI_API_KEY).",
                provider=provider_enum.value,
            )

        return LLMConfig(
            provider=provider_enum,
            model=model,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            timeout=settings.LLM_TIMEOUT,
            retry_count=settings.LLM_RETRY_COUNT,
            api_key=api_key,
        )

    # ── Provider creation dispatch ──────────────────────────────────

    @classmethod
    def _create_llm(
        cls,
        *,
        provider: LLMProvider,
        model: str,
        temperature: float,
        max_tokens: Optional[int],
        api_key: Optional[str],
        timeout: int,
        retry_count: int,
    ) -> BaseChatModel:
        """
        Dispatch LLM creation to the correct provider-specific factory
        method with automatic retry logic.
        """

        _provider_factories = {
            LLMProvider.GROQ: cls._create_groq,
            LLMProvider.OPENAI: cls._create_openai,
            # ── Future providers ─────────────────────────────────
            # LLMProvider.ANTHROPIC: cls._create_anthropic,
            # LLMProvider.GEMINI: cls._create_gemini,
            # LLMProvider.OLLAMA: cls._create_ollama,
            # LLMProvider.AZURE_OPENAI: cls._create_azure_openai,
        }

        factory_fn = _provider_factories.get(provider)
        if factory_fn is None:
            raise UnsupportedProviderError(
                f"No factory registered for provider '{provider.value}'."
            )

        # Build a retrying wrapper dynamically based on retry_count
        @retry(
            reraise=True,
            stop=stop_after_attempt(max(retry_count, 1)),
            wait=wait_exponential(multiplier=1, min=1, max=30),
            retry=retry_if_exception_type((ConnectionError, TimeoutError, OSError)),
            before_sleep=before_sleep_log(logger, "WARNING"),  # type: ignore[arg-type]
        )
        def _create_with_retry() -> BaseChatModel:
            logger.debug(
                "Creating LLM  | provider={provider}  model={model}  "
                "temperature={temp}",
                provider=provider.value,
                model=model,
                temp=temperature,
            )
            return factory_fn(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                api_key=api_key,
                timeout=timeout,
            )

        try:
            return _create_with_retry()
        except Exception as exc:
            logger.critical(
                "LLM creation FAILED after {retries} attempt(s)  | "
                "provider={provider}  model={model}  error={err}",
                retries=retry_count,
                provider=provider.value,
                model=model,
                err=str(exc),
            )
            raise LLMInitialisationError(
                f"Failed to create LLM (provider='{provider.value}', "
                f"model='{model}'): {exc}"
            ) from exc

    # ── Individual provider factories ───────────────────────────────

    @staticmethod
    def _create_groq(
        *,
        model: str,
        temperature: float,
        max_tokens: Optional[int],
        api_key: Optional[str],
        timeout: int,
    ) -> BaseChatModel:
        """Create a Groq-backed ``ChatGroq`` instance."""
        from langchain_groq import ChatGroq

        kwargs: Dict[str, Any] = {
            "model": model,
            "temperature": temperature,
            "request_timeout": timeout,
        }
        if api_key:
            kwargs["groq_api_key"] = api_key
        if max_tokens is not None:
            kwargs["max_tokens"] = max_tokens

        logger.info(
            "Groq LLM ready  | model={model}  temperature={temp}",
            model=model,
            temp=temperature,
        )
        return ChatGroq(**kwargs)

    @staticmethod
    def _create_openai(
        *,
        model: str,
        temperature: float,
        max_tokens: Optional[int],
        api_key: Optional[str],
        timeout: int,
    ) -> BaseChatModel:
        """Create an OpenAI-backed ``ChatOpenAI`` instance."""
        from langchain_openai import ChatOpenAI

        kwargs: Dict[str, Any] = {
            "model": model,
            "temperature": temperature,
            "request_timeout": timeout,
        }
        if api_key:
            kwargs["openai_api_key"] = api_key
        if max_tokens is not None:
            kwargs["max_tokens"] = max_tokens

        logger.info(
            "OpenAI LLM ready  | model={model}  temperature={temp}",
            model=model,
            temp=temperature,
        )
        return ChatOpenAI(**kwargs)

    # ── Template: Anthropic ─────────────────────────────────────────
    #
    # @staticmethod
    # def _create_anthropic(
    #     *,
    #     model: str,
    #     temperature: float,
    #     max_tokens: Optional[int],
    #     api_key: Optional[str],
    #     timeout: int,
    # ) -> BaseChatModel:
    #     from langchain_anthropic import ChatAnthropic
    #
    #     kwargs: Dict[str, Any] = {
    #         "model": model,
    #         "temperature": temperature,
    #         "timeout": timeout,
    #     }
    #     if api_key:
    #         kwargs["anthropic_api_key"] = api_key
    #     if max_tokens is not None:
    #         kwargs["max_tokens"] = max_tokens
    #     return ChatAnthropic(**kwargs)

    # ── Template: Gemini ────────────────────────────────────────────
    #
    # @staticmethod
    # def _create_gemini(
    #     *,
    #     model: str,
    #     temperature: float,
    #     max_tokens: Optional[int],
    #     api_key: Optional[str],
    #     timeout: int,
    # ) -> BaseChatModel:
    #     from langchain_google_genai import ChatGoogleGenerativeAI
    #
    #     kwargs: Dict[str, Any] = {
    #         "model": model,
    #         "temperature": temperature,
    #         "timeout": timeout,
    #     }
    #     if api_key:
    #         kwargs["google_api_key"] = api_key
    #     if max_tokens is not None:
    #         kwargs["max_output_tokens"] = max_tokens
    #     return ChatGoogleGenerativeAI(**kwargs)

    # ── Template: Ollama (local) ────────────────────────────────────
    #
    # @staticmethod
    # def _create_ollama(
    #     *,
    #     model: str,
    #     temperature: float,
    #     max_tokens: Optional[int],
    #     api_key: Optional[str],
    #     timeout: int,
    # ) -> BaseChatModel:
    #     from langchain_ollama import ChatOllama
    #
    #     kwargs: Dict[str, Any] = {
    #         "model": model,
    #         "temperature": temperature,
    #         "timeout": timeout,
    #     }
    #     if max_tokens is not None:
    #         kwargs["num_predict"] = max_tokens
    #     return ChatOllama(**kwargs)

    # ── Template: Azure OpenAI ──────────────────────────────────────
    #
    # @staticmethod
    # def _create_azure_openai(
    #     *,
    #     model: str,
    #     temperature: float,
    #     max_tokens: Optional[int],
    #     api_key: Optional[str],
    #     timeout: int,
    # ) -> BaseChatModel:
    #     from langchain_openai import AzureChatOpenAI
    #
    #     kwargs: Dict[str, Any] = {
    #         "azure_deployment": model,
    #         "temperature": temperature,
    #         "request_timeout": timeout,
    #         "openai_api_version": settings.AZURE_OPENAI_API_VERSION,
    #         "azure_endpoint": settings.AZURE_OPENAI_ENDPOINT,
    #     }
    #     if api_key:
    #         kwargs["openai_api_key"] = api_key
    #     if max_tokens is not None:
    #         kwargs["max_tokens"] = max_tokens
    #     return AzureChatOpenAI(**kwargs)


# =====================================================================
# Module-level convenience function  (the public API agents call)
# =====================================================================

_factory: Optional[LLMFactory] = None
_module_lock = threading.Lock()


def get_llm(
    *,
    temperature: Optional[float] = None,
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
) -> BaseChatModel:
    """
    Module-level convenience function.

    Agents call this instead of touching ``LLMFactory`` directly::

        from backend.app.ai.llm import get_llm
        llm = get_llm()
        llm = get_llm(temperature=0.4, model="gpt-4.1-mini")

    Thread-safe.  First call boots the singleton factory.
    """
    global _factory

    if _factory is None:
        with _module_lock:
            if _factory is None:
                _factory = LLMFactory()

    return _factory.get_llm(
        temperature=temperature,
        model=model,
        max_tokens=max_tokens,
    )
