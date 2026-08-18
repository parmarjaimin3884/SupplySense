# SupplySense LangGraph Supervisor

The `SupplySenseSupervisor` is the **central multi-agent orchestrator** for the SupplySense AI Supply Chain Decision Support Platform. Implemented using **LangGraph `StateGraph`**, it dynamically classifies user intent, routes queries to single or multiple agents (in parallel or sequence), merges outputs, deduplicates recommendations, and computes enterprise confidence scores.

---

## Architecture Overview

```
                                    [ USER QUERY ]
                                          │
                                          ▼
                                 [ Router Node ]
                            (Intent & Agent Selection)
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  │ (Parallel Execution Layer: Data & RAG) │
                  ▼                       ▼                       ▼
           [Inventory Node]       [Shipment Node]          [RAG Node] ...
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          │
                                          ▼
                               (Sequential Synthesis)
                                  [Risk Node]
                                          │
                                          ▼
                               [Executive Node]
                                          │
                                          ▼
                                   [Merger Node]
                            (Synthesis & Deduplication)
                                          │
                                          ▼
                                [SupervisorResponse]
```

---

## Managed Agents (7 total)

| Agent | Module | Category | Primary Focus |
|-------|--------|----------|---------------|
| Inventory Agent | `backend.app.ai.agents.inventory` | Operational | Low stock, dead stock, reorder levels, warehouse inventory |
| Shipment Agent | `backend.app.ai.agents.shipment` | Operational | Active shipments, carrier delays, ETA tracking, logistics |
| Supplier Agent | `backend.app.ai.agents.supplier` | Operational | Reliability, quality, lead times, vendor risk ratings |
| Forecast Agent | `backend.app.ai.agents.forecast` | Operational | Demand predictions, seasonal spikes, sales velocity |
| Risk Agent | `backend.app.ai.agents.risk` | Synthesis | Cross-domain risk correlation, operational priority actions |
| Executive Agent | `backend.app.ai.agents.executive` | Synthesis | 2-minute C-suite business health executive summary |
| RAG Agent | `backend.app.ai.agents.rag` | Knowledge | Company policies, SOPs, return rules, audit checklists, contracts |

---

## Routing & Execution Workflows

### 1. Single-Agent Routing
- **Query**: `"Which products are low in stock?"`
  - Router selects: `["inventory"]`
  - Flow: `router` -> `inventory` -> `merger` -> `END`

- **Query**: `"Explain procurement policy."`
  - Router selects: `["rag"]`
  - Flow: `router` -> `rag` -> `merger` -> `END`

### 2. Multi-Agent Parallel Routing
- **Query**: `"According to our procurement policy, should we reorder laptops?"`
  - Router selects: `["inventory", "rag"]` (Intent: Hybrid)
  - Flow: `router` -> `inventory` & `rag` (in parallel) -> `merger` -> `END`

### 3. Multi-Agent Sequential Synthesis
- **Query**: `"Which delayed shipment creates the biggest business risk?"`
  - Router selects: `["shipment", "risk"]`
  - Flow: `router` -> `shipment` -> `risk` -> `merger` -> `END`

- **Query**: `"Prepare today's executive summary with company policy references."`
  - Router selects: `["inventory", "shipment", "supplier", "forecast", "risk", "executive", "rag"]`
  - Flow: `router` -> (`inventory`, `shipment`, `supplier`, `forecast`, `rag` in parallel) -> `risk` -> `executive` -> `merger` -> `END`

---

## State Schema (`SupervisorState`)

The graph uses a `TypedDict` state with built-in reducer functions:

```python
class SupervisorState(TypedDict, total=False):
    user_question: str
    conversation_history: List[Dict[str, str]]
    intent: str
    intent_explanation: str
    selected_agents: List[str]
    agent_outputs: Annotated[Dict[str, Any], merge_dicts]
    merged_response: Dict[str, Any]
    nodes_executed: Annotated[List[str], merge_lists]
    confidence: float
    error: Optional[str]
    start_time: float
```

---

## Usage Example

```python
import asyncio
from backend.app.ai.supervisor import run_supervisor, SupplySenseSupervisor

async def main():
    # 1. Quick execution via helper function
    query = "According to our procurement policy, should we reorder laptops?"
    response = await run_supervisor(query)

    print(f"Intent: {response.intent}")
    print(f"Agents Invoked: {response.selected_agents}")
    print(f"Summary: {response.summary}")
    print(f"Citations: {response.citations_and_sources}")
    print(f"Confidence: {response.confidence}")

    # 2. Or instantiate class instance
    supervisor = SupplySenseSupervisor()
    exec_response = await supervisor.run("Generate today's executive report.")
    print(f"Executive Summary: {exec_response.summary}")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Output Schema (`SupervisorResponse`)

```json
{
  "query": "According to our procurement policy, should we reorder laptops?",
  "intent": "Hybrid",
  "selected_agents": ["inventory", "rag"],
  "summary": "Laptop inventory is at 15 units (below safety stock of 50). Per Procurement Policy v2.1 Section 3, emergency reorders must be placed when stock drops below 30%.",
  "answer": "Detailed synthesis with evidence and citations...",
  "findings": [
    {
      "category": "Inventory",
      "title": "Low Stock Alert",
      "detail": "Dell Latitude 5540 stock count is 15 units across all warehouses.",
      "source_agent": "inventory",
      "severity": "High"
    }
  ],
  "recommendations": [
    {
      "action": "Issue Emergency PO for 100 laptops",
      "rationale": "Inventory is below safety threshold specified in Procurement Policy v2.1.",
      "priority": "Urgent",
      "source_agents": ["inventory", "rag"]
    }
  ],
  "citations_and_sources": ["Procurement Policy v2.1"],
  "confidence": 0.92,
  "execution_metadata": {
    "total_duration_ms": 1250.5,
    "nodes_executed": ["router_node", "inventory_node", "rag_node", "merger_node"],
    "agents_invoked": ["inventory", "rag"],
    "parallel_execution_used": true
  }
}
```

---

## Observability & LangSmith

The supervisor and all node functions are decorated with `@traceable`.
Full execution graphs, node latencies, token consumption, and agent step trace logs are captured automatically in LangSmith.
