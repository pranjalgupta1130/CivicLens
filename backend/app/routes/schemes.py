from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.scheme import Scheme
from app.models.department import Department
from app.schemas.scheme import SchemeOut

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=list[SchemeOut])
def list_schemes(department_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Scheme)
    if department_id:
        query = query.filter(Scheme.department_id == department_id)
    
    schemes = query.all()
    results = []
    for s in schemes:
        dept = db.query(Department).filter(Department.id == s.department_id).first()
        dept_name = dept.name if dept else None
        results.append(SchemeOut(
            id=s.id,
            department_id=s.department_id,
            code=s.code,
            name=s.name,
            description=s.description,
            created_at=s.created_at,
            department_name=dept_name
        ))
    return results

@router.get("/{scheme_id}", response_model=SchemeOut)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")
    
    dept = db.query(Department).filter(Department.id == scheme.department_id).first()
    return SchemeOut(
        id=scheme.id,
        department_id=scheme.department_id,
        code=scheme.code,
        name=scheme.name,
        description=scheme.description,
        created_at=scheme.created_at,
        department_name=dept.name if dept else None
    )
