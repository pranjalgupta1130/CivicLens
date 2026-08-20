"""Live Database Adapters for Member 2 (Backend/Database) and Member 3 (Document RAG).

Implements Member2AdapterProtocol and Member3RAGAdapterProtocol backed by SQLAlchemy models,
with transparent fallback to deterministic demo datasets when DB records are absent.
"""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from .schemas import AnomalyPayload, HistoricalSpendingRecord, EvidenceDocument
from .adapters import (
    Member2AdapterProtocol,
    Member3RAGAdapterProtocol,
    DemoMember2Adapter,
    DemoMember3RAGAdapter,
)


logger = logging.getLogger("civiclens.ai.adapters")


class LiveMember2DBAdapter:
    """Production database adapter querying Member 2 tables (Anomaly, BudgetRecord, Department, Scheme)."""

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self._demo_fallback = DemoMember2Adapter()

    def get_anomaly_data(self, anomaly_id: str) -> Optional[AnomalyPayload]:
        if self.db:
            try:
                from app.models.anomaly import Anomaly
                from app.models.department import Department
                from app.models.scheme import Scheme

                anomaly = self.db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
                if anomaly:
                    dept = self.db.query(Department).filter(Department.id == anomaly.department_id).first()
                    scheme = self.db.query(Scheme).filter(Scheme.id == anomaly.scheme_id).first()

                    dept_name = dept.name if dept else "General"
                    scheme_name = scheme.name if scheme else None
                    prev_year = anomaly.year - 1 if anomaly.year else 2025

                    return AnomalyPayload(
                        anomaly_id=str(anomaly.id),
                        department=dept_name,
                        scheme=scheme_name,
                        year=anomaly.year,
                        previous_year=prev_year,
                        previous_spending=float(anomaly.previous_value),
                        current_spending=float(anomaly.current_value),
                        percentage_change=float(anomaly.percentage_change),
                        status=anomaly.status or "FLAGGED",
                    )
            except Exception as e:
                logger.warning(f"Error querying live Anomaly table ({e}); checking fallback.")

        # Fallback to demo anomaly catalogue
        return self._demo_fallback.get_anomaly_data(anomaly_id)

    def get_budget_record(self, department: str, year: int) -> Optional[Dict[str, Any]]:
        if self.db:
            try:
                from app.models.budget_record import BudgetRecord
                from app.models.department import Department
                from app.models.scheme import Scheme

                dept = self.db.query(Department).filter(func.lower(Department.name) == department.lower().strip()).first()
                if dept:
                    records = self.db.query(BudgetRecord).filter(
                        BudgetRecord.department_id == dept.id,
                        BudgetRecord.year == year
                    ).all()

                    if records:
                        total_budget = sum(float(r.budget_amount) for r in records)
                        total_actual = sum(float(r.actual_amount) for r in records)
                        first_scheme = None
                        if records[0].scheme_id:
                            sch = self.db.query(Scheme).filter(Scheme.id == records[0].scheme_id).first()
                            first_scheme = sch.name if sch else None

                        return {
                            "department": dept.name,
                            "scheme": first_scheme,
                            "year": year,
                            "amount": total_actual if total_actual > 0 else total_budget,
                            "budget_amount": total_budget,
                            "actual_amount": total_actual,
                            "currency": "INR Crores",
                        }
            except Exception as e:
                logger.warning(f"Error querying live BudgetRecord table ({e}); checking fallback.")

        return self._demo_fallback.get_budget_record(department, year)

    def get_historical_spending(
        self, department: str, start_year: int, end_year: int
    ) -> List[HistoricalSpendingRecord]:
        if self.db:
            try:
                from app.models.budget_record import BudgetRecord
                from app.models.department import Department
                from app.models.scheme import Scheme

                dept = self.db.query(Department).filter(func.lower(Department.name) == department.lower().strip()).first()
                if dept:
                    records = self.db.query(BudgetRecord).filter(
                        BudgetRecord.department_id == dept.id,
                        BudgetRecord.year >= start_year,
                        BudgetRecord.year <= end_year
                    ).order_by(BudgetRecord.year.asc()).all()

                    if records:
                        # Aggregate by year
                        yearly_map: Dict[int, float] = {}
                        for r in records:
                            amt = float(r.actual_amount) if float(r.actual_amount) > 0 else float(r.budget_amount)
                            yearly_map[r.year] = yearly_map.get(r.year, 0.0) + amt

                        results = []
                        for yr, total in sorted(yearly_map.items()):
                            results.append(HistoricalSpendingRecord(
                                year=yr,
                                amount=round(total, 2),
                                department=dept.name,
                                scheme=None,
                            ))
                        return results
            except Exception as e:
                logger.warning(f"Error querying live historical spending ({e}); checking fallback.")

        return self._demo_fallback.get_historical_spending(department, start_year, end_year)

    def compare_budget_periods(
        self, department: str, period_a: int, period_b: int
    ) -> Dict[str, Any]:
        rec_a = self.get_budget_record(department, period_a)
        rec_b = self.get_budget_record(department, period_b)

        if not rec_a or not rec_b:
            return self._demo_fallback.compare_budget_periods(department, period_a, period_b)

        val_a = rec_a["amount"]
        val_b = rec_b["amount"]
        diff = val_b - val_a
        pct = (diff / val_a) * 100.0 if val_a else 0.0

        return {
            "department": department,
            "period_a": period_a,
            "amount_a": val_a,
            "period_b": period_b,
            "amount_b": val_b,
            "absolute_change": round(diff, 2),
            "percentage_change": round(pct, 2),
            "note": "Live Database Record",
        }


