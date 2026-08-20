from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.budget_record import BudgetRecord
from app.models.department import Department
from app.models.scheme import Scheme
from app.schemas.budget import BudgetRecordOut, BudgetDossierOut, ExpenditureBreakdownItem, EvidenceProvenanceItem
from app.ai.live_adapters import LiveMember3DBRAGAdapter

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=list[BudgetRecordOut])
def list_budgets(
    department_id: Optional[str] = None,
    scheme_id: Optional[str] = None,
    year: Optional[int] = None,
    locality: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BudgetRecord)
    if department_id:
        query = query.filter(BudgetRecord.department_id == department_id)
    if scheme_id:
        query = query.filter(BudgetRecord.scheme_id == scheme_id)
    if year:
        query = query.filter(BudgetRecord.year == year)
    if locality:
        query = query.filter(BudgetRecord.locality == locality)
    if category:
        query = query.filter(BudgetRecord.category == category)

    records = query.all()
    results = []
    for r in records:
        dept = db.query(Department).filter(Department.id == r.department_id).first()
        scheme = db.query(Scheme).filter(Scheme.id == r.scheme_id).first()
        utilization = round((r.actual_amount / r.budget_amount * 100), 2) if r.budget_amount > 0 else 0.0

        results.append(BudgetRecordOut(
            id=r.id,
            department_id=r.department_id,
            scheme_id=r.scheme_id,
            year=r.year,
            locality=r.locality,
            category=r.category,
            budget_amount=float(r.budget_amount),
            actual_amount=float(r.actual_amount),
            source_document_id=r.source_document_id,
            created_at=r.created_at,
            department_name=dept.name if dept else None,
            scheme_name=scheme.name if scheme else None,
            utilization_percentage=utilization
        ))
    return results

@router.get("/dossier/{budget_id}", response_model=BudgetDossierOut)
def get_budget_dossier(budget_id: str, db: Session = Depends(get_db)):
    """Comprehensive budget dossier providing plain-language summaries, expenditure breakdown, YoY changes, and evidence provenance."""
    record = db.query(BudgetRecord).filter(BudgetRecord.id == budget_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget record not found")

    dept = db.query(Department).filter(Department.id == record.department_id).first()
    scheme = db.query(Scheme).filter(Scheme.id == record.scheme_id).first()

    dept_name = dept.name if dept else "General"
    scheme_name = scheme.name if scheme else "Public Scheme Outlay"

    b_val = float(record.budget_amount)
    a_val = float(record.actual_amount)
    diff = a_val - b_val
    utilization = round((a_val / b_val * 100), 1) if b_val > 0 else 0.0

    # Plain language summary
    if a_val > b_val * 1.01:
        diff_display = (a_val - b_val) / 10000000 if a_val >= 1000000 else (a_val - b_val)
        pct = ((a_val - b_val) / b_val) * 100
        summary = f"₹{diff_display:.1f} Cr more was spent than originally allocated (+{pct:.1f}% over budget)."
    elif a_val < b_val * 0.99:
        diff_display = (b_val - a_val) / 10000000 if b_val >= 1000000 else (b_val - a_val)
        pct = ((b_val - a_val) / b_val) * 100
        summary = f"₹{diff_display:.1f} Cr less was spent than originally allocated (-{pct:.1f}% under budget)."
    else:
        summary = "Exact outlay spent as originally allocated (100% utilization)."

    # Expenditure Breakdown (Where Did The Money Go?)
    same_dept_records = db.query(BudgetRecord).filter(
        BudgetRecord.department_id == record.department_id,
        BudgetRecord.year == record.year
    ).all()

    total_dept_actual = sum(float(r.actual_amount) for r in same_dept_records) or 1.0

    breakdown_items = []
    for r in same_dept_records:
        r_actual = float(r.actual_amount)
        r_budget = float(r.budget_amount)
        r_scheme = db.query(Scheme).filter(Scheme.id == r.scheme_id).first()
        label = f"{r_scheme.name if r_scheme else r.category} ({r.locality})"
        share = round((r_actual / total_dept_actual * 100), 1)

        breakdown_items.append(ExpenditureBreakdownItem(
            category_or_locality=label,
            allocated_amount=r_budget,
            actual_amount=r_actual,
            percentage_share=share
        ))

    # YoY Comparison (Why Did It Change?)
    prev_rec = db.query(BudgetRecord).filter(
        BudgetRecord.department_id == record.department_id,
        BudgetRecord.scheme_id == record.scheme_id,
        BudgetRecord.year == record.year - 1
    ).first()

    prev_year = record.year - 1 if prev_rec else None
    prev_amount = float(prev_rec.actual_amount) if prev_rec else None
    yoy_pct = None
    if prev_rec and float(prev_rec.actual_amount) > 0:
        yoy_pct = round(((a_val - float(prev_rec.actual_amount)) / float(prev_rec.actual_amount) * 100), 1)

    # Documentary Evidence & Provenance
    m3_adapter = LiveMember3DBRAGAdapter(db=db)
    query_str = f"{dept_name} {scheme_name} budget spending {record.year}"
    ev_docs = m3_adapter.retrieve_supporting_evidence(query=query_str, department=dept_name, top_k=2)

    evidence_items = []
    for doc in ev_docs:
        evidence_items.append(EvidenceProvenanceItem(
            document_title=doc.document_title,
            page_number=doc.page_number,
            relevant_chunk_text=doc.relevant_chunk_text,
            source_url=doc.source_url,
            provenance_statement="Source: Official government document",
            ai_grounding_statement="AI explanation generated from retrieved document evidence"
        ))

    return BudgetDossierOut(
        budget_record_id=record.id,
        department_name=dept_name,
        scheme_name=scheme_name,
        year=record.year,
        locality=record.locality,
        category=record.category,
        budget_amount=b_val,
        actual_amount=a_val,
        difference=diff,
        utilization_percentage=utilization,
        plain_language_summary=summary,
        expenditure_breakdown=breakdown_items,
        previous_year=prev_year,
        previous_year_amount=prev_amount,
        yoy_change_percentage=yoy_pct,
        evidence=evidence_items
    )

@router.get("/{budget_id}", response_model=BudgetRecordOut)
def get_budget(budget_id: str, db: Session = Depends(get_db)):
    record = db.query(BudgetRecord).filter(BudgetRecord.id == budget_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget record not found")

    dept = db.query(Department).filter(Department.id == record.department_id).first()
    scheme = db.query(Scheme).filter(Scheme.id == record.scheme_id).first()
    utilization = round((record.actual_amount / record.budget_amount * 100), 2) if record.budget_amount > 0 else 0.0

    return BudgetRecordOut(
        id=record.id,
        department_id=record.department_id,
        scheme_id=record.scheme_id,
        year=record.year,
        locality=record.locality,
        category=record.category,
        budget_amount=float(record.budget_amount),
        actual_amount=float(record.actual_amount),
        source_document_id=record.source_document_id,
        created_at=record.created_at,
        department_name=dept.name if dept else None,
        scheme_name=scheme.name if scheme else None,
        utilization_percentage=utilization
    )

