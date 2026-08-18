"""
Tests for backend.app.ai.core.tool_registry
"""

import pytest

from backend.app.ai.core.tool_registry import ToolRegistry, tool_registry
from backend.app.ai.core.exceptions import ToolError


# ---------------------------------------------------------------------------
# Helpers — mock tool objects
# ---------------------------------------------------------------------------

class _MockTool:
    """Minimal mock LangChain tool for testing."""

    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description


def _make_tool(name: str, desc: str = "test tool") -> _MockTool:
    return _MockTool(name=name, description=desc)


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

class TestToolRegistration:

    def setup_method(self):
        self.registry = ToolRegistry()

    def test_register_single_tool(self):
        tool = _make_tool("get_stock")
        self.registry.register_tool(tool, category="inventory")
        assert self.registry.has_tool("get_stock")
        assert self.registry.count == 1

    def test_register_multiple_tools(self):
        tools = [_make_tool("tool_a"), _make_tool("tool_b")]
        self.registry.register_tools(tools, category="analytics")
        assert self.registry.count == 2

    def test_duplicate_registration_raises(self):
        tool = _make_tool("get_stock")
        self.registry.register_tool(tool, category="inventory")

        with pytest.raises(ToolError, match="already registered"):
            self.registry.register_tool(tool, category="inventory")

    def test_duplicate_with_allow_overwrite(self):
        tool1 = _make_tool("get_stock", "v1")
        tool2 = _make_tool("get_stock", "v2")
        self.registry.register_tool(tool1, category="inventory")
        self.registry.register_tool(
            tool2, category="inventory", allow_overwrite=True
        )
        assert self.registry.count == 1
        # Should be v2
        retrieved = self.registry.get_tool("get_stock")
        assert retrieved.description == "v2"

    def test_register_tool_without_name_raises(self):
        tool = object()  # no .name attribute
        with pytest.raises(ToolError, match="without a name"):
            self.registry.register_tool(tool, category="test")

    def test_register_with_custom_name(self):
        tool = _make_tool("internal_name")
        self.registry.register_tool(
            tool, category="custom", name="public_name"
        )
        assert self.registry.has_tool("public_name")
        assert not self.registry.has_tool("internal_name")


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

class TestToolRetrieval:

    def setup_method(self):
        self.registry = ToolRegistry()
        self.registry.register_tool(_make_tool("inv_a"), category="inventory")
        self.registry.register_tool(_make_tool("inv_b"), category="inventory")
        self.registry.register_tool(_make_tool("ship_a"), category="shipment")

    def test_get_tool_by_name(self):
        tool = self.registry.get_tool("inv_a")
        assert tool.name == "inv_a"

    def test_get_nonexistent_tool_raises(self):
        with pytest.raises(ToolError, match="not registered"):
            self.registry.get_tool("nonexistent")

    def test_get_tools_returns_all(self):
        all_tools = self.registry.get_tools()
        assert len(all_tools) == 3

    def test_get_tools_by_category(self):
        inv_tools = self.registry.get_tools_by_category("inventory")
        assert len(inv_tools) == 2
        assert all(t.name.startswith("inv") for t in inv_tools)

    def test_get_tools_by_category_empty(self):
        result = self.registry.get_tools_by_category("nonexistent")
        assert result == []


# ---------------------------------------------------------------------------
# Query
# ---------------------------------------------------------------------------

class TestToolQuery:

    def setup_method(self):
        self.registry = ToolRegistry()
        self.registry.register_tool(
            _make_tool("get_inventory", "Fetch inventory"), category="inventory"
        )

    def test_has_tool_exists(self):
        assert self.registry.has_tool("get_inventory") is True

    def test_has_tool_not_exists(self):
        assert self.registry.has_tool("missing") is False

    def test_list_tools(self):
        listing = self.registry.list_tools()
        assert len(listing) == 1
        assert listing[0]["name"] == "get_inventory"
        assert listing[0]["category"] == "inventory"
        assert listing[0]["description"] == "Fetch inventory"

    def test_list_categories(self):
        self.registry.register_tool(_make_tool("ship_a"), category="shipment")
        cats = self.registry.list_categories()
        assert "inventory" in cats
        assert "shipment" in cats

    def test_count(self):
        assert self.registry.count == 1
        self.registry.register_tool(_make_tool("tool_2"), category="other")
        assert self.registry.count == 2


# ---------------------------------------------------------------------------
# Management
# ---------------------------------------------------------------------------

class TestToolManagement:

    def test_clear_registry(self):
        registry = ToolRegistry()
        registry.register_tool(_make_tool("a"), category="x")
        registry.register_tool(_make_tool("b"), category="x")
        assert registry.count == 2

        registry.clear_registry()
        assert registry.count == 0
        assert registry.list_tools() == []

    def test_repr(self):
        registry = ToolRegistry()
        assert "ToolRegistry(tools=0)" == repr(registry)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

class TestModuleSingleton:

    def test_singleton_is_tool_registry(self):
        assert isinstance(tool_registry, ToolRegistry)
