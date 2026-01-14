# app/api/endpoints/conversations.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Participant, Message
from app.schemas import conversation as conversation_schema, message as message_schema
from app.services import conversation_service, message_service, user_service

router = APIRouter()

@router.post("/", response_model=conversation_schema.Conversation, status_code=status.HTTP_201_CREATED)
async def create_new_conversation(
    conversation_in: conversation_schema.ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tạo một cuộc hội thoại mới.
    - type: 'private' hoặc 'group'.
    - participant_ids: Danh sách ID của những người tham gia (không cần bao gồm người tạo).
    - name: Bắt buộc cho group chat.
    """
    print(">>> CALL FROM app.api.endpoints.conversation.py.create_new_conversation")
    conversation = await conversation_service.create_conversation(db, conversation_data=conversation_in, creator_id=current_user.id)
    # Lấy thông tin chi tiết của các participant để trả về
    participants = db.query(User).filter(User.id.in_(conversation_in.participant_ids + [current_user.id])).all()
    conversation.participants = participants
    return conversation

@router.get("/", response_model=List[conversation_schema.Conversation])
def get_my_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy danh sách các cuộc hội thoại mà người dùng hiện tại tham gia.
    """
    conversations = conversation_service.get_user_conversations(db, user_id=current_user.id)
    # Lấy thông tin chi tiết của các participant cho mỗi conversation
    for conv in conversations:
        participant_ids = [p.user_id for p in db.query(Participant.user_id).filter(Participant.conversation_id == conv.id).all()]
        conv.participants = db.query(User).filter(User.id.in_(participant_ids)).all()
        last_msg = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()
        conv.last_message = last_msg
    return conversations

@router.get("/{conversation_id}/messages", response_model=List[message_schema.Message])
def get_conversation_messages(
    conversation_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy tin nhắn của một cuộc hội thoại.
    """
    messages = message_service.get_messages_by_conversation(
        db, conversation_id=conversation_id, user_id=current_user.id, skip=skip, limit=limit
    )

    # Populate sender information for each message
    for msg in messages:
        msg.sender = user_service.get_user(db, user_id=msg.sender_id)
    return messages

@router.post("/{conversation_id}/messages", response_model=message_schema.Message, status_code=status.HTTP_201_CREATED)
async def send_new_message(
    conversation_id: uuid.UUID,
    message_in: message_schema.MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gửi một tin nhắn mới vào cuộc hội thoại.
    """
    # Kiểm tra conversation có tồn tại và user có quyền hay không.
    print(">>> CALL from app.api.endpoints.conversations.py/send_new_message") 
    conversation = conversation_service.get_conversation_by_id(db, conversation_id, user_id=current_user.id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or you don't have access")

    message = await  message_service.create_message(
        db, message_data=message_in, conversation_id=conversation_id, sender_id=current_user.id
    )
    message.sender = current_user
    return message