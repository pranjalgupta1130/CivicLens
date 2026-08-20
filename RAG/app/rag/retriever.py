"""
CivicLens Vector Retriever
Performs cosine similarity search over stored document embeddings with metadata filtering.
Supports persistent disk storage (vector_store.json) and Supabase pgvector compatibility.
"""

import json
import os
import math
import re
from pathlib import Path
from typing import List, Dict, Any
from app.rag.embeddings import GeminiEmbeddingEngine

class VectorRetriever:
    def __init__(self, embedding_engine: GeminiEmbeddingEngine = None, storage_path: str = None, min_relevance_score: float = None):
        self.embedding_engine = embedding_engine or GeminiEmbeddingEngine()
        self.storage_path = storage_path or str(Path(__file__).parent.parent / "vector_store.json")
        default_score = float(os.getenv("RAG_MIN_RELEVANCE_SCORE", "0.25"))
        self.min_relevance_score = min_relevance_score if min_relevance_score is not None else default_score
        self.vector_store: List[Dict[str, Any]] = []
        self.load_store()

    def load_store(self):
        """Loads persisted vector embeddings from disk storage if available."""
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.vector_store = json.load(f)
            except Exception as e:
                print(f"[VectorRetriever] Error loading vector store: {e}")
                self.vector_store = []

    def save_store(self):
        """Persists stored vector embeddings to disk storage."""
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.vector_store, f, indent=2)
        except Exception as e:
            print(f"[VectorRetriever] Error saving vector store: {e}")

    def add_chunks(self, chunks_with_embeddings: List[Dict[str, Any]]):
        """
        Ingests chunks with precomputed vector embeddings and persists to store.
        Avoids duplicating chunks with identical chunk_id.
        """
        existing_ids = {c.get("chunk_id") for c in self.vector_store if c.get("chunk_id")}
        new_chunks = [c for c in chunks_with_embeddings if c.get("chunk_id") not in existing_ids]
        
        self.vector_store.extend(new_chunks)
        self.save_store()

    def retrieve(self, query: str, top_k: int = 4, department_filter: str = None) -> List[Dict[str, Any]]:
        """
        Retrieves top_k relevant chunks using Hybrid Search (Vector Similarity + Keyword Boosting).
        Only returns chunks exceeding self.min_relevance_score.
        """
        if not self.vector_store:
            return []

        query_vector = self.embedding_engine.embed_query(query)
        stop_words = {"what", "was", "is", "the", "in", "for", "how", "much", "of", "a", "an", "to", "and", "or", "on", "at", "by", "with"}
        financial_synonyms = {"spent": "expenditure", "spending": "expenditure", "allocated": "budget", "allocation": "budget", "cost": "expenditure"}
        raw_words = set(re.findall(r'\w+', query.lower()))
        base_words = set(w for w in raw_words if w not in stop_words) or raw_words
        query_words = set(base_words)
        for w in base_words:
            if w in financial_synonyms:
                query_words.add(financial_synonyms[w])
        
        scored_chunks = []
        for item in self.vector_store:
            # Metadata filter
            if department_filter and item.get("metadata", {}).get("department") != department_filter:
                continue

            vector_sim = self._cosine_similarity(query_vector, item["embedding"])
            
            # Keyword score: ratio of query terms occurring in chunk content/metadata
            content_lower = (item.get("content", "") + " " + str(item.get("metadata", {}))).lower()
            keyword_matches = sum(1 for word in query_words if word in content_lower or (len(word) > 4 and word[:4] in content_lower))
            keyword_score = keyword_matches / max(1, len(query_words))
            
            # Combined hybrid score (70% vector similarity + 30% keyword match)
            hybrid_score = (0.70 * vector_sim) + (0.30 * keyword_score)
            
            # Filter by relevance threshold
            if hybrid_score >= self.min_relevance_score:
                scored_chunks.append((hybrid_score, item))

        # Sort by highest hybrid score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored_chunks[:top_k]]

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)
