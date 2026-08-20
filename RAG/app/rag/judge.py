"""
CivicLens LLM-as-a-Judge Evaluation Engine
Evaluates generated RAG answers against retrieved evidence for factual grounding,
numerical consistency, and hallucination risk.
Uses live Gemini 2.0 Flash model when GEMINI_API_KEY is present,
and falls back safely to DETERMINISTIC_FALLBACK regex checks when unconfigured.
"""

import os
import re
import json
from typing import List, Dict, Any

class LLMJudge:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[LLMJudge] Warning initializing GenAI client: {e}")
                self.client = None

    @classmethod
    def evaluate_answer(cls, query: str, answer: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        instance = cls()
        return instance.evaluate(query, answer, retrieved_chunks)

    def evaluate(self, query: str, answer: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates answer grounding, numerical consistency, and hallucination risk.
        Returns judge score (0-100), evaluation status, issues, and evaluator mode.
        """
        if not retrieved_chunks:
            is_no_context = "No relevant budget records" in answer or "No relevant evidence" in answer
            return {
                "judge_score": 100.0 if is_no_context else 0.0,
                "is_grounded": True if is_no_context else False,
                "issues": [] if is_no_context else ["UNGROUNDED_ANSWER_NO_CONTEXT"],
                "verdict": "PASS" if is_no_context else "FAIL",
                "evaluator_mode": "ZERO_CONTEXT_GUARD"
            }

        # Attempt live Gemini LLM-as-a-Judge if client is configured
        if self.client:
            try:
                evidence_text = "\n".join([f"- From '{c.get('metadata', {}).get('document_name', 'Doc')}': {c.get('content', '')}" for c in retrieved_chunks])
                prompt = (
                    "You are an independent LLM Judge evaluating a RAG answer against official retrieved evidence.\n"
                    f"USER QUERY: {query}\n"
                    f"RETRIEVED EVIDENCE:\n{evidence_text}\n"
                    f"GENERATED ANSWER:\n{answer}\n\n"
                    "Evaluate whether the answer is strictly supported by evidence and free of numerical contradictions.\n"
                    "Respond STRICTLY in JSON format with keys:\n"
                    "{\n"
                    '  "judge_score": <float 0.0-100.0>,\n'
                    '  "is_grounded": <boolean>,\n'
                    '  "issues": [<string list of issues or empty>],\n'
                    '  "verdict": "<PASS|WARNING|FAIL>"\n'
                    "}"
                )
                response = self.client.models.generate_content(
                    model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
                    contents=prompt
                )
                raw_text = response.text.strip()
                # Parse JSON block from response
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if json_match:
                    res_dict = json.loads(json_match.group(0))
                    res_dict["evaluator_mode"] = "LLM_GEMINI"
                    return res_dict
            except Exception as e:
                print(f"[LLMJudge] API call failed, falling back to deterministic evaluation: {e}")

        # Deterministic Python Fallback
        return self._deterministic_fallback_eval(answer, retrieved_chunks)

    def _deterministic_fallback_eval(self, answer: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        issues = []
        combined_evidence = " ".join([chunk.get("content", "") for chunk in retrieved_chunks])
        
        # 1. Extract financial numbers (e.g. ₹500 Cr, 500, 70%) from answer and evidence
        answer_numbers = set(re.findall(r'\b\d+(?:\.\d+)?\b', answer))
        evidence_numbers = set(re.findall(r'\b\d+(?:\.\d+)?\b', combined_evidence))

        # Check for numeric claims in answer not present in evidence (ignoring common small numbers like 1, 2 for list items)
        suspicious_numbers = [n for n in answer_numbers if n not in evidence_numbers and float(n) > 5.0]
        if suspicious_numbers:
            issues.append(f"NUMERICAL_CONTRADICTION: Figures {suspicious_numbers} not found in retrieved evidence.")

        # 2. Check source citation validity
        cited_docs = set(re.findall(r"'([^']+)'", answer))
        retrieved_docs = {chunk.get("metadata", {}).get("document_name") for chunk in retrieved_chunks if chunk.get("metadata", {}).get("document_name")}
        
        invalid_citations = cited_docs - retrieved_docs
        if invalid_citations:
            issues.append(f"INVALID_CITATION: Answer cited unretrieved docs {invalid_citations}.")

        score = max(0.0, 100.0 - (len(issues) * 35.0))
        is_grounded = len(issues) == 0

        return {
            "judge_score": round(score, 1),
            "is_grounded": is_grounded,
            "issues": issues,
            "verdict": "PASS" if is_grounded else "WARNING",
            "evaluator_mode": "DETERMINISTIC_FALLBACK"
        }
