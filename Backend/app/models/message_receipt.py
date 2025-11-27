# app/models/message_receipt.py
import enum
from sqlalchemy import Column, String, TIMESTAMP, func, ForeignKey, Enum, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class ReceiptStatus(str, enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"

class MessageReceipt(Base):
    __tablename__ = "message_receipts"
    message_id = Column(BigInteger, ForeignKey("messages.id"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    status = Column(Enum(ReceiptStatus), default=ReceiptStatus.SENT)
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), server_default=func.now())