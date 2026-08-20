from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.assistant import AIAssistantRequest, AIAssistantResponse
from app.services.assistant_service import process_assistant_question

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post("", response_model=AIAssistantResponse)
def ask_ai_assistant(body: AIAssistantRequest, db: Session = Depends(get_db)):
    """Conversational AI Assistant endpoint answering grounded public finance questions."""
    try:
        return process_assistant_question(body, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Assistant execution failed: {e}"
        )
