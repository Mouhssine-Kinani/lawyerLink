from app.core.database import Base
from sqlalchemy import Column, BigInteger, String, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    client = "client"
    lawyer = "lawyer"


class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    role = Column(SAEnum(Role), default=Role.client, nullable=False)

    client_profile = relationship("Client", back_populates="user", uselist=False)
    lawyer_profile = relationship("Lawyer", back_populates="user", uselist=False)

class Client(Base):
    __tablename__ = "clients"
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    user = relationship("User", back_populates="client_profile")
    chat_sessions = relationship("ChatSession", back_populates="client")
    recommendations = relationship("RecommendationLog", back_populates="client")
    reservations = relationship("Reservation", back_populates="client")
    reviews = relationship("Review", back_populates="client")