class LiveMember3DBRAGAdapter:
    """Production RAG adapter querying Member 3 tables (BudgetDocument, DocumentChunk)."""

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self._demo_fallback = DemoMember3RAGAdapter()

    def retrieve_supporting_evidence(
        self, query: str, department: str, top_k: int = 3
    ) -> List[EvidenceDocument]:
        # First: Try live HTTP request to standalone RAG microservice (:8001)
        try:
            import httpx
            rag_url = os.getenv("RAG_SERVICE_URL", "http://localhost:8001/api/v1/query")
            resp = httpx.post(
                rag_url,
                json={"query": query, "department_filter": department, "top_k": top_k},
                timeout=3.0
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for idx, src in enumerate(data.get("sources", [])):
                    results.append(EvidenceDocument(
                        document_id=f"rag-doc-{idx+1}",
                        document_title=src.get("document", "Official Budget Record"),
                        page_number=src.get("page", 1),
                        relevant_chunk_text=src.get("excerpt", ""),
                        source_url="http://localhost:8001/api/v1/query",
                    ))
                if results:
                    return results
        except Exception as e:
            logger.info(f"Live RAG service HTTP query unavailable ({e}); trying local DB.")

        if self.db:
            try:
                from app.models.integration import BudgetDocument, DocumentChunk
                from app.models.department import Department

                # Match chunks by department name or query keywords
                dept = self.db.query(Department).filter(func.lower(Department.name) == department.lower().strip()).first()
                query_filter = self.db.query(DocumentChunk).join(BudgetDocument)
                if dept:
                    query_filter = query_filter.filter(BudgetDocument.department_id == dept.id)

                # Search by keyword matching in chunk text
                keywords = [k for k in query.split() if len(k) > 3]
                if keywords:
                    chunk_matches = query_filter.all()
                    scored_docs: List[tuple[int, EvidenceDocument]] = []
                    for chunk in chunk_matches:
                        doc = chunk.document
                        score = sum(1 for kw in keywords if kw.lower() in chunk.content.lower())
                        if score > 0:
                            evidence = EvidenceDocument(
                                document_id=str(doc.id),
                                document_title=doc.title,
                                page_number=chunk.page_number,
                                relevant_chunk_text=chunk.content,
                                source_url=doc.source_url or f"https://civiclens.gov/docs/{doc.id}.pdf",
                            )
                            scored_docs.append((score, evidence))

                    if scored_docs:
                        scored_docs.sort(key=lambda x: x[0], reverse=True)
                        return [item[1] for item in scored_docs[:top_k]]
            except Exception as e:
                logger.warning(f"Error querying live DocumentChunk table ({e}); checking fallback.")

        return self._demo_fallback.retrieve_supporting_evidence(query, department, top_k)

    def get_source_metadata(self, document_id: str) -> Optional[EvidenceDocument]:
        if self.db:
            try:
                from app.models.integration import BudgetDocument, DocumentChunk

                doc = self.db.query(BudgetDocument).filter(BudgetDocument.id == document_id).first()
                if doc:
                    first_chunk = self.db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).first()
                    return EvidenceDocument(
                        document_id=str(doc.id),
                        document_title=doc.title,
                        page_number=first_chunk.page_number if first_chunk else 1,
                        relevant_chunk_text=first_chunk.content if first_chunk else "",
                        source_url=doc.source_url,
                    )
            except Exception as e:
                logger.warning(f"Error querying live BudgetDocument metadata ({e}); checking fallback.")

        return self._demo_fallback.get_source_metadata(document_id)
