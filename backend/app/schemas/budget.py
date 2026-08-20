from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class BudgetRecordBase(BaseModel):
    department_id: str
    scheme_id: str
    year: int = Field(..., ge=2000, le=2100)
    locality: str
    category: str
    budget_amount: float = Field(..., ge=0.0)
    actual_amount: float = Field(..., ge=0.0)
    source_document_id: Optional[str] = None

class BudgetRecordCreate(BudgetRecordBase):
    pass

class BudgetRecordOut(BudgetRecordBase):
    id: str
    created_at: datetime
    department_name: Optional[str] = None
    scheme_name: Optional[str] = None
    utilization_percentage: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class CompareYearsRequest(BaseModel):
    department_id: str
    scheme_id: Optional[str] = None
    start_year: int
    end_year: int

class YearlyBreakdownItem(BaseModel):
    year: int
    budget_amount: float
    actual_amount: float
    yoy_change_percentage: float
    utilization_percentage: float

class CompareYearsResponse(BaseModel):
    department_id: str
    department_name: str
    scheme_id: Optional[str] = None
    scheme_name: Optional[str] = None
    start_year: int
    end_year: int
    yearly_breakdown: list[YearlyBreakdownItem]
    multi_year_trend: str # STABLE, GROWING, ABNORMAL_SPIKE, SEVERE_DROP
    total_growth_percentage: float

class ExpenditureBreakdownItem(BaseModel):
    category_or_locality: str
    allocated_amount: float
    actual_amount: float
    percentage_share: float

class EvidenceProvenanceItem(BaseModel):
    document_title: str
    page_number: Optional[int] = None
    relevant_chunk_text: str
    source_url: Optional[str] = None
    provenance_statement: str = "Source: Official government document"
    ai_grounding_statement: str = "AI explanation generated from retrieved document evidence"

class BudgetDossierOut(BaseModel):
    budget_record_id: str
    department_name: str
    scheme_name: str
    year: int
    locality: str
    category: str
    budget_amount: float
    actual_amount: float
    difference: float
    utilization_percentage: float
    plain_language_summary: str
    expenditure_breakdown: list[ExpenditureBreakdownItem] = Field(default_factory=list)
    previous_year: Optional[int] = None
    previous_year_amount: Optional[float] = None
    yoy_change_percentage: Optional[float] = None
    evidence: list[EvidenceProvenanceItem] = Field(default_factory=list)

