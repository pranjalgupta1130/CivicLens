import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_id: Mapped[str] = mapped_column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("department_id", "code", name="uq_scheme_dept_code"),
    )

    # Relationships
    department = relationship("Department", back_populates="schemes")
    budget_records = relationship("BudgetRecord", back_populates="scheme", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="scheme", cascade="all, delete-orphan")
