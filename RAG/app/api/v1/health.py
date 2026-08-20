from fastapi import APIRouter, status
from typing import Dict, Any
import os

router = APIRouter(tags=["Health"])

@router.get("/health", status_code=status.HTTP_200_OK, summary="API Health & Status Check")
async def health_check() -> Dict[str, Any]:
    """
    Returns system status, service health, and active environment.
    """
    has_gemini_key = bool(os.getenv("GEMINI_API_KEY"))
    has_supabase = bool(os.getenv("SUPABASE_URL"))
    
    return {
        "status": "online",
        "service": "CivicLens RAG & Budget Transparency API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "config": {
            "gemini_api_configured": has_gemini_key,
            "supabase_configured": has_supabase,
        }
    }
