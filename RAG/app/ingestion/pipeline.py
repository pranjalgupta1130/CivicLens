from typing import List, Dict, Any
from app.rag.parser import DocumentParser
from app.rag.chunker import DocumentChunker
from app.rag.embeddings import GeminiEmbeddingEngine
from app.rag.retriever import VectorRetriever

class IngestionPipeline:
    def __init__(self, retriever: VectorRetriever = None):
        self.parser = DocumentParser()
        self.chunker = DocumentChunker(chunk_size=350, overlap=40)
        self.embedding_engine = GeminiEmbeddingEngine()
        self.retriever = retriever or VectorRetriever(self.embedding_engine)

    def process_pdf_document(
        self,
        file_bytes: bytes,
        filename: str,
        department: str = "General",
        year: int = 2026
    ) -> Dict[str, Any]:
        """
        Executes step-by-step RAG ingestion for a PDF file:
        1. Extract text page by page
        2. Chunk text with metadata (doc, page, dept, year)
        3. Generate Gemini Embedding 2 vectors
        4. Store in Vector Database
        """
        # Step 1: Parse
        pages = self.parser.parse_pdf(file_bytes, filename, department, year)
        
        # Step 2: Chunk
        chunks = self.chunker.chunk_pages(pages)

        # Step 3: Embed
        chunks_with_vectors = []
        for chunk in chunks:
            vector = self.embedding_engine.embed_text(chunk["content"])
            chunk["embedding"] = vector
            chunks_with_vectors.append(chunk)

        # Step 4: Index into Vector Retriever / pgvector
        self.retriever.add_chunks(chunks_with_vectors)

        return {
            "status": "SUCCESS",
            "filename": filename,
            "total_pages": len(pages),
            "total_chunks": len(chunks),
            "embeddings_generated": len(chunks_with_vectors)
        }

    def process_csv_document(
        self,
        file_bytes: bytes,
        filename: str
    ) -> Dict[str, Any]:
        df = self.parser.parse_csv(file_bytes, filename)
        text_chunks = self.parser.parse_csv_to_text_chunks(df, filename)

        chunks_with_vectors = []
        for chunk in text_chunks:
            vector = self.embedding_engine.embed_text(chunk["content"])
            chunk["embedding"] = vector
            chunks_with_vectors.append(chunk)

        self.retriever.add_chunks(chunks_with_vectors)

        return {
            "status": "SUCCESS",
            "filename": filename,
            "total_rows": len(df),
            "total_chunks": len(text_chunks),
            "embeddings_generated": len(chunks_with_vectors)
        }
