import pytest
from app.services.ingestion import parse_and_ingest_csv
from app.services.anomaly_engine import run_anomaly_detection
from app.models.anomaly import Anomaly

def test_anomaly_detection_spike_and_overbudget(db_session):
    # CSV with intentional spike (+70%) and overbudget ratio (> 1.5)
    csv_data = (
        "department_code,department_name,scheme_code,scheme_name,year,locality,category,budget_amount,actual_amount\n"
        "HEALTH,Health Dept,HOSP_EXP,Hospital Expansion,2025,Mumbai,Capital Expenditure,100000000.0,100000000.0\n"
        "HEALTH,Health Dept,HOSP_EXP,Hospital Expansion,2026,Mumbai,Capital Expenditure,120000000.0,170000000.0\n"
    ).encode("utf-8")

    parse_and_ingest_csv(db_session, csv_data)
    res = run_anomaly_detection(db_session)

    assert res["anomalies_found"] >= 1
    anomalies = db_session.query(Anomaly).all()
    assert len(anomalies) >= 1

    spike_anom = [a for a in anomalies if a.anomaly_type == "SPENDING_SPIKE"][0]
    assert spike_anom.percentage_change == 70.0
    assert spike_anom.severity == "HIGH"

def test_anomaly_detection_drop(db_session):
    csv_data = (
        "department_code,department_name,scheme_code,scheme_name,year,locality,category,budget_amount,actual_amount\n"
        "EDU,Education Dept,SMART_CLS,Smart Classroom,2025,Pune,Capital Expenditure,100000000.0,100000000.0\n"
        "EDU,Education Dept,SMART_CLS,Smart Classroom,2026,Pune,Capital Expenditure,80000000.0,60000000.0\n"
    ).encode("utf-8")

    parse_and_ingest_csv(db_session, csv_data)
    res = run_anomaly_detection(db_session)

    anomalies = db_session.query(Anomaly).filter(Anomaly.anomaly_type == "SPENDING_DROP").all()
    assert len(anomalies) == 1
    drop_anom = anomalies[0]
    assert drop_anom.percentage_change == -40.0
    assert drop_anom.severity == "HIGH"
