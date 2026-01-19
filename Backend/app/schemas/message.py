# app/schemas/message.py
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional
from .user import User

class MessageBase(BaseModel):
   content: str          # Chứa Ciphertext (văn bản mã hóa) hoặc URL Cloudinary
   content_type: str = "text"
   iv: Optional[str] = None 
   
   # Trong Double Ratchet, chúng ta dùng signature để lưu Header JSON:
   # { "pubKey": "...", "count": n, "prevCount": pn, "iv": "..." }
   signature: Optional[str] = None 

class MessageCreate(MessageBase):
   model_config = ConfigDict(from_attributes=True)

class Message(MessageBase):
   id: int
   sender_id: uuid.UUID
   conversation_id: uuid.UUID
   created_at: datetime
   sender: User # Đảm bảo schema User này có identity_key_pub
   model_config = ConfigDict(from_attributes=True)