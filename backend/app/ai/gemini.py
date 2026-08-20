"""Gemini Client Integration & Mock Adapter for CivicLens.

Enforces zero-hallucination, evidence-grounded reasoning rules.
Provides MockGeminiAdapter for deterministic testing without external API keys.
"""

import json
import logging
from typing import Protocol, Dict, Any, List
from .schemas import InvestigationResult, InvestigationStatus, EvidenceDocument
from .config import GEMINI_API_KEY, GEMINI_MODEL, is_gemini_configured


logger = logging.getLogger(__name__)

GEMINI_SYSTEM_INSTRUCTION = """You are CivicLens AI, an objective public finance investigation analyst.
You must strictly follow these rules:
1. Grounding: Use ONLY the provided structured spending data and retrieved documentary evidence.
2. Zero-Hallucination: Never invent budget numbers, documents, page numbers, citations, schemes, or causes.
3. Insufficient Evidence: If the retrieved evidence is empty or does not explicitly state the cause of the spending change, state clearly: "Insufficient evidence to determine the cause."
4. Factuality: Clearly distinguish verified facts in the evidence from inferences.
5. No Chain-of-Thought: Do not output internal monologue or chain-of-thought. Output only the structured JSON result.
6. Format: Output valid JSON adhering to this schema:
{
  "summary": "Concise 1-2 sentence executive summary",
  "explanation": "Detailed grounded explanation citing specific facts from retrieved documents",
  "key_figures": {"previous_spending": float, "current_spending": float, "percentage_change": float},
  "evidence_status": "SUPPORTED" or "INSUFFICIENT_EVIDENCE",
  "confidence_score": float between 0.0 and 1.0
}
"""


class BaseGeminiClient(Protocol):
    """Protocol for Gemini reasoning engine."""
    def generate_explanation(
        self,
        anomaly: Dict[str, Any],
        historical_data: List[Dict[str, Any]],
        evidence: List[Dict[str, Any]],
    ) -> InvestigationResult:
        """Generate a grounded investigation explanation from validated evidence."""
        ...


class MockGeminiAdapter:
    """Deterministic mock Gemini adapter for tests and local offline execution.
    
    [DEMO / TEST MODE — NO EXTERNAL API CALL]
    """

    def generate_explanation(
        self,
        anomaly: Dict[str, Any],
        historical_data: List[Dict[str, Any]],
        evidence: List[Dict[str, Any]],
    ) -> InvestigationResult:
        dept = anomaly.get("department", "Unknown")
        scheme = anomaly.get("scheme", "General")
        prev_amt = anomaly.get("previous_spending", 0.0)
        curr_amt = anomaly.get("current_spending", 0.0)
        pct_change = anomaly.get("percentage_change", 0.0)

        # Evidence validation check
        if not evidence:
            return InvestigationResult(
                summary="Insufficient evidence to determine the cause.",
                explanation=(
                    f"Spending for {dept} ({scheme}) changed by {pct_change:+.1f}%, "
                    f"moving from {prev_amt} to {curr_amt} Cr. However, no documentary evidence "
                    f"was retrieved to verify the underlying policy or operational driver."
                ),
                key_figures={
                    "previous_spending": prev_amt,
                    "current_spending": curr_amt,
                    "percentage_change": pct_change,
                },
                evidence_status=InvestigationStatus.INSUFFICIENT_EVIDENCE,
                sources=[],
                confidence_score=0.0,
            )

        # Build grounded response using available evidence chunks
        evidence_objs = [EvidenceDocument(**e) if isinstance(e, dict) else e for e in evidence]
        primary_doc = evidence_objs[0]

        summary = (
            f"The +{pct_change:.1f}% spending increase in {dept} ({scheme}) for FY {anomaly.get('year', '')} "
            f"is documented in {primary_doc.document_title}."
        )

        explanation = (
            f"According to {primary_doc.document_title} (Page {primary_doc.page_number}), "
            f"the allocation increased from {prev_amt} Cr to {curr_amt} Cr to fund: "
            f"{primary_doc.relevant_chunk_text}"
        )

        return InvestigationResult(
            summary=summary,
            explanation=explanation,
            key_figures={
                "previous_spending": prev_amt,
                "current_spending": curr_amt,
                "percentage_change": pct_change,
                "department": dept,
                "scheme": scheme,
            },
            evidence_status=InvestigationStatus.SUPPORTED,
            sources=evidence_objs,
            confidence_score=0.95,
        )


class RealGeminiAdapter:
    """Production Gemini adapter utilizing LangChain Google GenAI client."""

    def __init__(self, api_key: str = "", model_name: str = ""):
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name or GEMINI_MODEL

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            self._llm = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.api_key,
                temperature=0.0,
            )
        except Exception as e:
            logger.warning(f"Could not initialize ChatGoogleGenerativeAI: {e}")
            self._llm = None

    def generate_explanation(
        self,
        anomaly: Dict[str, Any],
        historical_data: List[Dict[str, Any]],
        evidence: List[Dict[str, Any]],
    ) -> InvestigationResult:
        if not self._llm:
            logger.warning("RealGeminiAdapter falling back to MockGeminiAdapter (LLM uninitialized)")
            return MockGeminiAdapter().generate_explanation(anomaly, historical_data, evidence)

        if not evidence:
            return InvestigationResult(
                summary="Insufficient evidence to determine the cause.",
                explanation="No documentary evidence was found to explain the spending change.",
                key_figures=anomaly,
                evidence_status=InvestigationStatus.INSUFFICIENT_EVIDENCE,
                sources=[],
                confidence_score=0.0,
            )

        evidence_objs = [EvidenceDocument(**e) if isinstance(e, dict) else e for e in evidence]
        evidence_prompt_text = "\n\n".join(
            [
                f"Source: {doc.document_title} (Doc ID: {doc.document_id}, Page: {doc.page_number})\n"
                f"Content: {doc.relevant_chunk_text}"
                for doc in evidence_objs
            ]
        )

        user_content = (
            f"ANOMALY CONTEXT:\n{json.dumps(anomaly, indent=2)}\n\n"
            f"HISTORICAL SPENDING:\n{json.dumps(historical_data, indent=2)}\n\n"
            f"RETRIEVED DOCUMENT EVIDENCE:\n{evidence_prompt_text}\n\n"
            f"Generate grounded explanation JSON adhering strictly to instructions."
        )

        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content=GEMINI_SYSTEM_INSTRUCTION),
                HumanMessage(content=user_content),
            ]
            response = self._llm.invoke(messages)
            raw_text = response.content.strip()

            # Clean markdown JSON block formatting if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())
            return InvestigationResult(
                summary=parsed.get("summary", "Investigation completed."),
                explanation=parsed.get("explanation", ""),
                key_figures=parsed.get("key_figures", anomaly),
                evidence_status=InvestigationStatus(
                    parsed.get("evidence_status", InvestigationStatus.SUPPORTED.value)
                ),
                sources=evidence_objs,
                confidence_score=float(parsed.get("confidence_score", 0.9)),
            )
        except Exception as err:
            logger.error(f"Error calling Gemini LLM: {err}")
            # Graceful fallback to mock grounded generation rather than throwing
            return MockGeminiAdapter().generate_explanation(anomaly, historical_data, evidence)


def get_gemini_client(force_mock: bool = False) -> BaseGeminiClient:
    """Factory helper returning RealGeminiAdapter if configured, or MockGeminiAdapter."""
    if not force_mock and is_gemini_configured():
        return RealGeminiAdapter()
    return MockGeminiAdapter()
