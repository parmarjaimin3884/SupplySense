# SupplySense Demand Forecast Agent

The `ForecastAgent` is a production-ready LangChain AI assistant designed to act as a **Senior Demand Planning Manager**. It predicts future product demand by analyzing historical sales, seasonal patterns, inventory velocity, and trend indicators — then provides actionable procurement recommendations.

## Architecture

```
User Question
    |
    v
+----------------------------------+
|  ForecastAgent.analyze()         |
|  +----------------------------+  |
|  | LangChain AgentExecutor    |  |
|  |  +- tool_get_historical()  |  |
|  |  +- tool_get_seasonal()    |  |
|  |  +- tool_get_monthly()     |  |
|  |  +- tool_get_top_selling() |  |
|  |  +- tool_get_inventory()   |  |
|  |  +- ... (12 tools total)   |  |
|  +------------+---------------+  |
|               | raw analysis     |
|               v                  |
|  +----------------------------+  |
|  | Structuring Chain          |  |
|  | (with_structured_output)   |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  ForecastAnalysisResponse        |
|  (Pydantic validated output)     |
+----------------------------------+
```

## Features

- **Independent Execution**: Orchestrates 12 underlying database tools autonomously.
- **LLM Factory Integration**: Uses `get_llm()` for automatic Groq (dev) / OpenAI (prod) selection.
- **Strict Data Retrieval**: Uses predefined SQLAlchemy async tools -- never runs direct SQL.
- **Structured Pydantic Outputs**: Returns `ForecastAnalysisResponse` with `forecast`, `predicted_demand`, `high_demand_products`, `low_demand_products`, `recommendations`, and `confidence`.
- **LangSmith Observability**: Core method decorated with `@traceable` for latency and execution tracking.
- **Graceful Error Handling**: Always returns a valid schema, even on tool or LLM failures.
- **Festival Awareness**: Prompt is tuned for Indian and global business events (Diwali, Christmas, etc.).

## Available Tools

| Domain    | Tool                              | Purpose                                       |
|-----------|-----------------------------------|-----------------------------------------------|
| Inventory | `tool_get_inventory`              | Current stock levels for a product            |
| Inventory | `tool_get_inventory_turnover`     | Inventory turnover ratio and COGS             |
| Inventory | `tool_get_fast_moving_products`   | Products with highest sales velocity          |
| Analytics | `tool_get_sales_summary`          | Aggregated sales performance metrics          |
| Analytics | `tool_get_dashboard_metrics`      | System-wide counts (products, warehouses)     |
| Product   | `tool_get_top_selling_products`   | Top sellers by average daily sales            |
| Product   | `tool_get_slowest_selling_products` | Slowest sellers / dead stock candidates     |
| Forecast  | `tool_get_historical_sales`       | Recent completed sales orders                 |
| Forecast  | `tool_get_product_sales_history`  | Per-product sales history with quantities     |
| Forecast  | `tool_get_seasonal_sales`         | Demand data with seasonality factors          |
| Forecast  | `tool_get_monthly_sales`          | Aggregated monthly revenue and order counts   |
| Forecast  | `tool_get_demand_forecast`        | Pre-computed demand forecasts from DB         |

## Tool Layer

The forecast tools are defined in `backend/app/ai/tools/forecast.py` and query:
- `SalesOrder` / `SalesOrderItem` — historical sales data
- `DemandHistory` — seasonality factors and trend indicators
- `ForecastHistory` — pre-computed demand predictions

## Usage Example

```python
import asyncio
from backend.app.ai.agents.forecast import ForecastAgent

async def main():
    # 1. Instantiate (automatically gets the correct LLM)
    agent = ForecastAgent()

    # 2. Analyze business questions
    questions = [
        "Forecast laptop demand for next month.",
        "Which products need reordering?",
        "What demand is expected before Diwali?",
        "Show trending products.",
        "Which products will become out of stock?",
        "How much inventory should we purchase?",
    ]

    for q in questions:
        print(f"\nQuestion: {q}")
        response = await agent.analyze(q)

        print("Summary:", response.summary)
        print("Predicted Demand:", response.predicted_demand)
        print("High Demand:", response.high_demand_products)
        print("Low Demand:", response.low_demand_products)
        print("Recommendations:", [(r.action, r.priority) for r in response.recommendations])
        print("Confidence:", response.confidence)

if __name__ == "__main__":
    asyncio.run(main())
```

## Output Schema

```json
{
  "summary": "Demand analysis for the upcoming period.",
  "forecast": [
    {
      "product_id": "uuid",
      "product_name": "Dell Latitude 5540",
      "current_daily_sales": 12,
      "predicted_demand": "Increasing",
      "forecast_period": "Next 30 days",
      "estimated_units": 420,
      "seasonality_factor": 1.3,
      "reasoning": "Average daily sales of 12 units with a positive trend indicator of 1.3. Diwali season expected to boost demand by ~30%."
    }
  ],
  "predicted_demand": "Growing",
  "high_demand_products": ["Dell Latitude 5540", "iPhone 15 Pro"],
  "low_demand_products": ["USB-C Hub Model X"],
  "recommendations": [
    {
      "action": "Increase Procurement",
      "product_name": "Dell Latitude 5540",
      "rationale": "Daily sales of 12 units with only 150 in stock -- will stockout in ~12 days without replenishment.",
      "priority": "Urgent"
    }
  ],
  "confidence": 0.82
}
```

## Error Handling

| Failure              | Behavior                                                                 |
|----------------------|--------------------------------------------------------------------------|
| Tool failure         | Logs error, continues with available data, lowers confidence             |
| Empty sales data     | Explicitly states data insufficiency, sets low confidence                |
| Missing product      | Returns appropriate message in summary                                   |
| Invalid input        | Handled by `handle_parsing_errors=True` in AgentExecutor                 |
| Unexpected exception | Returns a valid fallback `ForecastAnalysisResponse` with confidence=0.0  |
