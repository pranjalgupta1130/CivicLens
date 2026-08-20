from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.budget_record import BudgetRecord
from app.models.department import Department
from app.models.scheme import Scheme
from app.schemas.budget import BudgetRecordOut

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=list[BudgetRecordOut])
def list_budgets(
    department_id: Optional[str] = None,
    scheme_id: Optional[str] = None,
    year: Optional[int] = None,
    locality: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BudgetRecord)
    if department_id:
        query = query.filter(BudgetRecord.department_id == department_id)
    if scheme_id:
        query = query.filter(BudgetRecord.scheme_id == scheme_id)
    if year:
        query = query.filter(BudgetRecord.year == year)
    if locality:
        query = query.filter(BudgetRecord.locality == locality)
    if category:
        query = query.filter(BudgetRecord.category == category)

    records = query.all()
    results = []
    for r in records:
        dept = db.query(Department).filter(Department.id == r.department_id).first()
        scheme = db.query(Scheme).filter(Scheme.id == r.scheme_id).first()
        utilization = round((r.actual_amount / r.budget_amount * 100), 2) if r.budget_amount > 0 else 0.0

        results.append(BudgetRecordOut(
            id=r.id,
            department_id=r.department_id,
            scheme_id=r.scheme_id,
            year=r.year,
            locality=r.locality,
            category=r.category,
            budget_amount=float(r.budget_amount),
            actual_amount=float(r.actual_amount),
            source_document_id=r.source_document_id,
            created_at=r.created_at,
            department_name=dept.name if dept else None,
            scheme_name=scheme.name if scheme else None,
            utilization_percentage=utilization
        ))
    return results

@router.get("/{budget_id}", response_model=BudgetRecordOut)
def get_budget(budget_id: str, db: Session = Depends(get_db)):
    record = db.query(BudgetRecord).filter(BudgetRecord.id == budget_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget record not found")

    dept = db.query(Department).filter(Department.id == record.department_id).first()
    scheme = db.query(Scheme).filter(Scheme.id == record.scheme_id).first()
    utilization = round((record.actual_amount / record.budget_amount * 100), 2) if record.budget_amount > 0 else 0.0

    return BudgetRecordOut(
        id=record.id,
        department_id=record.department_id,
        scheme_id=record.scheme_id,
        year=record.year,
        locality=record.locality,
        category=record.category,
        budget_amount=float(record.budget_amount),
        actual_amount=float(record.actual_amount),
        source_document_id=record.source_document_id,
        created_at=record.created_at,
        department_name=dept.name if dept else None,
        scheme_name=scheme.name if scheme else None,
        utilization_percentage=utilization
    )
