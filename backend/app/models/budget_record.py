import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class BudgetRecord(Base):
    __tablename__ = "budget_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_id: Mapped[str] = mapped_column(String(36), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(String(36), ForeignKey("schemes.id", ondelete="RESTRICT"), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    locality: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # Capital Expenditure, Revenue Expenditure, etc.
    budget_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    actual_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    source_document_id: Mapped[str] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("department_id", "scheme_id", "year", "locality", "category", name="uq_budget_item"),
    )

    # Relationships
    department = relationship("Department", back_populates="budget_records")
    scheme = relationship("Scheme", back_populates="budget_records")
    anomalies = relationship("Anomaly", back_populates="budget_record", cascade="all, delete-orphan")
