import pytest
from app.models.anomaly import Anomaly
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord


def test_run_ai_investigation_endpoint_demo(client, db_session):
    """Test running AI investigation on demo anomaly."""
    response = client.post("/api/investigations/run/ANOMALY-HLTH-2026")
    assert response.status_code == 200
    data = response.json()
    assert data["anomaly_id"] == "ANOMALY-HLTH-2026"
    assert "Annual Health Infrastructure & Modernization Report 2026" in data["reason"] or "Primary Healthcare" in data["ai_explanation"]
    assert data["evidence_strength"] in ["STRONG", "MODERATE"]
    assert data["confidence"] >= 0.9


def test_run_ai_investigation_on_db_anomaly(client, db_session):
    """Test creating an anomaly in DB and running live AI investigation."""
    dept = Department(name="Health", code="HLTH", description="Health Ministry")
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
        description="70% surge in Health spending"
    )
    db_session.add(anomaly)
    db_session.commit()
    db_session.refresh(anomaly)
    anomaly_id_val = anomaly.id

    # Run investigation endpoint
    response = client.post(f"/api/investigations/run/{anomaly_id_val}")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["anomaly_id"] == anomaly_id_val
    assert res_data["evidence_strength"] in ["STRONG", "MODERATE"]

    # Verify anomaly status updated in DB
    updated_anomaly = db_session.query(Anomaly).filter(Anomaly.id == anomaly_id_val).first()
    assert updated_anomaly.status == "INVESTIGATED"

    # Verify GET investigation endpoint
    get_res = client.get(f"/api/investigations/{anomaly_id_val}")
    assert get_res.status_code == 200
    assert get_res.json()["anomaly_id"] == anomaly_id_val


def test_run_ai_investigation_insufficient_evidence(client, db_session):
    """Test unevidenced anomaly returns INSUFFICIENT evidence strength."""
    dept = Department(name="Transport", code="TRN", description="Transport Dept")
    db_session.add(dept)
    db_session.commit()
    db_session.refresh(dept)

    scheme = Scheme(name="Highway Expansion", code="HWY", department_id=dept.id)
    db_session.add(scheme)
    db_session.commit()
    db_session.refresh(scheme)

    rec = BudgetRecord(
        department_id=dept.id,
        scheme_id=scheme.id,
        year=2026,
        budget_amount=500.0,
        actual_amount=850.0,
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
        previous_value=500.0,
        current_value=850.0,
        percentage_change=70.0,
        severity="HIGH",
        status="FLAGGED",
        description="Transport spike"
    )
    db_session.add(anomaly)
    db_session.commit()
    db_session.refresh(anomaly)
    anomaly_id_val = anomaly.id

    response = client.post(f"/api/investigations/run/{anomaly_id_val}")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["evidence_strength"] == "INSUFFICIENT"
    assert "Insufficient evidence" in res_data["reason"]
