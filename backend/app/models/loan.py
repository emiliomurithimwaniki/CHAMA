from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    borrower_user_id: Mapped[str] = mapped_column(String(36), index=True)

    principal_amount: Mapped[str] = mapped_column(String(50))
    interest_type: Mapped[str] = mapped_column(String(20), default="flat")
    interest_rate: Mapped[str] = mapped_column(String(50), default="0")
    term_months: Mapped[int] = mapped_column(default=1)

    status: Mapped[str] = mapped_column(String(30), default="submitted")

    total_payable: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
