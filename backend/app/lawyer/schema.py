from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class LawyerBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    firm: Optional[str] = None
    license_number: Optional[str] = None
    specialties: Optional[str] = None
    languages: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    rating_avg: Optional[Decimal] = None
    rating_count: int = 0
    city: Optional[str] = None
    region: Optional[str] = None
    is_active: bool = True


class LawyerCreate(LawyerBase):
    pass


class LawyerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    firm: Optional[str] = None
    license_number: Optional[str] = None
    specialties: Optional[str] = None
    languages: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    city: Optional[str] = None
    region: Optional[str] = None


class LawyerResponse(LawyerBase):
    user_id: int

    class Config:
        from_attributes = True


class LawyerPublicResponse(BaseModel):
    user_id: int
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    firm: Optional[str] = None
    specialties: Optional[str] = None
    languages: Optional[str] = None
    hourly_rate: Optional[float] = None
    rating_avg: Optional[float] = None
    rating_count: int = 0
    city: Optional[str] = None
    region: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True