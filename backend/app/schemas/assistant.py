from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AIAssistantRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500, description="Natural language question about budgets, spending, or policy changes")
    department: Optional[str] = Field(None, description="Optional department filter")
    year: Optional[int] = Field(None, ge=2000, le=2100, description="Optional fiscal year filter")
    period_a: Optional[int] = Field(None, ge=2000, le=2100, description="Optional baseline comparison year")
    period_b: Optional[int] = Field(None, ge=2000, le=2100, description="Optional target comparison year")


class EvidenceItem(BaseModel):
    document_id: str
    document_title: str
    page_number: Optional[int] = None
    relevant_chunk_text: str
    source_url: Optional[str] = None


class AIAssistantResponse(BaseModel):
    answer: str = Field(..., description="Grounded natural language answer")
    key_numbers: Dict[str, Any] = Field(default_factory=dict, description="Structured numerical metrics and totals")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="Retrieved documentary evidence chunks")
    sources: List[str] = Field(default_factory=list, description="Human-readable citation source strings")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    status: str = Field(..., description="Status: SUPPORTED, INSUFFICIENT_EVIDENCE, or ERROR")
