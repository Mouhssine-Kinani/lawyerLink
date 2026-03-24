from app.core.database import Base
from sqlalchemy import Column, BigInteger, Integer, DateTime, Date, Enum as SAEnum, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from enum import Enum

class SubscriptionStatus(str, Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"

class PaymentType(str, Enum):
    subscription = "subscription"
    boost = "boost"

class PaymentStatus(str, Enum):
    pending = "pending"
    success = "success"
    failed = "failed"

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(BigInteger, primary_key=True, index=True)
    lawyer_id = Column(BigInteger, ForeignKey("lawyers.user_id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.active, nullable=False)

    lawyer = relationship("Lawyer", back_populates="subscriptions")
    payment_transaction = relationship("PaymentTransaction", back_populates="subscription", uselist=False)

class BoostPayment(Base):
    __tablename__ = "boost_payments"
    id = Column(BigInteger, primary_key=True, index=True)
    lawyer_id = Column(BigInteger, ForeignKey("lawyers.user_id"), nullable=False)
    amount = Column(DECIMAL, nullable=False)
    boost_level = Column(Integer, nullable=False)
    starts_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    lawyer = relationship("Lawyer", back_populates="boost_payments")
    payment_transaction = relationship("PaymentTransaction", back_populates="boost_payment", uselist=False)

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    id = Column(BigInteger, primary_key=True, index=True)
    payer_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    subscription_id = Column(BigInteger, ForeignKey("subscriptions.id"), nullable=True)
    boost_payment_id = Column(BigInteger, ForeignKey("boost_payments.id"), nullable=True)
    amount = Column(DECIMAL, nullable=False)
    type = Column(SAEnum(PaymentType), nullable=False)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending, nullable=False)

    subscription = relationship("Subscription", back_populates="payment_transaction")
    boost_payment = relationship("BoostPayment", back_populates="payment_transaction")
    payer = relationship("User")
