"""
CivicLens Vector Retriever
Performs cosine similarity search over stored document embeddings with metadata filtering.
"""

from typing import List, Dict, Any
from app.rag.embeddings import GeminiEmbeddingEngine

class VectorRetriever:
    def __init__(self, embedding_engine: GeminiEmbeddingEngine = None):
        self.embedding_engine = embedding_engine or GeminiEmbeddingEngine()
        # In-memory document vector store for local execution & Supabase pgvector integration
        self.vector_store: List[Dict[str, Any]] = []

    def add_chunks(self, chunks_with_embeddings: List[Dict[str, Any]]):
        """
        Ingests chunks with precomputed vector embeddings.
        """
        self.vector_store.extend(chunks_with_embeddings)

    def retrieve(self, query: str, top_k: int = 4, department_filter: str = None) -> List[Dict[str, Any]]:
        """
        Retrieves top_k relevant chunks for a user query.
        """
        query_vector = self.embedding_engine.embed_query(query)
        
        scored_chunks = []
        for item in self.vector_store:
            # Metadata filter
            if department_filter and item["metadata"].get("department") != department_filter:
                continue

            similarity = self._cosine_similarity(query_vector, item["embedding"])
            scored_chunks.append((similarity, item))

        # Sort by highest similarity
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored_chunks[:top_k]]

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        import math
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)
