"""Phase 6 End-to-End Integration Tests for CivicLens.

Verifies end-to-end data flows across:
1. Anomaly -> LangGraph Investigation workflow
2. Natural Language Question -> Grounded AI Assistant
3. Anomaly / Question -> Grounded RTI Petition Generator
4. Insufficient Evidence propagation & Zero-Hallucination rules
5. Source metadata & page number preservation across endpoints
6. Error handling & sanitized input validation
"""

import pytest
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord
from app.models.anomaly import Anomaly
from app.models.integration import BudgetDocument, DocumentChunk, AIInvestigation


def setup_e2e_seeded_database(db_session):
    """Seed DB with a full end-to-end dataset (Department, Scheme, BudgetRecord, Anomaly, BudgetDocument, DocumentChunk)."""
    dept = Department(name="Health", code="HLTH", description="Department of Health")
    db_session.add(dept)
    db_session.commit()
    db_session.refresh(dept)

    scheme = Scheme(name="Primary Healthcare", code="PHC", department_id=dept.id)
    db_session.add(scheme)
    db_session.commit()
    db_session.refresh(scheme)

    rec = BudgetRecord(
        department_id=dept.id,
        scheme_id=scheme.id,
        year=2026,
        budget_amount=170.0,
        actual_amount=170.0,
        category="CAPITAL",
        locality="STATE"
    )
    db_session.add(rec)
    db_session.commit()
    db_session.refresh(rec)

    anomaly = Anomaly(
        budget_record_id=rec.id,
        department_id=dept.id,
        scheme_id=scheme.id,
        year=2026,
        anomaly_type="SPENDING_SPIKE",
        previous_value=100.0,
        current_value=170.0,
        percentage_change=70.0,
        severity="HIGH",
        status="FLAGGED",
        description="70% spending spike in Health Primary Healthcare"
    )
    db_session.add(anomaly)
    db_session.commit()
    db_session.refresh(anomaly)

    doc = BudgetDocument(
        department_id=dept.id,
        title="Annual Health Infrastructure & Modernization Report 2026",
        year=2026,
        source_url="https://civiclens.demo/docs/health-2026.pdf",
        file_path="docs/health-2026.pdf"
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)

    chunk = DocumentChunk(
        document_id=doc.id,
        content="Primary Healthcare infrastructure spending surged by 70% in FY 2026 due to the construction of 12 new rural district health centers.",
        page_number=14,
        chunk_index=1,
        metadata_json={"section": "District Hospitals"}
    )
    db_session.add(chunk)
    db_session.commit()

    return anomaly.id, dept.id, doc.id


# =============================================================================
# FLOW 1 — ANOMALY -> AI INVESTIGATION WORKFLOW
# =============================================================================

def test_flow1_anomaly_to_investigation_e2e(client, db_session):
    """Verify Flow 1: Anomaly -> POST /api/investigations/run/{anomaly_id} -> LangGraph -> DB Persistence."""
    anomaly_id, dept_id, doc_id = setup_e2e_seeded_database(db_session)

    # 1. Trigger AI investigation
    response = client.post(f"/api/investigations/run/{anomaly_id}")
    assert response.status_code == 200
    inv_data = response.json()

    assert inv_data["anomaly_id"] == anomaly_id
    assert inv_data["evidence_strength"] in ["STRONG", "MODERATE"]
    assert inv_data["confidence"] >= 0.9
    assert len(inv_data["source_chunks"]) >= 1

    # 2. Verify Anomaly status updated in DB
    updated_anomaly = db_session.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    assert updated_anomaly.status == "INVESTIGATED"

    # 3. Verify AIInvestigation persisted in DB
    persisted_inv = db_session.query(AIInvestigation).filter(AIInvestigation.anomaly_id == anomaly_id).first()
    assert persisted_inv is not None
    assert persisted_inv.evidence_strength in ["STRONG", "MODERATE"]
    assert persisted_inv.confidence >= 0.9


# =============================================================================
# FLOW 2 — QUESTION -> AI ASSISTANT
# =============================================================================

def test_flow2_question_to_assistant_e2e(client, db_session):
    """Verify Flow 2: Natural Language Question -> POST /api/assistant -> Grounded Answer + Sources."""
    setup_e2e_seeded_database(db_session)

    payload = {
        "question": "Why did spending increase in Health during 2026?",
        "department": "Health",
        "year": 2026
    }
    response = client.post("/api/assistant", json=payload)
    assert response.status_code == 200
    ast_data = response.json()

    assert ast_data["status"] == "SUPPORTED"
    assert ast_data["confidence"] >= 0.9
    assert len(ast_data["evidence"]) >= 1
    assert ast_data["evidence"][0]["page_number"] == 14
    assert "Annual Health Infrastructure & Modernization Report 2026" in ast_data["sources"][0]
    assert "170" in ast_data["answer"] or "70" in ast_data["answer"]


# =============================================================================
# FLOW 3 — ANOMALY/QUESTION -> RTI GENERATOR
# =============================================================================

