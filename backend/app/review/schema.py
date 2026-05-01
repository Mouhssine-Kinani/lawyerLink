from pydantic import BaseModel ,Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    lawyer_id: int
    reservation_id: Optional[int] = None
    rating: int = Field(ge=1, le=5) 
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    client_id: int
    lawyer_id: int
    reservation_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True