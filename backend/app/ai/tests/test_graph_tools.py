"""Integration tests for Controlled Tools connected to LangGraph Investigation Graph."""

import pytest
from ai.graph import create_investigation_graph, run_investigation
from ai.schemas import AnomalyPayload, InvestigationStatus, EvidenceDocument
from ai.adapters import (
    DemoMember2Adapter,
    DemoMember3RAGAdapter,
    Member2AdapterProtocol,
    Member3RAGAdapterProtocol,
)
from ai.gemini import MockGeminiAdapter


class FaultyMember2Adapter(DemoMember2Adapter):
    """Adapter where historical spending query fails."""
    def get_historical_spending(self, department: str, start_year: int, end_year: int):
        raise RuntimeError("Historical DB timeout")


class FaultyMember3RAGAdapter(DemoMember3RAGAdapter):
    """Adapter where RAG search fails."""
    def retrieve_supporting_evidence(self, query: str, department: str, top_k: int = 3):
        raise RuntimeError("Vector DB connection refused")


class EmptyMetadataMember3RAGAdapter(DemoMember3RAGAdapter):
    """Adapter returning doc chunks with missing metadata (incomplete citations)."""
    def retrieve_supporting_evidence(self, query: str, department: str, top_k: int = 3):
        return [
            EvidenceDocument(
                document_id="",
                document_title="",
                page_number=None,
                relevant_chunk_text="",
                source_url=None,
            )
        ]


def test_full_investigation_flow_with_controlled_tools():
    """Verify end-to-end investigation utilizes controlled tools and logs tool calls."""
    demo_anomaly = AnomalyPayload(
        anomaly_id="ANOMALY-HLTH-2026",
        department="Health",
        scheme="Primary Healthcare",
        year=2026,
        previous_year=2025,
        previous_spending=100.0,
        current_spending=170.0,
        percentage_change=70.0,
        status="FLAGGED",
    )

    result = run_investigation(
        anomaly=demo_anomaly,
        gemini_client=MockGeminiAdapter(),
    )

    assert result["status"] == "COMPLETED_SUPPORTED"
    assert result["evidence_valid"] is True
    assert result["evidence_count"] >= 1
    assert len(result["sources"]) >= 1

    # Verify tool calls are tracked and bounded
    tool_calls = result.get("tool_calls", [])
    assert len(tool_calls) > 0
    assert len(tool_calls) <= 10  # Bounded execution

    tool_names = [tc["tool"] for tc in tool_calls]
    assert "get_historical_spending" in tool_names
    assert "compare_budget_periods" in tool_names
    assert "search_budget_documents" in tool_names
    assert "get_source_metadata" in tool_names

    # Verify historical context enrichment
    assert result.get("historical_context") is not None
    assert result["historical_context"]["absolute_change"] == 70.0

    # Verify source metadata preservation
    source_meta = result.get("source_metadata", [])
    assert len(source_meta) >= 1
    assert source_meta[0]["document_id"] == "DOC-HLTH-2026-01"
    assert source_meta[0]["page_number"] == 14


def test_empty_rag_result_prevents_hallucination():
    """Verify that when no documentary evidence is found, graph never invents a cause."""
    anomaly = AnomalyPayload(
        anomaly_id="ANOMALY-AGRI-2026",
        department="Agriculture",
        scheme="Crop Insurance",
        year=2026,
        previous_year=2025,
        previous_spending=300.0,
        current_spending=600.0,
        percentage_change=100.0,
        status="FLAGGED",
    )

    result = run_investigation(
        anomaly=anomaly,
        gemini_client=MockGeminiAdapter(),
    )

    assert result["status"] == "COMPLETED_INSUFFICIENT_EVIDENCE"
    assert result["evidence_valid"] is False
    assert result["confidence"] == 0.0
    assert result["evidence_count"] == 0

    inv_result = result["investigation_result"]
    assert inv_result["summary"] == "Insufficient evidence to determine the cause."
    assert inv_result["evidence_status"] == InvestigationStatus.INSUFFICIENT_EVIDENCE.value
    assert len(inv_result["sources"]) == 0


def test_malformed_empty_metadata_treated_as_insufficient_evidence():
    """Verify evidence lacking title/id/text is flagged as invalid."""
    demo_anomaly = AnomalyPayload(
        anomaly_id="ANOMALY-HLTH-2026",
        department="Health",
        scheme="Primary Healthcare",
        year=2026,
        previous_year=2025,
        previous_spending=100.0,
        current_spending=170.0,
        percentage_change=70.0,
        status="FLAGGED",
    )

    result = run_investigation(
        anomaly=demo_anomaly,
        member3_adapter=EmptyMetadataMember3RAGAdapter(),
        gemini_client=MockGeminiAdapter(),
    )

    assert result["status"] == "COMPLETED_INSUFFICIENT_EVIDENCE"
    assert result["evidence_valid"] is False
    assert result["confidence"] == 0.0


def test_graceful_handling_of_adapter_failures():
    """Verify graph does not crash when tool queries encounter exceptions."""
    demo_anomaly = AnomalyPayload(
        anomaly_id="ANOMALY-HLTH-2026",
        department="Health",
        scheme="Primary Healthcare",
        year=2026,
        previous_year=2025,
        previous_spending=100.0,
        current_spending=170.0,
        percentage_change=70.0,
        status="FLAGGED",
    )

    # Historical spending fails
    res_m2_fail = run_investigation(
        anomaly=demo_anomaly,
        member2_adapter=FaultyMember2Adapter(),
        gemini_client=MockGeminiAdapter(),
    )
    assert res_m2_fail is not None
    assert len(res_m2_fail.get("tool_errors", [])) > 0

    # RAG fails
    res_m3_fail = run_investigation(
        anomaly=demo_anomaly,
        member3_adapter=FaultyMember3RAGAdapter(),
        gemini_client=MockGeminiAdapter(),
    )
    assert res_m3_fail["status"] == "COMPLETED_INSUFFICIENT_EVIDENCE"
    assert len(res_m3_fail.get("tool_errors", [])) > 0


def test_bounded_tool_execution_limits():
    """Verify top_k is strictly bounded and tool calls do not loop."""
    demo_anomaly = AnomalyPayload(
        anomaly_id="ANOMALY-HLTH-2026",
        department="Health",
        scheme="Primary Healthcare",
        year=2026,
        previous_year=2025,
        previous_spending=100.0,
        current_spending=170.0,
        percentage_change=70.0,
        status="FLAGGED",
    )

    app = create_investigation_graph()
    initial_state = {
        "anomaly": demo_anomaly.model_dump(),
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
    assert len(final_state["tool_calls"]) <= 8  # Strictly bounded deterministic steps
