from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str


class ReviewCreate(ReviewBase):
    lawyer_id: int


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    client_id: int
    lawyer_id: int
    rating: int
    comment: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewWithClientResponse(ReviewResponse):
    client_first_name: Optional[str] = None
    client_last_name: Optional[str] = None
    client_image_url: Optional[str] = None