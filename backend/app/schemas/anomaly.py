from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AnomalyOut(BaseModel):
    id: str
    budget_record_id: str
    department_id: str
    scheme_id: str
    department_name: Optional[str] = None
    scheme_name: Optional[str] = None
    year: int
    anomaly_type: str
    previous_value: float
    current_value: float
    percentage_change: float
    severity: str
    status: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnalyzeRequest(BaseModel):
    year: Optional[int] = None
    department_id: Optional[str] = None

class AnalyzeResponse(BaseModel):
    analyzed_records: int
    anomalies_found: int
    new_anomalies_created: int
    summary: dict[str, int]
