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