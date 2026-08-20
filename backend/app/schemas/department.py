from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DepartmentSummary(DepartmentOut):
    total_schemes_count: int = 0
    total_budget_amount: float = 0.0
    total_actual_amount: float = 0.0
