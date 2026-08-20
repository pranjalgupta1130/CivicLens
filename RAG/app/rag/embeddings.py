import os
from pathlib import Path
from typing import List, Union
import google.generativeai as genai
import pandas as pd
from pypdf import PdfReader


class GeminiEmbeddingEngine:

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.model_name = os.getenv(
            "GEMINI_EMBEDDING_MODEL", "models/text-embedding-004"
        )

    def _fallback_embedding(self, text: str, dimension: int = 768) -> List[float]:
        """Generates a deterministic float vector based on text hash for offline/fallback use."""
        import hashlib
        import math
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16)
        return [math.sin(seed + i) for i in range(dimension)]

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single document chunk text."""
        if self.api_key:
            try:
                response = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_document",
                )
                return response["embedding"]
            except Exception as e:
                print(f"[GeminiEmbeddingEngine] Warning: embed_text API call failed ({e}). Using fallback vector.")
        return self._fallback_embedding(text)

    def embed_query(self, query: str) -> List[float]:
        """Embeds a single user query string."""
        if self.api_key:
            try:
                response = genai.embed_content(
                    model=self.model_name,
                    content=query,
                    task_type="retrieval_query",
                )
                return response["embedding"]
            except Exception as e:
                print(f"[GeminiEmbeddingEngine] Warning: embed_query API call failed ({e}). Using fallback vector.")
        return self._fallback_embedding(query)

    # --- File Extractors ---
    def extract_text_from_pdf(self, file_path: str) -> str:
        reader = PdfReader(file_path)
        return "\n".join(
            [page.extract_text() for page in reader.pages if page.extract_text()]
        )

    def extract_text_from_csv(self, file_path: str) -> List[str]:
        df = pd.read_csv(file_path)
        # Row-by-row conversion to text string
        return df.astype(str).apply(lambda x: " | ".join(x), axis=1).tolist()

    # --- Batch Embedding Method ---
    def embed_batch_texts(
        self, texts: List[str], batch_size: int = 32
    ) -> List[List[float]]:
        """Embeds a list of text strings in chunks to respect API limits."""
        if not texts:
            return []

        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            chunk = texts[i : i + batch_size]
            if self.api_key:
                try:
                    response = genai.embed_content(
                        model=self.model_name,
                        content=chunk,
                        task_type="retrieval_document",
                    )
                    all_embeddings.extend(response["embedding"])
                    continue
                except Exception as e:
                    print(f"[GeminiEmbeddingEngine] Warning: Batch embedding failed at range {i}-{i+batch_size}: {e}")
            
            # Fallback for batch if key missing or failed
            for item in chunk:
                all_embeddings.append(self._fallback_embedding(item))

        return all_embeddings

    # --- Batch Process Files ---
    def process_files(self, file_paths: List[Union[str, Path]]) -> List[dict]:
        """Reads multiple PDF and CSV files, extracts content, and embeds them."""
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