"""
SupplySense - Enterprise RAG Knowledge Agent
Answers enterprise knowledge questions using retrieval-augmented generation.

This agent retrieves relevant company documents from a vector store
and generates grounded, source-cited answers. It NEVER answers from
its own memory for questions that should come from company documents.

It does NOT handle live operational queries (inventory, shipments, etc.)
"""

import logging
import time
from typing import Optional, Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage
from langsmith import traceable

from backend.app.ai.llm import get_llm
from backend.app.ai.agents.rag.prompt import RAG_AGENT_SYSTEM_PROMPT
from backend.app.ai.agents.rag.schemas import RAGResponse, RetrievedDocument
from backend.app.ai.agents.rag.state import RAGAgentState
from backend.app.ai.agents.rag.chains import get_structuring_chain
from backend.app.ai.agents.rag.retriever import (
    retrieve_documents_similarity,
    retrieve_documents_mmr,
)
from backend.app.ai.agents.rag.utils import (
    format_retrieved_context,
    compute_retrieval_confidence,
    extract_unique_sources,
    select_retrieval_strategy,
)

logger = logging.getLogger(__name__)


class RAGAgent:
    """
    Enterprise RAG Knowledge Agent.

    Answers company knowledge questions by retrieving relevant documents
    from the vector store and generating grounded, source-cited answers.

    Pipeline:
        1. Select retrieval strategy (similarity vs MMR)
        2. Retrieve relevant documents from vector store
        3. Format retrieved context
        4. LLM reasoning with retrieved context
        5. Structure output into validated RAGResponse

    Scope:
        - Company policies and SOPs
        - Supplier contracts and agreements
        - Warehouse guidelines and safety manuals
        - Compliance and audit documents
        - Return and procurement policies

    NOT in scope:
        - Live inventory data (use Inventory Agent)
        - Shipment tracking (use Shipment Agent)
        - Supplier performance (use Supplier Agent)
        - Demand forecasting (use Forecast Agent)
        - Risk assessment (use Risk Agent)
    """

    def __init__(self) -> None:
        """
        Initializes the RAG Knowledge Agent.
        Automatically obtains the LLM from the global factory.
        """
        self.llm = get_llm()

    @traceable(name="rag_agent_analyze")
    async def analyze(
        self,
        user_question: str,
        retrieval_method: Optional[str] = None,
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> RAGResponse:
        """
        Answers an enterprise knowledge question using RAG.

        Args:
            user_question: The user's question about company knowledge.
            retrieval_method: Override retrieval strategy ('similarity' or 'mmr').
                              If None, auto-selected based on query analysis.
            top_k: Number of documents to retrieve (default: 5).
            filter_metadata: Optional metadata filter for retrieval
                             (e.g., {"category": "Policy"}).

        Returns:
            RAGResponse: Grounded answer with sources, confidence,
            and retrieved documents.
        """
        start_time = time.time()
        state = RAGAgentState(user_question=user_question)

        try:
            # -- Step 1: Select retrieval strategy -----------------------------
            method = retrieval_method or select_retrieval_strategy(user_question)
            state.detected_intent = method
            logger.info(
                f"RAGAgent processing: '{user_question}' | "
                f"Strategy: {method} | top_k: {top_k}"
            )

            # -- Step 2: Retrieve documents ------------------------------------
            if method == "mmr":
                chunks = await retrieve_documents_mmr(
                    query=user_question,
                    k=top_k,
                    filter_metadata=filter_metadata,
                )
            else:
                chunks = await retrieve_documents_similarity(
                    query=user_question,
                    k=top_k,
                    filter_metadata=filter_metadata,
                )

            state.record_retrieval(chunks, method)
            logger.info(
                f"RAGAgent retrieved {len(chunks)} document(s) via {method}."
            )

            # -- Step 3: Format context ----------------------------------------
            context_text = format_retrieved_context(chunks)
            state.context_text = context_text

            # -- Step 4: LLM reasoning with retrieved context ------------------
            system_prompt = RAG_AGENT_SYSTEM_PROMPT.replace(
                "{context}", context_text
            )

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_question),
            ]

            raw_response = await self.llm.ainvoke(messages)
            raw_output = raw_response.content

            logger.info("RAGAgent completed LLM reasoning pass.")

            # -- Step 5: Structure the output ----------------------------------
            structuring_chain = get_structuring_chain(self.llm)

            # Pre-compute sources and confidence for the structuring prompt
            sources = extract_unique_sources(chunks)
            retrieval_confidence = compute_retrieval_confidence(chunks)

            retrieved_docs_json = []
            for c in chunks:
                retrieved_docs_json.append({
                    "content": c.get("content", "")[:500],
                    "source": c.get("source"),
                    "page": c.get("page"),
                    "category": c.get("category"),
                    "relevance_score": c.get("relevance_score"),
                })

            formatting_prompt = (
                f"You are a strict data formatter for an enterprise knowledge system. "
                f"Convert the following RAG answer into the required JSON schema.\n\n"
                f"User Question: {user_question}\n"
                f"Answer to Format:\n{raw_output}\n\n"
                f"Retrieved Sources: {sources}\n"
                f"Retrieval Confidence: {retrieval_confidence}\n"
                f"Number of Documents Retrieved: {len(chunks)}\n\n"
                f"RULES:\n"
                f"- 'summary' should be a concise one-line answer.\n"
                f"- 'answer' should contain the full detailed answer with source citations.\n"
                f"- 'sources' should list the document names used.\n"
                f"- 'confidence' should reflect retrieval quality "
                f"(suggested: {retrieval_confidence}).\n"
                f"- 'retrieved_documents' should contain the document chunks used.\n"
                f"- If no documents were found, set confidence to 0.1 and state that clearly.\n"
                f"- Strictly adhere to the RAGResponse schema.\n"
                f"- DO NOT add information not present in the answer above."
            )

            final_response: RAGResponse = await structuring_chain.ainvoke(
                formatting_prompt
            )

            # -- Record final state --------------------------------------------
            state.final_response = final_response
            state.confidence_score = final_response.confidence
            state.execution_metadata.duration_ms = (
                (time.time() - start_time) * 1000
            )

            logger.info(
                f"RAGAgent completed in "
                f"{state.execution_metadata.duration_ms:.0f}ms | "
                f"Documents: {len(chunks)} | "
                f"Sources: {len(sources)} | "
                f"Confidence: {final_response.confidence:.2f}"
            )

            return final_response

        except Exception as e:
            logger.error(f"RAGAgent execution failed: {e}", exc_info=True)
            state.error = str(e)
            state.execution_metadata.duration_ms = (
                (time.time() - start_time) * 1000
            )

            # Graceful fallback
            return RAGResponse(
                summary="Unable to retrieve information at this time.",
                answer=(
                    "I was unable to search the company knowledge base due to "
                    "a technical issue. Please try again or contact the IT team "
                    "if the problem persists."
                ),
                sources=[],
                confidence=0.0,
                retrieved_documents=[],
            )
