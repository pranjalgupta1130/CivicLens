"""
CivicLens Gemini Embedding Engine
Provides high-performance vector embedding generation for document chunks and user queries
using the official Google Gen AI SDK (`google.genai`).
"""

import os
import hashlib
import math
import re
from pathlib import Path
from typing import List, Dict, Any, Union
from dotenv import load_dotenv
from google import genai
from google.genai import types
import pandas as pd
from pypdf import PdfReader

# Robustly find and load .env relative to this file's directory
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()


class GeminiEmbeddingEngine:
    def __init__(self, api_key: str = None):
        raw_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.api_key = raw_key.strip() if raw_key else None
        
        # Initialize Google Gen AI client if key is valid
        if self.api_key and not self.api_key.startswith("your_"):
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiEmbeddingEngine] Client initialization warning: {e}")
                self.client = None
        else:
            self.client = None

        # Clean model name (default: gemini-embedding-2)
        raw_model = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2").strip()
        self.model_name = raw_model.replace("models/", "")

    def _fallback_embedding(self, text: str, dimension: int = 768) -> List[float]:
        """Generates a deterministic float vector based on stemmed word hashes for offline/fallback use."""
        vec = [0.0] * dimension
        words = re.findall(r'\w+', text.lower())
        if not words:
            return vec
        for word in words:
            stemmed = word[:-2] if word.endswith("ly") and len(word) > 4 else (word[:-3] if word.endswith("ing") and len(word) > 5 else word)
            seed = int(hashlib.md5(stemmed.encode("utf-8")).hexdigest(), 16)
            idx = seed % dimension
            vec[idx] += 1.0
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single document chunk text using RETRIEVAL_DOCUMENT task type."""
        if self.client:
            try:
                response = self.client.models.embed_content(
                    model=self.model_name,
                    contents=text,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT"
                    ),
                )
                if response.embeddings and len(response.embeddings) > 0:
                    return response.embeddings[0].values
            except Exception as e:
                print(f"[GeminiEmbeddingEngine] Warning: embed_text API call failed ({e}). Using fallback vector.")
        return self._fallback_embedding(text)

    def embed_query(self, query: str) -> List[float]:
        """Embeds a single user query string using RETRIEVAL_QUERY task type."""
        if self.client:
            try:
                response = self.client.models.embed_content(
                    model=self.model_name,
                    contents=query,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_QUERY"
                    ),
                )
                if response.embeddings and len(response.embeddings) > 0:
                    return response.embeddings[0].values
            except Exception as e:
                print(f"[GeminiEmbeddingEngine] Warning: embed_query API call failed ({e}). Using fallback vector.")
        return self._fallback_embedding(query)

    def embed_batch_texts(
        self, texts: List[str], batch_size: int = 32
    ) -> List[List[float]]:
        """Embeds a list of text strings in chunks to respect API rate limits."""
        if not texts:
            return []

        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            chunk = texts[i : i + batch_size]
            if self.client:
                try:
                    response = self.client.models.embed_content(
                        model=self.model_name,
                        contents=chunk,
                        config=types.EmbedContentConfig(
                            task_type="RETRIEVAL_DOCUMENT"
                        ),
                    )
                    if response.embeddings:
                        batch_vectors = [item.values for item in response.embeddings]
                        all_embeddings.extend(batch_vectors)
                        continue
                except Exception as e:
                    print(f"[GeminiEmbeddingEngine] Warning: Batch embedding failed at range {i}-{i+batch_size}: {e}")

            # Fallback for batch if key missing or failed
            for item in chunk:
                all_embeddings.append(self._fallback_embedding(item))

        return all_embeddings

    # --- File Text Extraction Helpers ---
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extracts all text content from a PDF file."""
        reader = PdfReader(file_path)
        return "\n".join(
            [page.extract_text() for page in reader.pages if page.extract_text()]
        )

    def extract_text_from_csv(self, file_path: str) -> List[str]:
        """Converts a CSV file into a list of row string representations."""
        df = pd.read_csv(file_path)
        return df.astype(str).apply(lambda x: " | ".join(x), axis=1).tolist()

    def process_files(self, file_paths: List[Union[str, Path]]) -> List[Dict[str, Any]]:
        """Reads PDF and CSV files, extracts content, and embeds them in batch."""
        results = []

        for path in file_paths:
            str_path = str(path)
            file_type = str_path.split(".")[-1].lower()

            if file_type == "pdf":
                text = self.extract_text_from_pdf(str_path)
                chunks = [p.strip() for p in text.split("\n\n") if p.strip()]
            elif file_type == "csv":
                chunks = self.extract_text_from_csv(str_path)
            else:
                continue

            embeddings = self.embed_batch_texts(chunks)

            results.append(
                {
                    "file_path": str_path,
                    "chunks": chunks,
                    "embeddings": embeddings,
                }
            )
        return results