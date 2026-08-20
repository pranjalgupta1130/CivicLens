"""RTI Generator Service for CivicLens.

Generates structured Right to Information (RTI) petitions grounded strictly
in verified budget data, RAG documentary evidence, and member adapters.
Disallows unsubstantiated accusations, fake citations, or fabricated spending numbers.
"""

import uuid
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.schemas.rti import (
    RTIGenerateRequest,
    RTIGenerateResponse,
    RequestedRecordItem,
)
from app.ai.live_adapters import LiveMember2DBAdapter, LiveMember3DBRAGAdapter
from app.ai.tools import (
    compare_budget_periods,
    get_historical_spending,
    search_budget_documents,
    get_source_metadata,
)

logger = logging.getLogger("civiclens.ai.rti")


def generate_rti_application(
    req: RTIGenerateRequest,
    db: Optional[Session] = None,
) -> RTIGenerateResponse:
    """Generate a structured, grounded RTI petition based on verified budget data and RAG evidence."""
    dept = req.department.strip()
    scheme = req.scheme or "General Sector Allocations"
    year = req.year or 2026
    period_a = req.period_a or (year - 1 if year else 2025)
    period_b = req.period_b or year
    applicant_name = req.applicant_name or "Concerned Citizen"
    applicant_address = req.applicant_address or "State Capital Region"

    m2_adapter = LiveMember2DBAdapter(db=db)
    m3_adapter = LiveMember3DBRAGAdapter(db=db)

    anomaly_info = None
    if req.anomaly_id:
        anomaly_info = m2_adapter.get_anomaly_data(req.anomaly_id)

    if anomaly_info:
        dept = anomaly_info.department or dept
        if anomaly_info.scheme:
            scheme = anomaly_info.scheme
        if anomaly_info.year:
            period_b = anomaly_info.year
            period_a = anomaly_info.previous_year or (period_b - 1)

    # 1. Retrieve period comparison metrics
    comp_res = compare_budget_periods(
        department=dept,
        period_a=period_a,
        period_b=period_b,
        member2_adapter=m2_adapter,
    )
    comp_data = comp_res.get("comparison", {})
    pct_change = comp_data.get("percentage_change", 0.0)
    amt_a = comp_data.get("amount_a", 0.0)
    amt_b = comp_data.get("amount_b", 0.0)

    # 2. Retrieve documentary evidence chunks via RAG
    query_term = f"{dept} {scheme} budget spending {period_b}"
    if req.user_query:
        query_term = req.user_query

    search_res = search_budget_documents(
        query=query_term,
        department=dept,
        top_k=3,
        member3_adapter=m3_adapter,
    )
    evidence_docs = search_res.get("results", [])

    # 3. Grounding & Evidence Check
    has_evidence = len(evidence_docs) > 0 and search_res.get("status") != "NO_EVIDENCE_FOUND"
    has_db_data = amt_b > 0 or amt_a > 0 or anomaly_info is not None

    background_facts: List[str] = []
    evidence_sources: List[str] = []

    if has_db_data:
        background_facts.append(
            f"According to recorded financial allocations for the Department of {dept}, "
            f"the budget spending in FY {period_a} was ₹{amt_a:.2f} Crores and in FY {period_b} "
            f"was ₹{amt_b:.2f} Crores, reflecting a variance of {pct_change:+.1f}%."
        )

    if has_evidence:
        for doc in evidence_docs:
            doc_title = doc.get("document_title", "Official Record")
            pg = doc.get("page_number")
            pg_str = f" (Page {pg})" if pg else ""
            evidence_sources.append(f"{doc_title}{pg_str}")
            background_facts.append(
                f"Documentary record '{doc_title}'{pg_str} states: \"{doc.get('relevant_chunk_text')}\""
            )
    elif not has_db_data:
        background_facts.append(
            f"No pre-existing verified documentary evidence or financial ledger records for '{dept}' "
            f"were identified in the public database repository."
        )

    # 4. Construct grounded requests for records & information
    info_requested: List[str] = [
        f"Detailed scheme-wise breakdown of budget allocations and actual expenditures for the Department of {dept} ({scheme}) for FY {period_a} and FY {period_b}.",
        f"Copies of official sanction orders, administrative approvals, and fund disbursement certificates released under {scheme} during FY {period_b}.",
        f"Month-by-month expenditure ledger and utilization certificates (UCs) submitted for the funds disbursed under {scheme} for FY {period_b}.",
        f"Minutes of audit committee meetings or CAG/Internal Audit reports reviewing spending variances for {dept} in FY {period_b}.",
    ]

    docs_requested: List[RequestedRecordItem] = [
        RequestedRecordItem(
            record_description=f"Certified copies of Scheme Allocation & Disbursement Orders for {scheme}",
            period_covered=f"FY {period_a} – FY {period_b}",
        ),
        RequestedRecordItem(
            record_description=f"Certified Copy of Utilization Certificates (UCs) for Department of {dept}",
            period_covered=f"FY {period_b}",
        ),
        RequestedRecordItem(
            record_description="Certified copies of Internal Audit Reports and Inspection Notes",
            period_covered=f"FY {period_a} – FY {period_b}",
        ),
    ]

    clarification_questions: List[str] = [
        f"What official factors led to the spending change of {pct_change:+.1f}% in FY {period_b} compared to FY {period_a}?",
        f"Were any supplementary grants sanctioned for {scheme} during FY {period_b}? If yes, please provide details.",
    ]

    # Set Grounding Status and Confidence
    if has_evidence and has_db_data:
        status = "SUPPORTED"
        confidence = 0.95
    elif has_db_data:
        status = "GROUNDED_RECORD_REQUEST"
        confidence = 0.80
    else:
        status = "INSUFFICIENT_EVIDENCE"
        confidence = 0.0

    rti_id = f"RTI-{dept[:4].upper()}-{period_b}-{uuid.uuid4().hex[:6].upper()}"
    public_authority = f"Public Information Officer (PIO), Department of {dept}"
    subject = f"Application under RTI Act 2005 for records regarding {dept} ({scheme}) expenditures for FY {period_b}"

    # Format official legal petition text
    facts_str = "\n".join([f"   {i+1}. {fact}" for i, fact in enumerate(background_facts)])
    info_str = "\n".join([f"   {i+1}. {info}" for i, info in enumerate(info_requested)])
    docs_str = "\n".join([f"   {i+1}. {doc.record_description} (Period: {doc.period_covered})" for i, doc in enumerate(docs_requested)])
    sources_str = ", ".join(evidence_sources) if evidence_sources else "CivicLens Budget Ledger & Public Repositories"

    formatted_text = f"""BEFORE THE PUBLIC INFORMATION OFFICER (PIO)
RIGHT TO INFORMATION ACT, 2005

Target Public Authority: {public_authority}
Date of Application: FY {period_b} Audit Cycle

I. APPLICANT DETAILS:
   Name: {applicant_name}
   Address: {applicant_address}

II. SUBJECT OF REQUEST:
   {subject}

III. VERIFIED BACKGROUND & STATEMENT OF FACTS:
{facts_str}

IV. SPECIFIC INFORMATION REQUESTED UNDER SECTION 6(1):
{info_str}

V. SPECIFIC OFFICIAL DOCUMENTS & CERTIFIED RECORDS REQUESTED:
{docs_str}

VI. PERIOD COVERED:
   FY {period_a} to FY {period_b}

VII. SOURCE & EVIDENCE REFERENCES:
   Verified via: {sources_str}

VIII. DECLARATION:
   I state that the information sought falls within the domain of public records and does not fall under any exemption specified in Section 8 or 9 of the RTI Act 2005.

Applicant Signature: {applicant_name}
Application ID: {rti_id}
"""

    return RTIGenerateResponse(
        rti_application_id=rti_id,
        public_authority=public_authority,
        department=dept,
        scheme=scheme,
        subject=subject,
        financial_years=[f"FY {period_a}", f"FY {period_b}"],
        background_facts=background_facts,
        information_requested=info_requested,
        documents_requested=docs_requested,
        clarification_questions=clarification_questions,
        evidence_sources=evidence_sources,
        grounding_confidence=confidence,
        status=status,
        formatted_rti_text=formatted_text,
    )
