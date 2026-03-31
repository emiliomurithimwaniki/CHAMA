from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Membership(Base):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("chama_id", "user_id", name="uq_membership_chama_user"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)

    role: Mapped[str] = mapped_column(String(30), default="member")  # member|chairperson|treasurer|secretary
    join_status: Mapped[str] = mapped_column(String(20), default="approved")

    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
