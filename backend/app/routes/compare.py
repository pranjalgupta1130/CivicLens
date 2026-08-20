from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.budget import CompareYearsRequest, CompareYearsResponse
from app.services.analytics import compare_years

router = APIRouter(prefix="/compare", tags=["Analytics"])

@router.get("", response_model=CompareYearsResponse)
def compare_department_years(
    department_id: str,
    start_year: int,
    end_year: int,
    scheme_id: str = None,
    db: Session = Depends(get_db)
):
    try:
        return compare_years(db, department_id, start_year, end_year, scheme_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("", response_model=CompareYearsResponse)
def compare_department_years_post(body: CompareYearsRequest, db: Session = Depends(get_db)):
    try:
        return compare_years(db, body.department_id, body.start_year, body.end_year, body.scheme_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
