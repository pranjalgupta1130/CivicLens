import os
from sqlalchemy.orm import Session
from app.services.ingestion import parse_and_ingest_csv
from app.services.anomaly_engine import run_anomaly_detection

def seed_database(db: Session, csv_path: str = None) -> dict:
    """Seeds the database with realistic demo budget records and triggers deterministic anomaly detection."""
    if not csv_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_path = os.path.join(base_dir, "data", "seed", "sample_budgets.csv")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Seed CSV file not found at '{csv_path}'")

    with open(csv_path, "rb") as f:
        content = f.read()

    ingest_result = parse_and_ingest_csv(db, content)
    anomaly_result = run_anomaly_detection(db)

    return {
        "ingest_result": ingest_result,
        "anomaly_result": anomaly_result
    }
