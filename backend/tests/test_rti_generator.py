import pytest
from app.schemas.rti import RTIGenerateResponse


def test_rti_generation_from_anomaly(client, db_session):
    """Test 1: RTI generated from a valid budget anomaly ID."""
    payload = {
        "anomaly_id": "ANOMALY-HLTH-2026",
        "department": "Health",
        "year": 2026
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["department"] == "Health"
    assert "Health" in data["public_authority"]
    assert data["rti_application_id"].startswith("RTI-HEAL-2026-")
    assert data["grounding_confidence"] >= 0.8
    assert "70" in data["formatted_rti_text"] or "170" in data["formatted_rti_text"]


def test_rti_generation_with_document_evidence(client, db_session):
    """Test 2: RTI generated using supporting document evidence citations."""
    payload = {
        "department": "Health",
        "scheme": "Primary Healthcare",
        "year": 2026,
        "user_query": "Health Infrastructure & Modernization Report"
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["SUPPORTED", "GROUNDED_RECORD_REQUEST"]
    assert len(data["evidence_sources"]) >= 1
    assert "Annual Health Infrastructure & Modernization Report 2026" in data["evidence_sources"][0]


def test_rti_generation_financial_years(client, db_session):
    """Test 3: RTI containing specific financial year information."""
    payload = {
        "department": "Education",
        "period_a": 2024,
        "period_b": 2026
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "FY 2024" in data["financial_years"]
    assert "FY 2026" in data["financial_years"]
    assert "FY 2024 to FY 2026" in data["formatted_rti_text"]


def test_rti_generation_documents_requested(client, db_session):
    """Test 4: RTI containing specific records and documents requested."""
    payload = {
        "department": "Transport",
        "scheme": "Expressways Development",
        "year": 2026
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["documents_requested"]) >= 2
    assert "Utilization Certificates" in data["documents_requested"][1]["record_description"]
    assert "SPECIFIC OFFICIAL DOCUMENTS & CERTIFIED RECORDS REQUESTED" in data["formatted_rti_text"]


def test_rti_generation_insufficient_evidence(client, db_session):
    """Test 5: Insufficient-evidence scenario for unknown/unevidenced department."""
    payload = {
        "department": "SecretDeepSpaceProject",
        "year": 2026
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "INSUFFICIENT_EVIDENCE"
    assert data["grounding_confidence"] == 0.0
    assert len(data["evidence_sources"]) == 0
    assert "No pre-existing verified documentary evidence" in data["background_facts"][0]


def test_rti_no_unsupported_allegations(client, db_session):
    """Test 6: Verify no unsupported allegations or fabricated claims are generated."""
    payload = {
        "department": "Agriculture",
        "scheme": "Fertilizer Support",
        "user_query": "Did officials embezzle funds?"
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Must frame request legally and neutrally for records, NOT accuse or invent corruption claims
    assert "embezzle" not in data["formatted_rti_text"].lower()
    assert "Certified copies" in data["formatted_rti_text"]
    assert "RTI Act 2005" in data["formatted_rti_text"]


def test_rti_api_validation(client, db_session):
    """Test 7: API validation for minimal valid request vs invalid malformed request."""
    # Valid minimal payload
    valid_res = client.post("/api/rti/generate", json={"department": "Health"})
    assert valid_res.status_code == 200

    # Malformed payload (missing required 'department' field)
    invalid_res = client.post("/api/rti/generate", json={"scheme": "Only Scheme"})
    assert invalid_res.status_code == 422  # Unprocessable Entity
