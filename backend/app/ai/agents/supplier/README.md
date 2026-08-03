# SupplySense Supplier Intelligence Agent

The `SupplierAgent` is a production-ready LangChain AI assistant designed to act as a **Senior Procurement Manager and Supplier Intelligence Analyst**. It continuously evaluates supplier performance, detects procurement risks, ranks vendors, and issues actionable business recommendations.

## Architecture

```
User Question
    │
    ▼
┌──────────────────────────────────┐
│  SupplierAgent.analyze()         │
│  ┌────────────────────────────┐  │
│  │ LangChain AgentExecutor    │  │
│  │  ├─ tool_get_supplier()    │  │
│  │  ├─ tool_get_best/risky()  │  │
│  │  ├─ tool_get_performance() │  │
│  │  ├─ tool_get_shipments()   │  │
│  │  ├─ tool_get_po_by_suppl() │  │
│  │  └─ ... (14 tools total)   │  │
│  └────────────┬───────────────┘  │
│               │ raw analysis     │
│               ▼                  │
│  ┌────────────────────────────┐  │
│  │ Structuring Chain          │  │
│  │ (with_structured_output)   │  │
│  └────────────┬───────────────┘  │
│               │                  │
│               ▼                  │
│  SupplierAnalysisResponse        │
│  (Pydantic validated output)     │
└──────────────────────────────────┘
```

## Features

- **Independent Execution**: Orchestrates 14 underlying database tools autonomously.
- **LLM Factory Integration**: Uses `get_llm()` for automatic Groq (dev) / OpenAI (prod) selection.
- **Strict Data Retrieval**: Uses predefined SQLAlchemy async tools — never runs direct SQL.
- **Structured Pydantic Outputs**: Returns `SupplierAnalysisResponse` with `supplier_health`, `best_suppliers`, `risky_suppliers`, `risk_assessments`, `recommendations`, and `confidence`.
- **LangSmith Observability**: Core method decorated with `@traceable` for latency and execution tracking.
- **Graceful Error Handling**: Always returns a valid schema, even on tool or LLM failures.

## Available Tools

| Domain         | Tool                                   | Purpose                                       |
|----------------|----------------------------------------|-----------------------------------------------|
| Supplier       | `tool_get_supplier`                    | Detailed supplier info                        |
| Supplier       | `tool_get_supplier_orders`             | Purchase order history for a supplier         |
| Supplier       | `tool_get_supplier_shipments`          | Shipment history for a supplier               |
| Supplier       | `tool_get_supplier_performance`        | Monthly KPIs (delivery %, delay, quality)     |
| Supplier       | `tool_get_supplier_reliability`        | Reliability score                             |
| Supplier       | `tool_get_supplier_lead_time`          | Standard lead time in days                    |
| Supplier       | `tool_get_best_suppliers`              | Top performers by reliability + quality       |
| Supplier       | `tool_get_risky_suppliers`             | Worst performers by reliability               |
| Shipment       | `tool_get_shipments_by_supplier`       | Shipments from a specific supplier            |
| Shipment       | `tool_calculate_average_delay`         | System-wide average delay benchmark           |
| Purchase Order | `tool_get_purchase_orders_by_supplier` | POs for a specific supplier                   |
| Purchase Order | `tool_get_pending_purchase_orders`     | All unfulfilled POs across suppliers          |
| Analytics      | `tool_get_supplier_summary`            | Aggregated supplier metrics                   |
| Analytics      | `tool_get_dashboard_metrics`           | System-wide dashboard counts                  |

## Usage Example

```python
import asyncio
from backend.app.ai.agents.supplier import SupplierAgent

async def main():
    # 1. Instantiate (automatically gets the correct LLM)
    agent = SupplierAgent()

    # 2. Analyze business questions
    questions = [
        "Which supplier is most reliable?",
        "Who should we avoid?",
        "Recommend suppliers for MacBooks.",
        "Show supplier performance.",
        "Which supplier has the longest lead time?",
        "Which supplier causes the most delays?",
    ]

    for q in questions:
        print(f"\nQuestion: {q}")
        response = await agent.analyze(q)

        print("Summary:", response.summary)
        print("Best Suppliers:", response.best_suppliers)
        print("Risky Suppliers:", response.risky_suppliers)
        print("Recommendations:", [(r.action, r.priority) for r in response.recommendations])
        print("Confidence:", response.confidence)

if __name__ == "__main__":
    asyncio.run(main())
```

## Output Schema

```json
{
  "summary": "High-level analysis of the supplier landscape.",
  "supplier_health": [
    {
      "supplier_id": "uuid",
      "company_name": "Acme Corp",
      "reliability_score": 92.5,
      "quality_score": 88.0,
      "lead_time_days": 7,
      "average_delay_days": 1.2,
      "delivery_percentage": 96.0,
      "risk_rating": "Low",
      "health_verdict": "Healthy"
    }
  ],
  "best_suppliers": ["Acme Corp", "Global Parts Inc"],
  "risky_suppliers": ["Slow Ship LLC"],
  "risk_assessments": [
    {
      "supplier_name": "Slow Ship LLC",
      "risk_category": "Delivery",
      "severity": "High",
      "description": "Average delay of 8.5 days over last 3 months."
    }
  ],
  "recommendations": [
    {
      "action": "Decrease Procurement",
      "supplier_name": "Slow Ship LLC",
      "rationale": "Reliability has dropped to 45% — shift volume to Acme Corp.",
      "priority": "Urgent"
    }
  ],
  "confidence": 0.85
}
```

## Error Handling

The agent handles the following failure modes gracefully:

| Failure              | Behavior                                                                 |
|----------------------|--------------------------------------------------------------------------|
| Tool failure         | Logs error, continues with available data, lowers confidence             |
| Supplier not found   | Returns appropriate message in summary                                   |
| Empty data           | Explicitly states data insufficiency, sets low confidence                |
| Invalid input        | Handled by `handle_parsing_errors=True` in AgentExecutor                 |
| Unexpected exception | Returns a valid fallback `SupplierAnalysisResponse` with confidence=0.0  |
