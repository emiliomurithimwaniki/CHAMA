from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PaymentIntent(Base):
    __tablename__ = "payment_intents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)

    purpose: Mapped[str] = mapped_column(String(30))  # contribution|loan_repayment
    target_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    amount: Mapped[str] = mapped_column(String(50))
    currency: Mapped[str] = mapped_column(String(10), default="KES")

    provider: Mapped[str] = mapped_column(String(20), default="mpesa")
    provider_request_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="pending")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)

    provider: Mapped[str] = mapped_column(String(20), default="mpesa")
    provider_txn_id: Mapped[str] = mapped_column(String(100), index=True)

    payer_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    amount: Mapped[str] = mapped_column(String(50))
    paid_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    raw_payload: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    match_status: Mapped[str] = mapped_column(String(20), default="unmatched")
    matched_entity_type: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    matched_entity_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
