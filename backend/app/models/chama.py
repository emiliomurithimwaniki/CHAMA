from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Chama(Base):
    __tablename__ = "chamas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), index=True)
    currency: Mapped[str] = mapped_column(String(10), default="KES")

    contribution_type: Mapped[str] = mapped_column(String(20), default="fixed")
    contribution_amount: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    contribution_frequency: Mapped[str] = mapped_column(String(20), default="monthly")

    loan_interest_type: Mapped[str] = mapped_column(String(20), default="flat")
    loan_interest_rate: Mapped[str] = mapped_column(String(50), default="0")

    created_by_user_id: Mapped[str] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
