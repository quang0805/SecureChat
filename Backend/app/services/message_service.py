# app/services/message_service.py
import uuid
from sqlalchemy.orm import Session,joinedload
from fastapi import HTTPException, status
from app.models import Message, Participant
from app.schemas.message import MessageCreate
from app.core.websockets import manager
from app.services import user_service

async def create_message(db: Session, message_data: MessageCreate, conversation_id: uuid.UUID, sender_id: uuid.UUID):
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

    # Lấy danh sách tất cả các người tham gia trong cuộc hội thoại (trừ người gửi)
    participants = db.query(Participant).filter(Participant.conversation_id == conversation_id)
    participant_ids = [p.user_id for p in participants if p.user_id != sender_id]


    # Chuẩn bị dữ liệu để gửi đi. 
    db_message.sender = user_service.get_user(db,sender_id)
    message_schema = MessageCreate.model_validate(db_message)

    # Gửi dữ liệu tới những người tham gia trong cuộc hội thoại. 
    broadcast_data = {
        "type": "new_message",
        "payload" : message_schema.model_dump()
    }

    await manager.broadcast(broadcast_data, participant_ids)
    return db_message


def get_messages_by_conversation(
    db: Session, 
    conversation_id: uuid.UUID, 
    user_id: uuid.UUID, 
    skip: int = 0, 
    limit: int = 50
):
    is_participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        Participant.user_id == user_id
    ).first()

    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this conversation"
        )
    
    messages = db.query(Message)\
        .options(joinedload(Message.sender))\
        .filter(Message.conversation_id == conversation_id)\
        .order_by(Message.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    # Đảo ngược danh sách tin nhắn, để tin nhẵn cũ ở đầu.     
    return messages[::-1]