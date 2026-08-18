"""
SupplySense — LangGraph Supervisor State
Defines the TypedDict state used by LangGraph StateGraph.
Tracks intent, active agent selections, raw agent outputs,
merged results, and execution metadata.
"""

from typing import List, Dict, Any, Optional, TypedDict, Annotated
import operator


def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    """Reducer function to merge dictionaries from parallel graph nodes."""
    res = dict(a) if a else {}
    if b:
        res.update(b)
    return res


def merge_lists(a: List[str], b: List[str]) -> List[str]:
    """Reducer function to combine list entries from graph nodes."""
    res = list(a) if a else []
    if b:
        for item in b:
            if item not in res:
                res.append(item)
    return res


class SupervisorState(TypedDict, total=False):
    """
    LangGraph State dictionary shared across all supervisor graph nodes.

    Attributes:
        user_question: The original question or command from the user.
        conversation_history: List of prior turn dicts [{'role': 'user', 'content': '...'}, ...].
        query_type: Execution mode string ('direct_tool', 'agent', 'rag', 'unsupported_hybrid', 'unknown').
        intent: Classified IntentCategory string or RouterIntent string.
        intent_explanation: Reasoning for routing selection.
        selected_agents: List of selected agent names ('inventory', 'shipment', etc.).
        target_tool: Name of direct tool to invoke if query_type is 'direct_tool'.
        tool_parameters: Extracted entity parameters for tool call.
        agent_outputs: Dict storing agent outputs keyed by agent name.
                       Uses a reducer so parallel node executions update safely.
        merged_response: Final SupervisorResponse or dict populated by merge node.
        nodes_executed: Tracked list of graph nodes executed.
        confidence: Composite confidence score.
        status: Status string ('success', 'unsupported_workflow', 'clarification_needed', 'error').
        error: Optional error string if a failure occurred.
        start_time: Epoch timestamp when execution began.
        llm_calls_made: Number of LLM calls executed during graph traversal.
    """
    user_question: str
    conversation_history: List[Dict[str, str]]
    query_type: str
    intent: str
    intent_explanation: str
    selected_agents: List[str]
    target_tool: Optional[str]
    tool_parameters: Optional[Dict[str, Any]]
    agent_outputs: Annotated[Dict[str, Any], merge_dicts]
    merged_response: Dict[str, Any]
    nodes_executed: Annotated[List[str], merge_lists]
    confidence: float
    status: str
    error: Optional[str]
    start_time: float
    llm_calls_made: int

