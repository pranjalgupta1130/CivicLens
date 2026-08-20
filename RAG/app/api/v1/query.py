from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from app.schemas.rag_schemas import QueryRequest, QueryResponse
from app.dependencies import get_retriever, get_generator
from app.rag.retriever import VectorRetriever
from app.rag.generator import GroundedRAGGenerator

router = APIRouter(tags=["RAG Query Engine"])

@router.post(
    "/query",
    response_model=QueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Grounded RAG Query",
    description="Retrieves relevant document chunks matching user query and generates verifiable, source-linked responses."
)
async def process_query(
    request: QueryRequest,
    retriever: VectorRetriever = Depends(get_retriever),
    generator: GroundedRAGGenerator = Depends(get_generator)
) -> QueryResponse:
    try:
        # Step 1: Retrieve context chunks asynchronously in threadpool
        chunks = await run_in_threadpool(
            retriever.retrieve,
            query=request.query,
            top_k=request.top_k,
            department_filter=request.department_filter
        )
        
        # Step 2: Generate grounded LLM response asynchronously in threadpool
        result = await run_in_threadpool(
            generator.generate_answer,
            query=request.query,
            retrieved_chunks=chunks
        )


        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            confidence=result["confidence"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query execution error: {str(e)}"
        )
