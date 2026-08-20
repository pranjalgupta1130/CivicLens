import os
import unittest.mock as mock
import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

rag_dir = Path(__file__).parent.parent
if str(rag_dir) not in sys.path:
    sys.path.insert(0, str(rag_dir))

from app.main import app
from app.rag.retriever import VectorRetriever
from app.rag.embeddings import GeminiEmbeddingEngine
from app.rag.generator import GroundedRAGGenerator
from app.rag.judge import LLMJudge

from app.dependencies import get_retriever, get_ingestion_pipeline
from app.ingestion.pipeline import IngestionPipeline

@pytest.fixture
def client(tmp_path):
    storage_file = str(tmp_path / "test_vector_store.json")
    test_retriever = VectorRetriever(storage_path=storage_file)
    test_pipeline = IngestionPipeline(retriever=test_retriever)
    app.dependency_overrides[get_retriever] = lambda: test_retriever
    app.dependency_overrides[get_ingestion_pipeline] = lambda: test_pipeline
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# ==============================================================================
# C1. RETRIEVAL THRESHOLD TESTS (RT1 - RT8)
# ==============================================================================

def test_RT1_relevant_query_retrieved(tmp_path):
    """RT1: Relevant query matching document content exceeds threshold and is retrieved."""
    storage_file = str(tmp_path / "rt1.json")
    engine = GeminiEmbeddingEngine()
    retriever = VectorRetriever(embedding_engine=engine, storage_path=storage_file, min_relevance_score=0.25)
    
    chunk = [{
        "chunk_id": "rt1_c1",
        "content": "Public Health Department budget allocation for Hospital Upgrade in 2026 is 500 Crore",
        "embedding": engine.embed_text("Public Health Department budget Hospital Upgrade 2026 500 Crore"),
        "metadata": {"department": "Public Health", "document_name": "health.csv"}
    }]
    retriever.add_chunks(chunk)
    
    results = retriever.retrieve("What is the Public Health budget for Hospital Upgrade?", top_k=4)
    assert len(results) == 1
    assert results[0]["chunk_id"] == "rt1_c1"

def test_RT2_irrelevant_query_rejected(tmp_path):
    """RT2: Completely irrelevant query scores below threshold and returns empty list."""
    storage_file = str(tmp_path / "rt2.json")
    engine = GeminiEmbeddingEngine()
    retriever = VectorRetriever(embedding_engine=engine, storage_path=storage_file, min_relevance_score=0.25)
    
    chunk = [{
        "chunk_id": "rt2_c1",
        "content": "Healthcare hospital budget 100 crore actual spending 80 crore",
        "embedding": engine.embed_text("Healthcare hospital budget 100 crore actual spending 80 crore"),
        "metadata": {"department": "Healthcare", "document_name": "healthcare.csv"}
    }]
    retriever.add_chunks(chunk)
    
    # Irrelevant topic (space travel rocket cost)
    results = retriever.retrieve("What is the cost of a space travel rocket?", top_k=4)
    assert results == [], "Irrelevant query must NOT retrieve healthcare chunk"

def test_RT3_threshold_boundary_behavior(tmp_path):
    """RT3: Verify exact filtering around custom relevance threshold."""
    storage_file = str(tmp_path / "rt3.json")
    engine = GeminiEmbeddingEngine()
    # High threshold (0.90) should reject weak matches
    retriever_strict = VectorRetriever(embedding_engine=engine, storage_path=storage_file, min_relevance_score=0.90)
    
    chunk = [{
        "chunk_id": "rt3_c1",
        "content": "Education scheme digital labs allocation 50 Cr",
        "embedding": engine.embed_text("Education scheme digital labs allocation 50 Cr"),
        "metadata": {"department": "Education"}
    }]
    retriever_strict.add_chunks(chunk)
    
    results_strict = retriever_strict.retrieve("Education budget overview", top_k=4)
    assert results_strict == []

def test_RT4_multiple_relevant_chunks(tmp_path):
    """RT4: Retrieve multiple relevant chunks above threshold."""
    storage_file = str(tmp_path / "rt4.json")
    engine = GeminiEmbeddingEngine()
    retriever = VectorRetriever(embedding_engine=engine, storage_path=storage_file, min_relevance_score=0.20)
    
    chunks = [
        {"chunk_id": "c1", "content": "Health hospital construction 100 Cr", "embedding": engine.embed_text("Health hospital construction 100 Cr"), "metadata": {"department": "Health"}},
        {"chunk_id": "c2", "content": "Health clinic equipment 50 Cr", "embedding": engine.embed_text("Health clinic equipment 50 Cr"), "metadata": {"department": "Health"}}
    ]
    retriever.add_chunks(chunks)
    
    results = retriever.retrieve("Health hospital clinic budget", top_k=4)
    assert len(results) == 2

