from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict

class AIInvestigationCreate(BaseModel):
    anomaly_id: str
    reason: str
    historical_findings: Optional[str] = None
    source_chunks: list[dict[str, Any]] = []
    ai_explanation: str
    confidence: float
    evidence_strength: str # STRONG, MODERATE, INSUFFICIENT

class AIInvestigationOut(AIInvestigationCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
