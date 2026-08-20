"""Tests for InvestigationState and Pydantic Schemas."""

import pytest
from ai.schemas import (
    AnomalyPayload,
    HistoricalSpendingRecord,
    EvidenceDocument,
    InvestigationStatus,
    InvestigationResult,
)
from ai.state import InvestigationState


def test_anomaly_payload_creation():
    payload = AnomalyPayload(
        anomaly_id="ANOMALY-001",
        department="Health",
        scheme="Primary Healthcare",
        year=2026,
        previous_year=2025,
        previous_spending=100.0,
        current_spending=170.0,
        percentage_change=70.0,
        status="FLAGGED",
    )
    assert payload.anomaly_id == "ANOMALY-001"
    assert payload.percentage_change == 70.0
    data = payload.model_dump()
    assert isinstance(data, dict)
    assert data["department"] == "Health"


def test_historical_record_creation():
    rec = HistoricalSpendingRecord(
        year=2025,
        amount=100.0,
        department="Health",
        scheme="Primary Healthcare",
    )
    assert rec.year == 2025
    assert rec.amount == 100.0


def test_evidence_document_creation():
    doc = EvidenceDocument(
        document_id="DOC-01",
        document_title="Budget Analysis 2026",
        page_number=14,
        relevant_chunk_text="Funds allocated for clinic upgrades.",
        source_url="https://civiclens.demo/doc.pdf",
    )
    assert doc.document_id == "DOC-01"
    assert doc.page_number == 14


def test_investigation_result_serialization():
    result = InvestigationResult(
        summary="Healthcare spending surged by 70%.",
        explanation="The increase was driven by equipment procurement.",
        key_figures={"previous_spending": 100.0, "current_spending": 170.0},
        evidence_status=InvestigationStatus.SUPPORTED,
        sources=[
            EvidenceDocument(
                document_id="DOC-01",
                document_title="Report",
                page_number=5,
                relevant_chunk_text="Text",
            )
        ],
        confidence_score=0.95,
    )
    dump = result.model_dump()
    assert dump["evidence_status"] == "SUPPORTED"
    assert dump["confidence_score"] == 0.95
    assert len(dump["sources"]) == 1


def test_investigation_state_typing():
    state: InvestigationState = {
        "anomaly": {"anomaly_id": "TEST-1", "department": "Health"},
        "historical_data": [],
        "retrieved_evidence": [],
        "evidence_valid": True,
        "sources": [],
        "investigation_result": None,
        "confidence": 0.0,
        "status": "INITIALIZED",
        "error": None,
    }
    assert state["status"] == "INITIALIZED"
    assert state["evidence_valid"] is True
