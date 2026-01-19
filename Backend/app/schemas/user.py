# app/schemas/user.py
import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
   username: str
   display_name: Optional[str] = None
   avatar_url: Optional[str] = None
   identity_key_pub: Optional[str] = None # Khóa định danh công khai ECDH

class UserCreate(UserBase):
   password: str
   encrypted_private_key: Optional[str] = None # Private Key đã bị wrap bằng mật khẩu

class User(UserBase):
   id: uuid.UUID
   # Chúng ta trả về encrypted_private_key để người dùng có thể khôi phục khi đăng nhập
   encrypted_private_key: Optional[str] = None 
   created_at: Optional[datetime] = None
   updated_at: Optional[datetime] = None
   model_config = ConfigDict(from_attributes=True)