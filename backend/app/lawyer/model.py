from app.core.database import Base
from sqlalchemy import Column, Integer, String, Enum as SAEnum, ForeignKey, BigInteger, Text, DECIMAL, Boolean
from sqlalchemy.orm import relationship

class Lawyer(Base):
    __tablename__ = "lawyers"
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    firm = Column(String(255), nullable=True)
    license_number = Column(String(100), nullable=True)
    specialties = Column(Text, nullable=True)
    languages = Column(String(255), nullable=True)
    hourly_rate = Column(DECIMAL, nullable=True)
    rating_avg = Column(DECIMAL, nullable=True)
    rating_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    image_url = Column(String(500), nullable=True)

    user = relationship("User", back_populates="lawyer_profile")
    recommendations = relationship("RecommendationLog", back_populates="lawyer")
    reservations = relationship("Reservation", back_populates="lawyer")
    reviews = relationship("Review", back_populates="lawyer")
    subscriptions = relationship("Subscription", back_populates="lawyer")
    boost_payments = relationship("BoostPayment", back_populates="lawyer")
