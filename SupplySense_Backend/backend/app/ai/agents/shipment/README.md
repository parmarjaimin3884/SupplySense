# SupplySense Shipment Monitoring Agent

The `ShipmentAgent` is a production-ready LangChain AI assistant designed to act as a Senior Supply Chain Logistics Manager. It is responsible for continuously evaluating shipment health, detecting delays, identifying logistics bottlenecks, and issuing actionable business recommendations.

## Features
- **Independent Execution**: Orchestrates multiple underlying DB tools safely.
- **LLM Factory Integration**: Uses `get_llm()` to automatically select Groq (development) or OpenAI (production) based on environment configuration.
- **Strict Data Retrieval**: Uses predefined SQLAlchemy async tools; never runs direct SQL queries.
- **Structured Pydantic Outputs**: Returns `ShipmentAnalysisResponse` containing specific keys like `critical_shipments`, `delayed_shipments`, and `recommendations`.
- **LangSmith Observability**: Methods are decorated with `@traceable` for seamless latency and execution tracking.

## Usage Example

```python
import asyncio
from backend.app.ai.agents.shipment import ShipmentAgent

async def main():
    # 1. Instantiate the agent (Automatically gets the correct LLM from the factory)
    agent = ShipmentAgent()
    
    # 2. Analyze a business question
    questions = [
        "Which shipments are delayed today?",
        "Show shipment summary.",
        "Which supplier causes the highest shipment delay?",
        "Which shipment is critical?"
    ]
    
    for q in questions:
        print(f"\\nQuestion: {q}")
        response = await agent.analyze(q)
        
        print("Summary:", response.summary)
        print("Status:", response.shipment_status)
        print("Critical Shipments:", response.critical_shipments)
        print("Delayed Shipments:", response.delayed_shipments)
        print("Supplier Risk:", response.supplier_risk)
        print("Warehouse Risk:", response.warehouse_risk)
        print("Recommendations:", response.recommendations)
        print("Confidence:", response.confidence)

if __name__ == "__main__":
    asyncio.run(main())
```
