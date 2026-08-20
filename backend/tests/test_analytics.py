import pytest
from app.services.analytics import get_dashboard_summary, compare_years
from app.models.department import Department

def test_dashboard_summary_and_compare(seeded_db):
    summary = get_dashboard_summary(seeded_db)
    assert summary.total_departments == 5
    assert summary.total_schemes == 5
    assert summary.total_budget_amount > 0
    assert summary.total_actual_amount > 0
    assert len(summary.top_spending_departments) > 0

    dept = seeded_db.query(Department).filter(Department.code == "HEALTH").first()
    comp = compare_years(seeded_db, department_id=dept.id, start_year=2023, end_year=2026)
    assert comp.start_year == 2023
    assert comp.end_year == 2026
    assert len(comp.yearly_breakdown) == 4
    assert comp.multi_year_trend in ["GROWING", "ABNORMAL_SPIKE"]
