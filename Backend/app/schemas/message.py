# app/schemas/message.py
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional
from .user import User

class MessageBase(BaseModel):
    content: str                             # Chứa Ciphertext (chuỗi đã mã hóa)
    content_type: str = "text"
    encrypted_aes_key: Optional[str] = None  # Bản mã khóa AÉS tin nhắn bằng RSA Public Key của người nhận.
    encrypted_aes_key_sender: Optional[str] = None  # Bản mã khóa AES tin nhắn bằng RSA Public Key của người nhận.
    iv: Optional[str] = None                 # IV `AES-GCM

class MessageCreate(MessageBase):
    model_config = ConfigDict(from_attributes=True)

class Message(MessageBase):
    id: int
    sender_id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime
    sender: User
    model_config = ConfigDict(from_attributes=True)