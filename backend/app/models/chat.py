from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ChatChannel(Base):
    __tablename__ = "chat_channels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    type: Mapped[str] = mapped_column(String(20), default="group")
    name: Mapped[str] = mapped_column(String(100), default="General")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chama_id: Mapped[str] = mapped_column(String(36), index=True)
    channel_id: Mapped[str] = mapped_column(String(36), index=True)
    sender_user_id: Mapped[str] = mapped_column(String(36), index=True)

    body: Mapped[str] = mapped_column(String(2000))
    message_type: Mapped[str] = mapped_column(String(20), default="text")
    attachment_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
