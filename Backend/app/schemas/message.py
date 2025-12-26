# app/schemas/message.py
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional
from .user import User

class MessageBase(BaseModel):
    content: str                    # Chứa Ciphertext (chuỗi đã mã hóa)
    content_type: str = "text"
    encrypted_aes_key: Optional[str] = None  # Khóa AES đã mã hóa bằng RSA Public Key
    iv: Optional[str] = None  # Vector khởi tạo cho thuật toán AES-GCM

class MessageCreate(MessageBase):
    model_config = ConfigDict(from_attributes=True)

class Message(MessageBase):
    id: int
    sender_id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime
    sender: User
    model_config = ConfigDict(from_attributes=True)