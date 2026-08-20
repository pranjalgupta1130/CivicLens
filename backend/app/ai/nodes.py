"""LangGraph Nodes for CivicLens Investigation Workflow.

Each node routes through the controlled investigation tools (ai.tools)
with bounded execution, deterministic steps, and zero-hallucination validation.
"""

from typing import Dict, Any, List, Optional
from .state import InvestigationState
from .schemas import AnomalyPayload, EvidenceDocument, InvestigationStatus, InvestigationResult
from .adapters import (
    Member2AdapterProtocol,
    Member3RAGAdapterProtocol,
    DemoMember2Adapter,
    DemoMember3RAGAdapter,
)
from .gemini import BaseGeminiClient, get_gemini_client
from .tools import (
    get_historical_spending,
    compare_budget_periods,
    search_budget_documents,
    get_source_metadata,
)



def receive_anomaly_node(
    state: InvestigationState,
    member2_adapter: Optional[Member2AdapterProtocol] = None,
) -> Dict[str, Any]:
    """Node 1: Receive and validate incoming anomaly payload."""
    adapter = member2_adapter or DemoMember2Adapter()
    raw_anomaly = state.get("anomaly")
    tool_calls = list(state.get("tool_calls", []))
    tool_errors = list(state.get("tool_errors", []))

    if not raw_anomaly:
        return {
            "error": "No anomaly provided to investigation workflow.",
            "status": "ERROR",
            "evidence_valid": False,
            "confidence": 0.0,
            "tool_calls": tool_calls,
            "tool_errors": ["No anomaly provided"],
        }

    # If an anomaly_id string was passed, resolve it via adapter
    if isinstance(raw_anomaly, str):
        tool_call_record = {
            "tool": "get_anomaly_data",
            "input": {"anomaly_id": raw_anomaly},
        }
        fetched = adapter.get_anomaly_data(raw_anomaly)
        if not fetched:
            tool_call_record["status"] = "NOT_FOUND"
            tool_calls.append(tool_call_record)
            tool_errors.append(f"Anomaly ID '{raw_anomaly}' not found.")
            return {
                "error": f"Anomaly ID '{raw_anomaly}' not found in backend records.",
                "status": "ERROR",
                "evidence_valid": False,
                "confidence": 0.0,
                "tool_calls": tool_calls,
                "tool_errors": tool_errors,
            }
        tool_call_record["status"] = "SUCCESS"
        tool_calls.append(tool_call_record)
        anomaly_dict = fetched.model_dump()
    elif isinstance(raw_anomaly, dict):
        anomaly_dict = raw_anomaly
    elif isinstance(raw_anomaly, AnomalyPayload):
        anomaly_dict = raw_anomaly.model_dump()
    else:
        return {
            "error": f"Invalid anomaly payload format: {type(raw_anomaly)}",
            "status": "ERROR",
            "evidence_valid": False,
            "confidence": 0.0,
            "tool_calls": tool_calls,
            "tool_errors": [f"Invalid anomaly payload format: {type(raw_anomaly)}"],
        }

    return {
        "anomaly": anomaly_dict,
        "status": "ANOMALY_RECEIVED",
        "error": None,
        "tool_calls": tool_calls,
        "tool_errors": tool_errors,
    }


def retrieve_historical_data_node(
    state: InvestigationState,
    member2_adapter: Optional[Member2AdapterProtocol] = None,
) -> Dict[str, Any]:
    """Node 2: Retrieve multi-year historical spending trends via controlled tool."""
    if state.get("error"):
        return {}

    anomaly = state.get("anomaly", {})
    dept = anomaly.get("department", "")
    curr_year = anomaly.get("year", 2026)
    prev_year = anomaly.get("previous_year", curr_year - 1)
    tool_calls = list(state.get("tool_calls", []))
    tool_errors = list(state.get("tool_errors", []))

    # Bounded historical range: preceding 4 years (max 10 years)
    start_year = max(2000, curr_year - 4)

    # 1. Call controlled tool: get_historical_spending
    hist_res = get_historical_spending(
        department=dept,
        start_year=start_year,
        end_year=curr_year,
        member2_adapter=member2_adapter,
    )
    tool_calls.append({
        "tool": "get_historical_spending",
        "input": {"department": dept, "start_year": start_year, "end_year": curr_year},
        "status": hist_res.get("status"),
    })

    records_data = hist_res.get("records", [])
    if hist_res.get("status") != "SUCCESS":
        tool_errors.append(f"Historical spending query: {hist_res.get('error', 'Failed')}")

    # 2. Call controlled tool: compare_budget_periods for period context
    comp_res = compare_budget_periods(
        department=dept,
        period_a=prev_year,
        period_b=curr_year,
        member2_adapter=member2_adapter,
    )
    tool_calls.append({
        "tool": "compare_budget_periods",
        "input": {"department": dept, "period_a": prev_year, "period_b": curr_year},
        "status": comp_res.get("status"),
    })

    historical_context = comp_res.get("comparison") if comp_res.get("status") == "SUCCESS" else None

    return {
        "historical_data": records_data,
        "historical_context": historical_context,
        "status": "HISTORICAL_DATA_RETRIEVED",
        "tool_calls": tool_calls,
        "tool_errors": tool_errors,
    }


