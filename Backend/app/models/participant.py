# app/models/participant.py
import enum
from sqlalchemy import Column, String, TIMESTAMP, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class ParticipantRole(str, enum.Enum):
    MEMBER = "member"
    ADMIN = "admin"

class Participant(Base):
    __tablename__ = "participants"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), primary_key=True)
    role = Column(Enum(ParticipantRole), default=ParticipantRole.MEMBER)
    joined_at = Column(TIMESTAMP(timezone=True), server_default=func.now())