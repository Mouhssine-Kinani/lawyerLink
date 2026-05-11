from app.core.database import Base
from sqlalchemy import Column, BigInteger, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum

class ReservationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(BigInteger, primary_key=True, index=True)
    client_id = Column(BigInteger, ForeignKey("clients.user_id"), nullable=False)
    lawyer_id = Column(BigInteger, ForeignKey("lawyers.user_id"), nullable=False)
    reservation_date = Column(DateTime, nullable=False)
    status = Column(SAEnum(ReservationStatus), default=ReservationStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    client = relationship("Client", back_populates="reservations")
    lawyer = relationship("Lawyer", back_populates="reservations")
    review = relationship("Review", back_populates="reservation", uselist=False)
