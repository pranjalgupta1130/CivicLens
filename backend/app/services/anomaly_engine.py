from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord
from app.models.anomaly import Anomaly

def run_anomaly_detection(db: Session, target_year: int = None, department_id: str = None) -> dict:
    """Deterministic anomaly detection engine based on formulaic spending variances and threshold rules."""
    query = db.query(BudgetRecord)
    if target_year:
        query = query.filter(BudgetRecord.year == target_year)
    if department_id:
        query = query.filter(BudgetRecord.department_id == department_id)

    records = query.all()
    anomalies_found = 0
    new_anomalies_created = 0
    summary = {"HIGH": 0, "MODERATE": 0, "NORMAL": 0}

    for record in records:
        # Fetch previous year's record for the same department, scheme, locality, and category
        prev_record = db.query(BudgetRecord).filter(
            BudgetRecord.department_id == record.department_id,
            BudgetRecord.scheme_id == record.scheme_id,
            BudgetRecord.locality == record.locality,
            BudgetRecord.category == record.category,
            BudgetRecord.year == record.year - 1
        ).first()

        dept = db.query(Department).filter(Department.id == record.department_id).first()
        scheme = db.query(Scheme).filter(Scheme.id == record.scheme_id).first()

        dept_name = dept.name if dept else "Unknown Dept"
        scheme_name = scheme.name if scheme else "Unknown Scheme"

        # Check 1: Over-budget utilization (actual vs budget)
        if record.budget_amount > 0:
            overbudget_ratio = record.actual_amount / record.budget_amount
            if overbudget_ratio > 1.5:
                sev = "HIGH" if (record.actual_amount - record.budget_amount) >= 10_000_000 else "MODERATE"
                pct_over = round((overbudget_ratio - 1.0) * 100, 2)
                desc = f"Actual expenditure in {record.locality} ({scheme_name}) exceeded allocated budget by {pct_over}% (Budget: ₹{record.budget_amount:,.2f}, Actual: ₹{record.actual_amount:,.2f})."
                _upsert_anomaly(db, record, "OVERBUDGET_EXPENDITURE", 0.0, record.actual_amount, pct_over, sev, desc)
                summary[sev] += 1
                anomalies_found += 1

        # Check 2: YoY Variance & Zero Baseline Handling
        if not prev_record:
            # Check multi-year history if available, else skip YoY
            continue

        prev_val = prev_record.actual_amount
        curr_val = record.actual_amount

        if prev_val == 0:
            if curr_val > 0:
                sev = "HIGH" if curr_val >= 50_000_000 else "MODERATE"
                desc = f"New major allocation for {scheme_name} in {record.year}: ₹{curr_val:,.2f} (Previous year had zero spend)."
                _upsert_anomaly(db, record, "NEW_SCHEME_ALLOCATION", 0.0, curr_val, 100.0, sev, desc)
                summary[sev] += 1
                anomalies_found += 1
            continue

        pct_change = round(((curr_val - prev_val) / prev_val) * 100, 2)

        # Threshold rules
        if pct_change >= 40.0:
            sev = "HIGH"
            atype = "SPENDING_SPIKE"
            desc = f"{dept_name} spending for {scheme_name} spiked by +{pct_change}% YoY in {record.year} (₹{prev_val:,.2f} -> ₹{curr_val:,.2f})."
            _upsert_anomaly(db, record, atype, prev_val, curr_val, pct_change, sev, desc)
            summary["HIGH"] += 1
            anomalies_found += 1
        elif pct_change >= 20.0:
            sev = "MODERATE"
            atype = "SPENDING_SPIKE"
            desc = f"{dept_name} spending for {scheme_name} increased moderate +{pct_change}% YoY in {record.year} (₹{prev_val:,.2f} -> ₹{curr_val:,.2f})."
            _upsert_anomaly(db, record, atype, prev_val, curr_val, pct_change, sev, desc)
            summary["MODERATE"] += 1
            anomalies_found += 1
        elif pct_change <= -40.0:
            sev = "HIGH"
            atype = "SPENDING_DROP"
            desc = f"{dept_name} spending for {scheme_name} dropped severely by {pct_change}% YoY in {record.year} (₹{prev_val:,.2f} -> ₹{curr_val:,.2f})."
            _upsert_anomaly(db, record, atype, prev_val, curr_val, pct_change, sev, desc)
            summary["HIGH"] += 1
            anomalies_found += 1
        elif pct_change <= -20.0:
            sev = "MODERATE"
            atype = "SPENDING_DROP"
            desc = f"{dept_name} spending for {scheme_name} dropped moderately by {pct_change}% YoY in {record.year} (₹{prev_val:,.2f} -> ₹{curr_val:,.2f})."
            _upsert_anomaly(db, record, atype, prev_val, curr_val, pct_change, sev, desc)
            summary["MODERATE"] += 1
            anomalies_found += 1
        else:
            summary["NORMAL"] += 1

        # Check 3: Multi-Year Moving Average Deviation (3 prior years)
        past_records = db.query(BudgetRecord).filter(
            BudgetRecord.department_id == record.department_id,
            BudgetRecord.scheme_id == record.scheme_id,
            BudgetRecord.locality == record.locality,
            BudgetRecord.category == record.category,
            BudgetRecord.year < record.year,
            BudgetRecord.year >= record.year - 3
        ).all()

        if len(past_records) >= 2:
            avg_past = sum(r.actual_amount for r in past_records) / len(past_records)
            if avg_past > 0:
                dev = round(((curr_val - avg_past) / avg_past) * 100, 2)
                if dev > 50.0:
                    desc = f"Expenditure for {scheme_name} in {record.year} deviates by +{dev}% from the multi-year average (₹{avg_past:,.2f} avg -> ₹{curr_val:,.2f})."
                    _upsert_anomaly(db, record, "MULTI_YEAR_DEVIATION", avg_past, curr_val, dev, "HIGH", desc)

    db.commit()

    return {
        "analyzed_records": len(records),
        "anomalies_found": anomalies_found,
        "new_anomalies_created": anomalies_found,
        "summary": summary
    }

def _upsert_anomaly(db: Session, record: BudgetRecord, anomaly_type: str, prev_val: float, curr_val: float, pct_change: float, severity: str, description: str):
    """Helper to upsert an anomaly record to prevent duplicate entries."""
    existing = db.query(Anomaly).filter(
        Anomaly.budget_record_id == record.id,
        Anomaly.anomaly_type == anomaly_type
    ).first()

    if existing:
        existing.previous_value = prev_val
        existing.current_value = curr_val
        existing.percentage_change = pct_change
        existing.severity = severity
        existing.description = description
    else:
        anom = Anomaly(
            budget_record_id=record.id,
            department_id=record.department_id,
            scheme_id=record.scheme_id,
            year=record.year,
            anomaly_type=anomaly_type,
            previous_value=prev_val,
            current_value=curr_val,
            percentage_change=pct_change,
            severity=severity,
            status="PENDING",
            description=description
        )
        db.add(anom)
