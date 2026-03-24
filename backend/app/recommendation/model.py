from app.core.database import Base
from sqlalchemy import Column, BigInteger, DECIMAL, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"
    id = Column(BigInteger, primary_key=True, index=True)
    client_id = Column(BigInteger, ForeignKey("clients.user_id"), nullable=False)
    session_id = Column(BigInteger, ForeignKey("chat_sessions.id"), nullable=False)
    lawyer_id = Column(BigInteger, ForeignKey("lawyers.user_id"), nullable=False)
    score = Column(DECIMAL, nullable=True)
    rank = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    client = relationship("Client", back_populates="recommendations")
    session = relationship("ChatSession", back_populates="recommendations")
    lawyer = relationship("Lawyer", back_populates="recommendations")
