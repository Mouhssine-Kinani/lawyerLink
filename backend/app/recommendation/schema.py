from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class RecommendationLogBase(BaseModel):
    session_id: int
    lawyer_id: int
    score: Optional[Decimal] = None
    rank: Optional[int] = None


class RecommendationLogCreate(RecommendationLogBase):
    client_id: int


class RecommendationLogResponse(RecommendationLogBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LawyerBrief(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    firm: Optional[str] = None
    specialties: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    rating_avg: Optional[Decimal] = None
    rating_count: Optional[int] = None
    image_url: Optional[str] = None


class RecommendationWithLawyerResponse(RecommendationLogBase):
    id: int
    client_id: int
    created_at: datetime
    lawyer: Optional[LawyerBrief] = None

    class Config:
        from_attributes = True