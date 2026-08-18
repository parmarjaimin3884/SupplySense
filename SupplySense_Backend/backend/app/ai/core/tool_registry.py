"""
SupplySense — Shared AI Core: Tool Registry
=============================================

Centralised registry for existing LangChain tools.

Design Principles
-----------------
* **Does NOT recreate tools** — tools already exist in ``backend/app/ai/tools/``.
  This registry manages *references* only.
* **Explicit registration** — tools must be registered via ``register_tool()``
  or ``register_tools()`` to avoid circular import issues from auto-importing
  tool modules.
* **No business logic** — the registry only stores, retrieves, and queries
  tool references.
* **Safety** — only explicitly registered tools are available to agents.
  The registry does not allow arbitrary Python function execution.
* **Thread-safe** — uses a threading lock to prevent race conditions during
  concurrent registration.

Usage
-----
::

    from backend.app.ai.core.tool_registry import tool_registry

    # Register tools explicitly
    from backend.app.ai.tools.inventory import get_inventory, get_low_stock
    tool_registry.register_tool(get_inventory, category="inventory")
    tool_registry.register_tool(get_low_stock, category="inventory")

    # Retrieve tools
    inv_tools = tool_registry.get_tools_by_category("inventory")
    all_tools = tool_registry.get_tools()
"""

from __future__ import annotations

import threading
from typing import Any, Dict, List, Optional, Sequence

from backend.app.ai.core.exceptions import ToolError


# ---------------------------------------------------------------------------
# Tool Entry
# ---------------------------------------------------------------------------

class ToolEntry:
    """
    Internal record for a registered tool.

    Attributes:
        tool: The LangChain tool object (e.g. ``StructuredTool``).
        name: The tool name (derived from ``tool.name`` or overridden).
        category: Logical grouping — e.g. 'inventory', 'shipment'.
        description: Brief description of the tool's purpose.
    """

    __slots__ = ("tool", "name", "category", "description")

    def __init__(
        self,
        tool: Any,
        name: str,
        category: str,
        description: str,
    ) -> None:
        self.tool = tool
        self.name = name
        self.category = category
        self.description = description

    def __repr__(self) -> str:
        return (
            f"ToolEntry(name={self.name!r}, category={self.category!r}, "
            f"description={self.description!r})"
        )


# ---------------------------------------------------------------------------
# Tool Registry
# ---------------------------------------------------------------------------

class ToolRegistry:
    """
    Centralised, thread-safe registry for LangChain tool objects.

    Prevents duplicate registrations, provides lookup by name or category,
    and enforces that only explicitly registered tools are available.

    This class does **not** contain business logic and does **not**
    auto-import tool modules.
    """

    def __init__(self) -> None:
        self._tools: Dict[str, ToolEntry] = {}
        self._lock = threading.Lock()

    # ── Registration ──────────────────────────────────────────────────

    def register_tool(
        self,
        tool: Any,
        *,
        category: str = "general",
        name: Optional[str] = None,
        description: Optional[str] = None,
        allow_overwrite: bool = False,
    ) -> None:
        """
        Register a single LangChain tool.

        Args:
            tool: The LangChain tool object.  Must have a ``name`` attribute.
            category: Logical category for grouping (e.g. 'inventory').
            name: Override the tool's name.  Defaults to ``tool.name``.
            description: Override the tool's description.
            allow_overwrite: If ``True``, silently overwrite a tool with the
                             same name.  If ``False`` (default), raise
                             ``ToolError`` on duplicate.

        Raises:
            ToolError: If the tool is missing a ``name`` attribute or if
                       a duplicate name is detected without ``allow_overwrite``.
        """
        tool_name = name or getattr(tool, "name", None)
        if not tool_name:
            raise ToolError(
                "Cannot register a tool without a name. "
                "Provide a 'name' argument or ensure the tool has a 'name' attribute.",
                tool_name="unknown",
            )

        tool_desc = description or getattr(tool, "description", "") or ""

        with self._lock:
            if tool_name in self._tools and not allow_overwrite:
                raise ToolError(
                    f"Tool '{tool_name}' is already registered. "
                    f"Use allow_overwrite=True to replace it.",
                    tool_name=tool_name,
                )

            self._tools[tool_name] = ToolEntry(
                tool=tool,
                name=tool_name,
                category=category,
                description=tool_desc,
            )

    def register_tools(
        self,
        tools: Sequence[Any],
        *,
        category: str = "general",
        allow_overwrite: bool = False,
    ) -> None:
        """
        Register multiple tools under the same category.

        Args:
            tools: Sequence of LangChain tool objects.
            category: Logical category for all tools in this batch.
            allow_overwrite: Whether to allow overwriting existing tools.
        """
        for tool in tools:
            self.register_tool(
                tool, category=category, allow_overwrite=allow_overwrite
            )

    # ── Retrieval ─────────────────────────────────────────────────────

    def get_tool(self, name: str) -> Any:
        """
        Retrieve a single tool by name.

        Args:
            name: The registered name of the tool.

        Returns:
            The LangChain tool object.

        Raises:
            ToolError: If no tool with the given name is registered.
        """
        with self._lock:
            entry = self._tools.get(name)
        if entry is None:
            raise ToolError(
                f"Tool '{name}' is not registered.",
                tool_name=name,
            )
        return entry.tool

    def get_tools(self) -> List[Any]:
        """Return all registered tool objects."""
        with self._lock:
            return [entry.tool for entry in self._tools.values()]

    def get_tools_by_category(self, category: str) -> List[Any]:
        """
        Retrieve all tools belonging to a specific category.

        Args:
            category: The category to filter by (case-sensitive).

        Returns:
            List of tool objects in the given category.
        """
        with self._lock:
            return [
                entry.tool
                for entry in self._tools.values()
                if entry.category == category
            ]

    # ── Query ─────────────────────────────────────────────────────────

    def has_tool(self, name: str) -> bool:
        """Check whether a tool with the given name is registered."""
        with self._lock:
            return name in self._tools

    def list_tools(self) -> List[Dict[str, str]]:
        """
        List all registered tools with their metadata.

        Returns:
            List of dicts with ``name``, ``category``, and ``description``.
        """
        with self._lock:
            return [
                {
                    "name": entry.name,
                    "category": entry.category,
                    "description": entry.description,
                }
                for entry in self._tools.values()
            ]

    def list_categories(self) -> List[str]:
        """Return a sorted list of unique categories."""
        with self._lock:
            return sorted({entry.category for entry in self._tools.values()})

    # ── Management ────────────────────────────────────────────────────

    def clear_registry(self) -> None:
        """Remove all registered tools.  Primarily for testing."""
        with self._lock:
            self._tools.clear()

    @property
    def count(self) -> int:
        """Number of registered tools."""
        with self._lock:
            return len(self._tools)

    def __repr__(self) -> str:
        return f"ToolRegistry(tools={self.count})"


# ---------------------------------------------------------------------------
# Module-level singleton instance
# ---------------------------------------------------------------------------

tool_registry = ToolRegistry()
"""
Module-level singleton ``ToolRegistry`` instance.

Import and use directly::

    from backend.app.ai.core.tool_registry import tool_registry
"""
