from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
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


class SubscriptionBase(BaseModel):
    start_date: date
    end_date: date


class SubscriptionCreate(SubscriptionBase):
    lawyer_id: int


class SubscriptionUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SubscriptionStatus] = None


class SubscriptionResponse(SubscriptionBase):
    id: int
    lawyer_id: int
    status: SubscriptionStatus

    class Config:
        from_attributes = True


class BoostPaymentBase(BaseModel):
    amount: Decimal
    boost_level: int
    starts_at: datetime
    expires_at: datetime


class BoostPaymentCreate(BoostPaymentBase):
    lawyer_id: int


class BoostPaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    boost_level: Optional[int] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class BoostPaymentResponse(BoostPaymentBase):
    id: int
    lawyer_id: int

    class Config:
        from_attributes = True


class PaymentTransactionBase(BaseModel):
    amount: Decimal
    type: PaymentType


class PaymentTransactionCreate(PaymentTransactionBase):
    payer_id: int
    subscription_id: Optional[int] = None
    boost_payment_id: Optional[int] = None


class PaymentTransactionUpdate(BaseModel):
    status: Optional[PaymentStatus] = None


class PaymentTransactionResponse(PaymentTransactionBase):
    id: int
    payer_id: int
    subscription_id: Optional[int]
    boost_payment_id: Optional[int]
    status: PaymentStatus

    class Config:
        from_attributes = True