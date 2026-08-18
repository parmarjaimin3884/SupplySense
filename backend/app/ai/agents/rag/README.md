# SupplySense Enterprise RAG Knowledge Agent

The `RAGAgent` answers enterprise knowledge questions by retrieving relevant company documents from a vector store and generating grounded, source-cited answers. It NEVER fabricates company policy or answers from its own training data.

## Architecture

```
User Question
      |
      v
+----------------------------------+
|  RAGAgent.analyze()              |
|  +----------------------------+  |
|  | Strategy Selection         |  |
|  | (similarity vs MMR)        |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | Vector Store Retrieval     |  |
|  | (ChromaDB / configurable)  |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | Context Formatting         |  |
|  | (numbered docs + metadata) |  |
|  +------------+---------------+  |
|               |                  |
|  +----------------------------+  |
|  | LLM Reasoning              |  |
|  | (grounded on context only) |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  +----------------------------+  |
|  | Structuring Chain          |  |
|  | (with_structured_output)   |  |
|  +------------+---------------+  |
|               |                  |
|               v                  |
|  RAGResponse                     |
|  (answer + sources + confidence) |
+----------------------------------+
```

## Key Differences from Other Agents

| Feature | Operational Agents | Risk/Executive | RAG Agent |
|---------|-------------------|----------------|-----------|
| Data Source | PostgreSQL (tools) | Agent outputs | Vector Store |
| LangChain Tools | Yes | No | No |
| AgentExecutor | Yes | No | No |
| Architecture | Tool-calling | Pure LLM chain | Retrieval + LLM chain |
| Grounding | DB data | Agent findings | Retrieved documents |

## Features

- **Dual Retrieval**: Similarity search (factual queries) and MMR (exploratory queries).
- **Auto Strategy Selection**: Heuristically picks the best retrieval method based on query type.
- **Metadata Filtering**: Filter by document category, source, or any custom metadata.
- **Source Citations**: Every answer cites specific documents.
- **No Hallucination**: Refuses to answer if documents don't contain the information.
- **Scope Boundaries**: Redirects operational queries to appropriate agents.
- **LLM Factory**: Uses `get_llm()` for Groq (dev) / OpenAI (prod).
- **LangSmith Tracing**: `@traceable` for retrieval and LLM latency tracking.
- **Graceful Error Handling**: Returns valid schema on any failure.

## Knowledge Sources

The vector store should contain documents such as:

| Document Type | Examples |
|---------------|----------|
| Policies | Procurement Policy, Return Policy, Inventory Policy |
| SOPs | Warehouse SOP, Emergency SOP |
| Contracts | Supplier Contracts, Vendor Agreements |
| Guidelines | Quality Guidelines, Warehouse Safety Manual |
| Compliance | Audit Checklist, Compliance Documents |
| Corporate | Company Rules |

## Environment Configuration

```env
# Embedding Configuration
EMBEDDING_PROVIDER=huggingface          # or 'openai'
HUGGINGFACE_EMBEDDING_MODEL=all-MiniLM-L6-v2
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Vector Store Configuration
VECTORSTORE_PROVIDER=chroma
CHROMA_PERSIST_DIR=./chroma_db
CHROMA_COLLECTION=supplysense_knowledge
```

## Usage Example

```python
import asyncio
from backend.app.ai.agents.rag import RAGAgent

async def main():
    agent = RAGAgent()

    questions = [
        "What is our return policy?",
        "Explain procurement policy.",
        "How should damaged inventory be handled?",
        "What are supplier payment terms?",
    ]

    for q in questions:
        print(f"\nQ: {q}")
        response = await agent.analyze(q)

        print(f"Summary: {response.summary}")
        print(f"Answer: {response.answer}")
        print(f"Sources: {response.sources}")
        print(f"Confidence: {response.confidence}")
        print(f"Documents Retrieved: {len(response.retrieved_documents)}")

if __name__ == "__main__":
    asyncio.run(main())
```

### With Metadata Filtering

```python
# Only search policy documents
response = await agent.analyze(
    "What is our return policy?",
    filter_metadata={"category": "Policy"},
)

# Force MMR retrieval for diverse results
response = await agent.analyze(
    "Explain all warehouse safety procedures.",
    retrieval_method="mmr",
    top_k=8,
)
```

## Output Schema

```json
{
  "summary": "The return policy allows returns within 30 days of delivery.",
  "answer": "According to the Return Policy (v2.1), customers may return products within 30 days of delivery provided the items are in original packaging. Damaged items follow a separate process outlined in Section 4.2. (Source: Return Policy v2.1, Section 2.1)",
  "sources": ["Return Policy v2.1"],
  "confidence": 0.88,
  "retrieved_documents": [
    {
      "content": "Section 2.1: Returns are accepted within 30 calendar days...",
      "source": "Return Policy v2.1",
      "page": 3,
      "category": "Policy",
      "relevance_score": 0.92
    }
  ]
}
```

## Error Handling

| Failure | Behavior |
|---------|----------|
| No documents found | Returns answer stating info not found, confidence ~0.1 |
| Empty retrieval | Explicitly states knowledge gap, suggests contacting department |
| Retriever failure | Logs error, returns graceful fallback response |
| LLM failure | Returns valid RAGResponse with confidence=0.0 |
| Invalid query | Handled gracefully with low-confidence response |

## File Structure

```
backend/app/ai/agents/rag/
  +-- __init__.py       # Package exports
  +-- agent.py          # Core RAGAgent class
  +-- chains.py         # with_structured_output chain
  +-- prompt.py         # Enterprise Knowledge Assistant prompt
  +-- retriever.py      # Vector store + embeddings factory + retrieval functions
  +-- schemas.py        # RAGResponse, RetrievedDocument
  +-- state.py          # RAGAgentState
  +-- utils.py          # Context formatting, confidence scoring, strategy selection
  +-- README.md         # This file
```
