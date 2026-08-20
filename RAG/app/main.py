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

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)