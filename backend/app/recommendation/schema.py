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