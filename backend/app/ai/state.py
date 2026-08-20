"""InvestigationState definition for LangGraph workflow."""

from typing import TypedDict, List, Dict, Any, Optional


class InvestigationState(TypedDict, total=False):
    """Typed state for the CivicLens LangGraph investigation workflow.
    
    Contains strictly structured metadata, citations, and bounded tool tracking.
    Does not expose or store private chain-of-thought.
    """
    anomaly: Optional[Dict[str, Any]]
    historical_data: List[Dict[str, Any]]
    historical_context: Optional[Dict[str, Any]]
    retrieved_evidence: List[Dict[str, Any]]
    evidence_count: int
    evidence_valid: bool
    sources: List[Dict[str, Any]]
    source_metadata: List[Dict[str, Any]]
    tool_calls: List[Dict[str, Any]]
    tool_errors: List[str]
    investigation_result: Optional[Dict[str, Any]]
    confidence: float
    status: str
    error: Optional[str]

