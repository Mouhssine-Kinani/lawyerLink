from pydantic import BaseModel,EmailStr,Field
from typing import Optional

"""any request sent by user will be validated against this requests here,this requests work like general rules"""
class RegisterRequest(BaseModel):
    email:EmailStr
    password:str = Field(...,min_length=6)
    role:str
    full_name:str
    phone:Optional[str] = None

class LoginRequest(BaseModel):
    email:EmailStr
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str = "bearer"

class UserResponse(BaseModel):
    id:str
    email:EmailStr
    role:str
    image_url:Optional[str] = None
    created_at:str

    class Config:
        from_attributes:True


