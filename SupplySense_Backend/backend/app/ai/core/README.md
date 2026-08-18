# SupplySense — Shared AI Core

## Overview

The Shared AI Core (`backend/app/ai/core/`) provides common infrastructure
used by all SupplySense AI agents and the LangGraph Supervisor.  It
eliminates duplicated code across agents while preserving each agent's
domain-specific logic.

## Architecture

```
backend/app/ai/core/           ← Shared Infrastructure (this package)
    │
    ├── base_agent.py          ← Abstract BaseAgent with execution lifecycle
    ├── state.py               ← Shared agent state models
    ├── response_models.py     ← Standardised response Pydantic models
    ├── tool_registry.py       ← Centralised tool registration
    ├── exceptions.py          ← AI exception hierarchy
    ├── tracing.py             ← LangSmith tracing utilities
    │
    ├── llm_factory.py         ← Bridge to backend.app.ai.llm (existing)
    ├── embeddings.py          ← Bridge to backend.app.ai.embeddings (existing)
    └── qdrant.py              ← Bridge to backend.app.ai.vectorstore (existing)
```

### Dependency Direction

```
core/               ← depends on: settings, logger, llm factory (only)
  ↓
agents/             ← depends on: core/, tools/
tools/              ← depends on: database, models
supervisor/         ← depends on: core/, agents/
```

The core **never** imports from `agents/`, `tools/`, or `supervisor/`.

---

## Modules

### `base_agent.py` — BaseAgent

Abstract base class providing the common execution lifecycle:

```
Input → validate_input() → Tracing Start → process() → format_response() → Tracing End → AgentResponse
```

On error:

```
process() raises → handle_error() → AgentResponse(status=failure)
```

**Key features:**
- Automatic LLM access via `get_llm()` from the existing factory
- Consistent Loguru logging (not stdlib `logging`)
- LangSmith tracing via `traced_agent_execution`
- Structured error handling with `AgentResponse`

**How existing agents use BaseAgent:**

```python
from backend.app.ai.core.base_agent import BaseAgent

class InventoryAgent(BaseAgent):
    name = "inventory"
    version = "1.0.0"
    description = "Evaluates inventory health and stock levels."

    async def process(self, user_question: str, **kwargs):
        # Your existing domain logic here
        tools = get_all_inventory_tools()
        agent_executor = ...
        result = await agent_executor.ainvoke(...)
        return result  # dict or Pydantic model
```

> **Note**: Existing agents are NOT required to inherit from `BaseAgent`.
> They work as-is. Adoption is incremental.

---

### `state.py` — BaseAgentState & BaseExecutionMetadata

Consolidates the duplicated state fields found in all 6+ agent state classes:

```python
from backend.app.ai.core.state import BaseAgentState

class InventoryAgentState(BaseAgentState):
    inventory_status: str = ""  # domain-specific addition
```

`BaseAgentState` provides:
- `user_question`, `conversation_history`, `detected_intent`
- `selected_tools`, `tool_outputs`
- `confidence_score`, `error`, `final_response`
- `execution_metadata: BaseExecutionMetadata`
- `record_tool_call(tool_name, output)` method
- `record_agent_input(agent_name, output)` method (for synthesis agents)
- `record_retrieval(chunks, method)` method (for RAG agent)

> **Does NOT replace** the `SupervisorState` TypedDict in `supervisor/state.py`.
> That remains the LangGraph StateGraph state.

---

### `response_models.py` — AgentResponse

Standardised Pydantic models for uniform agent output:

| Model | Purpose |
|-------|---------|
| `AgentResponse` | Top-level wrapper with status, metadata, errors |
| `AgentFinding` | A single finding with severity, category, evidence |
| `Recommendation` | An actionable recommendation with priority |
| `Evidence` | Source identification for a finding |
| `ExecutionMetadata` | Per-agent execution metrics |
| `AgentError` | Structured error record (not a Python exception) |

**How the Supervisor merger uses AgentResponse:**

The merger can check `response.status`, aggregate `response.findings`,
deduplicate `response.recommendations`, and compute composite confidence
from `response.confidence` — all with a uniform API regardless of which
agent produced the response.

---

### `tool_registry.py` — ToolRegistry

Centralised, thread-safe registry for existing LangChain tools:

```python
from backend.app.ai.core.tool_registry import tool_registry

# Register (explicit — avoids circular imports)
from backend.app.ai.tools.inventory import get_inventory
tool_registry.register_tool(get_inventory, category="inventory")

# Retrieve
inv_tools = tool_registry.get_tools_by_category("inventory")
all_tools = tool_registry.get_tools()
tool_registry.has_tool("get_inventory")  # True
tool_registry.list_tools()  # [{name, category, description}, ...]
```

**Important**: The registry does NOT auto-import tool modules and does
NOT contain business logic.

---

### `exceptions.py` — AI Exception Hierarchy

```
AIError
├── AgentError
│   ├── AgentExecutionError
│   └── AgentValidationError
├── ToolError
│   └── ToolExecutionError
├── LLMError
│   ├── LLMConfigurationError
│   ├── LLMRateLimitError
│   └── LLMTimeoutError
├── RoutingError
├── StateError
├── ResponseValidationError
├── RAGError
└── TracingError
```

Every exception carries: `agent_name`, `tool_name`, `operation`,
`request_id`, `original_exception`, `retryable`.

---

### `tracing.py` — LangSmith Tracing

Async context managers for consistent tracing:

```python
from backend.app.ai.core.tracing import traced_agent_execution

async with traced_agent_execution(agent_name="inventory") as ctx:
    result = await do_work()
    ctx["tools_used"] = ["get_low_stock"]
    # duration_ms, timestamps auto-captured
```

Available context managers:
- `traced_agent_execution` — agent-level spans
- `traced_tool_execution` — tool-level spans
- `traced_supervisor_execution` — full supervisor graph spans

---

## Running Tests

```bash
pytest tests/ai/core/ -v
```
