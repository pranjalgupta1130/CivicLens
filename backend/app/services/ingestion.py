import io
import hashlib
import pandas as pd
from typing import BinaryIO
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord
from app.models.anomaly import Anomaly

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
    h = hashlib.md5(name.encode('utf-8')).hexdigest()[:4].upper()
    if not words:
        return f"{prefix}_DEFAULT_{h}"
    if len(words) == 1:
        return f"{prefix}_{words[0][:6].upper()}_{h}"
    acronym = "".join(w[0] for w in words[:4]).upper()
    return f"{prefix}_{acronym}_{h}"

def parse_and_ingest_csv(db: Session, file_content: bytes, replace_existing: bool = True) -> dict:
    """Parses a CSV file containing budget records (standard or Union Budget Estimates), clears old data if replace_existing=True, and persists records into database."""
    
    if replace_existing:
        # Wipe old database records so uploaded dataset cleanly replaces previous dataset
        db.query(Anomaly).delete()
        db.query(BudgetRecord).delete()
        db.query(Scheme).delete()
        db.query(Department).delete()
        db.commit()

    # Attempt to read CSV with pandas
    try:
        df_raw = pd.read_csv(io.BytesIO(file_content), header=None)
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")

    if df_raw.empty:
        raise ValueError("The uploaded CSV file is empty.")

    rows_to_ingest = []
    
    # Check if this is an unheaded Union Budget Estimates CSV (like sumsbe (1).csv)
    # Look for header line containing 'Revenue', 'Capital', 'Total'
    header_idx = None
    for idx, row in df_raw.iterrows():
        row_vals = [str(v).strip().lower() for v in row if pd.notna(v)]
        if "revenue" in row_vals and "capital" in row_vals and "total" in row_vals:
            header_idx = idx
            break

    if header_idx is not None:
        # It's an unheaded Union Budget Estimates CSV format!
        for idx in range(header_idx + 1, len(df_raw)):
            row = df_raw.iloc[idx]
            c1 = str(row[1]).strip() if pd.notna(row[1]) else ''
            c2 = str(row[2]).strip() if pd.notna(row[2]) else ''
            c3 = str(row[3]).replace(',', '').strip() if pd.notna(row[3]) else ''
            c4 = str(row[4]).replace(',', '').strip() if pd.notna(row[4]) else ''
            c5 = str(row[5]).replace(',', '').strip() if pd.notna(row[5]) else ''

            # Include numbered department rows (e.g., '1. ', '2. ') to avoid double counting ministry summary totals
            if c1 != '' and c1[0].isdigit():
                dept_name = c2
                rev_val = _clean_numeric(c3)
                cap_val = _clean_numeric(c4)
                tot_val = _clean_numeric(c5)
                
                rows_to_ingest.append({
                    "department_name": dept_name,
                    "scheme_name": f"{dept_name} Revenue Outlay",
                    "year": 2026,
                    "locality": "Statewide",
                    "category": "Revenue Expenditure",
                    "budget_amount": rev_val,
                    "actual_amount": None  # Budget estimates only, no actual expenditure!
                })
                rows_to_ingest.append({
                    "department_name": dept_name,
                    "scheme_name": f"{dept_name} Capital Outlay",
                    "year": 2026,
                    "locality": "Statewide",
                    "category": "Capital Expenditure",
                    "budget_amount": cap_val,
                    "actual_amount": None  # Budget estimates only, no actual expenditure!
                })
    else:
        # Standard headed CSV format
        df = pd.read_csv(io.BytesIO(file_content))
        raw_cols = [str(col).strip().lower() for col in df.columns]
        col_mapping = {}

        for target_key, aliases in HEADER_ALIASES.items():
            for alias in aliases:
                if alias in raw_cols:
                    original_col = df.columns[raw_cols.index(alias)]
                    col_mapping[target_key] = original_col
                    break

        has_dept = "department_name" in col_mapping or "department_code" in col_mapping
        has_money = "budget_amount" in col_mapping or "actual_amount" in col_mapping

        if not has_dept or not has_money:
            raise ValueError(
                "CSV must contain department name/code and budget/spending figures."
            )

        for idx, row in df.iterrows():
            dept_name = str(row[col_mapping["department_name"]]).strip() if "department_name" in col_mapping else "General Department"
            if not dept_name or dept_name.lower() == "nan":
                dept_name = "General Department"

            dept_code = str(row[col_mapping["department_code"]]).strip().upper() if "department_code" in col_mapping else _make_code(dept_name, "DEPT")

            scheme_name = str(row[col_mapping["scheme_name"]]).strip() if "scheme_name" in col_mapping else f"{dept_name} Core Scheme"
            if not scheme_name or scheme_name.lower() == "nan":
                scheme_name = f"{dept_name} Core Scheme"

            scheme_code = str(row[col_mapping["scheme_code"]]).strip().upper() if "scheme_code" in col_mapping else _make_code(scheme_name, "SCH")

            year_raw = row[col_mapping["year"]] if "year" in col_mapping else 2026
            try:
                year = int(_clean_numeric(year_raw, 2026))
                if year < 2000 or year > 2100: year = 2026
            except Exception:
                year = 2026

            locality = str(row[col_mapping["locality"]]).strip() if "locality" in col_mapping else "Statewide"
            if not locality or locality.lower() == "nan": locality = "Statewide"

            category = str(row[col_mapping["category"]]).strip() if "category" in col_mapping else "Capital Expenditure"
            if not category or category.lower() == "nan": category = "Capital Expenditure"

            budget_val = _clean_numeric(row[col_mapping["budget_amount"]]) if "budget_amount" in col_mapping else None
            actual_val = _clean_numeric(row[col_mapping["actual_amount"]]) if "actual_amount" in col_mapping else None

            rows_to_ingest.append({
                "department_code": dept_code,
                "department_name": dept_name,
                "scheme_code": scheme_code,
                "scheme_name": scheme_name,
                "year": year,
                "locality": locality,
                "category": category,
                "budget_amount": budget_val,
                "actual_amount": actual_val
            })

    records_count = 0
    dept_cache = {}
    scheme_cache = {}

    for item in rows_to_ingest:
        dept_name = item["department_name"]
        dept_code = item.get("department_code") or _make_code(dept_name, "DEPT")

        scheme_name = item["scheme_name"]
        scheme_code = item.get("scheme_code") or _make_code(scheme_name, "SCH")

        year = item.get("year", 2026)
        locality = item.get("locality", "Statewide")
        category = item.get("category", "Capital Expenditure")

        budget_val = item.get("budget_amount")
        actual_val = item.get("actual_amount")

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
        scheme_key = f"{dept.id}_{scheme_code}_{category}"
        if scheme_key not in scheme_cache:
            scheme = db.query(Scheme).filter(Scheme.department_id == dept.id, Scheme.name == scheme_name).first()
            if not scheme:
                scheme = Scheme(department_id=dept.id, code=f"{scheme_code}_{_make_code(category, 'CAT')}", name=scheme_name)
                db.add(scheme)
                db.flush()
            scheme_cache[scheme_key] = scheme
        else:
            scheme = scheme_cache[scheme_key]

        # 3. Create Budget Record
        record = BudgetRecord(
            department_id=dept.id,
            scheme_id=scheme.id,
            year=year,
            locality=locality,
            category=category,
            budget_amount=float(budget_val) if budget_val is not None else 0.0,
            actual_amount=float(actual_val) if actual_val is not None else None
        )
        db.add(record)
        records_count += 1

    db.commit()
    return {
        "records_processed": records_count,
        "departments_count": len(dept_cache),
        "schemes_count": len(scheme_cache)
    }


