from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.rti import RTIGenerateRequest, RTIGenerateResponse
from app.services.rti_service import generate_rti_application

router = APIRouter(prefix="/rti", tags=["RTI Generator"])


@router.post("/generate", response_model=RTIGenerateResponse)
def generate_rti_endpoint(body: RTIGenerateRequest, db: Session = Depends(get_db)):
    """Generate a structured, grounded RTI petition based on verified budget data and RAG evidence."""
    try:
        return generate_rti_application(body, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RTI generation failed: {e}"
        )
