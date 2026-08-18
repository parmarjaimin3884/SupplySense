# SupplySense Risk Analysis Agent

The `RiskAgent` is the **Central Decision Intelligence Engine** of SupplySense. Unlike other agents in the platform, it does NOT query databases or use LangChain tools. Instead, it receives validated structured outputs from all 4 upstream agents and synthesizes them into an enterprise-level operational risk assessment.

## Architecture

```
Inventory Agent  ------+
                       |
Shipment Agent   ------+
                       +----> RiskAgent.analyze() ----> RiskAnalysisResponse
Supplier Agent   ------+
                       |
Forecast Agent   ------+
```

The Risk Agent operates as a **pure reasoning chain** (no AgentExecutor):

```
Upstream Agent Outputs
        |
        v
+----------------------------------+
|  RiskAgent.analyze()             |
|  +----------------------------+  |
|  | Format Agent Outputs       |  |
|  | (utils.py formatters)      |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | LLM Reasoning Pass         |  |
|  | (SystemMessage + context)  |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | Structuring Chain          |  |
|  | (with_structured_output)   |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  RiskAnalysisResponse            |
|  (Pydantic validated output)     |
+----------------------------------+
```

## Key Differences from Other Agents

| Feature | Inventory/Shipment/Supplier/Forecast | Risk Agent |
|---------|--------------------------------------|------------|
| Data Source | Database (via tools) | Upstream agent outputs |
| LangChain Tools | Yes (tool wrappers) | None |
| AgentExecutor | Yes | No |
| Architecture | Tool-calling agent + structuring | Pure LLM chain |
| Input | User question | User question + 4 agent outputs |

## Features

- **Cross-Domain Correlation**: Detects compound risks (e.g., low inventory + growing demand + delayed shipments = critical stockout).
- **LLM Factory Integration**: Uses `get_llm()` for automatic Groq (dev) / OpenAI (prod) selection.
- **Structured Pydantic Outputs**: Returns `RiskAnalysisResponse` with `critical_findings`, `priority_actions`, `recommendations`, and `confidence`.
- **LangSmith Observability**: Core method decorated with `@traceable`.
- **Graceful Degradation**: Works with partial data (1-4 agents). Reports missing domains explicitly.
- **Risk Level Classification**: Very Low / Low / Medium / High / Critical.

## Risk Categories

The agent identifies risks across these dimensions:

| Category | Source Agents |
|----------|---------------|
| Inventory Risk | Inventory Agent |
| Shipment Risk | Shipment Agent |
| Supplier Risk | Supplier Agent |
| Demand Risk | Forecast Agent |
| Warehouse Risk | Inventory + Shipment |
| Operational Risk | All agents |
| Business Continuity | All agents |
| Stockout Risk | Inventory + Forecast |
| Overstock Risk | Inventory + Forecast |
| Procurement Risk | Supplier + Forecast |

## Usage Example

```python
import asyncio
from backend.app.ai.agents.inventory import InventoryAgent
from backend.app.ai.agents.shipment import ShipmentAgent
from backend.app.ai.agents.supplier import SupplierAgent
from backend.app.ai.agents.forecast import ForecastAgent
from backend.app.ai.agents.risk import RiskAgent

async def main():
    # 1. Run upstream agents
    question = "What are today's biggest operational risks?"

    inv_agent = InventoryAgent(llm=get_llm())
    ship_agent = ShipmentAgent()
    sup_agent = SupplierAgent()
    fc_agent = ForecastAgent()

    inv_result = await inv_agent.analyze(question)
    ship_result = await ship_agent.analyze(question)
    sup_result = await sup_agent.analyze(question)
    fc_result = await fc_agent.analyze(question)

    # 2. Feed into Risk Agent
    risk_agent = RiskAgent()
    risk_result = await risk_agent.analyze(
        user_question=question,
        inventory_analysis=inv_result,
        shipment_analysis=ship_result,
        supplier_analysis=sup_result,
        forecast_analysis=fc_result,
    )

    # 3. Read the assessment
    print("Risk Level:", risk_result.risk_level)
    print("Summary:", risk_result.summary)
    print("Findings:", len(risk_result.critical_findings))
    print("Priority Actions:")
    for a in risk_result.priority_actions:
        print(f"  #{a.rank} [{a.urgency}] {a.action}: {a.rationale}")
    print("Confidence:", risk_result.confidence)

if __name__ == "__main__":
    asyncio.run(main())
```

## Output Schema

```json
{
  "summary": "Executive summary of operational risk posture.",
  "overall_risk": "Cross-domain risk narrative.",
  "risk_level": "High",
  "critical_findings": [
    {
      "risk_id": "RISK-INV-001",
      "category": "Stockout",
      "severity": "Critical",
      "title": "Imminent stockout for Dell Latitude 5540",
      "description": "Only 50 units in stock with daily sales of 12 units...",
      "source_agents": ["Inventory Agent", "Forecast Agent"],
      "business_impact": "Potential revenue loss of $75,000 within 5 days."
    }
  ],
  "affected_products": ["Dell Latitude 5540"],
  "affected_suppliers": ["Acme Electronics"],
  "affected_warehouses": ["WH-Mumbai-01"],
  "recommendations": [
    {
      "action": "Emergency Procurement",
      "category": "Emergency Procurement",
      "target": "Dell Latitude 5540",
      "rationale": "Stockout in ~4 days. Demand is increasing 30%.",
      "priority": "Urgent"
    }
  ],
  "priority_actions": [
    {
      "rank": 1,
      "action": "Emergency Procurement",
      "target": "Dell Latitude 5540",
      "rationale": "Imminent stockout with growing demand.",
      "urgency": "Immediate"
    }
  ],
  "confidence": 0.85
}
```

## Error Handling

| Failure | Behavior |
|---------|----------|
| Missing agent output | Explicitly states domain not assessed, lowers confidence |
| 0 agents provided | Returns low-confidence assessment, flags operational escalation |
| LLM failure | Returns valid fallback RiskAnalysisResponse with confidence=0.0 |
| Invalid input | Gracefully handles via Pydantic validation |
| Unexpected exception | Logs error, returns structured fallback response |

## Confidence Scoring

Confidence is based on:
- **Agent availability** (60% weight): Each of the 4 agents contributes 15% to baseline confidence.
- **Upstream confidence** (40% weight): Average of individual agent confidence scores.

| Agents Available | Base Confidence |
|-----------------|-----------------|
| 4/4 | 0.60 + upstream avg |
| 3/4 | 0.45 + upstream avg |
| 2/4 | 0.30 + upstream avg |
| 1/4 | 0.15 + upstream avg |
| 0/4 | 0.00 |
