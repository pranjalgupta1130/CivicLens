"""
CivicLens Local Embedding Engine
Generates vector embeddings locally using sentence-transformers (no API key required).
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Union
import pandas as pd
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

class GeminiEmbeddingEngine:
    def __init__(self, api_key: str = None):
        # Local open-source embedding model; auto-downloads on first run
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        try:
            self.model = SentenceTransformer(self.model_name)
        except Exception as e:
            print(f"[EmbeddingEngine] Warning loading local model: {e}")
            self.model = None

    def _fallback_embedding(self, text: str, dimension: int = 384) -> List[float]:
        """Generates a dummy float vector if loading fails."""
        import hashlib, math
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16)
        return [math.sin(seed + i) for i in range(dimension)]

    def embed_text(self, text: str) -> List[float]:
        """Embeds a document chunk locally."""
        if self.model:
            return self.model.encode(text).tolist()
        return self._fallback_embedding(text)

    def embed_query(self, query: str) -> List[float]:
        """Embeds a search query locally."""
        if self.model:
            return self.model.encode(query).tolist()
        return self._fallback_embedding(query)

    def embed_batch_texts(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Batch embeds multiple texts locally."""
        if not texts:
            return []
        if self.model:
            return self.model.encode(texts, batch_size=batch_size).tolist()
        return [self._fallback_embedding(t) for t in texts]

    # --- File Extraction ---
    def extract_text_from_pdf(self, file_path: str) -> str:
        reader = PdfReader(file_path)
        return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

    def extract_text_from_csv(self, file_path: str) -> List[str]:
        df = pd.read_csv(file_path)
        return df.astype(str).apply(lambda x: " | ".join(x), axis=1).tolist()

    def process_files(self, file_paths: List[Union[str, Path]]) -> List[Dict[str, Any]]:
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
            results.append({
                "file_path": str_path,
                "chunks": chunks,
                "embeddings": embeddings,
            })
        return results