# app/services/message_service.py
import uuid
from sqlalchemy.orm import Session,joinedload
from fastapi import HTTPException, status
from app.models import Message, Participant
from app.schemas.message import MessageCreate, Message as MessageSchema
from app.core.websockets import manager
from app.services import user_service


async def create_message(db: Session, message_data: MessageCreate, conversation_id: uuid.UUID, sender_id: uuid.UUID):
    # Kiểm tra xem người gửi có phải là thành viên của cuộc hội thoại không
    print(">>> CALL from app.services.message_service.py/create_message")
    is_participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        Participant.user_id == sender_id
    ).first()

    if not is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this conversation"
        )

    # Tạo đối tượng tin nhắn và lưu vào Database
    db_message = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=message_data.content, # Ciphertext từ Client
        content_type=message_data.content_type,
        # Lưu các trường E2EE phục vụ giải mã
        encrypted_aes_key=message_data.encrypted_aes_key,
        encrypted_aes_key_sender=message_data.encrypted_aes_key_sender,
        iv=message_data.iv
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    db_message.sender = user_service.get_user(db, sender_id)

    # Chuyển đổi sang Schema để chuẩn hóa dữ liệu gửi đi (vừa để trả về API, vừa để gửi Socket)
    message_output = MessageSchema.model_validate(db_message)

    # Lấy danh sách tất cả các người tham gia trong cuộc hội thoại
    participants = db.query(Participant.user_id).filter(
        Participant.conversation_id == conversation_id
    ).all()
    participant_ids = [p.user_id for p in participants]

    # Chuẩn bị dữ liệu để broadcast qua WebSocket
    broadcast_data = {
        "type": "new_message",
        "payload": message_output.model_dump(mode='json') 
    }
    # Gửi dữ liệu tới những người tham gia
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