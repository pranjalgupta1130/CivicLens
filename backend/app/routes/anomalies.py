from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.anomaly import Anomaly
from app.models.department import Department
from app.models.scheme import Scheme
from app.schemas.anomaly import AnomalyOut

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.get("", response_model=list[AnomalyOut])
def list_anomalies(
    severity: Optional[str] = None,
    department_id: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)
    if severity:
        query = query.filter(Anomaly.severity == severity.upper())
    if department_id:
        query = query.filter(Anomaly.department_id == department_id)
    if year:
        query = query.filter(Anomaly.year == year)

    anomalies = query.order_by(Anomaly.created_at.desc()).all()
    results = []
    for a in anomalies:
        dept = db.query(Department).filter(Department.id == a.department_id).first()
        scheme = db.query(Scheme).filter(Scheme.id == a.scheme_id).first()

        results.append(AnomalyOut(
            id=a.id,
            budget_record_id=a.budget_record_id,
            department_id=a.department_id,
            scheme_id=a.scheme_id,
            department_name=dept.name if dept else None,
            scheme_name=scheme.name if scheme else None,
            year=a.year,
            anomaly_type=a.anomaly_type,
            previous_value=float(a.previous_value),
            current_value=float(a.current_value),
            percentage_change=float(a.percentage_change),
            severity=a.severity,
            status=a.status,
            description=a.description,
            created_at=a.created_at
        ))
    return results

@router.get("/{anomaly_id}", response_model=AnomalyOut)
def get_anomaly(anomaly_id: str, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anomaly record not found")

    dept = db.query(Department).filter(Department.id == anomaly.department_id).first()
    scheme = db.query(Scheme).filter(Scheme.id == anomaly.scheme_id).first()

    return AnomalyOut(
        id=anomaly.id,
        budget_record_id=anomaly.budget_record_id,
        department_id=anomaly.department_id,
        scheme_id=anomaly.scheme_id,
        department_name=dept.name if dept else None,
        scheme_name=scheme.name if scheme else None,
        year=anomaly.year,
        anomaly_type=anomaly.anomaly_type,
        previous_value=float(anomaly.previous_value),
        current_value=float(anomaly.current_value),
        percentage_change=float(anomaly.percentage_change),
        severity=anomaly.severity,
        status=anomaly.status,
        description=anomaly.description,
        created_at=anomaly.created_at
    )
