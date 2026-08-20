from typing import Any, Dict, List

class DocumentChunker:

    def __init__(self, chunk_size: int = 400, overlap: int = 50):
        if chunk_size <= 0:
            raise ValueError("chunk_size must be greater than 0")
        if overlap >= chunk_size:
            raise ValueError("overlap must be strictly smaller than chunk_size")
        if overlap < 0:
            raise ValueError("overlap cannot be negative")

        self.chunk_size = chunk_size
        self.overlap = overlap
        self.step = chunk_size - overlap

    def chunk_pages(
        self, parsed_pages: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Chunks parsed page dicts while retaining exact page numbers and metadata."""
        chunks: List[Dict[str, Any]] = []
        chunk_idx = 0

        for page in parsed_pages:
            text = page.get("content", "")
            words = text.split()

            if not words:
                continue

            doc_name = page.get("document_name", "document")
            page_num = page.get("page_number", 1)

            start = 0
            while start < len(words):
                end = min(start + self.chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_text = " ".join(chunk_words)

                metadata = {
                    key: val
                    for key, val in page.items()
                    if key not in ("content", "document_name", "page_number")
                }
                metadata.update(
                    {
                        "document_name": doc_name,
                        "page_number": page_num,
                        "chunk_index": chunk_idx,
                    }
                )

                chunk_id = f"{doc_name}_p{page_num}_c{chunk_idx}"

                chunks.append(
                    {
                        "chunk_id": chunk_id,
                        "content": chunk_text,
                        "metadata": metadata,
                    }
                )

                chunk_idx += 1
                start += self.step

        return chunks