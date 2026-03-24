from app.core.database import Base
from sqlalchemy import Column, BigInteger, String, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum

class SenderEnum(str, Enum):
    client = "client"
    ai = "ai"

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(BigInteger, primary_key=True, index=True)
    client_id = Column(BigInteger, ForeignKey("clients.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    client = relationship("Client", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    recommendations = relationship("RecommendationLog", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(BigInteger, primary_key=True, index=True)
    session_id = Column(BigInteger, ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(SAEnum(SenderEnum), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    session = relationship("ChatSession", back_populates="messages")
