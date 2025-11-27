# app/models/friend.py
import enum
from sqlalchemy import Column, String, TIMESTAMP, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class FriendStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"

class Friend(Base):
    __tablename__ = "friends"
    user_id_requester = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    user_id_accepter = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    status = Column(Enum(FriendStatus), default=FriendStatus.PENDING, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), server_default=func.now())