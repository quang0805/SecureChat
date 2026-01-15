# app/schemas/user.py
import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    public_key: Optional[str] = None

class UserCreate(UserBase):
    password: str
    encrypted_private_key: Optional[str] = None

class User(UserBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
    encrypted_private_key: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

