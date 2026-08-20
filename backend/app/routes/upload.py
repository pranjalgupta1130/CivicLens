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

        return {
            "status": "success",
            "filename": file.filename,
            "records_ingested": ingest_res["records_processed"],
            "departments_created": ingest_res["departments_count"],
            "schemes_created": ingest_res["schemes_count"],
            "anomalies_detected": anomaly_res["anomalies_found"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"CSV processing failed: {str(e)}"
        )

@router.post("/analyze", response_model=AnalyzeResponse)
def trigger_analysis(body: AnalyzeRequest, db: Session = Depends(get_db)):
    res = run_anomaly_detection(db, target_year=body.year, department_id=body.department_id)
    return res
