import os
import httpx
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ingestion import parse_and_ingest_csv
from app.services.anomaly_engine import run_anomaly_detection
from app.schemas.anomaly import AnalyzeRequest, AnalyzeResponse

router = APIRouter(tags=["Ingestion & Analysis"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_budget_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported by Member 2 ingestion engine."
        )

    try:
        content = await file.read()
        ingest_res = parse_and_ingest_csv(db, content)
        # Automatically run deterministic anomaly engine on new data
        anomaly_res = run_anomaly_detection(db)

        # Forward CSV file bytes to RAG service for vector indexing
        rag_indexed = False
        try:
            rag_url = os.getenv("RAG_INGEST_CSV_URL", "http://localhost:8001/api/v1/ingest/csv")
            async with httpx.AsyncClient(timeout=10.0) as client:
                rag_resp = await client.post(rag_url, files={"file": (file.filename, content, "text/csv")})
                if rag_resp.status_code == 200:
                    rag_indexed = True
        except Exception as rag_err:
            print(f"[Upload Router] Warning: Failed to forward CSV to RAG service: {rag_err}")

        return {
            "status": "success",
            "filename": file.filename,
            "records_ingested": ingest_res["records_processed"],
            "departments_created": ingest_res["departments_count"],
            "schemes_created": ingest_res["schemes_count"],
            "anomalies_detected": anomaly_res["anomalies_found"],
            "rag_indexed": rag_indexed
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"CSV processing failed: {str(e)}"
        )

@router.post("/upload/pdf", status_code=status.HTTP_201_CREATED)
async def upload_budget_pdf(file: UploadFile = File(...), department: str = "General", year: int = 2026):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported by this endpoint."
        )

    try:
        content = await file.read()
        rag_url = os.getenv("RAG_INGEST_PDF_URL", "http://localhost:8001/api/v1/ingest/pdf")
        params = {"department": department, "year": year}
        async with httpx.AsyncClient(timeout=15.0) as client:
            rag_resp = await client.post(rag_url, params=params, files={"file": (file.filename, content, "application/pdf")})
            if rag_resp.status_code == 200:
                return {
                    "status": "success",
                    "filename": file.filename,
                    "rag_details": rag_resp.json()
                }
            else:
                raise HTTPException(status_code=rag_resp.status_code, detail=f"RAG service returned: {rag_resp.text}")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"PDF ingestion failed: {str(e)}"
        )

@router.post("/analyze", response_model=AnalyzeResponse)
def trigger_analysis(body: AnalyzeRequest, db: Session = Depends(get_db)):
    res = run_anomaly_detection(db, target_year=body.year, department_id=body.department_id)
    return res
