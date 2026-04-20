# app/chat/schema.py
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
        from_attributes = True  # Pydantic v2  (use orm_mode = True for v1)


class MessageResponse(BaseModel):
    id: int
    session_id: int
    sender: SenderEnum
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    session_id: int
    user_message: str
    ai_response: str
    ready: bool = False
    recommendation: str | None = None