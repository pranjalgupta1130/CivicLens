import pytest

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_dashboard_endpoint(client, seeded_db):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "total_budget_amount" in data
    assert data["total_departments"] == 5

def test_departments_endpoint(client, seeded_db):
    res = client.get("/api/departments")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5

def test_budgets_endpoint(client, seeded_db):
    res = client.get("/api/budgets")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0

def test_anomalies_endpoint(client, seeded_db):
    res = client.get("/api/anomalies")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1

def test_compare_endpoint(client, seeded_db):
    dept_res = client.get("/api/departments")
    dept_id = dept_res.json()[0]["id"]

    res = client.get(f"/api/compare?department_id={dept_id}&start_year=2023&end_year=2026")
    assert res.status_code == 200
    assert "yearly_breakdown" in res.json()

def test_upload_csv_endpoint(client):
    csv_content = (
        "department_code,department_name,scheme_code,scheme_name,year,locality,category,budget_amount,actual_amount\n"
        "TEST_NEW,New Dept,NEW_SCHEME,New Scheme,2025,Pune,Capital Expenditure,500.0,500.0\n"
    ).encode("utf-8")

    files = {"file": ("test.csv", csv_content, "text/csv")}
    res = client.post("/api/upload", files=files)
    assert res.status_code == 201
    assert res.json()["status"] == "success"
