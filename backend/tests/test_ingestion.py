import pytest
from app.services.ingestion import parse_and_ingest_csv
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord

def test_csv_ingestion(db_session):
    csv_data = (
        "department_code,department_name,scheme_code,scheme_name,year,locality,category,budget_amount,actual_amount\n"
        "TEST_DEPT,Test Dept Name,TEST_SCHEME,Test Scheme Name,2025,Mumbai,Capital Expenditure,1000.0,950.0\n"
        "TEST_DEPT,Test Dept Name,TEST_SCHEME,Test Scheme Name,2026,Mumbai,Capital Expenditure,1200.0,1700.0\n"
    ).encode("utf-8")

    res = parse_and_ingest_csv(db_session, csv_data)
    assert res["records_processed"] == 2
    assert res["departments_count"] == 1
    assert res["schemes_count"] == 1

    dept = db_session.query(Department).filter(Department.code == "TEST_DEPT").first()
    assert dept is not None
    assert dept.name == "Test Dept Name"

    records = db_session.query(BudgetRecord).all()
    assert len(records) == 2