def retrieve_supporting_evidence_node(
    state: InvestigationState,
    member3_adapter: Optional[Member3RAGAdapterProtocol] = None,
    top_k: int = 3,
) -> Dict[str, Any]:
    """Node 3: Retrieve documentary evidence chunks via controlled RAG & metadata tools."""
    if state.get("error"):
        return {}

    anomaly = state.get("anomaly", {})
    dept = anomaly.get("department", "")
    scheme = anomaly.get("scheme", "")
    year = anomaly.get("year", "")
    tool_calls = list(state.get("tool_calls", []))
    tool_errors = list(state.get("tool_errors", []))

    # Bounded query & top_k (1 to 5)
    bounded_top_k = max(1, min(5, top_k))
    query = f"{dept} {scheme} spending increase budget allocation FY {year}".strip()

    # 1. Call controlled tool: search_budget_documents
    search_res = search_budget_documents(
        query=query,
        department=dept,
        top_k=bounded_top_k,
        member3_adapter=member3_adapter,
    )
    tool_calls.append({
        "tool": "search_budget_documents",
        "input": {"query": query, "department": dept, "top_k": bounded_top_k},
        "status": search_res.get("status"),
        "count": search_res.get("count", 0),
    })

    evidence_data = search_res.get("results", [])
    if search_res.get("status") == "ERROR":
        tool_errors.append(f"Document search error: {search_res.get('error')}")

    # 2. Call controlled tool: get_source_metadata for each retrieved doc (bounded <= 5)
    source_metadata_list: List[Dict[str, Any]] = []
    for doc in evidence_data[:5]:
        doc_id = doc.get("document_id")
        if doc_id:
            meta_res = get_source_metadata(
                document_id=doc_id,
                member3_adapter=member3_adapter,
            )
            tool_calls.append({
                "tool": "get_source_metadata",
                "input": {"document_id": doc_id},
                "status": meta_res.get("status"),
            })
            if meta_res.get("status") == "SUCCESS" and "document" in meta_res:
                source_metadata_list.append(meta_res["document"])

    return {
        "retrieved_evidence": evidence_data,
        "evidence_count": len(evidence_data),
        "source_metadata": source_metadata_list,
        "status": "EVIDENCE_RETRIEVED",
        "tool_calls": tool_calls,
        "tool_errors": tool_errors,
    }


def validate_evidence_node(state: InvestigationState) -> Dict[str, Any]:
    """Node 4: Strictly validate evidence grounding before allowing LLM explanation.
    
    If evidence is missing, malformed, or lacks source metadata, sets evidence_valid=False.
    """
    if state.get("error"):
        return {"evidence_valid": False, "sources": []}

    retrieved = state.get("retrieved_evidence", [])

    if not retrieved:
        return {
            "evidence_valid": False,
            "sources": [],
            "status": "INSUFFICIENT_EVIDENCE",
        }

    # Validate that retrieved chunks have necessary citation fields
    valid_sources: List[Dict[str, Any]] = []
    for item in retrieved:
        if isinstance(item, dict):
            # Check presence of vital citation metadata
            has_title = bool(item.get("document_title"))
            has_text = bool(item.get("relevant_chunk_text"))
            has_id = bool(item.get("document_id"))
            if has_title and has_text and has_id:
                valid_sources.append(item)

    if not valid_sources:
        return {
            "evidence_valid": False,
            "sources": [],
            "status": "INSUFFICIENT_EVIDENCE",
        }

    return {
        "evidence_valid": True,
        "sources": valid_sources,
        "status": "EVIDENCE_VALIDATED",
    }


def generate_grounded_explanation_node(
    state: InvestigationState,
    gemini_client: Optional[BaseGeminiClient] = None,
) -> Dict[str, Any]:
    """Node 5: Generate zero-hallucination explanation via Gemini or fail safely."""
    if state.get("error"):
        return {}

    client = gemini_client or get_gemini_client()
    anomaly = state.get("anomaly", {})
    historical = state.get("historical_data", [])
    evidence_valid = state.get("evidence_valid", False)
    sources = state.get("sources", [])

    # CRITICAL EVIDENCE-FIRST RULE:
    # If evidence is invalid/missing, do NOT ask LLM to invent an explanation
    if not evidence_valid or not sources:
        result = InvestigationResult(
            summary="Insufficient evidence to determine the cause.",
            explanation=(
                f"Spending for {anomaly.get('department', 'Unknown')} changed by "
                f"{anomaly.get('percentage_change', 0.0):+.1f}%. However, no supporting "
                f"documentary evidence was found to explain the underlying policy or operational cause."
            ),
            key_figures=anomaly,
            evidence_status=InvestigationStatus.INSUFFICIENT_EVIDENCE,
            sources=[],
            confidence_score=0.0,
        )
        return {
            "investigation_result": result.model_dump(),
            "confidence": 0.0,
            "status": "INSUFFICIENT_EVIDENCE",
        }

    # Generate grounded explanation from verified sources
    result = client.generate_explanation(
        anomaly=anomaly,
        historical_data=historical,
        evidence=sources,
    )

    return {
        "investigation_result": result.model_dump(),
        "confidence": result.confidence_score,
        "status": "EXPLANATION_GENERATED",
    }


def return_result_node(state: InvestigationState) -> Dict[str, Any]:
    """Node 6: Finalize state and prepare result for user/API delivery."""
    if state.get("error"):
        return {
            "status": "COMPLETED_WITH_ERROR",
            "confidence": 0.0,
        }

    is_supported = state.get("evidence_valid", False)
    final_status = "COMPLETED_SUPPORTED" if is_supported else "COMPLETED_INSUFFICIENT_EVIDENCE"

    return {
        "status": final_status,
    }
