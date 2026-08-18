# SupplySense Inventory Agent

The `InventoryAgent` is a production-ready LangChain AI assistant designed to act as a Senior Enterprise Inventory Analyst. It operates completely independently of other workflows or agents, ensuring it fulfills the sole responsibility of analyzing inventory health and recommending business actions.

## Features
- **Strict Data Retrieval**: Uses predefined, safe SQLAlchemy asynchronous tools. Does *not* query PostgreSQL directly.
- **No Hallucinations**: Prompted to strictly rely on the data returned by the tool layer.
- **Structured Outputs**: Returns a Pydantic `InventoryAnalysisResponse` schema for predictable API consumption.

## Usage Example

```python
import asyncio
import os
from langchain_groq import ChatGroq
# from langchain_openai import ChatOpenAI # (For future migration)

from backend.app.ai.agents.inventory import InventoryAgent

async def main():
    # 1. Initialize the LLM (Using Groq now, easily swappable to OpenAI later)
    llm = ChatGroq(model="llama3-70b-8192", temperature=0.0)
    # Future OpenAI usage: llm = ChatOpenAI(model="gpt-4", temperature=0.0)
    
    # 2. Instantiate the agent
    agent = InventoryAgent(llm=llm)
    
    # 3. Analyze a business question
    questions = [
        "What products are running low?",
        "Show dead stock.",
        "Which warehouse has inventory imbalance?",
        "What should I reorder this week?"
    ]
    
    for q in questions:
        print(f"\\nQuestion: {q}")
        response = await agent.analyze(q)
        
        print("Summary:", response.summary)
        print("Risks:", response.risks)
        print("Recommendations:", response.recommendations)
        print("Status:", response.inventory_status)
        print("Confidence:", response.confidence)

if __name__ == "__main__":
    asyncio.run(main())
```
