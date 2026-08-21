import io
import pandas as pd
from typing import BinaryIO
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord

HEADER_ALIASES = {
    "department_code": ["department_code", "dept_code", "dept_id", "id"],
    "department_name": ["department_name", "department", "dept_name", "dept", "projecttitle", "project_title"],
    "scheme_code": ["scheme_code", "scheme_id"],
    "scheme_name": ["scheme_name", "scheme", "project", "sub_scheme"],
    "year": ["year", "fiscal_year", "fy"],
    "locality": ["locality", "district", "location", "area", "region"],
    "category": ["category", "type", "sector"],
    "budget_amount": ["budget_amount", "allocated", "allocated(cr)", "budget", "allocated_amount", "allocation"],
    "actual_amount": ["actual_amount", "spent", "actual", "spent_amount", "expenditure"]
}

def _clean_numeric(val, default=0.0) -> float:
    if pd.isna(val) or val is None:
        return default
    s = str(val).replace("₹", "").replace(",", "").replace("Cr", "").replace("cr", "").strip()
    try:
        return float(s)
    except ValueError:
        return default

def _make_code(name: str, prefix: str) -> str:
    cleaned = "".join(c for c in name if c.isalnum() or c.isspace()).strip()
    words = cleaned.split()
    if not words:
        return f"{prefix}_DEFAULT"
    if len(words) == 1:
        return f"{prefix}_{words[0][:6].upper()}"
    acronym = "".join(w[0] for w in words[:4]).upper()
    return f"{prefix}_{acronym}"

def parse_and_ingest_csv(db: Session, file_content: bytes) -> dict:
    """Parses a CSV file containing budget records, validates rows, and persists records into database."""
    try:
        df = pd.read_csv(io.BytesIO(file_content))
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")

    if df.empty:
        raise ValueError("The uploaded CSV file is empty.")

    # Standardize column headers
    raw_cols = [str(col).strip().lower() for col in df.columns]
    col_mapping = {}
    
    # Map input columns to canonical schema targets
    for target_key, aliases in HEADER_ALIASES.items():
        for alias in aliases:
            if alias in raw_cols:
                original_col = df.columns[raw_cols.index(alias)]
                col_mapping[target_key] = original_col
                break

    # Require at least department (or department_code) and spending numbers
    has_dept = "department_name" in col_mapping or "department_code" in col_mapping
    has_money = "budget_amount" in col_mapping or "actual_amount" in col_mapping

    if not has_dept or not has_money:
        raise ValueError(
            "CSV must contain department name/code and spending figures (e.g. allocated/spent or budget_amount/actual_amount)."
        )

    records_count = 0
    dept_cache = {}
    scheme_cache = {}

    for idx, row in df.iterrows():
        # Extract Department Name & Code
        dept_name = str(row[col_mapping["department_name"]]).strip() if "department_name" in col_mapping else "General Department"
        if not dept_name or dept_name.lower() == "nan":
            dept_name = "General Department"
            
        if "department_code" in col_mapping:
            dept_code = str(row[col_mapping["department_code"]]).strip().upper()
        else:
            dept_code = _make_code(dept_name, "DEPT")

        # Extract Scheme Name & Code
        scheme_name = str(row[col_mapping["scheme_name"]]).strip() if "scheme_name" in col_mapping else f"{dept_name} Core Scheme"
        if not scheme_name or scheme_name.lower() == "nan":
            scheme_name = f"{dept_name} Core Scheme"
            
        if "scheme_code" in col_mapping:
            scheme_code = str(row[col_mapping["scheme_code"]]).strip().upper()
        else:
            scheme_code = _make_code(scheme_name, "SCH")

        # Year
        year_raw = row[col_mapping["year"]] if "year" in col_mapping else 2026
        try:
            year = int(_clean_numeric(year_raw, 2026))
            if year < 2000 or year > 2100:
                year = 2026
        except Exception:
            year = 2026

        # Locality
        locality = str(row[col_mapping["locality"]]).strip() if "locality" in col_mapping else "Statewide"
        if not locality or locality.lower() == "nan":
            locality = "Statewide"

        # Category
        category = str(row[col_mapping["category"]]).strip() if "category" in col_mapping else "Capital Expenditure"
        if not category or category.lower() == "nan":
            category = "Capital Expenditure"

        # Financial Amounts
        budget_val = _clean_numeric(row[col_mapping["budget_amount"]]) if "budget_amount" in col_mapping else None
        actual_val = _clean_numeric(row[col_mapping["actual_amount"]]) if "actual_amount" in col_mapping else None

        if budget_val is None and actual_val is not None:
            budget_val = actual_val
        elif actual_val is None and budget_val is not None:
            actual_val = budget_val
        elif budget_val is None and actual_val is None:
            budget_val = 0.0
            actual_val = 0.0

        # 1. Upsert Department
        if dept_code not in dept_cache:
            dept = db.query(Department).filter((Department.code == dept_code) | (Department.name == dept_name)).first()
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
            scheme = db.query(Scheme).filter(Scheme.department_id == dept.id, (Scheme.code == scheme_code) | (Scheme.name == scheme_name)).first()
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
            record.budget_amount = float(budget_val)
            record.actual_amount = float(actual_val)
        else:
            record = BudgetRecord(
                department_id=dept.id,
                scheme_id=scheme.id,
                year=year,
                locality=locality,
                category=category,
                budget_amount=float(budget_val),
                actual_amount=float(actual_val)
            )
            db.add(record)

        records_count += 1

    db.commit()
    return {
        "records_processed": records_count,
        "departments_count": len(dept_cache),
        "schemes_count": len(scheme_cache)
    }

