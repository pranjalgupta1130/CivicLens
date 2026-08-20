import pytest
from app.schemas.assistant import AIAssistantResponse


def test_assistant_question_sufficient_evidence(client, db_session):
    """Test 1: Question with sufficient documentary evidence."""
    payload = {
        "question": "Why did healthcare spending increase in 2026?",
        "department": "Health",
        "year": 2026
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUPPORTED"
    assert data["confidence"] >= 0.9
    assert len(data["evidence"]) >= 1
    assert "Annual Health Infrastructure & Modernization Report 2026" in data["sources"][0]
    assert "170" in data["answer"] or "70" in data["answer"]


def test_assistant_question_year_comparison(client, db_session):
    """Test 2: Historical year comparison question."""
    payload = {
        "question": "Compare spending between FY 2025 and FY 2026 for Health",
        "department": "Health",
        "period_a": 2025,
        "period_b": 2026
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUPPORTED"
    assert data["confidence"] >= 0.9
    assert data["key_numbers"]["period_a"] == 2025
    assert data["key_numbers"]["period_b"] == 2026
    assert data["key_numbers"]["percentage_change"] == 70.0


def test_assistant_question_department_comparison(client, db_session):
    """Test 3: Department ranking/comparison question."""
    payload = {
        "question": "Which department changed the most between 2025 and 2026?",
        "period_a": 2025,
        "period_b": 2026
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUPPORTED"
    assert "Health" in data["answer"] or "key_numbers" in data
    assert "top_department" in data["key_numbers"] or "percentage_change" in data["key_numbers"]


def test_assistant_question_document_evidence_lookup(client, db_session):
    """Test 4: Question explicitly asking for documentary evidence & citations."""
    payload = {
        "question": "What evidence supports the Health department budget allocation?",
        "department": "Health"
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUPPORTED"
    assert len(data["evidence"]) >= 1
    assert data["evidence"][0]["document_id"] == "DOC-HLTH-2026-01"
    assert data["evidence"][0]["page_number"] == 14


def test_assistant_question_insufficient_evidence(client, db_session):
    """Test 5: Question where documentary evidence is missing."""
    payload = {
        "question": "Why did space research spending surge by 500% in FY 2026?",
        "department": "SpaceResearch",
        "year": 2026
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "INSUFFICIENT_EVIDENCE"
    assert data["confidence"] == 0.0
    assert len(data["evidence"]) == 0
    assert data["answer"] == "Insufficient evidence to determine the cause."


def test_assistant_zero_hallucination_verification(client, db_session):
    """Test 6: Verify no fabricated causes/citations are returned when evidence is unavailable."""
    payload = {
        "question": "What caused the secret unevidenced expansion in Nuclear Energy?",
        "department": "NuclearEnergy"
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Must NOT hallucinate a cause or invent fake source citations
    assert data["status"] == "INSUFFICIENT_EVIDENCE"
    assert data["confidence"] == 0.0
    assert data["sources"] == []
    assert "Insufficient evidence" in data["answer"]
