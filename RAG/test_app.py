from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add app package to sys.path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.main import app

def test_fastapi_endpoints():
    client = TestClient(app)

    print("\n--- 1. Testing Root Endpoint GET / ---")
    response = client.get("/")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print("GET / Response:", response.json())

    print("\n--- 2. Testing Health Endpoint GET /api/v1/health ---")
    response = client.get("/api/v1/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print("GET /api/v1/health Response:", response.json())

    print("\n--- 3. Testing Ingest CSV Endpoint POST /api/v1/ingest/csv ---")
    csv_data = "department,scheme,year,locality,category,budget_amount,actual_amount\nPublic Health,Hospital Modernization,2026,State,Infrastructure,500,480\nEducation,Digital Schools,2026,District,Technology,300,290"
    files = {"file": ("budget_2026.csv", csv_data.encode("utf-8"), "text/csv")}
    response = client.post("/api/v1/ingest/csv", files=files)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    print("POST /api/v1/ingest/csv Response:", response.json())

    print("\n--- 4. Testing Grounded Query Endpoint POST /api/v1/query ---")
    payload = {
        "query": "What is the budget for hospital modernization?",
        "top_k": 2
    }
    response = client.post("/api/v1/query", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    print("POST /api/v1/query Response:", response.json())

    print("\n--- 5. Testing Ingest PDF Endpoint POST /api/v1/ingest/pdf ---")
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Government of Maharashtra Budget FY2026. Department of Higher Education allocation: 1200 Crores.")
    pdf_bytes = doc.tobytes()
    doc.close()
    
    files = {"file": ("budget_education.pdf", pdf_bytes, "application/pdf")}
    data = {"department": "Education", "year": 2026}
    response = client.post("/api/v1/ingest/pdf", files=files, data=data)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    print("POST /api/v1/ingest/pdf Response:", response.json())

    print("\n[SUCCESS] ALL FASTAPI ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_fastapi_endpoints()