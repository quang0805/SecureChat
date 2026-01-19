# app/schemas/conversation.py
import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from .user import User
from .message import Message
from app.models.conversation import ConversationType

class ConversationBase(BaseModel):
   name: Optional[str] = None
   avatar_url: Optional[str] = None

class ConversationCreate(BaseModel):
   type: ConversationType
   participant_ids: List[uuid.UUID]
   name: Optional[str] = None

class Conversation(ConversationBase):
   id: uuid.UUID
   type: ConversationType
   creator_id: uuid.UUID
   participants: List[User] = []
   last_message: Optional[Message] = None
   model_config = ConfigDict(from_attributes=True)

# --- SCHEMA MỚI DÀNH CHO DOUBLE RATCHET ---
class RatchetStateSync(BaseModel):
    # Chuỗi JSON RatchetState đã được mã hóa bằng Master Key
    encrypted_ratchet_state: str 

class RatchetStateResponse(BaseModel):
    encrypted_ratchet_state: Optional[str] = None