"""Tests for CivicLens Controlled Investigation Tools."""

import pytest
from ai.tools import (
    get_budget_record,
    get_historical_spending,
    compare_budget_periods,
    search_budget_documents,
    get_source_metadata,
    INVESTIGATION_TOOLS,
)
from ai.adapters import DemoMember2Adapter, DemoMember3RAGAdapter


class FailingMember2Adapter:
    """Simulates an unexpected exception in Member 2 backend."""
    def get_budget_record(self, department: str, year: int):
        raise RuntimeError("Database connection timed out")

    def get_historical_spending(self, department: str, start_year: int, end_year: int):
        raise RuntimeError("Query failure")

    def compare_budget_periods(self, department: str, period_a: int, period_b: int):
        raise RuntimeError("Comparison service down")


class FailingMember3Adapter:
    """Simulates an unexpected exception in Member 3 RAG service."""
    def retrieve_supporting_evidence(self, query: str, department: str, top_k: int = 3):
        raise RuntimeError("Vector search connection failed")

    def get_source_metadata(self, document_id: str):
        raise RuntimeError("Metadata store unavailable")


def test_get_budget_record_valid():
    res = get_budget_record("Health", 2025)
    assert res["status"] == "SUCCESS"
    assert res["record"]["amount"] == 100.0
    assert res["record"]["year"] == 2025


def test_get_budget_record_missing():
    res = get_budget_record("Health", 2099)
    assert res["status"] == "NOT_FOUND"
    assert "No budget record found" in res["message"]


def test_get_historical_spending_valid():
    res = get_historical_spending("Health", 2023, 2026)
    assert res["status"] == "SUCCESS"
    assert res["count"] == 4
    assert res["records"][-1]["amount"] == 170.0


def test_get_historical_spending_invalid_year_range():
    # start_year > end_year
    res = get_historical_spending("Health", 2026, 2023)
    assert res["status"] == "INVALID_INPUT"
    assert "cannot be greater than" in res["error"]


def test_get_historical_spending_out_of_bounds_years():
    res = get_historical_spending("Health", 1980, 2026)
    assert res["status"] == "INVALID_INPUT"


def test_compare_budget_periods_valid():
    res = compare_budget_periods("Health", 2025, 2026)
    assert res["status"] == "SUCCESS"
    comp = res["comparison"]
    assert comp["absolute_change"] == 70.0
    assert comp["percentage_change"] == 70.0


def test_compare_budget_periods_missing_period():
    res = compare_budget_periods("Health", 2010, 2026)
    assert res["status"] == "NOT_FOUND"


def test_search_budget_documents_valid():
    res = search_budget_documents("healthcare allocation increase", "Health", top_k=3)
    assert res["status"] == "SUCCESS"
    assert res["count"] >= 1
    assert res["results"][0]["document_id"] == "DOC-HLTH-2026-01"


def test_search_budget_documents_empty_retrieval():
    res = search_budget_documents("unrelated space mission", "SpaceResearch", top_k=3)
    assert res["status"] == "NO_EVIDENCE_FOUND"
    assert res["count"] == 0
    assert res["results"] == []


def test_search_budget_documents_top_k_clamping():
    # top_k > 5 should be clamped to 5
    res = search_budget_documents("healthcare", "Health", top_k=10)
    assert res["status"] == "SUCCESS"
    assert len(res["results"]) <= 5


def test_get_source_metadata_valid():
    res = get_source_metadata("DOC-HLTH-2026-01")
    assert res["status"] == "SUCCESS"
    assert res["document"]["document_title"] == "Annual Health Infrastructure & Modernization Report 2026"
    assert res["document"]["page_number"] == 14


def test_get_source_metadata_not_found():
    res = get_source_metadata("NON-EXISTENT-DOC")
    assert res["status"] == "NOT_FOUND"
    assert "not found" in res["message"]


def test_malformed_inputs_and_sql_injection_rejection():
    # SQL injection attempt in department
    res = get_budget_record("Health'; DROP TABLE budgets; --", 2025)
    assert res["status"] == "INVALID_INPUT"

    # HTML/Script tag injection
    res2 = search_budget_documents("<script>alert(1)</script>", "Health")
    assert res2["status"] == "INVALID_INPUT"

    # Empty query
    res3 = search_budget_documents("", "Health")
    assert res3["status"] == "INVALID_INPUT"


def test_adapter_errors_handled_gracefully():
    failing_m2 = FailingMember2Adapter()
    failing_m3 = FailingMember3Adapter()

    res1 = get_budget_record("Health", 2025, member2_adapter=failing_m2)
    assert res1["status"] == "ERROR"
    assert "Adapter query failed" in res1["error"]

    res2 = search_budget_documents("query", "Health", member3_adapter=failing_m3)
    assert res2["status"] == "ERROR"
    assert "RAG retrieval failed" in res2["error"]

    res3 = get_source_metadata("DOC-01", member3_adapter=failing_m3)
    assert res3["status"] == "ERROR"


def test_langchain_tool_bindings_present():
    assert len(INVESTIGATION_TOOLS) == 5
    tool_names = [t.name for t in INVESTIGATION_TOOLS]
    assert "tool_get_budget_record" in tool_names
    assert "tool_get_historical_spending" in tool_names
    assert "tool_compare_budget_periods" in tool_names
    assert "tool_search_budget_documents" in tool_names
    assert "tool_get_source_metadata" in tool_names


def test_no_secret_leakage_in_tool_outputs():
    res = get_budget_record("Health", 2025)
    str_res = str(res)
    assert "AIzaSy" not in str_res
    assert "password" not in str_res.lower()
