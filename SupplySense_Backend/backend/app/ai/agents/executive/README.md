# SupplySense Executive Summary Agent

The `ExecutiveAgent` is the **final agent in the SupplySense pipeline**. It converts technical AI analysis from all 5 upstream agents into clear, actionable executive reports readable in under two minutes.

## Architecture

```
Inventory Agent   -----+
                       |
Shipment Agent    -----+
                       |
Supplier Agent    -----+----> ExecutiveAgent.analyze() ----> ExecutiveSummaryResponse
                       |
Forecast Agent    -----+
                       |
Risk Agent        -----+
```

The Executive Agent operates as a **pure reasoning chain** (no tools, no AgentExecutor):

```
5 Upstream Agent Outputs
        |
        v
+----------------------------------+
|  ExecutiveAgent.analyze()        |
|  +----------------------------+  |
|  | Format Agent Outputs       |  |
|  | (inline formatters)        |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | LLM Reasoning Pass         |  |
|  | (executive language)       |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | Structuring Chain          |  |
|  | (with_structured_output)   |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  ExecutiveSummaryResponse        |
|  (2-minute executive report)     |
+----------------------------------+
```

## Target Audience

- CEO
- Operations Director
- Warehouse Manager
- Procurement Manager
- Business Executives

## Features

- **Plain Business Language**: No technical jargon. Translates agent outputs into executive-friendly terms.
- **2-Minute Read**: Every sentence earns its place. Scannable bullet points and clear labels.
- **Balanced Reporting**: Includes both positive highlights AND issues.
- **Actionable**: Every recommendation includes WHAT, WHY, WHO, and HOW URGENT.
- **LLM Factory Integration**: Uses `get_llm()` for Groq (dev) / OpenAI (prod).
- **LangSmith Observability**: `@traceable` for latency and execution tracking.
- **Graceful Degradation**: Works with partial data (1-5 agents). Missing domains flagged.

## Usage Example

```python
import asyncio
from backend.app.ai.agents.inventory import InventoryAgent
from backend.app.ai.agents.shipment import ShipmentAgent
from backend.app.ai.agents.supplier import SupplierAgent
from backend.app.ai.agents.forecast import ForecastAgent
from backend.app.ai.agents.risk import RiskAgent
from backend.app.ai.agents.executive import ExecutiveAgent

async def main():
    # 1. Run all upstream agents (simplified - in production, run in parallel)
    question = "Prepare today's executive report."

    inv = await InventoryAgent(llm=get_llm()).analyze(question)
    ship = await ShipmentAgent().analyze(question)
    sup = await SupplierAgent().analyze(question)
    fc = await ForecastAgent().analyze(question)
    risk = await RiskAgent().analyze(
        question,
        inventory_analysis=inv,
        shipment_analysis=ship,
        supplier_analysis=sup,
        forecast_analysis=fc,
    )

    # 2. Generate executive summary
    exec_agent = ExecutiveAgent()
    report = await exec_agent.analyze(
        user_question=question,
        inventory_analysis=inv,
        shipment_analysis=ship,
        supplier_analysis=sup,
        forecast_analysis=fc,
        risk_analysis=risk,
    )

    # 3. Read the report
    print("EXECUTIVE SUMMARY")
    print("=" * 50)
    print(report.executive_summary)
    print(f"\nOverall Health: {report.overall_health}")
    print(f"\nHighlights:")
    for h in report.todays_highlights:
        print(f"  + {h}")
    print(f"\nCritical Issues:")
    for issue in report.critical_issues:
        print(f"  ! [{issue.urgency}] {issue.issue}")
    print(f"\nBusiness Impact: {report.business_impact}")
    print(f"\nImmediate Priorities:")
    for p in report.immediate_priorities:
        print(f"  {p}")
    print(f"\nConfidence: {report.confidence}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Output Schema

```json
{
  "executive_summary": "Operations are running smoothly with one area needing attention. Our laptop inventory is running low and may not meet next week's demand. All other departments are performing well.",
  "overall_health": "Needs Attention",
  "todays_highlights": [
    "Supplier performance is strong across top 5 vendors.",
    "Warehouse utilization is balanced at 72%.",
    "On-time delivery rate improved to 94%."
  ],
  "critical_issues": [
    {
      "issue": "Laptop stock will run out by Friday at current sales rates.",
      "impact": "Potential loss of 200+ customer orders worth approximately $150,000.",
      "urgency": "Immediate"
    }
  ],
  "business_impact": "Overall operations are healthy, but the laptop shortage could impact customer satisfaction and revenue this week if not addressed.",
  "top_risks": [
    "Laptop stockout within 5 business days.",
    "One supplier showing declining delivery performance.",
    "Seasonal demand increase expected in 3 weeks."
  ],
  "recommended_actions": [
    {
      "action": "Place emergency order for 500 laptops with our top-rated supplier.",
      "reason": "Current stock covers only 4 days of demand.",
      "priority": "Urgent",
      "owner": "Procurement Manager"
    }
  ],
  "immediate_priorities": [
    "1. Approve emergency laptop procurement order today.",
    "2. Schedule review meeting with underperforming supplier.",
    "3. Begin safety stock planning for upcoming seasonal demand."
  ],
  "confidence": 0.90
}
```

## Error Handling

| Failure | Behavior |
|---------|----------|
| Missing agent output | Reports domain as "Not assessed", adjusts confidence |
| 0 agents provided | Returns generic summary requesting manual review |
| LLM failure | Returns professional fallback with manual action steps |
| Invalid input | Gracefully handled via Pydantic validation |
| Unexpected exception | Logs error, returns structured fallback response |

## File Structure

```
backend/app/ai/agents/executive/
  +-- __init__.py       # Package exports
  +-- agent.py          # Core ExecutiveAgent class + inline formatters
  +-- chains.py         # with_structured_output chain
  +-- prompt.py         # Chief of Staff persona prompt
  +-- schemas.py        # ExecutiveSummaryResponse, CriticalIssue, ManagementRecommendation
  +-- state.py          # ExecutiveAgentState
  +-- README.md         # This file
```

## Note on utils.py

Unlike other agents, the Executive Agent embeds its formatting functions directly in `agent.py` rather than a separate `utils.py`. This keeps the module self-contained since the formatters are simpler (executive language only, no cross-domain correlation logic like the Risk Agent).
