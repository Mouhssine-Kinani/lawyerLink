from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class Role(str, Enum):
    admin = "admin"
    client = "client"
    lawyer = "lawyer"


class UserBase(BaseModel):
    email: str
    role: Role
    city: Optional[str] = None
    region: Optional[str] = None
    image_url: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ClientBase(BaseModel):
    first_name: str
    last_name: str
    phone: str


class ClientCreate(ClientBase):
    pass


class ClientResponse(ClientBase):
    user_id: int

    class Config:
        from_attributes = True


class LawyerBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    firm: Optional[str] = None
    license_number: Optional[str] = None
    specialties: Optional[str] = None
    languages: Optional[str] = None
    hourly_rate: Optional[float] = None
    rating_avg: Optional[float] = None
    rating_count: int = 0
    city: Optional[str] = None
    region: Optional[str] = None
    is_active: bool = True


class LawyerResponse(LawyerBase):
    user_id: int

    class Config:
        from_attributes = True


class UserFullResponse(BaseModel):
    id: int
    email: str
    role: Role
    city: Optional[str] = None
    region: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    client_profile: Optional[ClientResponse] = None
    lawyer_profile: Optional[LawyerResponse] = None

    class Config:
        from_attributes = True