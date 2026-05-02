from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    client = "client"
    lawyer = "lawyer"

class UserStatus(str, Enum):
    active = "active"
    blocked = "blocked"
    deleted = "deleted"

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    city: Optional[str] = None
    region: Optional[str] = None

class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    city: Optional[str]
    region: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminLawyerResponse(BaseModel):
    user_id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    firm: Optional[str]
    specialties: Optional[str]
    is_active: bool
    rating_avg: Optional[float]
    rating_count: int
    subscription_status: Optional[str]
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_users: int
    total_clients: int
    total_lawyers: int
    total_reservations: int
    pending_reservations: int
    completed_reservations: int
    total_reviews: int
    avg_rating: Optional[float]