from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.department import Department
from app.models.scheme import Scheme
from app.models.budget_record import BudgetRecord
from app.models.anomaly import Anomaly
from app.schemas.dashboard import DashboardSummary, TopSpenderItem, YearlyTrendItem
from app.schemas.budget import CompareYearsResponse, YearlyBreakdownItem

def get_dashboard_summary(db: Session) -> DashboardSummary:
    """Calculates overall dashboard aggregated metrics, top spending departments, and yearly trends."""
    total_budget = db.query(func.coalesce(func.sum(BudgetRecord.budget_amount), 0.0)).scalar()
    total_actual = db.query(func.coalesce(func.sum(BudgetRecord.actual_amount), 0.0)).scalar()
    
    total_departments = db.query(func.count(Department.id)).scalar()
    total_schemes = db.query(func.count(Scheme.id)).scalar()

    total_anomalies = db.query(func.count(Anomaly.id)).scalar()
    high_anomalies = db.query(func.count(Anomaly.id)).filter(Anomaly.severity == "HIGH").scalar()

    # Top spending departments (for latest year)
    latest_year = db.query(func.max(BudgetRecord.year)).scalar() or 2026

    top_dept_query = db.query(
        Department.id,
        Department.name,
        func.sum(BudgetRecord.budget_amount).label("total_budget"),
        func.sum(BudgetRecord.actual_amount).label("total_actual")
    ).join(BudgetRecord, Department.id == BudgetRecord.department_id)\
     .filter(BudgetRecord.year == latest_year)\
     .group_by(Department.id, Department.name)\
     .order_by(desc("total_actual"))\
     .limit(5).all()

    top_spenders = []
    for dept_id, dept_name, b_amt, a_amt in top_dept_query:
        # Calculate YoY for department
        prev_actual = db.query(func.sum(BudgetRecord.actual_amount))\
            .filter(BudgetRecord.department_id == dept_id, BudgetRecord.year == latest_year - 1)\
            .scalar() or 0.0
        
        yoy = round(((a_amt - prev_actual) / prev_actual * 100), 2) if prev_actual > 0 else 0.0
        top_spenders.append(TopSpenderItem(
            department_id=dept_id,
            department_name=dept_name,
            total_budget=float(b_amt),
            total_actual=float(a_amt),
            yoy_change_percentage=yoy
        ))

    # Yearly trends
    yearly_query = db.query(
        BudgetRecord.year,
        func.sum(BudgetRecord.budget_amount).label("total_budget"),
        func.sum(BudgetRecord.actual_amount).label("total_actual")
    ).group_by(BudgetRecord.year).order_by(BudgetRecord.year).all()

    yearly_trends = [
        YearlyTrendItem(year=y, total_budget=float(b), total_actual=float(a))
        for y, b, a in yearly_query
    ]

    return DashboardSummary(
        total_budget_amount=float(total_budget),
        total_actual_amount=float(total_actual),
        total_departments=total_departments,
        total_schemes=total_schemes,
        total_anomalies_count=total_anomalies,
        high_severity_anomalies_count=high_anomalies,
        top_spending_departments=top_spenders,
        yearly_trend=yearly_trends
    )

def compare_years(db: Session, department_id: str, start_year: int, end_year: int, scheme_id: str = None) -> CompareYearsResponse:
    """Historical comparison engine across multiple budget years for a department or scheme."""
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise ValueError(f"Department ID '{department_id}' not found.")

    scheme_name = None
    if scheme_id:
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        scheme_name = scheme.name if scheme else None

    query = db.query(
        BudgetRecord.year,
        func.sum(BudgetRecord.budget_amount).label("budget_sum"),
        func.sum(BudgetRecord.actual_amount).label("actual_sum")
    ).filter(
        BudgetRecord.department_id == department_id,
        BudgetRecord.year >= start_year,
        BudgetRecord.year <= end_year
    )

    if scheme_id:
        query = query.filter(BudgetRecord.scheme_id == scheme_id)

    records = query.group_by(BudgetRecord.year).order_by(BudgetRecord.year).all()

    breakdown = []
    prev_actual = None

    for year, b_sum, a_sum in records:
        b_val = float(b_sum)
        a_val = float(a_sum)
        
        yoy = round(((a_val - prev_actual) / prev_actual) * 100, 2) if (prev_actual and prev_actual > 0) else 0.0
        utilization = round((a_val / b_val) * 100, 2) if b_val > 0 else 0.0

        breakdown.append(YearlyBreakdownItem(
            year=year,
            budget_amount=b_val,
            actual_amount=a_val,
            yoy_change_percentage=yoy,
            utilization_percentage=utilization
        ))
        prev_actual = a_val

    # Overall multi-year trend calculation
    if breakdown:
        first_actual = breakdown[0].actual_amount
        last_actual = breakdown[-1].actual_amount
        total_growth = round(((last_actual - first_actual) / first_actual * 100), 2) if first_actual > 0 else 0.0

        if total_growth > 50.0:
            trend = "ABNORMAL_SPIKE"
        elif total_growth < -25.0:
            trend = "SEVERE_DROP"
        elif total_growth > 10.0:
            trend = "GROWING"
        else:
            trend = "STABLE"
    else:
        total_growth = 0.0
        trend = "STABLE"

    return CompareYearsResponse(
        department_id=dept.id,
        department_name=dept.name,
        scheme_id=scheme_id,
        scheme_name=scheme_name,
        start_year=start_year,
        end_year=end_year,
        yearly_breakdown=breakdown,
        multi_year_trend=trend,
        total_growth_percentage=total_growth
    )
