# app/models/conversation.py
import uuid
import enum
from sqlalchemy import Column, String, Text, TIMESTAMP, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class ConversationType(str, enum.Enum):
    PRIVATE = "private"
    GROUP = "group"

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(ConversationType), nullable=False)
    name = Column(String(255))
    avatar_url = Column(Text)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), server_default=func.now())