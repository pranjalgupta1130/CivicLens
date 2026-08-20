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
