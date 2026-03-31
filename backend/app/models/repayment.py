from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LoanRepayment(Base):
    __tablename__ = "loan_repayments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    loan_id: Mapped[str] = mapped_column(String(36), index=True)

    amount: Mapped[str] = mapped_column(String(50))
    payment_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    recorded_by_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="confirmed")

    paid_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
