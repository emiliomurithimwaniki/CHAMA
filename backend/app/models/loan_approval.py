from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LoanApproval(Base):
    __tablename__ = "loan_approvals"
    __table_args__ = (UniqueConstraint("loan_id", "step", name="uq_loan_step"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    loan_id: Mapped[str] = mapped_column(String(36), index=True)

    step: Mapped[str] = mapped_column(String(20))  # treasurer|chairperson
    status: Mapped[str] = mapped_column(String(20))  # approved|rejected
    acted_by_user_id: Mapped[str] = mapped_column(String(36), index=True)
    acted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
