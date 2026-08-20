from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.integration import AIInvestigation
from app.models.anomaly import Anomaly
from app.schemas.investigation import AIInvestigationCreate, AIInvestigationOut
from app.ai.live_adapters import LiveMember2DBAdapter, LiveMember3DBRAGAdapter
from app.ai.graph import run_investigation


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

@router.post("/run/{anomaly_id}", response_model=AIInvestigationOut)
def run_ai_investigation_endpoint(anomaly_id: str, db: Session = Depends(get_db)):
    """Trigger the Member 4 LangGraph investigation workflow using live database models."""
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        # Check if it's a known demo anomaly ID
        if not anomaly_id.startswith("ANOMALY-"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anomaly record not found")

    # Initialize live database adapters
    m2_adapter = LiveMember2DBAdapter(db=db)
    m3_adapter = LiveMember3DBRAGAdapter(db=db)

    # Execute LangGraph investigation workflow
    final_state = run_investigation(
        anomaly=anomaly_id,
        member2_adapter=m2_adapter,
        member3_adapter=m3_adapter,
    )

    if final_state.get("error") and not final_state.get("investigation_result"):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=final_state["error"])

    inv_result = final_state.get("investigation_result", {})
    sources = inv_result.get("sources", [])
    evidence_status = inv_result.get("evidence_status", "INSUFFICIENT_EVIDENCE")

    # Map evidence strength
    if evidence_status == "SUPPORTED" and len(sources) > 0:
        evidence_strength = "STRONG"
    elif evidence_status == "SUPPORTED":
        evidence_strength = "MODERATE"
    else:
        evidence_strength = "INSUFFICIENT"

    reason = inv_result.get("summary", "Investigation completed.")
    ai_explanation = inv_result.get("explanation", "No detailed explanation available.")
    confidence = float(final_state.get("confidence", 0.0))
    historical_findings = str(final_state.get("historical_context", ""))

    existing = db.query(AIInvestigation).filter(AIInvestigation.anomaly_id == anomaly_id).first() if anomaly else None
    if existing:
        existing.reason = reason
        existing.historical_findings = historical_findings
        existing.source_chunks = sources
        existing.ai_explanation = ai_explanation
        existing.confidence = confidence
        existing.evidence_strength = evidence_strength
        inv = existing
    elif anomaly:
        inv = AIInvestigation(
            anomaly_id=anomaly_id,
            reason=reason,
            historical_findings=historical_findings,
            source_chunks=sources,
            ai_explanation=ai_explanation,
            confidence=confidence,
            evidence_strength=evidence_strength
        )
        db.add(inv)
    else:
        # For pure demo IDs without DB anomaly row
        import uuid
        from datetime import datetime
        return AIInvestigationOut(
            id=str(uuid.uuid4()),
            anomaly_id=anomaly_id,
            reason=reason,
            historical_findings=historical_findings,
            source_chunks=sources,
            ai_explanation=ai_explanation,
            confidence=confidence,
            evidence_strength=evidence_strength,
            created_at=datetime.utcnow()
        )

    if anomaly:
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
