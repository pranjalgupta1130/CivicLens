from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord
from app.schemas.department import DepartmentOut, DepartmentSummary

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=list[DepartmentSummary])
def list_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    results = []
    for dept in departments:
        schemes_count = db.query(func.count(Scheme.id)).filter(Scheme.department_id == dept.id).scalar()
        b_sum = db.query(func.coalesce(func.sum(BudgetRecord.budget_amount), 0.0)).filter(BudgetRecord.department_id == dept.id).scalar()
        a_sum = db.query(func.coalesce(func.sum(BudgetRecord.actual_amount), 0.0)).filter(BudgetRecord.department_id == dept.id).scalar()

        results.append(DepartmentSummary(
            id=dept.id,
            code=dept.code,
            name=dept.name,
            description=dept.description,
            created_at=dept.created_at,
            total_schemes_count=schemes_count,
            total_budget_amount=float(b_sum),
            total_actual_amount=float(a_sum)
        ))
    return results

@router.get("/{department_id}", response_model=DepartmentOut)
def get_department(department_id: str, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return dept
