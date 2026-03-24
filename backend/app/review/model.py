from app.core.database import Base
from sqlalchemy import Column, BigInteger, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Review(Base):
    __tablename__ = "reviews"
    id = Column(BigInteger, primary_key=True, index=True)
    client_id = Column(BigInteger, ForeignKey("clients.user_id"), nullable=False)
    lawyer_id = Column(BigInteger, ForeignKey("lawyers.user_id"), nullable=False)
    reservation_id = Column(BigInteger, ForeignKey("reservations.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    client = relationship("Client", back_populates="reviews")
    lawyer = relationship("Lawyer", back_populates="reviews")
    reservation = relationship("Reservation", back_populates="review")
