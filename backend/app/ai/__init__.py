"""CivicLens - Member 4 Agentic AI Module.

Provides LangGraph-based investigation workflow, evidence validation,
and grounded Gemini explanations for budget spending anomalies.
"""

from .schemas import (
    AnomalyPayload,
    HistoricalSpendingRecord,
    EvidenceDocument,
    InvestigationStatus,
    InvestigationResult,
)
from .state import InvestigationState
from .adapters import (
    Member2AdapterProtocol,
    Member3RAGAdapterProtocol,
    DemoMember2Adapter,
    DemoMember3RAGAdapter,
)
from .gemini import (
    BaseGeminiClient,
    MockGeminiAdapter,
    RealGeminiAdapter,
    get_gemini_client,
)
from .graph import create_investigation_graph, run_investigation
from .tools import (
    BudgetRecordInput,
    HistoricalSpendingInput,
    CompareBudgetInput,
    SearchDocumentsInput,
    SourceMetadataInput,
    get_budget_record,
    get_historical_spending,
    compare_budget_periods,
    search_budget_documents,
    get_source_metadata,
    INVESTIGATION_TOOLS,
)

__all__ = [
    "AnomalyPayload",
    "HistoricalSpendingRecord",
    "EvidenceDocument",
    "InvestigationStatus",
    "InvestigationResult",
    "InvestigationState",
    "Member2AdapterProtocol",
    "Member3RAGAdapterProtocol",
    "DemoMember2Adapter",
    "DemoMember3RAGAdapter",
    "BaseGeminiClient",
    "MockGeminiAdapter",
    "RealGeminiAdapter",
    "get_gemini_client",
    "create_investigation_graph",
    "run_investigation",
    "BudgetRecordInput",
    "HistoricalSpendingInput",
    "CompareBudgetInput",
    "SearchDocumentsInput",
    "SourceMetadataInput",
    "get_budget_record",
    "get_historical_spending",
    "compare_budget_periods",
    "search_budget_documents",
    "get_source_metadata",
    "INVESTIGATION_TOOLS",
]