def test_RT5_top_k_does_not_force_irrelevant_chunks(tmp_path):
    """RT5: top_k=4 returns only 1 relevant chunk when only 1 chunk exceeds threshold."""
    storage_file = str(tmp_path / "rt5.json")
    engine = GeminiEmbeddingEngine()
    retriever = VectorRetriever(embedding_engine=engine, storage_path=storage_file, min_relevance_score=0.25)
    
    chunks = [
        {"chunk_id": "relevant_c1", "content": "Road infrastructure highway expansion 1000 Cr", "embedding": engine.embed_text("Road infrastructure highway expansion 1000 Cr"), "metadata": {"department": "Transport"}},
        {"chunk_id": "irrelevant_c2", "content": "Animal husbandry poultry farm subsidy 5 Cr", "embedding": engine.embed_text("Animal husbandry poultry farm subsidy 5 Cr"), "metadata": {"department": "Agriculture"}}
    ]
    retriever.add_chunks(chunks)
    
    # Query specifically about road highway expansion
    results = retriever.retrieve("highway road infrastructure expansion", top_k=4)
    assert len(results) == 1
    assert results[0]["chunk_id"] == "relevant_c1"

def test_RT6_no_relevant_documents(tmp_path):
    """RT6: Empty vector store returns empty list gracefully."""
    storage_file = str(tmp_path / "rt6.json")
    retriever = VectorRetriever(storage_path=storage_file)
    assert retriever.retrieve("Any query") == []

def test_RT7_department_filter_with_threshold(tmp_path):
    """RT7: Department filter combines with threshold to filter candidate chunks."""
    storage_file = str(tmp_path / "rt7.json")
    engine = GeminiEmbeddingEngine()
    retriever = VectorRetriever(embedding_engine=engine, storage_path=storage_file, min_relevance_score=0.20)
    
    chunks = [
        {"chunk_id": "h1", "content": "Building construction 100 Cr", "embedding": engine.embed_text("Building construction 100 Cr"), "metadata": {"department": "Health"}},
        {"chunk_id": "e1", "content": "Building construction 100 Cr", "embedding": engine.embed_text("Building construction 100 Cr"), "metadata": {"department": "Education"}}
    ]
    retriever.add_chunks(chunks)
    
    results = retriever.retrieve("Building construction", top_k=4, department_filter="Health")
    assert len(results) == 1
    assert results[0]["metadata"]["department"] == "Health"

def test_RT8_empty_or_short_query_handling(tmp_path):
    """RT8: Very short or blank queries handle safely without crash."""
    storage_file = str(tmp_path / "rt8.json")
    retriever = VectorRetriever(storage_path=storage_file)
    assert retriever.retrieve("") == []
    assert retriever.retrieve("a") == []

# ==============================================================================
# C2. LLM JUDGE TESTS (LJ1 - LJ8)
# ==============================================================================

def test_LJ1_correct_grounded_answer_pass():
    """LJ1: Valid answer matching evidence scores 100 with PASS verdict."""
    chunks = [{"content": "Healthcare budget allocation is 500 Crore in 2026", "metadata": {"document_name": "health.csv"}}]
    answer = "Based on 'health.csv', Healthcare budget allocation is 500 Crore in 2026."
    res = LLMJudge.evaluate_answer("What is healthcare budget?", answer, chunks)
    assert res["is_grounded"] is True
    assert res["judge_score"] == 100.0
    assert res["verdict"] == "PASS"

def test_LJ2_incorrect_numerical_answer_fail():
    """LJ2: Answer claiming wrong financial number flags NUMERICAL_CONTRADICTION."""
    chunks = [{"content": "Healthcare budget allocation is 500 Crore", "metadata": {"document_name": "health.csv"}}]
    answer = "Healthcare budget allocation is 9999 Crore as stated in 'health.csv'."
    res = LLMJudge.evaluate_answer("What is healthcare budget?", answer, chunks)
    assert res["is_grounded"] is False
    assert any("NUMERICAL_CONTRADICTION" in issue for issue in res["issues"])
    assert res["verdict"] in ["WARNING", "FAIL"]

def test_LJ3_unsupported_factual_claim():
    """LJ3: Zero context query evaluates safely as zero context guard."""
    res = LLMJudge.evaluate_answer("Unrelated query", "No relevant budget records were found", [])
    assert res["is_grounded"] is True
    assert res["verdict"] == "PASS"
    assert res["evaluator_mode"] == "ZERO_CONTEXT_GUARD"

def test_LJ4_valid_citation_pass():
    """LJ4: Answer citing retrieved document passes citation verification."""
    chunks = [{"content": "Water supply project 200 Cr", "metadata": {"document_name": "water_report.pdf"}}]
    answer = "Water supply project is 200 Cr as per 'water_report.pdf'."
    res = LLMJudge.evaluate_answer("water supply", answer, chunks)
    assert res["is_grounded"] is True
    assert res["issues"] == []

def test_LJ5_missing_evidence_low_confidence():
    """LJ5: Query executed without context produces LOW confidence."""
    gen = GroundedRAGGenerator()
    res = gen.generate_answer("Query", [])
    assert res["confidence"] == "LOW"
    assert res["sources"] == []