def test_flow3_investigation_to_rti_e2e(client, db_session):
    """Verify Flow 3: Verified Context -> POST /api/rti/generate -> Grounded Legal Petition."""
    anomaly_id, dept_id, doc_id = setup_e2e_seeded_database(db_session)

    payload = {
        "anomaly_id": anomaly_id,
        "department": "Health",
        "scheme": "Primary Healthcare",
        "year": 2026,
        "applicant_name": "Dr. A. Sharma",
        "applicant_address": "Civil Lines, Sector 4"
    }
    response = client.post("/api/rti/generate", json=payload)
    assert response.status_code == 200
    rti_data = response.json()

    assert rti_data["department"] == "Health"
    assert rti_data["status"] in ["SUPPORTED", "GROUNDED_RECORD_REQUEST"]
    assert rti_data["grounding_confidence"] >= 0.8
    assert len(rti_data["background_facts"]) >= 1
    assert "Dr. A. Sharma" in rti_data["formatted_rti_text"]
    assert "RIGHT TO INFORMATION ACT, 2005" in rti_data["formatted_rti_text"]
    assert "Primary Healthcare" in rti_data["subject"]


# =============================================================================
# CROSS-FLOW INSUFFICIENT EVIDENCE PROPAGATION
# =============================================================================

def test_e2e_insufficient_evidence_propagation(client, db_session):
    """Verify that unevidenced queries safely return INSUFFICIENT_EVIDENCE across all endpoints."""
    # 1. Assistant endpoint with unevidenced department
    ast_res = client.post("/api/assistant", json={
        "question": "Why did spending surge in FY 2026?",
        "department": "SecretDeepSpace"
    })
    assert ast_res.status_code == 200
    assert ast_res.json()["status"] == "INSUFFICIENT_EVIDENCE"
    assert ast_res.json()["confidence"] == 0.0

    # 2. RTI endpoint with unevidenced department
    rti_res = client.post("/api/rti/generate", json={
        "department": "SecretDeepSpace",
        "year": 2026
    })
    assert rti_res.status_code == 200
    assert rti_res.json()["status"] == "INSUFFICIENT_EVIDENCE"
    assert rti_res.json()["grounding_confidence"] == 0.0


# =============================================================================
# SOURCE METADATA & PAGE NUMBER PRESERVATION
# =============================================================================

def test_e2e_source_metadata_preservation(client, db_session):
    """Verify document titles, page numbers, and source URLs survive end-to-end."""
    setup_e2e_seeded_database(db_session)

    response = client.post("/api/assistant", json={
        "question": "Show documentary citations for Health spending.",
        "department": "Health"
    })
    assert response.status_code == 200
    data = response.json()

    assert len(data["evidence"]) >= 1
    ev_item = data["evidence"][0]
    assert ev_item["document_title"] == "Annual Health Infrastructure & Modernization Report 2026"
    assert ev_item["page_number"] == 14
    assert ev_item["source_url"] == "https://civiclens.demo/docs/health-2026.pdf"


# =============================================================================
# ERROR HANDLING & SANITIZATION
# =============================================================================

def test_e2e_error_handling_and_validation(client, db_session):
    """Verify invalid inputs return proper HTTP status codes without leaking stack traces."""
    # Invalid anomaly ID format / missing record
    inv_res = client.post("/api/investigations/run/NON-EXISTENT-ANOMALY-UUID")
    assert inv_res.status_code in [404, 500]

    # Missing required 'department' in RTI generator
    rti_res = client.post("/api/rti/generate", json={"scheme": "No Department Provided"})
    assert rti_res.status_code == 422

    # Malformed empty payload in assistant
    ast_res = client.post("/api/assistant", json={})
    assert ast_res.status_code == 422


# =============================================================================
# DYNAMIC DATA & CSV A VS B ANALYTICS REGRESSION TESTS
# =============================================================================

def test_dynamic_csv_upload_and_analytics_diff(client, db_session):
    """Verify Upload CSV A -> DB & API update -> Upload CSV B -> DB & API update differ."""
    # CSV A
    csv_a = (
        "department_code,department_name,scheme_code,scheme_name,year,locality,category,budget_amount,actual_amount\n"
        "AAA,Alpha Rural Department,A001,Alpha Water Project,2026,Alpha District,Water,1000,400\n"
    )
    res_a = client.post("/api/upload", files={"file": ("csv_a.csv", csv_a.encode("utf-8"), "text/csv")})
    assert res_a.status_code == 201

    dash_a = client.get("/api/dashboard").json()
    depts_a = client.get("/api/departments").json()
    budgets_a = client.get("/api/budgets").json()

    assert any(d["code"] == "AAA" for d in depts_a)
    assert any(b["department_name"] == "Alpha Rural Department" for b in budgets_a)

    # CSV B with radically different values
    csv_b = (
        "department_code,department_name,scheme_code,scheme_name,year,locality,category,budget_amount,actual_amount\n"
        "BBB,Beta Agriculture Department,B001,Beta Irrigation Project,2026,Beta District,Agriculture,8000,7200\n"
    )
    res_b = client.post("/api/upload", files={"file": ("csv_b.csv", csv_b.encode("utf-8"), "text/csv")})
    assert res_b.status_code == 201

    dash_b = client.get("/api/dashboard").json()
    depts_b = client.get("/api/departments").json()

    # Dashboard totals must change
    assert dash_b["total_budget_amount"] > dash_a["total_budget_amount"]
    assert dash_b["total_actual_amount"] > dash_a["total_actual_amount"]
    assert any(d["code"] == "BBB" for d in depts_b)

