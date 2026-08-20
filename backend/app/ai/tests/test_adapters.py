"""Tests for Member 2 and Member 3 Demo Adapters."""

import pytest
from app.ai.adapters import DemoMember2Adapter, DemoMember3RAGAdapter
from app.ai.schemas import AnomalyPayload, EvidenceDocument


def test_member2_get_anomaly_data():
    adapter = DemoMember2Adapter()
    anomaly = adapter.get_anomaly_data("ANOMALY-HLTH-2026")
    assert anomaly is not None
    assert anomaly.department == "Health"
    assert anomaly.percentage_change == 70.0
    assert anomaly.previous_spending == 100.0
    assert anomaly.current_spending == 170.0


def test_member2_get_budget_record():
    adapter = DemoMember2Adapter()
    record = adapter.get_budget_record("Health", 2025)
    assert record is not None
    assert record["amount"] == 100.0
    assert record["year"] == 2025


def test_member2_get_historical_spending():
    adapter = DemoMember2Adapter()
    history = adapter.get_historical_spending("Health", 2023, 2026)
    assert len(history) == 4
    years = [r.year for r in history]
    assert years == [2023, 2024, 2025, 2026]


def test_member2_compare_budget_periods():
    adapter = DemoMember2Adapter()
    comparison = adapter.compare_budget_periods("Health", 2025, 2026)
    assert comparison["absolute_change"] == 70.0
    assert comparison["percentage_change"] == 70.0
    assert "[DEMO DATA" in comparison["note"]


def test_member3_rag_retrieval_matched():
    adapter = DemoMember3RAGAdapter()
    docs = adapter.retrieve_supporting_evidence(
        query="Health Primary Healthcare spending increase", department="Health", top_k=3
    )
    assert len(docs) >= 1
    doc = docs[0]
    assert isinstance(doc, EvidenceDocument)
    assert doc.document_id == "DOC-HLTH-2026-01"
    assert doc.page_number == 14
    assert "Primary Healthcare Expansion Scheme" in doc.relevant_chunk_text


def test_member3_rag_retrieval_empty_for_unknown():
    adapter = DemoMember3RAGAdapter()
    docs = adapter.retrieve_supporting_evidence(
        query="Transport Highway spending increase", department="Transport", top_k=3
    )
    assert docs == []