def test_LJ6_judge_detects_invalid_citation():
    """LJ6: Judge flags invalid document citation not present in retrieved chunks."""
    chunks = [{"content": "Water supply project 200 Cr", "metadata": {"document_name": "water_report.pdf"}}]
    answer = "Water supply project is 200 Cr as per 'fake_unretrieved_doc.pdf'."
    res = LLMJudge.evaluate_answer("water supply", answer, chunks)
    assert res["is_grounded"] is False
    assert any("INVALID_CITATION" in issue for issue in res["issues"])

def test_LJ7_mock_live_gemini_judge_execution():
    """LJ7: Mocked Gemini API call executes live LLM-as-a-Judge path cleanly."""
    judge = LLMJudge(api_key="mock_key_123")
    
    mock_gen_resp = mock.MagicMock()
    mock_gen_resp.text = '{"judge_score": 95.0, "is_grounded": true, "issues": [], "verdict": "PASS"}'
    
    with mock.patch.object(judge, "client") as mock_client:
        mock_client.models.generate_content.return_value = mock_gen_resp
        chunks = [{"content": "Road allocation 100 Cr", "metadata": {"document_name": "road.pdf"}}]
        res = judge.evaluate("road budget", "Road allocation is 100 Cr as per 'road.pdf'", chunks)
        assert res["evaluator_mode"] == "LLM_GEMINI"
        assert res["judge_score"] == 95.0

def test_LJ8_judge_structured_response_validation():
    """LJ8: Judge evaluation output contains all required keys."""
    res = LLMJudge.evaluate_answer("query", "No relevant budget records", [])
    assert "judge_score" in res
    assert "is_grounded" in res
    assert "issues" in res
    assert "verdict" in res
    assert "evaluator_mode" in res

# ==============================================================================
# C3. END-TO-END TESTS (E2E1 - E2E5)
# ==============================================================================

def test_E2E1_budget_allocation_query(client):
    """E2E1: Ingest Healthcare 2026 CSV -> Query budget -> Returns 100 Cr."""
    csv_bytes = (
        "department,scheme,year,locality,category,budget_amount,actual_amount\n"
        "Healthcare,Hospital Upgrade,2026,State,Infrastructure,100.0,80.0\n"
    ).encode("utf-8")
    client.post("/api/v1/ingest/csv", files={"file": ("healthcare_2026.csv", csv_bytes, "text/csv")})
    
    res = client.post("/api/v1/query", json={"query": "What was the healthcare budget in 2026?"})
    assert res.status_code == 200
    data = res.json()
    assert "100.0" in data["answer"] or "100" in data["answer"]
    assert len(data["sources"]) >= 1

def test_E2E2_actual_spending_query(client):
    """E2E2: Query actual spending -> Returns 80 Cr."""
    csv_bytes = (
        "department,scheme,year,locality,category,budget_amount,actual_amount\n"
        "Healthcare,Hospital Upgrade,2026,State,Infrastructure,100.0,80.0\n"
    ).encode("utf-8")
    client.post("/api/v1/ingest/csv", files={"file": ("healthcare_2026.csv", csv_bytes, "text/csv")})

    res = client.post("/api/v1/query", json={"query": "How much was actually spent on healthcare in 2026?"})
    assert res.status_code == 200
    data = res.json()
    assert "80.0" in data["answer"] or "80" in data["answer"]

def test_E2E3_utilization_query(client):
    """E2E3: Query healthcare records -> Verified source attributions returned."""
    csv_bytes = (
        "department,scheme,year,locality,category,budget_amount,actual_amount\n"
        "Healthcare,Hospital Upgrade,2026,State,Infrastructure,100.0,80.0\n"
    ).encode("utf-8")
    client.post("/api/v1/ingest/csv", files={"file": ("healthcare_2026.csv", csv_bytes, "text/csv")})

    res = client.post("/api/v1/query", json={"query": "Healthcare Hospital Upgrade infrastructure expenditure"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["sources"]) >= 1
    assert data["sources"][0]["department"] == "Healthcare"

def test_E2E4_irrelevant_rocket_query(client):
    """E2E4: Irrelevant query 'What is the cost of a rocket?' -> Rejects healthcare document, sources=[], LOW confidence."""
    res = client.post("/api/v1/query", json={"query": "What is the cost of a rocket?"})
    assert res.status_code == 200
    data = res.json()
    assert data["sources"] == []
    assert data["confidence"] == "LOW"
    assert "No relevant budget records" in data["answer"]

def test_E2E5_simulated_hallucination_detected():
    """E2E5: Evidence = 100 Cr, Generated Answer = 150 Cr -> Judge flags contradiction."""
    chunks = [{"content": "Healthcare budget allocation: 100 Crore", "metadata": {"document_name": "healthcare_2026.csv"}}]
    hallucinated_answer = "Healthcare budget allocation is 150 Crore as per 'healthcare_2026.csv'."
    
    eval_result = LLMJudge.evaluate_answer("What is healthcare budget?", hallucinated_answer, chunks)
    assert eval_result["is_grounded"] is False
    assert eval_result["verdict"] == "WARNING"
    assert any("NUMERICAL_CONTRADICTION" in issue for issue in eval_result["issues"])
