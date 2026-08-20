"""Member 2 (Backend/Data) and Member 3 (RAG) Adapter Interfaces.

Defines protocol contracts and deterministic demo implementations for testing.
All demo data is strictly labeled: [DEMO DATA — NOT REAL GOVERNMENT DATA].
"""

from typing import Protocol, List, Dict, Any, Optional
from .schemas import AnomalyPayload, HistoricalSpendingRecord, EvidenceDocument



class Member2AdapterProtocol(Protocol):
    """Interface protocol for Member 2 FastAPI/Database services."""
    def get_anomaly_data(self, anomaly_id: str) -> Optional[AnomalyPayload]:
        """Fetch anomaly details by ID."""
        ...

    def get_budget_record(self, department: str, year: int) -> Optional[Dict[str, Any]]:
        """Fetch budget record for a department and fiscal year."""
        ...

    def get_historical_spending(
        self, department: str, start_year: int, end_year: int
    ) -> List[HistoricalSpendingRecord]:
        """Fetch multi-year historical spending trends."""
        ...

    def compare_budget_periods(
        self, department: str, period_a: int, period_b: int
    ) -> Dict[str, Any]:
        """Compute comparative change between two budget periods."""
        ...


class Member3RAGAdapterProtocol(Protocol):
    """Interface protocol for Member 3 RAG / pgvector retrieval services."""
    def retrieve_supporting_evidence(
        self, query: str, department: str, top_k: int = 3
    ) -> List[EvidenceDocument]:
        """Retrieve relevant documentary evidence chunks and citations."""
        ...

    def get_source_metadata(self, document_id: str) -> Optional[EvidenceDocument]:
        """Fetch metadata for a specific document ID."""
        ...


# ==============================================================================
# DETERMINISTIC DEMO ADAPTERS (PLACEHOLDERS)
# ==============================================================================

class DemoMember2Adapter:
    """Deterministic demo adapter simulating Member 2 backend data.
    
    [DEMO DATA — NOT REAL GOVERNMENT DATA]
    """

    def __init__(self):
        # Demo anomalies catalogue
        self._anomalies: Dict[str, AnomalyPayload] = {
            "ANOMALY-HLTH-2026": AnomalyPayload(
                anomaly_id="ANOMALY-HLTH-2026",
                department="Health",
                scheme="Primary Healthcare",
                year=2026,
                previous_year=2025,
                previous_spending=100.0,
                current_spending=170.0,
                percentage_change=70.0,
                status="FLAGGED",
            ),
            "ANOMALY-EDU-2026": AnomalyPayload(
                anomaly_id="ANOMALY-EDU-2026",
                department="Education",
                scheme="Digital Classrooms",
                year=2026,
                previous_year=2025,
                previous_spending=50.0,
                current_spending=52.0,
                percentage_change=4.0,
                status="NORMAL",
            ),
        }

        # Demo historical spending
        self._history: Dict[str, List[HistoricalSpendingRecord]] = {
            "Health": [
                HistoricalSpendingRecord(year=2023, amount=82.5, department="Health", scheme="Primary Healthcare"),
                HistoricalSpendingRecord(year=2024, amount=91.0, department="Health", scheme="Primary Healthcare"),
                HistoricalSpendingRecord(year=2025, amount=100.0, department="Health", scheme="Primary Healthcare"),
                HistoricalSpendingRecord(year=2026, amount=170.0, department="Health", scheme="Primary Healthcare"),
            ],
            "Education": [
                HistoricalSpendingRecord(year=2023, amount=45.0, department="Education", scheme="Digital Classrooms"),
                HistoricalSpendingRecord(year=2024, amount=48.0, department="Education", scheme="Digital Classrooms"),
                HistoricalSpendingRecord(year=2025, amount=50.0, department="Education", scheme="Digital Classrooms"),
                HistoricalSpendingRecord(year=2026, amount=52.0, department="Education", scheme="Digital Classrooms"),
            ],
        }

    def get_anomaly_data(self, anomaly_id: str) -> Optional[AnomalyPayload]:
        return self._anomalies.get(anomaly_id)

    def get_budget_record(self, department: str, year: int) -> Optional[Dict[str, Any]]:
        history = self._history.get(department, [])
        for record in history:
            if record.year == year:
                return {
                    "department": department,
                    "scheme": record.scheme,
                    "year": record.year,
                    "amount": record.amount,
                    "currency": "INR Crores [DEMO DATA]",
                }
        return None

    def get_historical_spending(
        self, department: str, start_year: int, end_year: int
    ) -> List[HistoricalSpendingRecord]:
        history = self._history.get(department, [])
        return [r for r in history if start_year <= r.year <= end_year]

    def compare_budget_periods(
        self, department: str, period_a: int, period_b: int
    ) -> Dict[str, Any]:
        rec_a = self.get_budget_record(department, period_a)
        rec_b = self.get_budget_record(department, period_b)
        if not rec_a or not rec_b:
            return {"error": "One or both periods not found"}

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
            "note": "[DEMO DATA — NOT REAL GOVERNMENT DATA]",
        }


class DemoMember3RAGAdapter:
    """Deterministic demo adapter simulating Member 3 RAG document retrieval.
    
    [DEMO DATA — NOT REAL GOVERNMENT DATA]
    """

    def __init__(self):
        self._corpus: Dict[str, List[EvidenceDocument]] = {
            "Health": [
                EvidenceDocument(
                    document_id="DOC-HLTH-2026-01",
                    document_title="Annual Health Infrastructure & Modernization Report 2026",
                    page_number=14,
                    relevant_chunk_text=(
                        "[DEMO DATA] Under the Primary Healthcare Expansion Scheme, budgetary allocations "
                        "for FY 2026 increased from Rs 100 Cr to Rs 170 Cr (+70%) to fund the emergency procurement "
                        "of diagnostic equipment and recruitment of 450 rural medical officers across newly sanctioned "
                        "district clinics."
                    ),
                    source_url="https://civiclens.demo/documents/hlth-2026-01.pdf",
                )
            ]
        }

    def retrieve_supporting_evidence(
        self, query: str, department: str, top_k: int = 3
    ) -> List[EvidenceDocument]:
        # Return matched evidence for demo departments; return empty list for others to test empty-evidence cases
        dept_key = department.capitalize().strip() if department else ""
        docs = self._corpus.get(dept_key, [])
        return docs[:top_k]

    def get_source_metadata(self, document_id: str) -> Optional[EvidenceDocument]:
        """Fetch source metadata for a specific document ID.
        
        [DEMO DATA — NOT REAL GOVERNMENT DATA]
        """
        clean_id = document_id.strip() if document_id else ""
        for docs in self._corpus.values():
            for doc in docs:
                if doc.document_id.lower() == clean_id.lower():
                    return doc
        return None

