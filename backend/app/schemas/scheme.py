from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SchemeBase(BaseModel):
    department_id: str
    code: str
    name: str
    description: Optional[str] = None

class SchemeCreate(SchemeBase):
    pass

class SchemeOut(SchemeBase):
    id: str
    created_at: datetime
    department_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
