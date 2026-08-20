import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    budget_record_id: Mapped[str] = mapped_column(String(36), ForeignKey("budget_records.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id: Mapped[str] = mapped_column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    anomaly_type: Mapped[str] = mapped_column(String(50), nullable=False) # SPENDING_SPIKE, SPENDING_DROP, OVERBUDGET_EXPENDITURE, MULTI_YEAR_DEVIATION, NEW_SCHEME_ALLOCATION
    previous_value: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    current_value: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    percentage_change: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # NORMAL, MODERATE, HIGH
    status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, INVESTIGATED, RESOLVED
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    budget_record = relationship("BudgetRecord", back_populates="anomalies")
    department = relationship("Department", back_populates="anomalies")
    scheme = relationship("Scheme", back_populates="anomalies")
    investigation = relationship("AIInvestigation", back_populates="anomaly", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="anomaly", cascade="all, delete-orphan")
