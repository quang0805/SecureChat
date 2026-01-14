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
    
    #Loại tin nhắn và nội dung
    content_type = Column(String(20), default="text")
    content = Column(Text, nullable=False)

    #E2EE
    encrypted_aes_key = Column(Text, nullable=True)             # Khóa AES đã được mã hóa bằng RSA Public Key của người nhận
    encrypted_aes_key_sender = Column(Text, nullable=True)      # Khóa AES mã hóa bằng RSA Public key của người gửi => phục vụ việc load lại tin nhắn.
    signature = Column(Text, nullable=True)                     # Chữ ký số để xác thực người gửi
    iv = Column(String(50), nullable=True)                      # Initialization Vector cho AES-GCM

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    # Relationship to User
    sender = relationship("User", back_populates="messages_sent")