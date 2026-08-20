"""End-to-End Tests for CivicLens LangGraph Investigation Workflow."""

import os
from app.ai.graph import create_investigation_graph, run_investigation
from app.ai.schemas import AnomalyPayload, InvestigationStatus
from app.ai.adapters import DemoMember2Adapter, DemoMember3RAGAdapter
from app.ai.gemini import MockGeminiAdapter


def test_graph_compilation():
    """Verify that LangGraph StateGraph compiles successfully."""
    graph = create_investigation_graph()
    assert graph is not None


def test_end_to_end_demo_investigation_supported():
    """Verify full workflow on the primary demo scenario (Health +70%)."""
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

    mock_gemini = MockGeminiAdapter()
    result_state = run_investigation(
        anomaly=demo_anomaly,
        gemini_client=mock_gemini,
    )

    assert result_state["status"] == "COMPLETED_SUPPORTED"
    assert result_state["evidence_valid"] is True
    assert len(result_state["historical_data"]) > 0
    assert len(result_state["retrieved_evidence"]) > 0

    inv_result = result_state["investigation_result"]
    assert inv_result is not None
    assert inv_result["evidence_status"] == InvestigationStatus.SUPPORTED.value
    assert len(inv_result["sources"]) == 1
    assert inv_result["sources"][0]["document_id"] == "DOC-HLTH-2026-01"
    assert result_state["confidence"] >= 0.9


def test_end_to_end_investigation_insufficient_evidence():
    """Verify full workflow when no supporting evidence exists (Transport department)."""
    unsupported_anomaly = AnomalyPayload(
        anomaly_id="ANOMALY-TRANS-2026",
        department="Transport",
        scheme="Highway Expansion",
        year=2026,
        previous_year=2025,
        previous_spending=500.0,
        current_spending=850.0,
        percentage_change=70.0,
        status="FLAGGED",
    )

    mock_gemini = MockGeminiAdapter()
    result_state = run_investigation(
        anomaly=unsupported_anomaly,
        gemini_client=mock_gemini,
    )

    assert result_state["status"] == "COMPLETED_INSUFFICIENT_EVIDENCE"
    assert result_state["evidence_valid"] is False
    assert result_state["confidence"] == 0.0

    inv_result = result_state["investigation_result"]
    assert inv_result is not None
    assert inv_result["summary"] == "Insufficient evidence to determine the cause."
    assert inv_result["evidence_status"] == InvestigationStatus.INSUFFICIENT_EVIDENCE.value
    assert len(inv_result["sources"]) == 0


def test_investigation_with_anomaly_id_string():
    """Verify that passing an anomaly ID string resolves through Member 2 adapter."""
    mock_gemini = MockGeminiAdapter()
    result_state = run_investigation(
        anomaly="ANOMALY-HLTH-2026",
        gemini_client=mock_gemini,
    )

    assert result_state["status"] == "COMPLETED_SUPPORTED"
    assert result_state["anomaly"]["department"] == "Health"
    assert result_state["evidence_valid"] is True


def test_investigation_with_invalid_anomaly_id():
    """Verify graceful handling when anomaly ID does not exist."""
    result_state = run_investigation(anomaly="NON_EXISTENT_ID")
    assert result_state["status"] == "COMPLETED_WITH_ERROR"
    assert "not found" in result_state["error"]


def test_no_hardcoded_secrets_in_repo():
    """Safety check ensuring no real API keys are committed in code."""
    from app.ai.config import GEMINI_API_KEY
    assert not GEMINI_API_KEY.startswith("AIzaSy"), "Real Google API key detected in code!"
