from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    image_url: Optional[str] = None
    created_at: datetime  # or str if you prefer to keep it as string
    
    class Config:
        from_attributes = True  # For SQLAlchemy models (formerly orm_mode)