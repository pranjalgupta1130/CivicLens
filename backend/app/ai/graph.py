"""CivicLens LangGraph Investigation Workflow.

Defines the 6-node deterministic investigation state graph.
"""

from typing import Optional, Dict, Any, Union
from functools import partial
from langgraph.graph import StateGraph, START, END
from langgraph.graph.state import CompiledStateGraph

from .state import InvestigationState
from .schemas import AnomalyPayload
from .adapters import (
    Member2AdapterProtocol,
    Member3RAGAdapterProtocol,
    DemoMember2Adapter,
    DemoMember3RAGAdapter,
)
from .gemini import BaseGeminiClient, get_gemini_client
from .nodes import (
    receive_anomaly_node,
    retrieve_historical_data_node,
    retrieve_supporting_evidence_node,
    validate_evidence_node,
    generate_grounded_explanation_node,
    return_result_node,
)



def create_investigation_graph(
    member2_adapter: Optional[Member2AdapterProtocol] = None,
    member3_adapter: Optional[Member3RAGAdapterProtocol] = None,
    gemini_client: Optional[BaseGeminiClient] = None,
) -> CompiledStateGraph:
    """Build and compile the CivicLens LangGraph investigation workflow.
    
    Workflow Topology:
        START -> receive_anomaly
              -> retrieve_historical_data
              -> retrieve_supporting_evidence
              -> validate_evidence
              -> generate_grounded_explanation
              -> return_result
              -> END
    """
    m2_adapter = member2_adapter or DemoMember2Adapter()
    m3_adapter = member3_adapter or DemoMember3RAGAdapter()
    client = gemini_client or get_gemini_client()

    # Create StateGraph
    workflow = StateGraph(InvestigationState)

    # Bind node handlers with injected adapters
    workflow.add_node(
        "receive_anomaly",
        partial(receive_anomaly_node, member2_adapter=m2_adapter),
    )
    workflow.add_node(
        "retrieve_historical_data",
        partial(retrieve_historical_data_node, member2_adapter=m2_adapter),
    )
    workflow.add_node(
        "retrieve_supporting_evidence",
        partial(retrieve_supporting_evidence_node, member3_adapter=m3_adapter),
    )
    workflow.add_node("validate_evidence", validate_evidence_node)
    workflow.add_node(
        "generate_grounded_explanation",
        partial(generate_grounded_explanation_node, gemini_client=client),
    )
    workflow.add_node("return_result", return_result_node)

    # Sequential edges
    workflow.add_edge(START, "receive_anomaly")
    workflow.add_edge("receive_anomaly", "retrieve_historical_data")
    workflow.add_edge("retrieve_historical_data", "retrieve_supporting_evidence")
    workflow.add_edge("retrieve_supporting_evidence", "validate_evidence")
    workflow.add_edge("validate_evidence", "generate_grounded_explanation")
    workflow.add_edge("generate_grounded_explanation", "return_result")
    workflow.add_edge("return_result", END)

    return workflow.compile()


def run_investigation(
    anomaly: Union[str, Dict[str, Any], AnomalyPayload],
    member2_adapter: Optional[Member2AdapterProtocol] = None,
    member3_adapter: Optional[Member3RAGAdapterProtocol] = None,
    gemini_client: Optional[BaseGeminiClient] = None,
) -> InvestigationState:
    """Execute end-to-end investigation workflow for a given anomaly input."""
    app = create_investigation_graph(
        member2_adapter=member2_adapter,
        member3_adapter=member3_adapter,
        gemini_client=gemini_client,
    )

    initial_state: InvestigationState = {
        "anomaly": anomaly.model_dump() if hasattr(anomaly, "model_dump") else anomaly,
        "historical_data": [],
        "historical_context": None,
        "retrieved_evidence": [],
        "evidence_count": 0,
        "evidence_valid": False,
        "sources": [],
        "source_metadata": [],
        "tool_calls": [],
        "tool_errors": [],
        "investigation_result": None,
        "confidence": 0.0,
        "status": "INITIALIZED",
        "error": None,
    }

    final_state = app.invoke(initial_state)
    return final_state

