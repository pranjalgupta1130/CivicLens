"""Tests for Evidence Validation and Zero-Hallucination Grounding."""

import pytest
from app.ai.state import InvestigationState
from app.ai.nodes import validate_evidence_node, generate_grounded_explanation_node
from app.ai.gemini import MockGeminiAdapter
from app.ai.schemas import InvestigationStatus


def test_validate_evidence_with_valid_documents():
    state: InvestigationState = {
        "retrieved_evidence": [
            {
                "document_id": "DOC-01",
                "document_title": "Budget Document 2026",
                "page_number": 12,
                "relevant_chunk_text": "Medical clinic modernization funds.",
                "source_url": "https://civiclens.demo/doc.pdf",
            }
        ]
    }
    result = validate_evidence_node(state)
    assert result["evidence_valid"] is True
    assert result["status"] == "EVIDENCE_VALIDATED"
    assert len(result["sources"]) == 1


def test_validate_evidence_with_empty_documents():
    state: InvestigationState = {
        "retrieved_evidence": []
    }
    result = validate_evidence_node(state)
    assert result["evidence_valid"] is False
    assert result["status"] == "INSUFFICIENT_EVIDENCE"
    assert result["sources"] == []


def test_validate_evidence_with_malformed_documents():
    state: InvestigationState = {
        "retrieved_evidence": [
            {"invalid_key": "some text without title or chunk"}
        ]
    }
    result = validate_evidence_node(state)
    assert result["evidence_valid"] is False
    assert result["status"] == "INSUFFICIENT_EVIDENCE"
    assert result["sources"] == []


def test_explanation_generation_when_evidence_invalid_or_missing():
    """Verify that empty/invalid evidence NEVER triggers an invented LLM explanation."""
    state: InvestigationState = {
        "anomaly": {
            "department": "Transport",
            "scheme": "Road Maintenance",
            "year": 2026,
            "previous_spending": 200.0,
            "current_spending": 350.0,
            "percentage_change": 75.0,
        },
        "historical_data": [],
        "evidence_valid": False,
        "sources": [],
    }

    mock_client = MockGeminiAdapter()
    result = generate_grounded_explanation_node(state, gemini_client=mock_client)

    inv_result = result["investigation_result"]
    assert inv_result["summary"] == "Insufficient evidence to determine the cause."
    assert inv_result["evidence_status"] == InvestigationStatus.INSUFFICIENT_EVIDENCE.value
    assert result["confidence"] == 0.0
    assert result["status"] == "INSUFFICIENT_EVIDENCE"
    assert len(inv_result["sources"]) == 0


def test_explanation_generation_with_valid_evidence():
    state: InvestigationState = {
        "anomaly": {
            "department": "Health",
            "scheme": "Primary Healthcare",
            "year": 2026,
            "previous_spending": 100.0,
            "current_spending": 170.0,
            "percentage_change": 70.0,
        },
        "historical_data": [],
        "evidence_valid": True,
        "sources": [
            {
                "document_id": "DOC-HLTH-2026-01",
                "document_title": "Annual Health Infrastructure Report 2026",
                "page_number": 14,
                "relevant_chunk_text": "Equipment procurement for rural clinics.",
                "source_url": "https://civiclens.demo/hlth.pdf",
            }
        ],
    }

    mock_client = MockGeminiAdapter()
    result = generate_grounded_explanation_node(state, gemini_client=mock_client)

    inv_result = result["investigation_result"]
    assert inv_result["evidence_status"] == InvestigationStatus.SUPPORTED.value
    assert "Annual Health Infrastructure Report 2026" in inv_result["summary"]
    assert "Page 14" in inv_result["explanation"]
    assert result["confidence"] >= 0.9
    assert len(inv_result["sources"]) == 1
