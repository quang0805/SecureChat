# app/services/message_service.py
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Message, Participant
from app.schemas.message import MessageCreate

def create_message(db: Session, message_data: MessageCreate, conversation_id: uuid.UUID, sender_id: uuid.UUID):
    # Kiểm tra xem người gửi có phải là thành viên của cuộc hội thoại không
    is_participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        Participant.user_id == sender_id
    ).first()

    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this conversation"
        )

    db_message = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=message_data.content,
        content_type=message_data.content_type
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, skip: int = 0, limit: int = 50):
    # Kiểm tra xem người dùng có quyền xem tin nhắn không
    is_participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        Participant.user_id == user_id
    ).first()

    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this conversation"
        )
    
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    # Đảo ngược lại để tin nhắn cũ nhất ở đầu
    return messages[::-1]