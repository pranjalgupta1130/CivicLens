import io
import pandas as pd
from typing import BinaryIO
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord

REQUIRED_CSV_COLUMNS = [
    "department_code",
    "department_name",
    "scheme_code",
    "scheme_name",
    "year",
    "locality",
    "category",
    "budget_amount",
    "actual_amount"
]

def parse_and_ingest_csv(db: Session, file_content: bytes) -> dict:
    """Parses a CSV file containing budget records, validates rows, and persists records into Supabase PostgreSQL."""
    df = pd.read_csv(io.BytesIO(file_content))
    
    # Standardize column headers
    df.columns = [str(col).strip().lower() for col in df.columns]
    
    # Check for missing required columns
    missing_cols = [col for col in REQUIRED_CSV_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required CSV columns: {', '.join(missing_cols)}")
    
    records_count = 0
    dept_cache = {}
    scheme_cache = {}

    for idx, row in df.iterrows():
        dept_code = str(row["department_code"]).strip().upper()
        dept_name = str(row["department_name"]).strip()
        scheme_code = str(row["scheme_code"]).strip().upper()
        scheme_name = str(row["scheme_name"]).strip()
        year = int(row["year"])
        locality = str(row["locality"]).strip()
        category = str(row["category"]).strip()
        budget_amt = float(row["budget_amount"])
        actual_amt = float(row["actual_amount"])

        # 1. Upsert Department
        if dept_code not in dept_cache:
            dept = db.query(Department).filter(Department.code == dept_code).first()
            if not dept:
                dept = Department(code=dept_code, name=dept_name)
                db.add(dept)
                db.flush()
            dept_cache[dept_code] = dept
        else:
            dept = dept_cache[dept_code]

        # 2. Upsert Scheme
        scheme_key = f"{dept.id}_{scheme_code}"
        if scheme_key not in scheme_cache:
            scheme = db.query(Scheme).filter(Scheme.department_id == dept.id, Scheme.code == scheme_code).first()
            if not scheme:
                scheme = Scheme(department_id=dept.id, code=scheme_code, name=scheme_name)
                db.add(scheme)
                db.flush()
            scheme_cache[scheme_key] = scheme
        else:
            scheme = scheme_cache[scheme_key]

        # 3. Upsert Budget Record
        record = db.query(BudgetRecord).filter(
            BudgetRecord.department_id == dept.id,
            BudgetRecord.scheme_id == scheme.id,
            BudgetRecord.year == year,
            BudgetRecord.locality == locality,
            BudgetRecord.category == category
        ).first()

        if record:
            record.budget_amount = budget_amt
            record.actual_amount = actual_amt
        else:
            record = BudgetRecord(
                department_id=dept.id,
                scheme_id=scheme.id,
                year=year,
                locality=locality,
                category=category,
                budget_amount=budget_amt,
                actual_amount=actual_amt
            )
            db.add(record)

        records_count += 1

    db.commit()
    return {
        "records_processed": records_count,
        "departments_count": len(dept_cache),
        "schemes_count": len(scheme_cache)
    }
