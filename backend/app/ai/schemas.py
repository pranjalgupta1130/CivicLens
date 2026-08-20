"""Pydantic schemas for CivicLens Agentic AI investigation."""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class InvestigationStatus(str, Enum):
    """Investigation outcome status."""
    SUPPORTED = "SUPPORTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    ERROR = "ERROR"


class AnomalyPayload(BaseModel):
    """Payload representing a detected budget spending anomaly from Member 2."""
    anomaly_id: str = Field(..., description="Unique identifier for the anomaly")
    department: str = Field(..., description="Government department/ministry")
    scheme: Optional[str] = Field(None, description="Specific program or scheme name")
    year: int = Field(..., description="Current fiscal year where anomaly occurred")
    previous_year: Optional[int] = Field(None, description="Baseline comparison fiscal year")
    previous_spending: float = Field(..., description="Baseline spending amount (e.g. in Crores)")
    current_spending: float = Field(..., description="Current spending amount (e.g. in Crores)")
    percentage_change: float = Field(..., description="Calculated percentage change")
    status: str = Field("FLAGGED", description="Anomaly status (e.g. FLAGGED, UNDER_REVIEW)")


class HistoricalSpendingRecord(BaseModel):
    """Historical spending record for a department/scheme over time."""
    year: int = Field(..., description="Fiscal year")
    amount: float = Field(..., description="Actual or revised spending amount")
    department: str = Field(..., description="Department name")
    scheme: Optional[str] = Field(None, description="Scheme name if applicable")


class EvidenceDocument(BaseModel):
    """Document chunk and citation metadata retrieved from Member 3 RAG pipeline."""
    document_id: str = Field(..., description="Document identifier")
    document_title: str = Field(..., description="Title of the official report or budget document")
    page_number: Optional[int] = Field(None, description="Page number of the citation")
    relevant_chunk_text: str = Field(..., description="Extracted factual chunk text")
    source_url: Optional[str] = Field(None, description="Direct URL or archive link to source")


class InvestigationResult(BaseModel):
    """Structured, frontend-ready investigation result."""
    summary: str = Field(..., description="Concise executive summary of the investigation")
    explanation: str = Field(..., description="Grounded explanation citing retrieved evidence")
    key_figures: Dict[str, Any] = Field(default_factory=dict, description="Key metrics and figures")
    evidence_status: InvestigationStatus = Field(..., description="Status of evidence grounding")
    sources: List[EvidenceDocument] = Field(default_factory=list, description="Verified source citations")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
