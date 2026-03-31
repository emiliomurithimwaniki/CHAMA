from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Contribution(Base):
    __tablename__ = "contributions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)

    amount: Mapped[str] = mapped_column(String(50))
    contribution_date: Mapped[date] = mapped_column(Date, default=date.today)
    period_key: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)

    payment_method: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    payment_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    recorded_by_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="confirmed")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
