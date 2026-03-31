from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreateIn(BaseModel):
    full_name: str
    phone_number: str
    password: str


class UserOut(BaseModel):
    id: str
    full_name: str
    phone_number: str


class ChamaCreateIn(BaseModel):
    name: str
    currency: str = "KES"


class ChamaOut(BaseModel):
    id: str
    name: str
    currency: str


class ChamaUpdateIn(BaseModel):
    name: str | None = None
    currency: str | None = None


class MembershipOut(BaseModel):
    user_id: str
    role: str
    join_status: str


class AddMemberIn(BaseModel):
    phone_number: str
    role: str = "member"


class ContributionCreateIn(BaseModel):
    user_id: str | None = None
    amount: str
    contribution_date: date | None = None
    period_key: str | None = None
    payment_method: str | None = None
    payment_reference: str | None = None


class ContributionOut(BaseModel):
    id: str
    chama_id: str
    user_id: str
    amount: str
    contribution_date: date
    period_key: str | None
    status: str


class LoanCreateIn(BaseModel):
    principal_amount: str
    interest_type: str = "flat"
    interest_rate: str = "0"
    term_months: int = 1


class LoanOut(BaseModel):
    id: str
    chama_id: str
    borrower_user_id: str
    principal_amount: str
    interest_type: str
    interest_rate: str
    term_months: int
    status: str


class LoanApprovalIn(BaseModel):
    reason: str | None = None


class ChatSendMessageIn(BaseModel):
    body: str
    message_type: str = "text"
    attachment_url: str | None = None


class ChatMessageOut(BaseModel):
    id: str
    chama_id: str
    channel_id: str
    sender_user_id: str
    body: str
    message_type: str
    attachment_url: str | None
    created_at: datetime
