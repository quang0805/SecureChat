# app/schemas/message.py
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from .user import User

class MessageBase(BaseModel):
    content: str
    content_type: str = "text"

class MessageCreate(MessageBase):
    model_config = ConfigDict(from_attributes=True)
    pass

class Message(MessageBase):
    id: int
    sender_id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime
    sender: User
    model_config = ConfigDict(from_attributes=True)