import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add RAG package directory to sys.path
rag_dir = Path(__file__).parent.parent
if str(rag_dir) not in sys.path:
    sys.path.insert(0, str(rag_dir))

from app.main import app
from app.rag.generator import GroundedRAGGenerator
from app.rag.retriever import VectorRetriever
from app.rag.embeddings import GeminiEmbeddingEngine
from app.rag.chunker import DocumentChunker
from app.rag.parser import DocumentParser

@pytest.fixture
def client():
    return TestClient(app)

# 1. Health Endpoint
def test_1_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

# 2. Root Endpoint
def test_2_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "message" in res.json()
    assert res.json()["version"] == "1.0.0"

# 3. CSV Ingestion
def test_3_csv_ingestion(client):
    csv_data = (
        "department,scheme,year,locality,category,budget_amount,actual_amount\n"
        "Public Health,Hospital Modernization,2026,State,Infrastructure,500.0,480.0\n"
        "Education,Digital Classrooms,2026,District,Technology,300.0,290.0\n"
    ).encode("utf-8")
    files = {"file": ("budget_test.csv", csv_data, "text/csv")}
    res = client.post("/api/v1/ingest/csv", files=files)
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["filename"] == "budget_test.csv"
    assert data["total_rows"] == 2
    assert data["embeddings_generated"] == 2

# 4. PDF Ingestion
def test_4_pdf_ingestion(client):
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Government of Maharashtra Budget FY2026. Department of Public Works allocation: 1500 Crores.")
    pdf_bytes = doc.tobytes()
    doc.close()

    files = {"file": ("budget_pw.pdf", pdf_bytes, "application/pdf")}
    data = {"department": "Public Works", "year": 2026}
    res = client.post("/api/v1/ingest/pdf", files=files, data=data)
    assert res.status_code == 201
    res_json = res.json()
    assert res_json["status"] == "SUCCESS"
    assert res_json["filename"] == "budget_pw.pdf"
    assert res_json["total_pages"] == 1

# 5. Non-PDF Rejection for PDF endpoint
def test_5_invalid_pdf_filetype(client):
    files = {"file": ("not_pdf.txt", b"Hello world", "text/plain")}
    res = client.post("/api/v1/ingest/pdf", files=files)
    assert res.status_code == 400
    assert "File must be a PDF" in res.json()["detail"]

# 6. Non-CSV Rejection for CSV endpoint
def test_6_invalid_csv_filetype(client):
    files = {"file": ("not_csv.txt", b"Hello world", "text/plain")}
    res = client.post("/api/v1/ingest/csv", files=files)
    assert res.status_code == 400
    assert "File must be a CSV" in res.json()["detail"]

# 7. Valid Query After Ingestion
def test_7_query_with_ingested_context(client):
    # Ingest CSV first
    csv_data = (
        "department,scheme,year,locality,category,budget_amount,actual_amount\n"
        "Public Health,Hospital Modernization,2026,State,Infrastructure,500.0,480.0\n"
    ).encode("utf-8")
    client.post("/api/v1/ingest/csv", files={"file": ("query_test.csv", csv_data, "text/csv")})

    res = client.post("/api/v1/query", json={"query": "What is the budget for Hospital Modernization?", "top_k": 2})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) > 0
    assert data["confidence"] in ["HIGH", "MODERATE"]

# 8. Query Before Ingestion (Zero Context Grounding)
def test_8_query_without_context(client):
    generator = GroundedRAGGenerator()
    res = generator.generate_answer(query="Unrelated query", retrieved_chunks=[])
    assert res["sources"] == []
    assert res["confidence"] == "LOW"
    assert "No relevant budget records were found" in res["answer"]

# 9. Irrelevant Query Handling
def test_9_irrelevant_query(client):
    res = client.post("/api/v1/query", json={"query": "Quantum physics string theory space travel", "top_k": 2})
    assert res.status_code == 200
    data = res.json()
    assert "confidence" in data
    # Should not crash or fabricate sources

# 10. Department Filtering in Retrieval
def test_10_department_filtering(client):
    engine = GeminiEmbeddingEngine()
    retriever = VectorRetriever(engine)
    chunks = [
        {
            "chunk_id": "c1",
            "content": "Health budget 500 Cr",
            "embedding": engine.embed_text("Health budget 500 Cr"),
            "metadata": {"department": "Health"}
        },
        {
            "chunk_id": "c2",
            "content": "Education budget 300 Cr",
            "embedding": engine.embed_text("Education budget 300 Cr"),
            "metadata": {"department": "Education"}
        }
    ]
    retriever.add_chunks(chunks)

    health_chunks = retriever.retrieve("budget", department_filter="Health")
    assert len(health_chunks) == 1
    assert health_chunks[0]["metadata"]["department"] == "Health"

# 11. Source Attribution Metadata Format
def test_11_source_attribution_format():
    generator = GroundedRAGGenerator()
    test_chunks = [{
        "content": "Sample content for hospital building",
        "metadata": {
            "document_name": "health_2026.pdf",
            "page_number": 3,
            "department": "Public Health"
        }
    }]
    res = generator.generate_answer(query="hospital", retrieved_chunks=test_chunks)
    assert len(res["sources"]) == 1
    source = res["sources"][0]
    assert source["document"] == "health_2026.pdf"
    assert source["page"] == 3
    assert source["department"] == "Public Health"
    assert "excerpt" in source

