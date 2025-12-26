import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    display_name = Column(String(100))
    avatar_url = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), server_default=func.now())

     # Relationships
    messages_sent = relationship("Message", back_populates="sender")

    #E2EE
    public_key = Column(Text, nullable=True)  # Lưu RSA Public Key (PEM format)
    encrypted_private_key = Column(Text, nullable=True)  # Lưu RSA Private Key đã bị mã hóa bởi PBKDF2