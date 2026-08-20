"""
CivicLens Grounded RAG Generator (Keyless / Offline Version)
Generates structured answers using retrieved chunks directly without external API keys.
"""

from typing import List, Dict, Any

class GroundedRAGGenerator:
    def __init__(self, api_key: str = None):
        # No remote initialization required
        pass

    def generate_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        structured_budget_data: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        
        sources_list = []
        snippets = []

        for idx, chunk in enumerate(retrieved_chunks):
            meta = chunk.get("metadata", {})
            doc_name = meta.get("document_name", "Official Budget Record")
            page_num = meta.get("page_number", 1)
            dept_name = meta.get("department", "N/A")
            content_text = chunk.get("content", "").strip()

            sources_list.append({
                "document": doc_name,
                "page": page_num,
                "department": dept_name,
                "excerpt": content_text[:150] + "..." if len(content_text) > 150 else content_text
            })
            snippets.append(f"• From '{doc_name}' (Page {page_num}):\n  \"{content_text}\"")

        if retrieved_chunks:
            answer_text = (
                f"Based on the local budget database for '{query}':\n\n" + 
                "\n\n".join(snippets)
            )
            confidence = "HIGH" if len(sources_list) >= 2 else "MODERATE"
        else:
            answer_text = (
                "No relevant budget records were found for this query in the local system. "
                "Please upload a budget PDF/CSV document first."
            )
            confidence = "LOW"

        return {
            "answer": answer_text,
            "sources": sources_list,
            "confidence": confidence
        }