# 12. Confidence Scoring Logic
def test_12_confidence_scoring_logic():
    generator = GroundedRAGGenerator()
    single_chunk = [{
        "content": "Sample chunk 1",
        "metadata": {"document_name": "d1.pdf", "page_number": 1, "department": "Dept1"}
    }]
    res_single = generator.generate_answer(query="test", retrieved_chunks=single_chunk)
    assert res_single["confidence"] == "MODERATE"

    two_chunks = single_chunk + [{
        "content": "Sample chunk 2",
        "metadata": {"document_name": "d2.pdf", "page_number": 2, "department": "Dept2"}
    }]
    res_two = generator.generate_answer(query="test", retrieved_chunks=two_chunks)
    assert res_two["confidence"] == "HIGH"

# 13. Empty Retrieval Grounding
def test_13_empty_retrieval_grounding(tmp_path):
    empty_file = str(tmp_path / "empty_store.json")
    retriever = VectorRetriever(storage_path=empty_file)
    results = retriever.retrieve("nonexistent topic")
    assert results == []

# 14. Local Embedding Engine Execution
def test_14_embedding_engine_execution():
    engine = GeminiEmbeddingEngine()
    vec = engine.embed_text("Test embedding query")
    assert isinstance(vec, list)
    assert len(vec) > 0
    assert all(isinstance(v, float) for v in vec)

# 15. Document Chunker Sliding Window
def test_15_document_chunker():
    chunker = DocumentChunker(chunk_size=10, overlap=2)
    pages = [{"document_name": "doc.pdf", "page_number": 1, "content": "one two three four five six seven eight nine ten eleven twelve thirteen fourteen"}]
    chunks = chunker.chunk_pages(pages)
    assert len(chunks) >= 2
    assert chunks[0]["metadata"]["document_name"] == "doc.pdf"

# 16. Document Parser CSV & PDF
def test_16_document_parser_csv():
    parser = DocumentParser()
    csv_bytes = b"department,scheme,year\nHealth,Hospitals,2026"
    df = parser.parse_csv(csv_bytes, "test.csv")
    assert len(df) == 1
    assert "department" in df.columns
    chunks = parser.parse_csv_to_text_chunks(df, "test.csv")
    assert len(chunks) == 1
    assert "Allocated Budget" in chunks[0]["content"]

# 17. Malformed Request Validation
def test_17_malformed_query_request(client):
    res = client.post("/api/v1/query", json={"top_k": 5}) # Missing required 'query'
    assert res.status_code == 422

# 18. Top-K Parameter Boundary Validation
def test_18_top_k_parameter_validation(client):
    res_bad_low = client.post("/api/v1/query", json={"query": "test", "top_k": 0})
    assert res_bad_low.status_code == 422
    res_bad_high = client.post("/api/v1/query", json={"query": "test", "top_k": 50})
    assert res_bad_high.status_code == 422

# 19. Persistent Storage Across Service Restarts
def test_19_vector_store_persistence_across_restarts(tmp_path):
    storage_file = str(tmp_path / "test_vectors.json")
    engine = GeminiEmbeddingEngine()
    retriever1 = VectorRetriever(embedding_engine=engine, storage_path=storage_file)
    
    test_chunk = [{
        "chunk_id": "persist_c1",
        "content": "Government allocated 500 Cr for Smart City project in 2026",
        "embedding": engine.embed_text("Smart City project 500 Cr"),
        "metadata": {"department": "Urban Development", "document_name": "smart_city.pdf", "page_number": 1}
    }]
    retriever1.add_chunks(test_chunk)
    
    # Simulate service restart by re-instantiating VectorRetriever with the same storage file
    retriever2 = VectorRetriever(embedding_engine=engine, storage_path=storage_file)
    assert len(retriever2.vector_store) == 1
    
    results = retriever2.retrieve("Smart City", top_k=1)
    assert len(results) == 1
    assert results[0]["metadata"]["department"] == "Urban Development"

# 20. LLMJudge Evaluation for Numerical Consistency & Grounding
def test_20_llm_judge_evaluation():
    from app.rag.judge import LLMJudge
    chunks = [{
        "content": "Health budget allocation is 500 Crore",
        "metadata": {"document_name": "health.pdf", "page_number": 1}
    }]
    
    # Valid grounded answer
    valid_eval = LLMJudge.evaluate_answer("What is health budget?", "Based on 'health.pdf', health budget allocation is 500 Crore.", chunks)
    assert valid_eval["is_grounded"] is True
    assert valid_eval["judge_score"] == 100.0
    
    # Hallucinated numeric claim
    hallucinated_eval = LLMJudge.evaluate_answer("What is health budget?", "Based on 'health.pdf', health budget is 9999 Crore.", chunks)
    assert hallucinated_eval["is_grounded"] is False
    assert len(hallucinated_eval["issues"]) > 0
    assert "NUMERICAL_CONTRADICTION" in hallucinated_eval["issues"][0]
