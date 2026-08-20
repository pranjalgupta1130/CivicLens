from typing import Dict, Any, List
from pydantic import BaseModel
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_v1_router
from app.api.v1.health import router as health_router
import uvicorn
import os
from dotenv import load_dotenv

from pathlib import Path

# Load environment variables from .env file (robust path resolution)
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

app = FastAPI(
    title="CivicLens API",
    description="Intelligent Government Budget Transparency Platform API powered by Gemini & Grounded RAG.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 routes
app.include_router(api_v1_router)

@app.get("/", status_code=status.HTTP_200_OK, tags=["Root"])
async def root():
    return {
        "message": "Welcome to CivicLens API",
        "docs": "/docs",
        "health": "/api/v1/health",
        "version": "1.0.0"
    }

# Request schema for audit prioritization
class AuditPrioritizationRequest(BaseModel):
    department: str
    budget_variance_pct: float
    dollar_amount: float
    faithfulness_score: float
    has_prior_flags: bool = False

def prioritize_audit(
    department: str,
    budget_variance_pct: float,
    dollar_amount: float,
    faithfulness_score: float,
    has_prior_flags: bool = False
) -> Dict[str, Any]:
    
    # 1. Score components (1-5 scale)
    magnitude_score = 5 if dollar_amount > 10_000_000 else (3 if dollar_amount > 1_000_000 else 1)
    volatility_score = 5 if abs(budget_variance_pct) > 20.0 else (3 if abs(budget_variance_pct) > 10.0 else 1)
    grounding_score = 5 if faithfulness_score < 0.6 else (3 if faithfulness_score < 0.8 else 1)
    history_score = 5 if has_prior_flags else 1

    # 2. Weighted Score Calculation
    composite_risk_score = (
        (magnitude_score * 0.35) +
        (volatility_score * 0.25) +
        (grounding_score * 0.20) +
        (history_score * 0.20)
    )

    # 3. Priority Tier Assignment
    if composite_risk_score >= 3.8:
        priority = "HIGH"
        action = "Flag for immediate manual audit verification and invoice audit."
    elif composite_risk_score >= 2.5:
        priority = "MEDIUM"
        action = "Schedule for automated spot-checking and LLM re-evaluation."
    else:
        priority = "LOW"
        action = "Log verification passed; standard monitoring."

    return {
        "department": department,
        "composite_risk_score": round(composite_risk_score, 2),
        "priority_level": priority,
        "recommended_action": action
    }

# Endpoint exposing the prioritization function
@app.post("/api/v1/prioritize-audit", tags=["Audit Prioritization"])
async def calculate_audit_priority(payload: AuditPrioritizationRequest):
    return prioritize_audit(
        department=payload.department,
        budget_variance_pct=payload.budget_variance_pct,
        dollar_amount=payload.dollar_amount,
        faithfulness_score=payload.faithfulness_score,
        has_prior_flags=payload.has_prior_flags
    )
# Add this schema near your other Pydantic models in main.py
class AnalyticsQueryRequest(BaseModel):
    query: str
    dataset: List[Dict[str, Any]]  # Array of department audit/budget records

# Initialize analyzer
from app.rag.analytics import NaturalLanguageAnalytics
analytics_engine = NaturalLanguageAnalytics()

# Add endpoint
@app.post("/api/v1/analytics", tags=["Natural Language Analytics"])
async def run_analytics(payload: AnalyticsQueryRequest):
    result = analytics_engine.summarize_dataset(
        records=payload.dataset,
        query=payload.query
    )
    return result

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)