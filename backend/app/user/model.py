from ..database import Base
from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    moderator = "moderator"
    user = "user"


class User(Base):
    __tablename__="users"
    id=Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash=Column(String(255), nullable=False)
    created_at=Column(DateTime, server_default=func.now(), nullable=False)
    role=Column(SAEnum(Role), default=Role.user,nullable=False)