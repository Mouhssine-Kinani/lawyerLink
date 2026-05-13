from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class ReservationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


class ReservationBase(BaseModel):
    reservation_date: datetime
    notes: Optional[str] = None


class ReservationCreate(ReservationBase):
    lawyer_id: int
    reservation_date:datetime
    notes: Optional[str] = None


class ReservationUpdate(BaseModel):
    reservation_date: Optional[datetime] = None
    status: Optional[ReservationStatus] = None
    notes: Optional[str] = None


class ReservationResponse(ReservationBase):
    id: int
    client_id: int
    lawyer_id: int
    reservation_date: datetime
    status: ReservationStatus
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReservationWithClientResponse(ReservationResponse):
    client_first_name: Optional[str] = None
    client_last_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    client_image_url: Optional[str] = None