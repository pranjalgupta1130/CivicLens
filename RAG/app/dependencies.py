from functools import lru_cache
from app.rag.embeddings import GeminiEmbeddingEngine
from app.rag.retriever import VectorRetriever
from app.rag.generator import GroundedRAGGenerator
from app.ingestion.pipeline import IngestionPipeline

@lru_cache
def get_embedding_engine() -> GeminiEmbeddingEngine:
    return GeminiEmbeddingEngine()

@lru_cache
def get_retriever() -> VectorRetriever:
    return VectorRetriever(embedding_engine=get_embedding_engine())

@lru_cache
def get_generator() -> GroundedRAGGenerator:
    return GroundedRAGGenerator()

@lru_cache
def get_ingestion_pipeline() -> IngestionPipeline:
    return IngestionPipeline(retriever=get_retriever())

