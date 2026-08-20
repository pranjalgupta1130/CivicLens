"""
CivicLens Grounded RAG Generator
Combines query, retrieved document chunks, and structured budget records to generate
verifiable, source-linked responses via Gemini Flash using the official Google Gen AI SDK (`google.genai`).
"""

import os
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Robustly find and load .env relative to this file's directory
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()


class GroundedRAGGenerator:
    def __init__(self, api_key: str = None):
        # Resolve API key from explicitly passed param or environment variable
        raw_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.api_key = raw_key.strip() if raw_key else None
        
        # Initialize Google Gen AI client if key is valid
        if self.api_key and not self.api_key.startswith("your_"):
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GroundedRAGGenerator] Client initialization warning: {e}")
                self.client = None
        else:
            self.client = None
            
        # Target default model (gemini-3.5-flash or gemini-3.6-flash)
        raw_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
        self.model_name = raw_model.replace("models/", "")

    def generate_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        structured_budget_data: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a grounded answer linked to specific retrieved document sources.
        """
        # Format document sources context
        formatted_docs = ""
        sources_list = []
        for idx, chunk in enumerate(retrieved_chunks):
            meta = chunk.get("metadata", {})
            doc_name = meta.get("document_name", "Official Gazette / Record")
            page_num = meta.get("page_number", 1)
            dept_name = meta.get("department", "N/A")
            content_text = chunk.get("content", "")

            doc_info = f"Document: {doc_name} | Page: {page_num} | Dept: {dept_name}"
            formatted_docs += f"\n--- SOURCE [{idx+1}]: {doc_info} ---\n{content_text}\n"
            
            sources_list.append({
                "document": doc_name,
                "page": page_num,
                "department": dept_name,
                "excerpt": content_text[:150] + "..." if len(content_text) > 150 else content_text
            })

        # Separate system instruction from user query context
        system_instruction = (
            "You are CivicLens, an intelligent government budget transparency assistant.\n"
            "Answer the citizen's question strictly using the provided document sources and budget records below.\n"
            "Do NOT invent facts. If the evidence is insufficient, explicitly state that.\n"
            "For every key claim, cite the source document and page number.\n"
            "Explain financial metrics in simple, clear language."
        )

        user_prompt = (
            f"USER QUESTION: {query}\n\n"
            f"RETRIEVED DOCUMENT SOURCES:\n{formatted_docs if formatted_docs else 'No documents retrieved.'}\n\n"
            f"STRUCTURED BUDGET RECORDS:\n{structured_budget_data or 'None provided'}\n"
        )

        if self.client:
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction
                    )
                )
                if response and response.text:
                    return {
                        "answer": response.text,
                        "sources": sources_list,
                        "confidence": "HIGH" if len(sources_list) >= 2 else "MODERATE"
                    }
            except Exception as e:
                print(f"[GroundedRAGGenerator] Gemini API Error: {e}")
                if self.api_key and self.api_key.startswith("AQ."):
                    print(
                        "[GroundedRAGGenerator] NOTICE: GEMINI_API_KEY in .env starts with 'AQ.', "
                        "which is a Supabase/AWS key. Please ensure GEMINI_API_KEY is set to a valid "
                        "Google AI Studio key (starts with 'AIzaSy...')."
                    )

        # Dynamic synthesis from retrieved document sources if offline / API key issue
        if retrieved_chunks:
            top_chunk = retrieved_chunks[0]
            doc_meta = top_chunk.get("metadata", {})
            doc_name = doc_meta.get("document_name", "Official Gazette")
            page_num = doc_meta.get("page_number", 1)
            content_snippet = top_chunk.get("content", "").strip()

            dynamic_answer = (
                f"According to {doc_name} (Page {page_num}):\n\n"
                f'"{content_snippet}"\n\n'
                f"[Source: {doc_name}, Page {page_num}]"
            )
            return {
                "answer": dynamic_answer,
                "sources": sources_list,
                "confidence": "HIGH" if len(sources_list) >= 2 else "MODERATE"
            }

        # Fallback when no document chunks are retrieved
        return {
            "answer": (
                "No relevant document records were found for this query. "
                "Please upload a budget document (PDF or CSV) to get grounded answers with source citations."
            ),
            "sources": [],
            "confidence": "LOW"
        }