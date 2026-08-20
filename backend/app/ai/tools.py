"""CivicLens Controlled Investigation Tools.

Provides a safe abstraction layer between LangGraph/Gemini and Member 2 / Member 3 interfaces.
Strictly disallows arbitrary SQL, code execution, URL fetching, or secret leakage.
"""

import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, field_validator
from langchain_core.tools import tool

from .adapters import (
    Member2AdapterProtocol,
    Member3RAGAdapterProtocol,
    DemoMember2Adapter,
    DemoMember3RAGAdapter,
)
from .schemas import EvidenceDocument



# ==============================================================================
# STRONGLY TYPED INPUT SCHEMAS
# ==============================================================================

class BudgetRecordInput(BaseModel):
    """Input schema for get_budget_record."""
    department: str = Field(..., min_length=1, max_length=100, description="Name of the department")
    year: int = Field(..., ge=2000, le=2100, description="Fiscal year (between 2000 and 2100)")

    @field_validator("department")
    @classmethod
    def sanitize_department(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Department name cannot be empty")
        # Check for disallowed SQL injection / scripting characters
        if re.search(r"[;\"'<>\{\}]", clean):
            raise ValueError("Department contains invalid characters")
        return clean


class HistoricalSpendingInput(BaseModel):
    """Input schema for get_historical_spending."""
    department: str = Field(..., min_length=1, max_length=100, description="Name of the department")
    start_year: int = Field(..., ge=2000, le=2100, description="Starting fiscal year")
    end_year: int = Field(..., ge=2000, le=2100, description="Ending fiscal year")

    @field_validator("department")
    @classmethod
    def sanitize_department(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Department name cannot be empty")
        if re.search(r"[;\"'<>\{\}]", clean):
            raise ValueError("Department contains invalid characters")
        return clean


class CompareBudgetInput(BaseModel):
    """Input schema for compare_budget_periods."""
    department: str = Field(..., min_length=1, max_length=100, description="Name of the department")
    period_a: int = Field(..., ge=2000, le=2100, description="Baseline fiscal year")
    period_b: int = Field(..., ge=2000, le=2100, description="Comparison fiscal year")

    @field_validator("department")
    @classmethod
    def sanitize_department(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Department name cannot be empty")
        if re.search(r"[;\"'<>\{\}]", clean):
            raise ValueError("Department contains invalid characters")
        return clean


class SearchDocumentsInput(BaseModel):
    """Input schema for search_budget_documents."""
    query: str = Field(..., min_length=2, max_length=300, description="Factual query string")
    department: str = Field(..., min_length=1, max_length=100, description="Department name filter")
    top_k: int = Field(3, ge=1, le=5, description="Number of evidence chunks to retrieve (1 to 5)")

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Query string cannot be empty")
        if re.search(r"[;\"'<>\{\}]", clean):
            raise ValueError("Query contains invalid characters")
        return clean

    @field_validator("department")
    @classmethod
    def sanitize_department(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Department name cannot be empty")
        if re.search(r"[;\"'<>\{\}]", clean):
            raise ValueError("Department contains invalid characters")
        return clean


class SourceMetadataInput(BaseModel):
    """Input schema for get_source_metadata."""
    document_id: str = Field(..., min_length=1, max_length=100, description="Document unique identifier")

    @field_validator("document_id")
    @classmethod
    def sanitize_doc_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Document ID cannot be empty")
        if re.search(r"[;\"'<>\{\}]", clean):
            raise ValueError("Document ID contains invalid characters")
        return clean


# ==============================================================================
# CONTROLLED TOOL IMPLEMENTATIONS
# ==============================================================================

def get_budget_record(
    department: str,
    year: int,
    member2_adapter: Optional[Member2AdapterProtocol] = None,
) -> Dict[str, Any]:
    """Retrieve structured budget allocation record for a department and fiscal year."""
    try:
        validated = BudgetRecordInput(department=department, year=year)
    except Exception as e:
        return {"status": "INVALID_INPUT", "error": str(e)}

    adapter = member2_adapter or DemoMember2Adapter()
    try:
        record = adapter.get_budget_record(validated.department, validated.year)
        if not record:
            return {
                "status": "NOT_FOUND",
                "message": f"No budget record found for {validated.department} in year {validated.year}.",
            }
        return {"status": "SUCCESS", "record": record}
    except Exception as err:
        return {"status": "ERROR", "error": f"Adapter query failed: {err}"}


def get_historical_spending(
    department: str,
    start_year: int,
    end_year: int,
    member2_adapter: Optional[Member2AdapterProtocol] = None,
) -> Dict[str, Any]:
    """Retrieve time-series spending records for a department across a valid year range."""
    try:
        validated = HistoricalSpendingInput(
            department=department, start_year=start_year, end_year=end_year
        )
    except Exception as e:
        return {"status": "INVALID_INPUT", "error": str(e)}

    if validated.start_year > validated.end_year:
        return {
            "status": "INVALID_INPUT",
            "error": f"start_year ({validated.start_year}) cannot be greater than end_year ({validated.end_year}).",
        }

    adapter = member2_adapter or DemoMember2Adapter()
    try:
        records = adapter.get_historical_spending(
            validated.department, validated.start_year, validated.end_year
        )
        records_dump = [
            r.model_dump() if hasattr(r, "model_dump") else r for r in records
        ]
        return {
            "status": "SUCCESS",
            "department": validated.department,
            "start_year": validated.start_year,
            "end_year": validated.end_year,
            "records": records_dump,
            "count": len(records_dump),
        }
    except Exception as err:
        return {"status": "ERROR", "error": f"Adapter query failed: {err}"}


def compare_budget_periods(
    department: str,
    period_a: int,
    period_b: int,
    member2_adapter: Optional[Member2AdapterProtocol] = None,
) -> Dict[str, Any]:
    """Compute period-over-period comparative metrics using deterministic logic."""
    try:
        validated = CompareBudgetInput(
            department=department, period_a=period_a, period_b=period_b
        )
    except Exception as e:
        return {"status": "INVALID_INPUT", "error": str(e)}

    adapter = member2_adapter or DemoMember2Adapter()
    try:
        comparison = adapter.compare_budget_periods(
            validated.department, validated.period_a, validated.period_b
        )
        if "error" in comparison:
            return {"status": "NOT_FOUND", "message": comparison["error"]}
        return {"status": "SUCCESS", "comparison": comparison}
    except Exception as err:
        return {"status": "ERROR", "error": f"Adapter query failed: {err}"}


def search_budget_documents(
    query: str,
    department: str,
    top_k: int = 3,
    member3_adapter: Optional[Member3RAGAdapterProtocol] = None,
) -> Dict[str, Any]:
    """Search supporting documentary evidence chunks with citations from Member 3 RAG service."""
    # Ensure top_k is within safe bounds 1-5
    bounded_top_k = max(1, min(5, top_k)) if isinstance(top_k, int) else 3

    try:
        validated = SearchDocumentsInput(
            query=query, department=department, top_k=bounded_top_k
        )
    except Exception as e:
        return {"status": "INVALID_INPUT", "error": str(e)}

    adapter = member3_adapter or DemoMember3RAGAdapter()
    try:
        docs = adapter.retrieve_supporting_evidence(
            query=validated.query, department=validated.department, top_k=validated.top_k
        )
        docs_dump = [
            d.model_dump() if hasattr(d, "model_dump") else d for d in docs
        ]
        status = "SUCCESS" if docs_dump else "NO_EVIDENCE_FOUND"
        return {
            "status": status,
            "query": validated.query,
            "department": validated.department,
            "results": docs_dump,
            "count": len(docs_dump),
        }
    except Exception as err:
        return {"status": "ERROR", "error": f"RAG retrieval failed: {err}"}


def get_source_metadata(
    document_id: str,
    member3_adapter: Optional[Member3RAGAdapterProtocol] = None,
) -> Dict[str, Any]:
    """Retrieve source metadata, page numbers, and citation details for a given document ID."""
    try:
        validated = SourceMetadataInput(document_id=document_id)
    except Exception as e:
        return {"status": "INVALID_INPUT", "error": str(e)}

    adapter = member3_adapter or DemoMember3RAGAdapter()
    try:
        doc = adapter.get_source_metadata(validated.document_id)
        if not doc:
            return {
                "status": "NOT_FOUND",
                "message": f"Document ID '{validated.document_id}' not found.",
            }
        doc_dump = doc.model_dump() if hasattr(doc, "model_dump") else doc
        return {"status": "SUCCESS", "document": doc_dump}
    except Exception as err:
        return {"status": "ERROR", "error": f"Source metadata query failed: {err}"}


# ==============================================================================
# LANGCHAIN TOOL BINDINGS
# ==============================================================================

@tool(args_schema=BudgetRecordInput)
def tool_get_budget_record(department: str, year: int) -> Dict[str, Any]:
    """Controlled tool to retrieve a budget record for a department and year."""
    return get_budget_record(department, year)


@tool(args_schema=HistoricalSpendingInput)
def tool_get_historical_spending(department: str, start_year: int, end_year: int) -> Dict[str, Any]:
    """Controlled tool to retrieve historical spending records for a department across years."""
    return get_historical_spending(department, start_year, end_year)


@tool(args_schema=CompareBudgetInput)
def tool_compare_budget_periods(department: str, period_a: int, period_b: int) -> Dict[str, Any]:
    """Controlled tool to compare spending changes between two fiscal periods."""
    return compare_budget_periods(department, period_a, period_b)


@tool(args_schema=SearchDocumentsInput)
def tool_search_budget_documents(query: str, department: str, top_k: int = 3) -> Dict[str, Any]:
    """Controlled tool to search documentary evidence with citations for budget allocations."""
    return search_budget_documents(query, department, top_k)


@tool(args_schema=SourceMetadataInput)
def tool_get_source_metadata(document_id: str) -> Dict[str, Any]:
    """Controlled tool to retrieve metadata and citation details for a document ID."""
    return get_source_metadata(document_id)


INVESTIGATION_TOOLS = [
    tool_get_budget_record,
    tool_get_historical_spending,
    tool_compare_budget_periods,
    tool_search_budget_documents,
    tool_get_source_metadata,
]
