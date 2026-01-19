# app/models/participant.py
import enum
from sqlalchemy import Column, String, TIMESTAMP, func, ForeignKey, Enum, Text
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

   # --- DOUBLE RATCHET STATE ---
   # Lưu toàn bộ object RatchetState (RootKey, ChainKey...) 
   # Dưới dạng JSON đã mã hóa bằng Master Key của người dùng này.
   encrypted_ratchet_state = Column(Text, nullable=True)