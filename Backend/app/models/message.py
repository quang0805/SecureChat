# app/models/message.py
from sqlalchemy import Column, String, Text, TIMESTAMP, func, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Message(Base):
    __tablename__ = "messages"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"))
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content_type = Column(String(20), default="text")
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
        # Relationship to User
    sender = relationship("User", back_populates="messages_sent")