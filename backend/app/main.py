import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.services.seed_service import seed_database

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civiclens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize DB tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Auto-seed demo dataset if empty
    db = SessionLocal()
    try:
        from app.models.budget_record import BudgetRecord
        count = db.query(BudgetRecord).count()
        if count == 0:
            logger.info("Database empty. Seeding initial demo budget data...")
            seed_res = seed_database(db)
            logger.info(f"Seed complete: {seed_res}")
        else:
            logger.info(f"Database already contains {count} budget records. Skipping auto-seed.")
    except Exception as e:
        logger.error(f"Error during auto-seed check: {e}")
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS for Member 1 & 4 frontend & integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
from app.routes import health, dashboard, departments, schemes, budgets, anomalies, upload, compare, investigations, assistant, rti

app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(anomalies.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(compare.router, prefix=settings.API_V1_STR)
app.include_router(investigations.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(rti.router, prefix=settings.API_V1_STR)



@app.get("/")
def root_redirect():
    return {
        "message": "Welcome to CivicLens Intelligent Government Budget Transparency Platform API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
