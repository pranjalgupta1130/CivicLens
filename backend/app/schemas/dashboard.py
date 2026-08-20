from typing import Optional
from pydantic import BaseModel

class TopSpenderItem(BaseModel):
    department_id: str
    department_name: str
    total_budget: float
    total_actual: float
    yoy_change_percentage: float

class YearlyTrendItem(BaseModel):
    year: int
    total_budget: float
    total_actual: float

class DashboardSummary(BaseModel):
    total_budget_amount: float
    total_actual_amount: float
    total_departments: int
    total_schemes: int
    total_anomalies_count: int
    high_severity_anomalies_count: int
    top_spending_departments: list[TopSpenderItem]
    yearly_trend: list[YearlyTrendItem]
