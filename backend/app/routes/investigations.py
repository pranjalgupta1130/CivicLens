from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.integration import AIInvestigation
from app.models.anomaly import Anomaly
from app.schemas.investigation import AIInvestigationCreate, AIInvestigationOut

router = APIRouter(prefix="/investigations", tags=["Integration - Member 3/4"])

@router.post("", response_model=AIInvestigationOut, status_code=status.HTTP_201_CREATED)
def create_investigation(body: AIInvestigationCreate, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == body.anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anomaly ID not found")

    existing = db.query(AIInvestigation).filter(AIInvestigation.anomaly_id == body.anomaly_id).first()
    if existing:
        existing.reason = body.reason
        existing.historical_findings = body.historical_findings
        existing.source_chunks = body.source_chunks
        existing.ai_explanation = body.ai_explanation
        existing.confidence = body.confidence
        existing.evidence_strength = body.evidence_strength
        inv = existing
    else:
        inv = AIInvestigation(
            anomaly_id=body.anomaly_id,
            reason=body.reason,
            historical_findings=body.historical_findings,
            source_chunks=body.source_chunks,
            ai_explanation=body.ai_explanation,
            confidence=body.confidence,
            evidence_strength=body.evidence_strength
        )
        db.add(inv)

    anomaly.status = "INVESTIGATED"
    db.commit()
    db.refresh(inv)
    return inv

@router.get("/{anomaly_id}", response_model=AIInvestigationOut)
def get_investigation(anomaly_id: str, db: Session = Depends(get_db)):
    inv = db.query(AIInvestigation).filter(AIInvestigation.anomaly_id == anomaly_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI Investigation for this anomaly not found")
    return inv
