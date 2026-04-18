from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    lawyer_id: int
    reservation_id: Optional[int] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    client_id: int
    lawyer_id: int
    reservation_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True