from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from app.schemas.rag_schemas import IngestionResponse
from app.dependencies import get_ingestion_pipeline
from app.ingestion.pipeline import IngestionPipeline

router = APIRouter(tags=["Document Ingestion"])

@router.post(
    "/ingest/pdf",
    response_model=IngestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Budget PDF Document",
    description="Extracts, chunks, embeds, and indexes text from an uploaded budget PDF file."
)
async def ingest_pdf(
    file: UploadFile = File(..., description="PDF budget document to ingest"),
    department: str = Form("General", description="Department associated with document"),
    year: int = Form(2026, description="Fiscal year"),
    pipeline: IngestionPipeline = Depends(get_ingestion_pipeline)
) -> IngestionResponse:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF document (.pdf)"
        )
    
    try:
        contents = await file.read()
        result = await run_in_threadpool(
            pipeline.process_pdf_document,
            file_bytes=contents,
            filename=file.filename,
            department=department,
            year=year
        )
        return IngestionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF ingestion failed: {str(e)}"
        )

@router.post(
    "/ingest/csv",
    response_model=IngestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Budget CSV Data",
    description="Parses tabular CSV budget data, generates text chunks per record, embeds, and indexes them."
)
async def ingest_csv(
    file: UploadFile = File(..., description="CSV budget dataset to ingest"),
    pipeline: IngestionPipeline = Depends(get_ingestion_pipeline)
) -> IngestionResponse:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV dataset (.csv)"
        )
    
    try:
        contents = await file.read()
        result = await run_in_threadpool(
            pipeline.process_csv_document,
            file_bytes=contents,
            filename=file.filename
        )
        return IngestionResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV ingestion failed: {str(e)}"
        )