# backend/app/chat/schema.py
from pydantic import BaseModel
from datetime import datetime
from app.chat.model import SenderEnum


# ── Inbound ──────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    content: str


# ── Outbound ─────────────────────────────────────────────────────────────────

class SessionResponse(BaseModel):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    session_id: int
    sender: SenderEnum
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class LawyerInfo(BaseModel):
    id: int
    name: str
    city: str
    region: str | None = None
    specialties: list[str]
    languages: str | None = None
    hourly_rate: str
    boosted: bool = False


class ChatResponse(BaseModel):
    session_id: int
    user_message: str
    ai_response: str
    ready: bool = False
    recommendation: str | None = None
    lawyers: list[LawyerInfo] | None = None