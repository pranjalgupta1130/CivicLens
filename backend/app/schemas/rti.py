from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RTIGenerateRequest(BaseModel):
    applicant_name: Optional[str] = Field("Concerned Citizen", description="Applicant name for RTI petition")
    applicant_address: Optional[str] = Field("State Capital Region", description="Applicant address for response delivery")
    department: str = Field(..., min_length=2, max_length=150, description="Target Public Authority or Department")
    scheme: Optional[str] = Field(None, description="Optional target scheme or program name")
    year: Optional[int] = Field(None, ge=2000, le=2100, description="Target financial year")
    period_a: Optional[int] = Field(None, ge=2000, le=2100, description="Optional baseline comparison year")
    period_b: Optional[int] = Field(None, ge=2000, le=2100, description="Optional target comparison year")
    anomaly_id: Optional[str] = Field(None, description="Optional budget anomaly ID")
    user_query: Optional[str] = Field(None, description="Optional specific citizen query or context")


class RequestedRecordItem(BaseModel):
    record_description: str = Field(..., description="Description of requested official document or record")
    period_covered: str = Field(..., description="Time period or fiscal year covered by the record")


class RTIGenerateResponse(BaseModel):
    rti_application_id: str = Field(..., description="Unique RTI application draft ID")
    public_authority: str = Field(..., description="Public Authority / PIO designation")
    department: str = Field(..., description="Department name")
    scheme: Optional[str] = Field(None, description="Scheme name if applicable")
    subject: str = Field(..., description="Formal RTI petition subject title")
    financial_years: List[str] = Field(default_factory=list, description="Relevant financial years covered")
    background_facts: List[str] = Field(default_factory=list, description="Verified facts derived strictly from repository data")
    information_requested: List[str] = Field(default_factory=list, description="Specific questions and information requests")
    documents_requested: List[RequestedRecordItem] = Field(default_factory=list, description="Specific records and documents requested")
    clarification_questions: List[str] = Field(default_factory=list, description="Clarification questions regarding variances")
    evidence_sources: List[str] = Field(default_factory=list, description="Source documents and citations used")
    grounding_confidence: float = Field(..., ge=0.0, le=1.0, description="Grounding confidence score between 0.0 and 1.0")
    status: str = Field(..., description="Status: SUPPORTED, INSUFFICIENT_EVIDENCE, or GROUNDED_RECORD_REQUEST")
    formatted_rti_text: str = Field(..., description="Complete, formatted legal RTI petition text for submission")
