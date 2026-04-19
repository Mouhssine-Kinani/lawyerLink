from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class Role(str, Enum):
    admin = "admin"
    client = "client"
    lawyer = "lawyer"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Role
    first_name: str
    last_name: str
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: Role
    image_url: Optional[str] = None
    created_at: str
    city: Optional[str] = None
    region: Optional[str] = None

    class Config:
        from_attributes = True